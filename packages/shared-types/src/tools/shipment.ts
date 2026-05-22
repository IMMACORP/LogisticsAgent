export type {
  ToolErrorCode,
  ToolExecutionContext,
  ToolExecutionStatus,
  ToolResult,
} from './common';

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
