import type { ToolExecutionContext, ToolResult } from './common';

export type { ToolExecutionContext, ToolResult };

export interface SearchInventoryInput {
  itemCode?: string;
  itemName?: string;
  warehouseCode?: string;
  limit?: number;
}

export interface InventoryRecord {
  itemCode: string;
  itemName: string;
  warehouseCode: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  unit: string;
  updatedAt: string;
}

export type SearchInventoryOutput = InventoryRecord[];

export interface CheckStockAvailabilityInput {
  warehouseCode: string;
  itemCode: string;
  requestedQuantity: number;
}

export interface CheckStockAvailabilityOutput {
  warehouseCode: string;
  itemCode: string;
  itemName: string;
  requestedQuantity: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  sufficient: boolean;
  unit: string;
  updatedAt: string;
}

export interface ReserveInventoryInput {
  warehouseCode: string;
  itemCode: string;
  quantity: number;
  /** Optional idempotency / trace reference stored in row metadata */
  reservationReference?: string;
}

export interface ReserveInventoryOutput {
  warehouseCode: string;
  itemCode: string;
  itemName: string;
  reservedInTransaction: number;
  totalReservedQuantity: number;
  availableQuantity: number;
  unit: string;
  reservationReference?: string;
  /** Placeholder flag �? true when advisory lock hook ran */
  lockAcquired: boolean;
  updatedAt: string;
}
