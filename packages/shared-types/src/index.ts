import type { AgentChannel } from './agent-run-context';

export type { AgentChannel, AgentRunContext } from './agent-run-context';

export interface AgentRequest {
  userId: string;
  channel: AgentChannel;
  prompt: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface SlackNotificationPayload {
  channelId: string;
  text: string;
  blocks?: unknown[];
}

export type {
  CheckStockAvailabilityInput,
  CheckStockAvailabilityOutput,
  DeliveryIssueRecord,
  DeliveryIssueStatus,
  EscalationSeverity,
  GetShipmentStatusInput,
  GetShipmentStatusOutput,
  InventoryRecord,
  KnowledgeCategory,
  KnowledgeChunkHit,
  KnowledgeCitation,
  KnowledgeRetrievalMode,
  NotifySlackInput,
  NotifySlackOutput,
  NotifySlackPriority,
  ReserveInventoryInput,
  ReserveInventoryOutput,
  SearchDeliveryIssueInput,
  SearchDeliveryIssueOutput,
  SearchInventoryInput,
  SearchInventoryOutput,
  SearchKnowledgeBaseInput,
  SearchKnowledgeBaseOutput,
  SearchShipmentHistoryInput,
  SearchShipmentHistoryOutput,
  ShipmentHistoryRecord,
  ShipmentStatus,
  StructuredEscalationPayload,
  ToolErrorCode,
  ToolExecutionContext,
  ToolExecutionStatus,
  ToolResult,
} from './tools';

export { priorityToSeverity } from './tools';
