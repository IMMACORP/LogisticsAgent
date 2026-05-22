import type { AgentRequest, AgentResponse, AgentRunContext } from '@inquiry-agent/shared-types';

import { getChannelAgent, getSharedToolRegistry } from '../channel-agents.js';
import { createAgentRunContext } from '../runtime/create-agent-run-context.js';
import { formatFinalOutputMessage } from '../runtime/format-final-output.js';
import { getDefaultOpenAIAgentsRuntime } from '../runtime/openai-agents-runtime.js';
import { structuredLog } from '../runtime/structured-log.js';
import type { ReceptionTurnOutput } from '../../schemas/reception/reception-turn.schemas.js';
import { receptionTurnOutputSchema } from '../../schemas/reception/reception-turn.schemas.js';
import { slackEscalationService } from '../../services/slack-escalation.service.js';
import { createReceptionAgent, createReceptionMemorySession } from './reception-agent.js';
import { getOrCreateReceptionMemorySession } from './reception-memory.js';
import {
  receptionEscalateMaxConfidence,
  receptionRouteMinCompleteness,
  receptionRouteMinConfidence,
  slackEscalationChannelLabel,
} from './reception-thresholds.js';

let receptionAgentSingleton: ReturnType<typeof createReceptionAgent> | undefined;

function getReceptionAgentSingleton() {
  receptionAgentSingleton ??= createReceptionAgent(getSharedToolRegistry().resolveTools('reception'));
  return receptionAgentSingleton;
}

function buildSpecialistHandoffPrompt(
  userPrompt: string,
  decision: ReceptionTurnOutput,
): string {
  return [
    '以下は受付エージェントの整理結果です。あなたは専門エージェントとして、ツールを活用して解決に当たってください。',
    '',
    `[分類] ${decision.classification.domain}`,
    `[要約] ${decision.classification.intentSummary}`,
    `[受付からユーザーへの返信] ${decision.replyToUser}`,
    '',
    '[元のユーザー問い合わせ]',
    userPrompt,
  ].join('\n');
}

function toolCtxFromRunCtx(ctx: AgentRunContext) {
  return {
    sessionId: ctx.sessionId,
    userId: ctx.userId,
    agentName: ctx.agentName,
    traceId: ctx.traceId,
  };
}

async function maybeNotifyLowConfidence(
  decision: ReceptionTurnOutput,
  ctx: AgentRunContext,
): Promise<boolean> {
  const threshold = receptionEscalateMaxConfidence();
  const low = decision.confidence <= threshold;
  const human = decision.requestHumanReview === true;
  if (!low && !human) {
    return false;
  }

  const title = human
    ? '受付: モデルが人間レビューを推奨'
    : '受付: 信頼度が閾値以下（自動エスカレーション）';

  const message = [
    `traceId: ${ctx.traceId}`,
    `sessionId: ${ctx.sessionId}`,
    `userId: ${ctx.userId ?? '(none)'}`,
    `confidence: ${decision.confidence}`,
    `informationCompleteness: ${decision.informationCompleteness}`,
    `domain: ${decision.classification.domain}`,
    `action: ${decision.action}`,
    decision.escalationReason ? `escalationReason: ${decision.escalationReason}` : '',
    `intentSummary: ${decision.classification.intentSummary}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await slackEscalationService.notifySlack(
      {
        channel: slackEscalationChannelLabel(),
        priority: human ? 'HIGH' : 'MEDIUM',
        title,
        message,
        sessionId: ctx.sessionId,
        metadata: {
          kind: 'reception_low_confidence',
          traceId: ctx.traceId,
          reception: decision,
        },
      },
      toolCtxFromRunCtx(ctx),
    );
    return true;
  } catch {
    structuredLog('warn', 'reception.escalation.slack_failed', {
      traceId: ctx.traceId,
      sessionId: ctx.sessionId,
    });
    return false;
  }
}

function shouldAutoRoute(decision: ReceptionTurnOutput): decision is ReceptionTurnOutput & {
  routedSpecialist: 'it' | 'hr' | 'logistics';
} {
  if (decision.action !== 'route_specialist') {
    return false;
  }
  if (!decision.routedSpecialist) {
    return false;
  }
  if (decision.confidence < receptionRouteMinConfidence()) {
    return false;
  }
  if (decision.informationCompleteness < receptionRouteMinCompleteness()) {
    return false;
  }
  return true;
}

export async function runReceptionAgentTurn(request: AgentRequest): Promise<AgentResponse> {
  const runtime = getDefaultOpenAIAgentsRuntime();

  const context = createAgentRunContext({
    userId: request.userId,
    channel: 'reception',
    agentName: 'reception-agent',
    metadata: request.metadata,
  });

  const session = getOrCreateReceptionMemorySession(context.sessionId, createReceptionMemorySession);

  const receptionAgent = getReceptionAgentSingleton();

  structuredLog('info', 'reception.run.start', {
    traceId: context.traceId,
    sessionId: context.sessionId,
    userId: context.userId,
  });

  let receptionResult;
  try {
    receptionResult = await runtime.run({
      agent: receptionAgent,
      input: request.prompt,
      context,
      session,
      maxTurns: 14,
    });
  } catch (err) {
    structuredLog('error', 'reception.run.failed', {
      traceId: context.traceId,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      message: 'Reception agent run failed. See server logs for details.',
      details: {
        traceId: context.traceId,
        sessionId: context.sessionId,
        channel: 'reception',
        runtime: 'openai-agents-sdk',
      },
    };
  }

  const parsed = receptionTurnOutputSchema.safeParse(receptionResult.finalOutput);
  if (!parsed.success) {
    structuredLog('error', 'reception.output.parse_failed', {
      traceId: context.traceId,
      issues: parsed.error.flatten(),
    });
    return {
      success: false,
      message:
        '受付エージェントの構造化出力を検証できませんでした。会話を続けるか、別の言い回しでもう一度お試しください。',
      details: {
        traceId: context.traceId,
        sessionId: context.sessionId,
        channel: 'reception',
        runtime: 'openai-agents-sdk',
        validationError: parsed.error.flatten(),
        rawFinalOutput: receptionResult.finalOutput,
      },
    };
  }

  const decision = parsed.data;

  const escalated = await maybeNotifyLowConfidence(decision, context);

  let specialistChannel: 'it' | 'hr' | 'logistics' | undefined;
  let specialistText: string | undefined;

  if (shouldAutoRoute(decision)) {
    specialistChannel = decision.routedSpecialist;
    const specialistAgent = getChannelAgent(specialistChannel);
    const specialistContext: AgentRunContext = {
      ...context,
      channel: specialistChannel,
      agentName: specialistAgent.name,
    };

    try {
      const spec = await runtime.run({
        agent: specialistAgent,
        input: buildSpecialistHandoffPrompt(request.prompt, decision),
        context: specialistContext,
        maxTurns: 16,
      });
      specialistText = formatFinalOutputMessage(spec.finalOutput);
    } catch (err) {
      structuredLog('error', 'reception.specialist.failed', {
        traceId: context.traceId,
        specialistChannel,
        error: err instanceof Error ? err.message : String(err),
      });
      specialistText = '（専門エージェントの実行中にエラーが発生しました。受付の回答のみをご確認ください。）';
    }
  }

  const combinedMessage = specialistText
    ? `${decision.replyToUser}\n\n---\n【${specialistChannel} 専門エージェント】\n${specialistText}`
    : decision.replyToUser;

  structuredLog('info', 'reception.run.complete', {
    traceId: context.traceId,
    sessionId: context.sessionId,
    confidence: decision.confidence,
    action: decision.action,
    domain: decision.classification.domain,
    routedSpecialist: decision.routedSpecialist,
    autoRouted: Boolean(specialistChannel),
    escalated,
  });

  return {
    success: true,
    message: combinedMessage,
    details: {
      traceId: context.traceId,
      sessionId: context.sessionId,
      channel: 'reception',
      runtime: 'openai-agents-sdk',
      reception: decision,
      specialistChannel,
      lowConfidenceEscalated: escalated,
    },
  };
}
