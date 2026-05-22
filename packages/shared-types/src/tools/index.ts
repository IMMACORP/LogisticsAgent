export type {
  ToolErrorCode,
  ToolExecutionContext,
  ToolExecutionStatus,
  ToolResult,
} from './common';

export type {
  DeliveryIssueRecord,
  DeliveryIssueStatus,
  GetShipmentStatusInput,
  GetShipmentStatusOutput,
  SearchDeliveryIssueInput,
  SearchDeliveryIssueOutput,
  SearchShipmentHistoryInput,
  SearchShipmentHistoryOutput,
  ShipmentHistoryRecord,
  ShipmentStatus,
} from './shipment';

export type {
  CheckStockAvailabilityInput,
  CheckStockAvailabilityOutput,
  InventoryRecord,
  ReserveInventoryInput,
  ReserveInventoryOutput,
  SearchInventoryInput,
  SearchInventoryOutput,
} from './inventory';

export type {
  KnowledgeCategory,
  KnowledgeChunkHit,
  KnowledgeCitation,
  KnowledgeRetrievalMode,
  SearchKnowledgeBaseInput,
  SearchKnowledgeBaseOutput,
} from './knowledge';

export type {
  EscalationSeverity,
  NotifySlackInput,
  NotifySlackOutput,
  NotifySlackPriority,
  StructuredEscalationPayload,
} from './slack';

export { priorityToSeverity } from './slack';
