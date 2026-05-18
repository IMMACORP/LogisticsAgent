import type { PrismaClient } from "@prisma/client";

/**
 * Minimal Prisma surface passed into repositories for transaction support.
 * Compatible with the client passed to `prisma.$transaction(async (tx) => ...)`.
 */
export type DbExecutor = Pick<
  PrismaClient,
  | "conversation"
  | "message"
  | "shipment"
  | "inventory"
  | "escalationLog"
  | "auditLog"
>;
