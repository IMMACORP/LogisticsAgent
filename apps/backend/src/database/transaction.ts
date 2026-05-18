import type { PrismaClient } from '@prisma/client';

import type { DbExecutor } from './types/db-executor';

export type TransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?:
    | 'ReadUncommitted'
    | 'ReadCommitted'
    | 'RepeatableRead'
    | 'Serializable';
};

export async function withTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: DbExecutor) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> {
  return prisma.$transaction(
    async (tx: unknown) => callback(tx as DbExecutor),
    options,
  );
}
