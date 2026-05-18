export interface AgentRequest {
  userId: string;
  channel: 'hr' | 'it' | 'logistics' | 'accounting' | 'reception';
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
  ToolErrorCode,
  ToolExecutionContext,
  ToolExecutionStatus,
  ToolResult,
} from './tools/shipment';
