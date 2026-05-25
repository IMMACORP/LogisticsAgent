import { randomUUID } from 'node:crypto';

import { prisma } from '../database/client.js';
import { AuditRepository } from '../database/repositories/audit.repository.js';

export interface AuditLogInput {
  action: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actorType?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async log(input: AuditLogInput): Promise<{ id: string }> {
    const row = await this.auditRepository.create({
      data: {
        id: randomUUID(),
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: input.actorId ?? 'system',
        actorType: input.actorType ?? 'workflow',
        oldValues: (input.oldValues ?? undefined) as any,
        newValues: (input.newValues ?? undefined) as any,
        metadata: (input.metadata ?? undefined) as any,
      },
    });
    return { id: row.id };
  }
}

export const auditService = new AuditService(new AuditRepository(prisma));
