"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantMemoryProvider = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const embeddings_1 = require("../utils/embeddings");
class QdrantMemoryProvider {
    client;
    collection;
    constructor() {
        this.client = new js_client_rest_1.QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
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
        const result = await this.client.search(this.collection, {
            vector,
            limit,
            filter: {
                must: [
                    {
                        key: "workflowId",
                        match: { value: workflowId }
                    }
                ]
            }
        });
        return result.map(r => ({
            agentId: r.payload.agentId,
            workflowId: r.payload.workflowId,
            step: r.payload.step,
            content: r.payload.content,
            timestamp: r.payload.timestamp
        }));
    }
}
exports.QdrantMemoryProvider = QdrantMemoryProvider;
//# sourceMappingURL=QdrantMemoryProvider.js.map