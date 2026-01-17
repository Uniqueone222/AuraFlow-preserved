import { QdrantClient } from "@qdrant/js-client-rest"
import { MemoryEntry, MemoryProvider } from "./MemoryProvider"
import { embed } from "../utils/embeddings"

export class QdrantMemoryProvider implements MemoryProvider {
  private client: QdrantClient
  private collection: string

  constructor() {
    const QDRANT_URL = process.env.QDRANT_URL;
    const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
    
    // Validate required environment variables
    if (!QDRANT_URL || !QDRANT_API_KEY) {
      throw new Error(
        'Qdrant memory backend is enabled but QDRANT_URL and/or QDRANT_API_KEY are not set. ' +
        'Please set these environment variables or disable memory backend by removing MEMORY_BACKEND=qdrant.'
      );
    }

    this.client = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY
    })

    this.collection = process.env.QDRANT_COLLECTION || "auraflow_memory"
  }

  async save(entry: MemoryEntry): Promise<void> {
    const vector = await embed(entry.content)

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
    })
  }

  async query(
    query: string,
    workflowId: string,
    limit: number
  ): Promise<MemoryEntry[]> {
    const vector = await embed(query)

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
    })

    return result.map(r => ({
      agentId: r.payload!.agentId as string,
      workflowId: r.payload!.workflowId as string,
      step: r.payload!.step as number,
      content: r.payload!.content as string,
      timestamp: r.payload!.timestamp as number
    }))
  }
}
