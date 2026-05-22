/** How hits were produced — extensible for RAG pipelines */
export type KnowledgeRetrievalMode =
  | 'lexical'
  | 'semantic'
  | 'hybrid'
  | 'lexical_only';

export type KnowledgeCategory = 'it_support' | 'logistics' | 'hr';

export interface SearchKnowledgeBaseInput {
  query: string;
  category?: KnowledgeCategory;
  language?: string;
  limit?: number;
  /** When true, run semantic path (requires vector backend); default hybrid intent */
  includeSemantic?: boolean;
}

/** Stable reference for citations / footnotes in agent answers */
export interface KnowledgeCitation {
  documentId: string;
  chunkId: string;
  documentCode?: string;
  title: string;
  sourceUrl?: string;
  /** Human-readable pointer, e.g. `KB-IT-001#chunk-2` */
  locator: string;
  /** Optional excerpt offset within the chunk text */
  excerptSpan?: { start: number; end: number };
}

/** One retrievable segment aligned with future `knowledge_chunks` rows */
export interface KnowledgeChunkHit {
  citation: KnowledgeCitation;
  chunkIndex: number;
  /** Total chunks for this document (when known) */
  chunkCount?: number;
  content: string;
  summary?: string;
  category: string;
  language?: string;
  /** Lexical / fused / semantic relevance */
  score?: number;
  matchKind: 'lexical' | 'semantic' | 'hybrid';
  /** Populated when semantic path runs */
  vector?: {
    distance?: number;
    embeddingModel?: string;
    dimensions?: number;
  };
}

export interface SearchKnowledgeBaseOutput {
  chunks: KnowledgeChunkHit[];
  retrieval: {
    mode: KnowledgeRetrievalMode;
    /** `pgvector` once wired; `none` for placeholder */
    vectorBackend: 'none' | 'pgvector';
    lexicalHitCount: number;
    semanticHitCount: number;
  };
  /** Warnings for operators (e.g. semantic disabled) */
  warnings?: string[];
}
