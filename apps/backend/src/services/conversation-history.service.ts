import { prisma } from '../database/client.js';
import { ConversationRepository } from '../database/repositories/conversation.repository.js';
import {
  buildPaginationMeta,
  parsePaginationQuery,
  type PaginationMeta,
} from '../schemas/pagination/pagination.schemas.js';
import type { ConversationHistoryItem } from '../schemas/history/history.schemas.js';
import { metadataRecord, toIso } from '../lib/pagination/parse-metadata.js';

export interface ListConversationsQuery {
  page?: number;
  pageSize?: number;
  userId: string;
  status?: 'active' | 'closed';
  currentAgent?: string;
}

function mapRow(row: {
  id: string;
  userId: string;
  status: string;
  currentAgent: string | null;
  summary: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): ConversationHistoryItem {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    currentAgent: row.currentAgent,
    summary: row.summary,
    metadata: metadataRecord(row.metadata),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export class ConversationHistoryService {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async listConversations(query: ListConversationsQuery): Promise<{
    data: ConversationHistoryItem[];
    pagination: PaginationMeta;
  }> {
    const { page, pageSize, skip, take } = parsePaginationQuery(query);

    const where = {
      userId: query.userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.currentAgent ? { currentAgent: query.currentAgent } : {}),
    };

    const [rows, total] = await Promise.all([
      this.conversationRepository.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      this.conversationRepository.count({ where }),
    ]);

    return {
      data: rows.map(mapRow),
      pagination: buildPaginationMeta(total, page, pageSize),
    };
  }

  async getConversation(
    conversationId: string,
    userId?: string,
  ): Promise<ConversationHistoryItem | null> {
    const row = await this.conversationRepository.findUnique({
      where: { id: conversationId },
    });
    if (!row) {
      return null;
    }
    if (userId && row.userId !== userId) {
      return null;
    }
    return mapRow(row);
  }
}

export const conversationHistoryService = new ConversationHistoryService(
  new ConversationRepository(prisma),
);
