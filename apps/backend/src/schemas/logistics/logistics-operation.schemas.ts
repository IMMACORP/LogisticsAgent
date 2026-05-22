import { z } from 'zod';

export const logisticsInquiryKindSchema = z.enum([
  'shipment',
  'inventory',
  'export_request',
  'delivery_issue',
  'mixed',
  'other',
]);

export type LogisticsInquiryKind = z.infer<typeof logisticsInquiryKindSchema>;

/**
 * Structured final output for the Logistics Operation Support agent (`outputType`).
 * Populated after the model has used tools where appropriate (tool-first workflow).
 */
export const logisticsOperationOutputSchema = z.object({
  inquiryKind: logisticsInquiryKindSchema,
  /** Tools the model relied on for this answer (names only). */
  toolsUsed: z.array(z.string().min(1).max(128)).max(16),
  /** Short internal summary of facts from tools (not shown verbatim to users if userFacingAnswer is set). */
  findingsSummary: z.string().min(1).max(4000),
  /** Primary answer for the end user (Japanese). */
  userFacingAnswer: z.string().min(1).max(12_000),
  /** Model confidence in the answer (0–1). */
  confidence: z.number().min(0).max(1),
  /** When true, human operators should be involved; model may also call notifySlack. */
  needsEscalation: z.boolean(),
  escalationReason: z.string().max(2000).nullable(),
  suggestedNextSteps: z.array(z.string().min(1).max(500)).max(12),
});

export type LogisticsOperationOutput = z.infer<typeof logisticsOperationOutputSchema>;
