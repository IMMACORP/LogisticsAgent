import { randomUUID } from 'node:crypto';
import { prisma } from '../database/client.js';
import { EscalationRepository } from '../database/repositories/escalation.repository.js';
function parseStoredPayload(metadata) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return null;
    }
    const m = metadata;
    const p = m.structuredPayload;
    if (p && typeof p === 'object' && !Array.isArray(p)) {
        return p;
    }
    return null;
}
export class EscalationLogService {
    escalationRepository;
    constructor(escalationRepository) {
        this.escalationRepository = escalationRepository;
    }
    async findByIdempotencyKey(idempotencyKey) {
        const row = await this.escalationRepository.findFirst({
            where: {
                metadata: { path: ['idempotencyKey'], equals: idempotencyKey },
            },
        });
        if (!row) {
            return null;
        }
        const existingPayload = parseStoredPayload(row.metadata);
        if (!existingPayload) {
            return null;
        }
        return {
            idempotencyKey,
            escalationLogId: row.id,
            existingPayload,
        };
    }
    async persist(input) {
        const reason = input.payload.triggers.join(', ');
        const row = await this.escalationRepository.create({
            data: {
                id: randomUUID(),
                conversationId: input.conversationId ?? null,
                category: input.category,
                priority: input.payload.priority,
                escalationReason: reason,
                assignedTeam: input.assignedTeam ?? null,
                slackThreadTs: input.slackThreadTs ?? null,
                status: 'open',
                metadata: {
                    idempotencyKey: input.payload.idempotencyKey,
                    schemaVersion: input.payload.schemaVersion,
                    triggers: input.payload.triggers,
                    structuredPayload: input.payload,
                },
            },
        });
        return { id: row.id };
    }
}
export const escalationLogService = new EscalationLogService(new EscalationRepository(prisma));
