"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantMemoryProvider = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const embeddings_1 = require("../utils/embeddings");
class QdrantMemoryProvider {
    client;
    collection;
    constructor() {
        const QDRANT_URL = process.env.QDRANT_URL;
        const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
        // Validate required environment variables
        if (!QDRANT_URL || !QDRANT_API_KEY) {
            throw new Error('Qdrant memory backend is enabled but QDRANT_URL and/or QDRANT_API_KEY are not set. ' +
                'Please set these environment variables or disable memory backend by removing MEMORY_BACKEND=qdrant.');
        }
        this.client = new js_client_rest_1.QdrantClient({
            url: QDRANT_URL,
            apiKey: QDRANT_API_KEY
        });
        this.collection = process.env.QDRANT_COLLECTION || "auraflow_memory";
    }
    async save(entry) {
        const vector = await (0, embeddings_1.embed)(entry.content);
        await this.client.upsert(this.collection, {
            wait: true,
            points: [
                {
                    id: crypto.randomUUID(),
                    vector,
                    payload: {
                        agentId: entry.agentId,
                        workflowId: entry.workflowId,
                        step: entry.step,
                        content: entry.content,
                        timestamp: entry.timestamp
                    }
                }
            ]
        });
    }
    async query(query, workflowId, limit) {
        const vector = await (0, embeddings_1.embed)(query);
        // Build search parameters
        const searchParams = {
            vector,
            limit,
            with_payload: true
        };
        // Only add filter if workflowId is specified and not 'all-workflows'
        if (workflowId && workflowId !== 'all-workflows') {
            searchParams.query_filter = {
                must: [
                    {
                        key: "workflowId",
                        match: { value: workflowId }
                    }
                ]
            };
        }
        const result = await this.client.search(this.collection, searchParams);
        return result.map(r => ({
            agentId: r.payload.agentId,
            workflowId: r.payload.workflowId,
            step: r.payload.step,
            content: r.payload.content,
            timestamp: r.payload.timestamp
        }));
    }
    async clear() {
        try {
            await this.client.deleteCollection(this.collection);
            // Recreate the collection for future use
            await this.client.createCollection(this.collection, {
                vectors: {
                    size: 384,
                    distance: "Cosine"
                }
            });
        }
        catch (error) {
            throw new Error(`Failed to clear memory collection: ${error.message}`);
        }
    }
}
exports.QdrantMemoryProvider = QdrantMemoryProvider;
//# sourceMappingURL=QdrantMemoryProvider.js.map