import type {
  KnowledgeCategory,
  KnowledgeChunkHit,
  KnowledgeRetrievalMode,
  SearchKnowledgeBaseInput,
  SearchKnowledgeBaseOutput,
} from '@inquiry-agent/shared-types';

import { knowledgeCorpusSeeds } from '../data/knowledge-corpus';
import type { EmbeddingProvider } from '../lib/knowledge/embedding-provider';
import type {
  KnowledgeChunkVectorRow,
  PgVectorKnowledgeSearch,
  SemanticSearchHit,
} from '../lib/knowledge/pgvector-search';
import { ToolExecutionError } from '../lib/tools/tool-result';

function locator(documentCode: string, chunkIndex: number): string {
  return `${documentCode}#chunk-${chunkIndex}`;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\u3000、。．,.:;/\\|]+/u)
    .filter((t) => t.length > 0);
}

function lexicalScore(queryTokens: string[], queryRaw: string, text: string): number {
  const hay = text.toLowerCase();
  const q = queryRaw.trim().toLowerCase();
  let score = 0;
  if (q.length > 0 && hay.includes(q)) {
    score += 3;
  }
  for (const token of queryTokens) {
    if (token.length === 0) {
      continue;
    }
    if (token.length >= 2 && hay.includes(token)) {
      score += 1;
      continue;
    }
    if (token.length === 1 && /[\u3000-\u9fff\uff00-\uffef]/u.test(token) && hay.includes(token)) {
      score += 1;
    }
  }
  return score;
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export class KnowledgeService {
  constructor(
    private readonly vectorSearch: PgVectorKnowledgeSearch,
    private readonly embedder: EmbeddingProvider,
  ) {}

  async searchKnowledgeBase(
    input: SearchKnowledgeBaseInput,
  ): Promise<SearchKnowledgeBaseOutput> {
    const limit = input.limit ?? 8;
    const queryTokens = tokenize(input.query);
    if (queryTokens.length === 0) {
      throw new ToolExecutionError(
        '検索に使用できる語がクエリに含まれていません',
        'INVALID_INPUT',
      );
    }

    const warnings: string[] = [];
    const lexicalHits: KnowledgeChunkHit[] = [];

    for (const doc of knowledgeCorpusSeeds) {
      if (input.category && doc.category !== input.category) {
        continue;
      }
      if (input.language && doc.language !== input.language) {
        continue;
      }

      const chunkCount = doc.chunks.length;
      for (const chunk of doc.chunks) {
        const haystack = `${doc.title}\n${doc.summary}\n${chunk.content}`;
        const score = lexicalScore(queryTokens, input.query, haystack);
        if (score <= 0) {
          continue;
        }

        lexicalHits.push({
          citation: {
            documentId: doc.documentId,
            chunkId: chunk.chunkId,
            documentCode: doc.documentCode,
            title: doc.title,
            sourceUrl: doc.sourceUrl,
            locator: locator(doc.documentCode, chunk.chunkIndex),
            excerptSpan: { start: 0, end: Math.min(280, chunk.content.length) },
          },
          chunkIndex: chunk.chunkIndex,
          chunkCount,
          content: chunk.content.slice(0, 400),
          summary: doc.summary,
          category: doc.category,
          language: doc.language,
          score,
          matchKind: 'lexical',
        });
      }
    }

    lexicalHits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const lexicalTop = lexicalHits.slice(0, limit);

    let semanticHits: SemanticSearchHit[] = [];
    let vectorBackend: 'none' | 'pgvector' = 'none';

    if (input.includeSemantic) {
      const queryEmbedding = await this.embedder.embedText(input.query);

      if (this.vectorSearch.isConfigured() && this.vectorSearch.backend === 'pgvector') {
        vectorBackend = 'pgvector';
        semanticHits = await this.vectorSearch.searchSemantic({
          queryEmbedding,
          limit,
          category: input.category,
          language: input.language,
        });
      } else {
        /** Local embedding similarity placeholder (not pgvector-backed) */
        warnings.push(
          'セマンティック検索はローカル埋め込み類似度のプレースホルダです。本番では pgvector + 事前計算チャンク埋め込みに差し替えてください。',
        );

        const candidates: SemanticSearchHit[] = [];

        for (const doc of knowledgeCorpusSeeds) {
          if (input.category && doc.category !== input.category) {
            continue;
          }
          if (input.language && doc.language !== input.language) {
            continue;
          }

          for (const chunk of doc.chunks) {
            const textForEmbed = chunk.content.slice(0, 800);
            const chunkEmbedding = await this.embedder.embedText(textForEmbed);
            const score = cosineSimilarity(queryEmbedding, chunkEmbedding);

            const row: KnowledgeChunkVectorRow = {
              chunkId: chunk.chunkId,
              documentId: doc.documentId,
              documentCode: doc.documentCode,
              title: doc.title,
              content: chunk.content,
              summary: doc.summary,
              category: doc.category,
              language: doc.language,
              sourceUrl: doc.sourceUrl,
              chunkIndex: chunk.chunkIndex,
              chunkCount: doc.chunks.length,
            };

            candidates.push({
              chunk: row,
              distance: 1 - score,
              score,
            });
          }
        }

        candidates.sort((a, b) => b.score - a.score);
        semanticHits = candidates.slice(0, limit);
      }
    }

    const semanticChunks: KnowledgeChunkHit[] = semanticHits.map((hit) => ({
      citation: {
        documentId: hit.chunk.documentId,
        chunkId: hit.chunk.chunkId,
        documentCode: hit.chunk.documentCode ?? undefined,
        title: hit.chunk.title,
        sourceUrl: hit.chunk.sourceUrl ?? undefined,
        locator: locator(
          hit.chunk.documentCode ?? hit.chunk.documentId,
          hit.chunk.chunkIndex,
        ),
        excerptSpan: { start: 0, end: Math.min(280, hit.chunk.content.length) },
      },
      chunkIndex: hit.chunk.chunkIndex,
      chunkCount: hit.chunk.chunkCount ?? undefined,
      content: hit.chunk.content.slice(0, 400),
      summary: hit.chunk.summary ?? undefined,
      category: hit.chunk.category,
      language: hit.chunk.language ?? undefined,
      score: hit.score,
      matchKind: 'semantic' as const,
      vector: {
        distance: hit.distance,
        embeddingModel: this.embedder.modelId,
        dimensions: this.embedder.dimensions,
      },
    }));

    let mode: KnowledgeRetrievalMode;
    let merged: KnowledgeChunkHit[];

    if (!input.includeSemantic) {
      mode = 'lexical_only';
      merged = lexicalTop;
    } else if (semanticChunks.length === 0) {
      mode = 'lexical_only';
      merged = lexicalTop;
      warnings.push('セマンティック候補が0件のため、レキシカル結果のみ返却しました。');
    } else {
      mode = 'hybrid';
      const byChunk = new Map<string, KnowledgeChunkHit>();

      for (const hit of semanticChunks) {
        byChunk.set(hit.citation.chunkId, { ...hit, matchKind: 'hybrid' });
      }
      for (const hit of lexicalTop) {
        const existing = byChunk.get(hit.citation.chunkId);
        if (!existing) {
          byChunk.set(hit.citation.chunkId, { ...hit, matchKind: 'hybrid' });
        } else {
          const fusedScore = Math.max(
            existing.score ?? 0,
            hit.score ?? 0,
          );
          byChunk.set(hit.citation.chunkId, {
            ...existing,
            score: fusedScore,
            matchKind: 'hybrid',
          });
        }
      }

      merged = [...byChunk.values()].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0),
      );
      merged = merged.slice(0, limit);
    }

    if (merged.length === 0) {
      throw new ToolExecutionError(
        '該当するナレッジチャンクが見つかりません',
        'NO_RESULTS',
        { query: input.query, category: input.category },
      );
    }

    return {
      chunks: merged,
      retrieval: {
        mode,
        vectorBackend,
        lexicalHitCount: lexicalTop.length,
        semanticHitCount: semanticChunks.length,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
