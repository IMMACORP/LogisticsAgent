export type ToolExecutionStatus = 'success' | 'failed';

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: ToolErrorCode;
  executionTimeMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionContext {
  sessionId: string;
  userId?: string;
  agentName?: string;
  traceId?: string;
}

export type ToolErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'DATABASE_ERROR'
  | 'NO_RESULTS';

export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELAYED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface GetShipmentStatusInput {
  trackingNumber: string;
}

export interface GetShipmentStatusOutput {
  trackingNumber: string;
  shipmentStatus: ShipmentStatus;
  currentLocation: string;
  origin?: string;
  destination?: string;
  customerName?: string;
  estimatedArrival?: string;
  delayReason?: string;
  lastUpdatedAt: string;
}

export interface SearchShipmentHistoryInput {
  trackingNumber?: string;
  customerName?: string;
  shipmentStatus?: ShipmentStatus;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export interface ShipmentHistoryRecord {
  trackingNumber: string;
  shipmentStatus: ShipmentStatus;
  origin?: string;
  destination?: string;
  customerName?: string;
  currentLocation?: string;
  updatedAt: string;
}

export interface SearchShipmentHistoryOutput {
  records: ShipmentHistoryRecord[];
  total: number;
}

export type DeliveryIssueStatus = 'DELAYED' | 'CANCELLED';

export interface SearchDeliveryIssueInput {
  trackingNumber?: string;
  customerName?: string;
  issueStatus?: DeliveryIssueStatus;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export interface DeliveryIssueRecord {
  trackingNumber: string;
  shipmentStatus: DeliveryIssueStatus;
  delayReason?: string;
  currentLocation?: string;
  estimatedArrival?: string;
  customerName?: string;
  lastUpdatedAt: string;
}

export type SearchDeliveryIssueOutput = DeliveryIssueRecord[];
