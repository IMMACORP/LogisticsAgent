import { randomUUID } from 'node:crypto';

import type { StructuredWorkflowEscalation } from '../schemas/escalation/escalation.schemas.js';
import { prisma } from '../database/client.js';
import { EscalationRepository } from '../database/repositories/escalation.repository.js';

export interface PersistEscalationInput {
  payload: StructuredWorkflowEscalation;
  conversationId?: string;
  category: string;
  assignedTeam?: string;
  slackThreadTs?: string;
}

export interface IdempotentEscalationHit {
  idempotencyKey: string;
  escalationLogId: string;
  existingPayload: StructuredWorkflowEscalation;
}


function parseStoredPayload(metadata: unknown): StructuredWorkflowEscalation | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }
  const m = metadata as Record<string, unknown>;
  const p = m.structuredPayload;
  if (p && typeof p === 'object' && !Array.isArray(p)) {
    return p as StructuredWorkflowEscalation;
  }
  return null;
}

export class EscalationLogService {
  constructor(private readonly escalationRepository: EscalationRepository) {}

  async findByIdempotencyKey(idempotencyKey: string): Promise<IdempotentEscalationHit | null> {
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

  async persist(input: PersistEscalationInput): Promise<{ id: string }> {
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
        metadata: ({
          idempotencyKey: input.payload.idempotencyKey,
          schemaVersion: input.payload.schemaVersion,
          triggers: input.payload.triggers,
          structuredPayload: input.payload,
        } as any),
      },
    });
    return { id: row.id };
  }
}

export const escalationLogService = new EscalationLogService(new EscalationRepository(prisma));
