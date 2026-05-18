import type { PrismaClient } from '@prisma/client';

import type { DbExecutor } from '../types/db-executor';
import { BaseRepository } from './base.repository';

type ConversationDelegate = PrismaClient['conversation'];

export class ConversationRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findUnique(
    args: Parameters<ConversationDelegate['findUnique']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['findUnique']> {
    return this.exec(tx).conversation.findUnique(args);
  }

  findFirst(
    args?: Parameters<ConversationDelegate['findFirst']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['findFirst']> {
    return this.exec(tx).conversation.findFirst(args);
  }

  findMany(
    args?: Parameters<ConversationDelegate['findMany']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['findMany']> {
    return this.exec(tx).conversation.findMany(args);
  }

  create(
    args: Parameters<ConversationDelegate['create']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['create']> {
    return this.exec(tx).conversation.create(args);
  }

  createMany(
    args: Parameters<ConversationDelegate['createMany']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['createMany']> {
    return this.exec(tx).conversation.createMany(args);
  }

  update(
    args: Parameters<ConversationDelegate['update']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['update']> {
    return this.exec(tx).conversation.update(args);
  }

  updateMany(
    args: Parameters<ConversationDelegate['updateMany']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['updateMany']> {
    return this.exec(tx).conversation.updateMany(args);
  }

  upsert(
    args: Parameters<ConversationDelegate['upsert']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['upsert']> {
    return this.exec(tx).conversation.upsert(args);
  }

  delete(
    args: Parameters<ConversationDelegate['delete']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['delete']> {
    return this.exec(tx).conversation.delete(args);
  }

  deleteMany(
    args?: Parameters<ConversationDelegate['deleteMany']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['deleteMany']> {
    return this.exec(tx).conversation.deleteMany(args);
  }

  count(
    args?: Parameters<ConversationDelegate['count']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['count']> {
    return this.exec(tx).conversation.count(args);
  }

  aggregate(
    args: Parameters<ConversationDelegate['aggregate']>[0],
    tx?: DbExecutor,
  ): ReturnType<ConversationDelegate['aggregate']> {
    return this.exec(tx).conversation.aggregate(args);
  }
}
