import { runTool } from '../../lib/tools/tool-result';
import { searchKnowledgeBaseInputSchema } from '../../schemas/knowledge/knowledge.schemas';
import { stripNullFields } from '../../schemas/agent-zod.js';
import { knowledgeService } from '../../services';
export async function searchKnowledgeBase(input, _context) {
    const parsed = searchKnowledgeBaseInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? '入力値が不正です',
            errorCode: 'VALIDATION_ERROR',
        };
    }
    return runTool(() => knowledgeService.searchKnowledgeBase(stripNullFields(parsed.data)));
}
