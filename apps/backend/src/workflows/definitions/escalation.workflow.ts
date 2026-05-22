import { slackEscalationService } from '../../services/index.js';
import { auditService } from '../../services/audit.service.js';
import { escalationLogService } from '../../services/escalation-log.service.js';
import {
  escalationWorkflowInputSchema,
  type EscalationWorkflowInput,
  type StructuredWorkflowEscalation,
} from '../../schemas/escalation/escalation.schemas.js';
import { WorkflowError } from '../workflow-error.js';
import type { WorkflowDefinition, WorkflowExecutionContext } from '../types.js';
import { assertTriggersSubstantiated } from '../escalation/evaluate-triggers.js';
import { summarizeConversationForEscalation } from '../escalation/summarize-conversation.js';
import { buildStructuredEscalationPayload } from '../escalation/build-escalation-payload.js';

export const ESCALATION_WORKFLOW_KEY = 'escalation';

export type { EscalationWorkflowInput };

function skipIfIdempotent(ctx: WorkflowExecutionContext): boolean {
  return ctx.state.idempotentReplay === true;
}

async function auditStep(
  ctx: WorkflowExecutionContext,
  action: string,
  newValues?: Record<string, unknown>,
): Promise<void> {
  await auditService.log({
    action,
    entityType: 'workflow_run',
    entityId: ctx.runId,
    actorId: 'workflow:escalation',
    actorType: 'workflow',
    newValues,
    metadata: {
      traceId: ctx.traceId,
      workflowKey: ctx.workflowKey,
      step: action,
    },
  });
}

export function createEscalationWorkflow(): WorkflowDefinition {
  return {
    key: ESCALATION_WORKFLOW_KEY,
    version: '2',
    steps: [
      {
        id: 'gather_context',
        description: 'Validate triggers, substantiate conditions, idempotency check',
        timeoutMs: 5_000,
        run: async (ctx) => {
          const parsed = escalationWorkflowInputSchema.safeParse(ctx.state.input);
          if (!parsed.success) {
            throw new WorkflowError('VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid input');
          }
          const input = parsed.data;
          ctx.state.input = input;

          const evaluation = assertTriggersSubstantiated(input.triggers, input.context);
          ctx.state.evaluation = evaluation;

          const existing = await escalationLogService.findByIdempotencyKey(input.idempotencyKey);
          if (existing) {
            ctx.state.idempotentReplay = true;
            ctx.state.structuredPayload = existing.existingPayload;
            ctx.state.escalationLogId = existing.escalationLogId;
            await auditStep(ctx, 'escalation.gather_context.idempotent_hit', {
              idempotencyKey: input.idempotencyKey,
              escalationLogId: existing.escalationLogId,
            });
            return;
          }

          ctx.state.gatheredContext = {
            sessionId: input.sessionId,
            userId: input.userId,
            conversationId: input.conversationId,
            activeTriggers: evaluation.activeTriggers,
            priority: evaluation.priority,
            severity: evaluation.severity,
          };

          await auditStep(ctx, 'escalation.gather_context', {
            activeTriggers: evaluation.activeTriggers,
            idempotencyKey: input.idempotencyKey,
          });
        },
      },
      {
        id: 'summarize_conversation',
        description: 'Operator-facing conversation summary',
        timeoutMs: 5_000,
        run: async (ctx) => {
          if (skipIfIdempotent(ctx)) {
            return;
          }
          const input = ctx.state.input as EscalationWorkflowInput;
          const evaluation = ctx.state.evaluation as { activeTriggers: string[] };
          const summary = summarizeConversationForEscalation(input, evaluation.activeTriggers);
          ctx.state.conversationSummary = summary;
          await auditStep(ctx, 'escalation.summarize_conversation', {
            summaryLength: summary.length,
          });
        },
      },
      {
        id: 'create_escalation_payload',
        description: 'Build structured escalation schema v1.1',
        timeoutMs: 3_000,
        run: async (ctx) => {
          if (skipIfIdempotent(ctx)) {
            return;
          }
          const input = ctx.state.input as EscalationWorkflowInput;
          const evaluation = ctx.state.evaluation as Parameters<
            typeof buildStructuredEscalationPayload
          >[0]['evaluation'];

          const payload = buildStructuredEscalationPayload({
            input,
            evaluation,
            conversationSummary: String(ctx.state.conversationSummary),
            workflowRunId: ctx.runId,
            traceId: ctx.traceId,
          });
          ctx.state.structuredPayload = payload;
          await auditStep(ctx, 'escalation.create_payload', {
            schemaVersion: payload.schemaVersion,
            triggers: payload.triggers,
            priority: payload.priority,
          });
        },
      },
      {
        id: 'notify_slack',
        description: 'Send Slack notification with structured payload',
        timeoutMs: 20_000,
        retry: { maxAttempts: 3, baseDelayMs: 800 },
        run: async (ctx) => {
          if (skipIfIdempotent(ctx)) {
            return;
          }
          const payload = ctx.state.structuredPayload as StructuredWorkflowEscalation;
          const input = ctx.state.input as EscalationWorkflowInput;

          const out = await slackEscalationService.notifySlack(
            {
              channel: payload.slackChannel,
              priority: payload.priority,
              severity: payload.severity,
              title: payload.title,
              message: payload.message,
              sessionId: payload.sessionId,
              mentionUsers: input.mentionUsers,
              metadata: {
                idempotencyKey: payload.idempotencyKey,
                triggers: payload.triggers,
                schemaVersion: payload.schemaVersion,
                workflowRunId: ctx.runId,
                structuredPayload: payload,
              },
            },
            {
              sessionId: payload.sessionId,
              userId: input.userId,
              agentName: input.context.agentName ?? 'workflow:escalation',
              traceId: ctx.traceId,
            },
          );

          ctx.state.slackResult = out;
          await auditStep(ctx, 'escalation.notify_slack', {
            slackChannel: out.slackChannel,
            severity: out.severity,
            sentAt: out.sentAt,
          });
        },
        compensate: async (ctx, err) => {
          ctx.state.compensationNote =
            'Slack notification cannot be revoked automatically; operators must acknowledge manually.';
          await auditStep(ctx, 'escalation.notify_slack.compensate', {
            error: err instanceof Error ? err.message : String(err),
          });
        },
      },
      {
        id: 'persist_escalation_log',
        description: 'Persist escalation log row (idempotent key in metadata)',
        timeoutMs: 8_000,
        retry: { maxAttempts: 2, baseDelayMs: 400 },
        run: async (ctx) => {
          if (skipIfIdempotent(ctx)) {
            await auditStep(ctx, 'escalation.persist_skipped_idempotent', {
              escalationLogId: ctx.state.escalationLogId,
            });
            return;
          }

          const payload = ctx.state.structuredPayload as StructuredWorkflowEscalation;
          const input = ctx.state.input as EscalationWorkflowInput;
          const slack = ctx.state.slackResult as { threadTs?: string } | undefined;

          const { id } = await escalationLogService.persist({
            payload,
            conversationId: input.conversationId,
            category: input.category ?? 'workflow_escalation',
            assignedTeam: input.assignedTeam,
            slackThreadTs: slack?.threadTs,
          });

          ctx.state.escalationLogId = id;
          await auditStep(ctx, 'escalation.persist_log', { escalationLogId: id });
        },
        compensate: async (ctx) => {
          ctx.state.escalationLogCompensated = true;
          await auditStep(ctx, 'escalation.persist_log.compensate', {
            escalationLogId: ctx.state.escalationLogId,
            note: 'Mark escalation cancelled in a future saga step',
          });
        },
      },
    ],
  };
}
