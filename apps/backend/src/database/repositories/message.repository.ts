import type { PrismaClient } from '@prisma/client';

import type { DbExecutor } from '../types/db-executor';
import { BaseRepository } from './base.repository';

type MessageDelegate = PrismaClient['message'];

export class MessageRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findMany(
    args?: Parameters<MessageDelegate['findMany']>[0],
    tx?: DbExecutor,
  ): ReturnType<MessageDelegate['findMany']> {
    return this.exec(tx).message.findMany(args);
  }

  create(
    args: Parameters<MessageDelegate['create']>[0],
    tx?: DbExecutor,
  ): ReturnType<MessageDelegate['create']> {
    return this.exec(tx).message.create(args);
  }

  count(
    args?: Parameters<MessageDelegate['count']>[0],
    tx?: DbExecutor,
  ): ReturnType<MessageDelegate['count']> {
    return this.exec(tx).message.count(args);
  }
}
