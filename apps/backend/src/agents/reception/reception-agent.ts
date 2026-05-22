import { Agent, MemorySession, type Tool } from '@openai/agents';
import type { AgentRunContext } from '@inquiry-agent/shared-types';

import { receptionTurnOutputSchema } from '../../schemas/reception/reception-turn.schemas.js';
import { resolveAgentsModel } from '../runtime/sdk-config.js';

const RECEPTION_INSTRUCTIONS = [
  'あなたは社内問い合わせの「受付（Reception）」エージェントです。IT / 人事（HR）/ 物流のいずれかへ振り分ける前に、意図を整理し不足情報を聞き取ります。',
  '',
  '責務:',
  '1) ユーザーの問い合わせを分類する（IT / HR / 物流 / 不明 / 対象外）。',
  '2) ルーティングや回答に必要な情報が欠けていれば、具体的に質問して収集する。',
  '3) 十分な情報があり、適切な専門エージェントが明確なときだけ route_specialist を選ぶ。',
  '4) 信頼度が低い・ポリシー上のグレー・安全上の懸念がある場合は requestHumanReview を true にし、理由を escalationReason に書く。必要なら notifySlack ツールで人間へエスカレーションする。',
  '5) 社内ナレッジ検索ツール（searchKnowledgeBase）は、一般案内や社内手続の確認に使ってよい。推測で断定しない。',
  '',
  '出力は必ずスキーマに従う structured final output のみ（replyToUser にユーザー向け本文を書く）。',
  'confidence は「分類と次アクションが正しい」主観的確度。informationCompleteness はルーティングに十分な事実が揃っているか。',
  'routedSpecialist は action が route_specialist のときのみ it / hr / logistics のいずれか。それ以外は null。',
  'ユーザーが会計など受付対象外の場合は domain=out_of_scope とし、action=acknowledge_only か clarify を選ぶ。',
].join('\n');

/**
 * Reception agent: Zod `outputType` for structured decisions + tools for KB / Slack.
 */
export function createReceptionAgent(tools: unknown[]): Agent<AgentRunContext> {
  const model = resolveAgentsModel();

  return new Agent({
    name: 'reception-agent',
    instructions: RECEPTION_INSTRUCTIONS,
    tools: tools as Tool<AgentRunContext>[],
    outputType: receptionTurnOutputSchema,
    ...(model ? { model } : {}),
  } as unknown as Agent<AgentRunContext>);
}

export function createReceptionMemorySession(sessionId: string): MemorySession {
  return new MemorySession({ sessionId });
}
