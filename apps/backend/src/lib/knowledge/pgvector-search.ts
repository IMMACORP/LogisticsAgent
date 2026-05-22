import type { KnowledgeCategory } from '@inquiry-agent/shared-types';

/** Row shape expected once `knowledge_chunks.embedding vector(1536)` exists */
export interface KnowledgeChunkVectorRow {
  chunkId: string;
  documentId: string;
  documentCode: string | null;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  language: string | null;
  sourceUrl: string | null;
  chunkIndex: number;
  chunkCount: number | null;
}

export interface SemanticSearchParams {
  queryEmbedding: Float32Array;
  limit: number;
  category?: KnowledgeCategory;
  language?: string;
}

export interface SemanticSearchHit {
  chunk: KnowledgeChunkVectorRow;
  distance: number;
  score: number;
}

/**
 * pgvector integration boundary.
 *
 * Future implementation (example):
 *
 * ```sql
 * SELECT c.*, (c.embedding <=> $1::vector) AS distance
 * FROM knowledge_chunks c
 * JOIN knowledge_documents d ON d.id = c.document_id
 * WHERE ($2::text IS NULL OR d.category = $2)
 * ORDER BY c.embedding <=> $1::vector
 * LIMIT $3;
 * ```
 *
 * Requires: `CREATE EXTENSION IF NOT EXISTS vector;`
 * Index: `CREATE INDEX ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);`
 */
export interface PgVectorKnowledgeSearch {
  readonly backend: 'none' | 'pgvector';
  isConfigured(): boolean;
  searchSemantic(params: SemanticSearchParams): Promise<SemanticSearchHit[]>;
}

export class NoOpPgVectorKnowledgeSearch implements PgVectorKnowledgeSearch {
  readonly backend = 'none' as const;

  isConfigured(): boolean {
    return false;
  }

  async searchSemantic(_params: SemanticSearchParams): Promise<SemanticSearchHit[]> {
    return [];
  }
}
