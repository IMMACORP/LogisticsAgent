import { MemorySession } from '@openai/agents';
import { getSharedToolRegistry } from '../channel-agents.js';
import { createAgentRunContext } from '../runtime/create-agent-run-context.js';
import { getDefaultOpenAIAgentsRuntime } from '../runtime/openai-agents-runtime.js';
import { structuredLog } from '../runtime/structured-log.js';
import { runWithRetries, isRetryableAgentError } from '../../lib/agents/retry-async.js';
import { logisticsOperationOutputSchema, } from '../../schemas/logistics/logistics-operation.schemas.js';
import { slackEscalationService } from '../../services/slack-escalation.service.js';
import { slackEscalationChannelLabel } from '../reception/reception-thresholds.js';
import { createLogisticsOperationSupportAgent } from './logistics-operation-agent.js';
import { getOrCreateLogisticsMemorySession } from './logistics-memory.js';
import { logisticsEscalateMaxConfidence, logisticsRetryBaseDelayMs, logisticsRunMaxAttempts, } from './logistics-thresholds.js';
let logisticsAgentSingleton;
function getLogisticsOperationAgentSingleton() {
    logisticsAgentSingleton ??= createLogisticsOperationSupportAgent(getSharedToolRegistry().resolveTools('logistics'));
    return logisticsAgentSingleton;
}
function toolCtxFromRunCtx(ctx) {
    return {
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        agentName: ctx.agentName,
        traceId: ctx.traceId,
    };
}
async function maybeProgrammaticEscalation(out, ctx, usedNotifySlack) {
    const lowConfidence = out.confidence <= logisticsEscalateMaxConfidence();
    const flagged = out.needsEscalation === true;
    if (!lowConfidence && !flagged) {
        return false;
    }
    if (usedNotifySlack) {
        return false;
    }
    const title = flagged
        ? '物流オペレーション: エスカレーション（モデルフラグ）'
        : '物流オペレーション: 信頼度低下（自動エスカレーション）';
    const message = [
        `traceId: ${ctx.traceId}`,
        `sessionId: ${ctx.sessionId}`,
        `userId: ${ctx.userId ?? '(none)'}`,
        `inquiryKind: ${out.inquiryKind}`,
        `confidence: ${out.confidence}`,
        `toolsUsed: ${out.toolsUsed.join(', ') || '(none)'}`,
        out.escalationReason ? `escalationReason: ${out.escalationReason}` : '',
        `findingsSummary: ${out.findingsSummary}`,
    ]
        .filter(Boolean)
        .join('\n');
    try {
        await slackEscalationService.notifySlack({
            channel: slackEscalationChannelLabel(),
            priority: flagged ? 'HIGH' : 'MEDIUM',
            title,
            message,
            sessionId: ctx.sessionId,
            metadata: {
                kind: 'logistics_operation_escalation',
                traceId: ctx.traceId,
                logistics: out,
            },
        }, toolCtxFromRunCtx(ctx));
        return true;
    }
    catch {
        structuredLog('warn', 'logistics.escalation.slack_failed', {
            traceId: ctx.traceId,
            sessionId: ctx.sessionId,
        });
        return false;
    }
}
export async function runLogisticsOperationAgentTurn(request) {
    const runtime = getDefaultOpenAIAgentsRuntime();
    const context = createAgentRunContext({
        userId: request.userId,
        channel: 'logistics',
        agentName: 'logistics-operation-support-agent',
        metadata: request.metadata,
    });
    const session = getOrCreateLogisticsMemorySession(context.sessionId, (id) => new MemorySession({ sessionId: id }));
    const agent = getLogisticsOperationAgentSingleton();
    structuredLog('info', 'logistics.run.start', {
        traceId: context.traceId,
        sessionId: context.sessionId,
        userId: context.userId,
    });
    let attemptsUsed = 0;
    let raw;
    try {
        const runResult = await runWithRetries(async () => {
            attemptsUsed += 1;
            return runtime.run({
                agent,
                input: request.prompt,
                context,
                session,
                maxTurns: 18,
            });
        }, {
            maxAttempts: logisticsRunMaxAttempts(),
            baseDelayMs: logisticsRetryBaseDelayMs(),
            isRetryable: isRetryableAgentError,
            onAttempt: (attempt, err) => {
                if (attempt < logisticsRunMaxAttempts() && isRetryableAgentError(err)) {
                    structuredLog('warn', 'logistics.run.will_retry', {
                        traceId: context.traceId,
                        attempt,
                        error: err instanceof Error ? err.message : String(err),
                    });
                }
            },
        });
        raw = runResult.finalOutput;
    }
    catch (err) {
        structuredLog('error', 'logistics.run.failed', {
            traceId: context.traceId,
            attemptsUsed,
            error: err instanceof Error ? err.message : String(err),
        });
        return {
            success: false,
            message: '物流エージェントの実行に失敗しました。時間をおいて再度お試しください。',
            details: {
                traceId: context.traceId,
                sessionId: context.sessionId,
                channel: 'logistics',
                runtime: 'openai-agents-sdk',
                attemptsUsed,
            },
        };
    }
    const parsed = logisticsOperationOutputSchema.safeParse(raw);
    if (!parsed.success) {
        structuredLog('error', 'logistics.output.parse_failed', {
            traceId: context.traceId,
            issues: parsed.error.flatten(),
        });
        return {
            success: false,
            message: '物流エージェントの構造化出力を検証できませんでした。',
            details: {
                traceId: context.traceId,
                sessionId: context.sessionId,
                channel: 'logistics',
                runtime: 'openai-agents-sdk',
                attemptsUsed,
                validationError: parsed.error.flatten(),
                rawFinalOutput: raw,
            },
        };
    }
    const decision = parsed.data;
    const usedNotifySlack = decision.toolsUsed.some((n) => n === 'notifySlack');
    const escalated = await maybeProgrammaticEscalation(decision, context, usedNotifySlack);
    structuredLog('info', 'logistics.run.complete', {
        traceId: context.traceId,
        sessionId: context.sessionId,
        inquiryKind: decision.inquiryKind,
        confidence: decision.confidence,
        toolsUsed: decision.toolsUsed,
        attemptsUsed,
        programmaticEscalation: escalated,
    });
    return {
        success: true,
        message: decision.userFacingAnswer,
        details: {
            traceId: context.traceId,
            sessionId: context.sessionId,
            channel: 'logistics',
            runtime: 'openai-agents-sdk',
            logistics: decision,
            attemptsUsed,
            programmaticEscalation: escalated,
        },
    };
}
