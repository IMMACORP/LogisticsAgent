import { withTransaction } from '../database/transaction';
import { acquireInventoryLockPlaceholder } from '../lib/inventory/inventory-lock';
import { ToolExecutionError } from '../lib/tools/tool-result';
const DEFAULT_SEARCH_LIMIT = 20;
function availableQuantity(row) {
    return row.quantity - row.reservedQuantity;
}
function toInventoryRecord(row) {
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
function mergeReservationMetadata(existing, reference, reservedQty) {
    const base = existing && typeof existing === 'object' && !Array.isArray(existing)
        ? { ...existing }
        : {};
    if (reference) {
        base.lastReservationReference = reference;
    }
    base.lastReservedQuantity = reservedQty;
    base.lastReservedAt = new Date().toISOString();
    return base;
}
export class InventoryService {
    inventoryRepository;
    prisma;
    constructor(inventoryRepository, prisma) {
        this.inventoryRepository = inventoryRepository;
        this.prisma = prisma;
    }
    async searchInventory(input) {
        const limit = input.limit ?? DEFAULT_SEARCH_LIMIT;
        const where = {
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
        }));
        if (rows.length === 0) {
            throw new ToolExecutionError('条件に一致する在庫が見つかりません', 'NO_RESULTS', { filters: input });
        }
        return rows.map(toInventoryRecord);
    }
    async checkStockAvailability(input) {
        const row = (await this.inventoryRepository.findUnique({
            where: {
                warehouseCode_itemCode: {
                    warehouseCode: input.warehouseCode,
                    itemCode: input.itemCode,
                },
            },
        }));
        if (!row) {
            throw new ToolExecutionError(`倉庫 ${input.warehouseCode} に品目 ${input.itemCode} の在庫がありません`, 'NOT_FOUND', { warehouseCode: input.warehouseCode, itemCode: input.itemCode });
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
    async reserveInventory(input) {
        return withTransaction(this.prisma, async (tx) => {
            const lock = await acquireInventoryLockPlaceholder(tx, input.warehouseCode, input.itemCode);
            const row = (await this.inventoryRepository.findUnique({
                where: {
                    warehouseCode_itemCode: {
                        warehouseCode: input.warehouseCode,
                        itemCode: input.itemCode,
                    },
                },
            }, tx));
            if (!row) {
                throw new ToolExecutionError(`倉庫 ${input.warehouseCode} に品目 ${input.itemCode} の在庫がありません`, 'NOT_FOUND', { warehouseCode: input.warehouseCode, itemCode: input.itemCode });
            }
            const available = availableQuantity(row);
            if (available < input.quantity) {
                throw new ToolExecutionError(`引当可能数が不足しています（必要: ${input.quantity}、可能: ${available}）`, 'INSUFFICIENT_STOCK', {
                    warehouseCode: input.warehouseCode,
                    itemCode: input.itemCode,
                    requestedQuantity: input.quantity,
                    availableQuantity: available,
                });
            }
            const totalReservedQuantity = row.reservedQuantity + input.quantity;
            const updated = (await this.inventoryRepository.update({
                where: { id: row.id },
                data: {
                    reservedQuantity: totalReservedQuantity,
                    metadata: mergeReservationMetadata(row.metadata, input.reservationReference, input.quantity),
                },
            }, tx));
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
        }, { isolationLevel: 'Serializable' });
    }
}
