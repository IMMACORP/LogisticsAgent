import { logisticsOperationOutputSchema } from '../../schemas/logistics/logistics-operation.schemas.js';
import { receptionTurnOutputSchema } from '../../schemas/reception/reception-turn.schemas.js';

/**
 * Extracts the conversational line shown to end users from structured agent output.
 * Internal fields (findingsSummary, toolsUsed, confidence, etc.) stay in logs/DB metadata only.
 */
export function extractUserFacingMessage(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try {
        return extractUserFacingMessage(JSON.parse(trimmed));
      } catch {
        return value;
      }
    }
    return value;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (typeof record.userFacingAnswer === 'string' && record.userFacingAnswer.length > 0) {
      return record.userFacingAnswer;
    }
    if (typeof record.replyToUser === 'string' && record.replyToUser.length > 0) {
      return record.replyToUser;
    }

    const logistics = logisticsOperationOutputSchema.safeParse(value);
    if (logistics.success) {
      return logistics.data.userFacingAnswer;
    }

    const reception = receptionTurnOutputSchema.safeParse(value);
    if (reception.success) {
      return reception.data.replyToUser;
    }
  }

  return '';
}

/**
 * Normalizes SDK `finalOutput` for HTTP/SSE `message` fields (user-visible text only).
 */
export function formatFinalOutputMessage(value: unknown): string {
  const userMessage = extractUserFacingMessage(value);
  if (userMessage.length > 0) {
    return userMessage;
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

/** Channels whose agents use structured `outputType` (do not stream raw JSON deltas to the UI). */
export function channelUsesStructuredDialogueOutput(channel: string): boolean {
  return channel === 'logistics' || channel === 'reception';
}
