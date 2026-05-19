import { tool } from '@openai/agents';
import { getShipmentStatusInputSchema, searchDeliveryIssueInputSchema, searchShipmentHistoryInputSchema, } from '../../schemas/shipment/shipment.schemas';
import { getShipmentStatus } from './get-shipment-status.tool';
import { searchDeliveryIssue } from './search-delivery-issue.tool';
import { searchShipmentHistory } from './search-shipment-history.tool';
export const getShipmentStatusAgentTool = tool({
    name: 'getShipmentStatus',
    description: '送り状番号（trackingNumber）を指定して、配送ステータス・現在地・ETA・遅延理由を取得します。物流オペレーションエージェント向け。',
    parameters: getShipmentStatusInputSchema,
    execute: async (input) => getShipmentStatus(input),
});
export const searchShipmentHistoryAgentTool = tool({
    name: 'searchShipmentHistory',
    description: '送り状番号・荷主名・ステータス・期間で配送履歴を検索します。過去の出荷・着荷状況の照会に使用します。',
    parameters: searchShipmentHistoryInputSchema,
    execute: async (input) => searchShipmentHistory(input),
});
export const searchDeliveryIssueAgentTool = tool({
    name: 'searchDeliveryIssue',
    description: '配送遅延（DELAYED）や出荷キャンセル（CANCELLED）などの配送トラブルを検索します。遅延理由・現在地・ETAを返します。',
    parameters: searchDeliveryIssueInputSchema,
    execute: async (input) => searchDeliveryIssue(input),
});
export const shipmentAgentTools = [
    getShipmentStatusAgentTool,
    searchShipmentHistoryAgentTool,
    searchDeliveryIssueAgentTool,
];
export { getShipmentStatus } from './get-shipment-status.tool';
export { searchDeliveryIssue } from './search-delivery-issue.tool';
export { searchShipmentHistory } from './search-shipment-history.tool';
