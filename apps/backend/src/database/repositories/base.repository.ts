import type { PrismaClient } from '@prisma/client';

import type { DbExecutor } from '../types/db-executor';

export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaClient) {}

  protected exec(tx?: DbExecutor): DbExecutor {
    return tx ?? this.prisma;
  }
}
