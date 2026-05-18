import type { PrismaClient } from '@prisma/client';

/**
 * Prisma delegates available inside `prisma.$transaction(async (tx) => ...)`.
 */
export type DbExecutor = Pick<
  PrismaClient,
  | 'conversation'
  | 'message'
  | 'shipment'
  | 'inventory'
  | 'escalationLog'
  | 'auditLog'
>;
