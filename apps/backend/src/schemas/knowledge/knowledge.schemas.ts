import { z } from 'zod';

import { agentNullable } from '../agent-zod.js';

export const knowledgeCategorySchema = z.enum(['it_support', 'logistics', 'hr']);

const searchKnowledgeBaseObjectSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, '検索クエリを入力してください')
    .max(2000, '検索クエリは2000文字以内で入力してください'),
  category: agentNullable(knowledgeCategorySchema),
  language: agentNullable(z.string().trim().min(2).max(16)),
  limit: agentNullable(z.number().int().min(1).max(25)),
  includeSemantic: agentNullable(z.boolean()),
});

export const searchKnowledgeBaseToolParametersSchema =
  searchKnowledgeBaseObjectSchema;

export const searchKnowledgeBaseInputSchema = searchKnowledgeBaseToolParametersSchema;

export type SearchKnowledgeBaseInputSchema = z.infer<
  typeof searchKnowledgeBaseInputSchema
>;
