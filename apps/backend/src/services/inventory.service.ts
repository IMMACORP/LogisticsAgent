import type {
  CheckStockAvailabilityInput,
  CheckStockAvailabilityOutput,
  InventoryRecord,
  ReserveInventoryInput,
  ReserveInventoryOutput,
  SearchInventoryInput,
  SearchInventoryOutput,
} from '@inquiry-agent/shared-types';
import type { PrismaClient } from '@prisma/client';

import { withTransaction } from '../database/transaction';
import type { InventoryRepository } from '../database/repositories/inventory.repository';
import { acquireInventoryLockPlaceholder } from '../lib/inventory/inventory-lock';
import { ToolExecutionError } from '../lib/tools/tool-result';

const DEFAULT_SEARCH_LIMIT = 20;

type InventoryWhereInput = {
  warehouseCode?: string | { contains: string; mode: 'insensitive' };
  itemCode?: string | { contains: string; mode: 'insensitive' };
  itemName?: { contains: string; mode: 'insensitive' };
};

type InventoryRow = {
  id: string;
  warehouseCode: string;
  itemCode: string;
  itemName: string | null;
  quantity: number;
  reservedQuantity: number;
  unit: string | null;
  metadata: unknown;
  updatedAt: Date;
};

function availableQuantity(row: Pick<InventoryRow, 'quantity' | 'reservedQuantity'>): number {
  return row.quantity - row.reservedQuantity;
}

function toInventoryRecord(row: InventoryRow): InventoryRecord {
  const available = availableQuantity(row);
  return {
    itemCode: row.itemCode,
    itemName: row.itemName ?? row.itemCode,
    warehouseCode: row.warehouseCode,
    quantity: row.quantity,
    availableQuantity: available,
    reservedQuantity: row.reservedQuantity,
    unit: row.unit ?? '個',
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mergeReservationMetadata(
  existing: unknown,
  reference: string | undefined,
  reservedQty: number,
): Record<string, unknown> {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};

  if (reference) {
    base.lastReservationReference = reference;
  }
  base.lastReservedQuantity = reservedQty;
  base.lastReservedAt = new Date().toISOString();

  return base;
}

export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async searchInventory(input: SearchInventoryInput): Promise<SearchInventoryOutput> {
    const limit = input.limit ?? DEFAULT_SEARCH_LIMIT;

    const where: InventoryWhereInput = {
      ...(input.warehouseCode ? { warehouseCode: input.warehouseCode } : {}),
      ...(input.itemCode
        ? { itemCode: { contains: input.itemCode, mode: 'insensitive' } }
        : {}),
      ...(input.itemName
        ? { itemName: { contains: input.itemName, mode: 'insensitive' } }
        : {}),
    };

    const rows = (await this.inventoryRepository.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })) as InventoryRow[];

    if (rows.length === 0) {
      throw new ToolExecutionError(
        '条件に一致する在庫が見つかりません',
        'NO_RESULTS',
        { filters: input },
      );
    }

    return rows.map(toInventoryRecord);
  }

  async checkStockAvailability(
    input: CheckStockAvailabilityInput,
  ): Promise<CheckStockAvailabilityOutput> {
    const row = (await this.inventoryRepository.findUnique({
      where: {
        warehouseCode_itemCode: {
          warehouseCode: input.warehouseCode,
          itemCode: input.itemCode,
        },
      },
    })) as InventoryRow | null;

    if (!row) {
      throw new ToolExecutionError(
        `倉庫 ${input.warehouseCode} に品目 ${input.itemCode} の在庫がありません`,
        'NOT_FOUND',
        { warehouseCode: input.warehouseCode, itemCode: input.itemCode },
      );
    }

    const available = availableQuantity(row);

    return {
      warehouseCode: row.warehouseCode,
      itemCode: row.itemCode,
      itemName: row.itemName ?? row.itemCode,
      requestedQuantity: input.requestedQuantity,
      quantity: row.quantity,
      reservedQuantity: row.reservedQuantity,
      availableQuantity: available,
      sufficient: available >= input.requestedQuantity,
      unit: row.unit ?? '個',
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async reserveInventory(input: ReserveInventoryInput): Promise<ReserveInventoryOutput> {
    return withTransaction(
      this.prisma,
      async (tx) => {
        const lock = await acquireInventoryLockPlaceholder(
          tx,
          input.warehouseCode,
          input.itemCode,
        );

        const row = (await this.inventoryRepository.findUnique(
          {
            where: {
              warehouseCode_itemCode: {
                warehouseCode: input.warehouseCode,
                itemCode: input.itemCode,
              },
            },
          },
          tx,
        )) as InventoryRow | null;

        if (!row) {
          throw new ToolExecutionError(
            `倉庫 ${input.warehouseCode} に品目 ${input.itemCode} の在庫がありません`,
            'NOT_FOUND',
            { warehouseCode: input.warehouseCode, itemCode: input.itemCode },
          );
        }

        const available = availableQuantity(row);
        if (available < input.quantity) {
          throw new ToolExecutionError(
            `引当可能数が不足しています（必要: ${input.quantity}、可能: ${available}）`,
            'INSUFFICIENT_STOCK',
            {
              warehouseCode: input.warehouseCode,
              itemCode: input.itemCode,
              requestedQuantity: input.quantity,
              availableQuantity: available,
            },
          );
        }

        const totalReservedQuantity = row.reservedQuantity + input.quantity;

        const updated = (await this.inventoryRepository.update(
          {
            where: { id: row.id },
            data: {
              reservedQuantity: totalReservedQuantity,
              metadata: mergeReservationMetadata(
                row.metadata,
                input.reservationReference,
                input.quantity,
              ) as object,
            },
          },
          tx,
        )) as InventoryRow;

        const availableAfter = availableQuantity(updated);

        return {
          warehouseCode: updated.warehouseCode,
          itemCode: updated.itemCode,
          itemName: updated.itemName ?? updated.itemCode,
          reservedInTransaction: input.quantity,
          totalReservedQuantity: updated.reservedQuantity,
          availableQuantity: availableAfter,
          unit: updated.unit ?? '個',
          reservationReference: input.reservationReference,
          lockAcquired: lock.acquired,
          updatedAt: updated.updatedAt.toISOString(),
        };
      },
      { isolationLevel: 'Serializable' },
    );
  }
}
