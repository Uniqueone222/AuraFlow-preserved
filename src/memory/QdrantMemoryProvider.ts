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

    // Build search parameters
    const searchParams: any = {
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

    const result = await this.client.search(this.collection, searchParams)

    return result.map(r => ({
      agentId: r.payload!.agentId as string,
      workflowId: r.payload!.workflowId as string,
      step: r.payload!.step as number,
      content: r.payload!.content as string,
      timestamp: r.payload!.timestamp as number
    }))
  }

  async clear(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collection)
      
      // Recreate the collection for future use
      await this.client.createCollection(this.collection, {
        vectors: {
          size: 384,
          distance: "Cosine"
        }
      })
    } catch (error: any) {
      throw new Error(`Failed to clear memory collection: ${error.message}`)
    }
  }
}
