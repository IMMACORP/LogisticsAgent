import { prisma } from '../database/client.js';
import { MessageRepository } from '../database/repositories/message.repository.js';
import { buildPaginationMeta, parsePaginationQuery, } from '../schemas/pagination/pagination.schemas.js';
import { metadataRecord, toIso } from '../lib/pagination/parse-metadata.js';
function mapRow(row) {
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
    messageRepository;
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async listMessages(query) {
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
