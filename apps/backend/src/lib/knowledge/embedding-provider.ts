/**
 * Abstraction for query embeddings used with pgvector / hosted embedding APIs.
 * Inject a production implementation (e.g. OpenAI `text-embedding-3-small`).
 */
export interface EmbeddingProvider {
  readonly modelId: string;
  readonly dimensions: number;
  embedText(text: string): Promise<Float32Array>;
}

/** No network I/O — deterministic stub for dev / until RAG is wired */
export class StubEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = 'stub-deterministic';
  readonly dimensions = 1536;

  async embedText(text: string): Promise<Float32Array> {
    const vector = new Float32Array(this.dimensions);
    for (let i = 0; i < text.length; i += 1) {
      vector[i % this.dimensions] += text.charCodeAt(i) / 65536;
    }
    return vector;
  }
}
