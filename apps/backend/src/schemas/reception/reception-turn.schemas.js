import { z } from 'zod';
/** Domains the reception agent may assign before routing to a specialist. */
export const receptionDomainSchema = z.enum([
    'it',
    'hr',
    'logistics',
    'unclear',
    'out_of_scope',
]);
export const receptionRoutedSpecialistSchema = z.enum(['it', 'hr', 'logistics']);
export const receptionActionSchema = z.enum([
    /** Ask the user for missing facts before routing. */
    'clarify',
    /** Enough context to hand work to IT / HR / Logistics specialist. */
    'route_specialist',
    /** Answer from reception only (e.g. generic orientation, no specialist). */
    'acknowledge_only',
]);
/**
 * Structured final output for the Reception Agent (OpenAI Agents SDK `outputType`).
 */
export const receptionTurnOutputSchema = z.object({
    classification: z.object({
        domain: receptionDomainSchema,
        intentSummary: z.string().min(1).max(2000),
        keywords: z.array(z.string().min(1).max(128)).max(24).optional(),
    }),
    /** Model-estimated probability that the domain + next action are correct (0–1). */
    confidence: z.number().min(0).max(1),
    /** How complete the inquiry is for routing (0 = critical info missing, 1 = ready). */
    informationCompleteness: z.number().min(0).max(1),
    /** Specific questions or data points still needed from the user. */
    missingInformation: z.array(z.string().min(1).max(500)).max(12),
    action: receptionActionSchema,
    /** When action is `route_specialist`, which specialist should own the next step. */
    routedSpecialist: receptionRoutedSpecialistSchema.nullable(),
    /** Natural-language reply shown to the user (Japanese). */
    replyToUser: z.string().min(1).max(12_000),
    /** True when the model recommends human triage (policy edge, abuse, safety, etc.). */
    requestHumanReview: z.boolean(),
    /** Short reason for operators when escalating (Slack / logs). */
    escalationReason: z.string().max(2000).optional(),
});
