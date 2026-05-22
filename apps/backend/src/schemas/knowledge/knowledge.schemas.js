import { z } from 'zod';
export const knowledgeCategorySchema = z.enum(['it_support', 'logistics', 'hr']);
export const searchKnowledgeBaseInputSchema = z.object({
    query: z
        .string()
        .trim()
        .min(1, '検索クエリを入力してください')
        .max(2000, '検索クエリは2000文字以内で入力してください'),
    category: knowledgeCategorySchema.optional(),
    language: z.string().trim().min(2).max(16).optional(),
    limit: z.number().int().min(1).max(25).optional(),
    includeSemantic: z.boolean().optional(),
});
