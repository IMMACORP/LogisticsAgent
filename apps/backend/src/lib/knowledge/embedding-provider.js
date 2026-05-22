/** No network I/O — deterministic stub for dev / until RAG is wired */
export class StubEmbeddingProvider {
    modelId = 'stub-deterministic';
    dimensions = 1536;
    async embedText(text) {
        const vector = new Float32Array(this.dimensions);
        for (let i = 0; i < text.length; i += 1) {
            vector[i % this.dimensions] += text.charCodeAt(i) / 65536;
        }
        return vector;
    }
}
