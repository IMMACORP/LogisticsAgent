import { prisma } from '../database/client.js';
import { MessageRepository } from '../database/repositories/message.repository.js';
import {
  buildPaginationMeta,
  parsePaginationQuery,
  type PaginationMeta,
} from '../schemas/pagination/pagination.schemas.js';
import type { MessageHistoryItem } from '../schemas/history/history.schemas.js';
import { metadataRecord, toIso } from '../lib/pagination/parse-metadata.js';

export interface ListMessagesQuery {
  page?: number;
  pageSize?: number;
  conversationId?: string;
  userId?: string;
  role?: 'user' | 'assistant' | 'agent' | 'system';
}

function mapRow(row: {
  id: string;
  conversationId: string;
  userId: string | null;
  role: string;
  agentType: string | null;
  content: string;
  intent: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): MessageHistoryItem {
  return {
    id: row.id,
    conversationId: row.conversationId,
    userId: row.userId,
    role: row.role,
    agentType: row.agentType,
    content: row.content,
    intent: row.intent,
    metadata: metadataRecord(row.metadata),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export class MessageHistoryService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async listMessages(query: ListMessagesQuery): Promise<{
    data: MessageHistoryItem[];
    pagination: PaginationMeta;
  }> {
    const { page, pageSize, skip, take } = parsePaginationQuery(query);

    const where = {
      ...(query.conversationId ? { conversationId: query.conversationId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.role ? { role: query.role } : {}),
    };

    const [rows, total] = await Promise.all([
      this.messageRepository.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.messageRepository.count({ where }),
    ]);

    return {
      data: rows.map(mapRow),
      pagination: buildPaginationMeta(total, page, pageSize),
    };
  }
}

export const messageHistoryService = new MessageHistoryService(new MessageRepository(prisma));
