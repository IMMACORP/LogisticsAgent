import type { PrismaClient } from '@prisma/client';

import type { DbExecutor } from '../types/db-executor';
import { BaseRepository } from './base.repository';

type AuditDelegate = PrismaClient['auditLog'];

export class AuditRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    args: Parameters<AuditDelegate['create']>[0],
    tx?: DbExecutor,
  ): ReturnType<AuditDelegate['create']> {
    return this.exec(tx).auditLog.create(args);
  }

  findMany(
    args?: Parameters<AuditDelegate['findMany']>[0],
    tx?: DbExecutor,
  ): ReturnType<AuditDelegate['findMany']> {
    return this.exec(tx).auditLog.findMany(args);
  }
}
