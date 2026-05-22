import { randomUUID } from 'node:crypto';

import type { AgentChannel } from '@inquiry-agent/shared-types';

import { prisma } from '../database/client.js';
import { ConversationRepository } from '../database/repositories/conversation.repository.js';
import { MessageRepository } from '../database/repositories/message.repository.js';

const CHANNEL_TO_AGENT: Record<AgentChannel, string> = {
  reception: 'reception',
  hr: 'hr',
  it: 'it',
  logistics: 'logistics',
  accounting: 'accounting',
};

export interface EnsureConversationInput {
  userId: string;
  channel: AgentChannel;
  conversationId?: string;
  sessionId: string;
  traceId: string;
}

export interface AppendMessageInput {
  conversationId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  agentType?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async ensureConversation(input: EnsureConversationInput): Promise<{ conversationId: string }> {
    if (input.conversationId) {
      const existing = await this.conversationRepository.findUnique({
        where: { id: input.conversationId },
      });
      if (!existing) {
        throw new Error(`Conversation not found: ${input.conversationId}`);
      }
      if (existing.userId !== input.userId) {
        throw new Error('Conversation does not belong to this user');
      }
      await this.conversationRepository.update({
        where: { id: input.conversationId },
        data: {
          currentAgent: CHANNEL_TO_AGENT[input.channel],
          updatedAt: new Date(),
          metadata: {
            ...(typeof existing.metadata === 'object' && existing.metadata
              ? (existing.metadata as Record<string, unknown>)
              : {}),
            lastSessionId: input.sessionId,
            lastTraceId: input.traceId,
          },
        },
      });
      return { conversationId: input.conversationId };
    }

    const row = await this.conversationRepository.create({
      data: {
        id: randomUUID(),
        userId: input.userId,
        status: 'active',
        currentAgent: CHANNEL_TO_AGENT[input.channel],
        metadata: {
          channel: input.channel,
          sessionId: input.sessionId,
          traceId: input.traceId,
        },
      },
    });
    return { conversationId: row.id };
  }

  async appendMessage(input: AppendMessageInput): Promise<{ messageId: string }> {
    const row = await this.messageRepository.create({
      data: {
        id: randomUUID(),
        conversationId: input.conversationId,
        userId: input.userId ?? null,
        role: input.role,
        agentType: input.agentType ?? null,
        content: input.content,
        metadata: {
          ...(input.metadata ?? {}),
          ...(input.traceId ? { traceId: input.traceId } : {}),
        },
      },
    });
    return { messageId: row.id };
  }

  async listRecentMessages(conversationId: string, limit = 40) {
    return this.messageRepository.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }
}

export const conversationService = new ConversationService(
  new ConversationRepository(prisma),
  new MessageRepository(prisma),
);
