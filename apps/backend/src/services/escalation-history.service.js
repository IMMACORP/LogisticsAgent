import { prisma } from '../database/client.js';
import { EscalationRepository } from '../database/repositories/escalation.repository.js';
import { buildPaginationMeta, parsePaginationQuery, } from '../schemas/pagination/pagination.schemas.js';
import { metadataRecord, toIso } from '../lib/pagination/parse-metadata.js';
function mapRow(row) {
    return {
        id: row.id,
        conversationId: row.conversationId,
        category: row.category,
        priority: row.priority,
        escalationReason: row.escalationReason,
        assignedTeam: row.assignedTeam,
        slackThreadTs: row.slackThreadTs,
        status: row.status,
        resolvedAt: row.resolvedAt ? toIso(row.resolvedAt) : null,
        metadata: metadataRecord(row.metadata),
        createdAt: toIso(row.createdAt),
        updatedAt: toIso(row.updatedAt),
    };
}
export class EscalationHistoryService {
    escalationRepository;
    constructor(escalationRepository) {
        this.escalationRepository = escalationRepository;
    }
    async listEscalations(query) {
        const { page, pageSize, skip, take } = parsePaginationQuery(query);
        const where = {
            ...(query.conversationId ? { conversationId: query.conversationId } : {}),
            ...(query.status ? { status: query.status } : {}),
            ...(query.priority ? { priority: query.priority } : {}),
            ...(query.category ? { category: query.category } : {}),
        };
        const [rows, total] = await Promise.all([
            this.escalationRepository.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.escalationRepository.count({ where }),
        ]);
        return {
            data: rows.map(mapRow),
            pagination: buildPaginationMeta(total, page, pageSize),
        };
    }
    async getEscalation(escalationId) {
        const row = await this.escalationRepository.findUnique({
            where: { id: escalationId },
        });
        return row ? mapRow(row) : null;
    }
}
export const escalationHistoryService = new EscalationHistoryService(new EscalationRepository(prisma));
