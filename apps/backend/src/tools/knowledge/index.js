import { tool } from '@openai/agents';
import { stripNullFields } from '../../schemas/agent-zod.js';
import { searchKnowledgeBaseToolParametersSchema } from '../../schemas/knowledge/knowledge.schemas';
import { searchKnowledgeBase } from './search-knowledge-base.tool';
export const searchKnowledgeBaseAgentTool = tool({
    name: 'searchKnowledgeBase',
    description: '社内ナレッジ（IT / 物流 / 人事）を検索します。チャンク単位で抜粋と引用メタデータ（documentId, chunkId, locator, sourceUrl）を返します。includeSemantic=true で埋め込み類似度のプレースホルダ併用（将来 pgvector 接続）。',
    parameters: searchKnowledgeBaseToolParametersSchema,
    execute: async (input) => searchKnowledgeBase(stripNullFields(input)),
});
export const knowledgeAgentTools = [searchKnowledgeBaseAgentTool];
export { searchKnowledgeBase } from './search-knowledge-base.tool';
