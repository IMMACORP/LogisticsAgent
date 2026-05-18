import type { PrismaClient } from "@prisma/client";

import type { DbExecutor } from "./types/db-executor.js";

export type TransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?:
    | "ReadUncommitted"
    | "ReadCommitted"
    | "RepeatableRead"
    | "Serializable";
};

/**
 * Runs `callback` inside `prisma.$transaction`, passing the transaction-scoped client as {@link DbExecutor}.
 */
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
