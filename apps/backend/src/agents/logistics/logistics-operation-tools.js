import { getShipmentStatusAgentTool } from '../../tools/shipment/index.js';
import { searchInventoryAgentTool } from '../../tools/inventory/index.js';
import { knowledgeAgentTools } from '../../tools/knowledge/index.js';
import { slackAgentTools } from '../../tools/slack/index.js';
/**
 * Canonical tool surface for the Logistics Operation Support agent (tool-first).
 * Order: shipment status → inventory → knowledge → escalation.
 */
export const logisticsOperationSupportAgentTools = [
    getShipmentStatusAgentTool,
    searchInventoryAgentTool,
    ...knowledgeAgentTools,
    ...slackAgentTools,
];
