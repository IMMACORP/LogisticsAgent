import { Agent, type Tool } from '@openai/agents';
import type { AgentRunContext } from '@inquiry-agent/shared-types';

import { logisticsOperationOutputSchema } from '../../schemas/logistics/logistics-operation.schemas.js';
import { resolveAgentsModel } from '../runtime/sdk-config.js';

const LOGISTICS_OPERATION_INSTRUCTIONS = [
  'あなたは「物流オペレーション支援」エージェントです。次の4ツールのみ使用できます: getShipmentStatus / searchInventory / searchKnowledgeBase / notifySlack。',
  '',
  'ツールファースト原則:',
  '- 事実確認が必要なら、推測せず先に適切なツールを呼び出す。',
  '- 送り状・配送状況: getShipmentStatus（trackingNumber が分かる場合）。',
  '- 在庫照会: searchInventory（倉庫・品目コード・品目名など分かる条件で）。',
  '- 輸出・貿易手続・社内ルール: searchKnowledgeBase。',
  '- 配送トラブル調査: まず getShipmentStatus で現状把握し、必要に応じ searchKnowledgeBase。重大・未解決は notifySlack でエスカレーション。',
  '- 輸出依頼サポート: 社内手続・必要書類は searchKnowledgeBase。判断できない・権限外は needsEscalation=true と notifySlack。',
  '',
  '最終出力は必ずスキーマに従う structured output のみ。userFacingAnswer にユーザー向け本文。findingsSummary にツール結果の要約。',
  'toolsUsed には実際に呼び出したツール名を列挙。confidence は回答の確からしさ。',
].join('\n');

export function createLogisticsOperationSupportAgent(tools: unknown[]): Agent<AgentRunContext> {
  const model = resolveAgentsModel();

  return new Agent({
    name: 'logistics-operation-support-agent',
    instructions: LOGISTICS_OPERATION_INSTRUCTIONS,
    tools: tools as Tool<AgentRunContext>[],
    outputType: logisticsOperationOutputSchema,
    ...(model ? { model } : {}),
  } as unknown as Agent<AgentRunContext>);
}
