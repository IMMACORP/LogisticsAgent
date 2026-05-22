import { randomUUID } from 'node:crypto';
import { prisma } from '../database/client.js';
import { AuditRepository } from '../database/repositories/audit.repository.js';
export class AuditService {
    auditRepository;
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
    }
    async log(input) {
        const row = await this.auditRepository.create({
            data: {
                id: randomUUID(),
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                actorId: input.actorId ?? 'system',
                actorType: input.actorType ?? 'workflow',
                oldValues: input.oldValues ?? undefined,
                newValues: input.newValues ?? undefined,
                metadata: input.metadata ?? undefined,
            },
        });
        return { id: row.id };
    }
}
export const auditService = new AuditService(new AuditRepository(prisma));
