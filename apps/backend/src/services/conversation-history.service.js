import { prisma } from '../database/client.js';
import { ConversationRepository } from '../database/repositories/conversation.repository.js';
import { buildPaginationMeta, parsePaginationQuery, } from '../schemas/pagination/pagination.schemas.js';
import { metadataRecord, toIso } from '../lib/pagination/parse-metadata.js';
function mapRow(row) {
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
    conversationRepository;
    constructor(conversationRepository) {
        this.conversationRepository = conversationRepository;
    }
    async listConversations(query) {
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
    async getConversation(conversationId, userId) {
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
export const conversationHistoryService = new ConversationHistoryService(new ConversationRepository(prisma));
