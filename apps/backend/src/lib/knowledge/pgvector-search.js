export class NoOpPgVectorKnowledgeSearch {
    backend = 'none';
    isConfigured() {
        return false;
    }
    async searchSemantic(_params) {
        return [];
    }
}
