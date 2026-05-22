import type { DbExecutor } from '../../database/types/db-executor';

/**
 * Stable lock key for a warehouse + SKU pair.
 * Used by the advisory-lock placeholder and for future Redis/distributed locks.
 */
export function inventoryLockKey(warehouseCode: string, itemCode: string): string {
  return `inventory:${warehouseCode}:${itemCode}`;
}

/**
 * Placeholder for row-level inventory locking inside a transaction.
 *
 * Production: replace with `SELECT pg_advisory_xact_lock(hashtext(key))` via
 * `prisma.$executeRaw` on the transaction client, or a distributed lock (Redis).
 */
export async function acquireInventoryLockPlaceholder(
  _tx: DbExecutor,
  warehouseCode: string,
  itemCode: string,
): Promise<{ lockKey: string; acquired: boolean }> {
  const lockKey = inventoryLockKey(warehouseCode, itemCode);

  // TODO: await tx.$executeRaw`SELECT pg_advisory_xact_lock(${hash(lockKey)})`
  return { lockKey, acquired: true };
}
