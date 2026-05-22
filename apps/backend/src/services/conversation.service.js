import { randomUUID } from 'node:crypto';
import { prisma } from '../database/client.js';
import { ConversationRepository } from '../database/repositories/conversation.repository.js';
import { MessageRepository } from '../database/repositories/message.repository.js';
const CHANNEL_TO_AGENT = {
    reception: 'reception',
    hr: 'hr',
    it: 'it',
    logistics: 'logistics',
    accounting: 'accounting',
};
export class ConversationService {
    conversationRepository;
    messageRepository;
    constructor(conversationRepository, messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }
    async ensureConversation(input) {
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
                            ? existing.metadata
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
    async appendMessage(input) {
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
    async listRecentMessages(conversationId, limit = 40) {
        return this.messageRepository.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
    }
}
export const conversationService = new ConversationService(new ConversationRepository(prisma), new MessageRepository(prisma));
