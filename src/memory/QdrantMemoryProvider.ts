import { QdrantClient } from "@qdrant/js-client-rest"
import { MemoryEntry, MemoryProvider } from "./MemoryProvider"
import { embed } from "../utils/embeddings"
import { Logger, LogLevel } from "../utils/Logger"

export class QdrantMemoryProvider implements MemoryProvider {
  private client: QdrantClient
  private collection: string
  private logger: Logger

  constructor() {
    const QDRANT_URL = process.env.QDRANT_URL;
    const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
    this.logger = Logger.getInstance();
    
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
    this.logger.logSessionEvent('Qdrant Memory Provider Initialized', undefined, undefined, undefined, {
      url: QDRANT_URL,
      collection: this.collection
    });
  }

  async save(entry: MemoryEntry): Promise<void> {
    try {
      const startTime = Date.now();
      const correlationId = this.logger.logNetworkRequest(
        'PUT',
        `${process.env.QDRANT_URL}/collections/${this.collection}/points/upsert`,
        'Qdrant',
        JSON.stringify(entry).length
      );

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

      const duration = Date.now() - startTime;
      this.logger.logNetworkResponse(
        correlationId,
        200,
        JSON.stringify(entry).length,
        duration
      );
    } catch (error: any) {
      this.logger.log(LogLevel.ERROR, `Qdrant save failed: ${error.message}`, {
        workflowId: entry.workflowId,
        agentId: entry.agentId
      });
      throw error;
    }
  }

  async query(
    query: string,
    workflowId: string,
    limit: number
  ): Promise<MemoryEntry[]> {
    try {
      const startTime = Date.now();
      const correlationId = this.logger.logNetworkRequest(
        'POST',
        `${process.env.QDRANT_URL}/collections/${this.collection}/points/search`,
        'Qdrant',
        query.length
      );

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
      const duration = Date.now() - startTime;

      this.logger.logNetworkResponse(
        correlationId,
        200,
        JSON.stringify(result).length,
        duration
      );

      return result.map(r => ({
        agentId: r.payload!.agentId as string,
        workflowId: r.payload!.workflowId as string,
        step: r.payload!.step as number,
        content: r.payload!.content as string,
        timestamp: r.payload!.timestamp as number
      }))
    } catch (error: any) {
      this.logger.log(LogLevel.ERROR, `Qdrant query failed: ${error.message}`, {
        workflowId,
        limit
      });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const startTime = Date.now();
      const correlationId = this.logger.logNetworkRequest(
        'DELETE',
        `${process.env.QDRANT_URL}/collections/${this.collection}`,
        'Qdrant'
      );

      await this.client.deleteCollection(this.collection)
      
      // Recreate the collection for future use
      await this.client.createCollection(this.collection, {
        vectors: {
          size: 384,
          distance: "Cosine"
        }
      })

      const duration = Date.now() - startTime;
      this.logger.logNetworkResponse(
        correlationId,
        200,
        0,
        duration
      );
    } catch (error: any) {
      this.logger.log(LogLevel.ERROR, `Qdrant clear failed: ${error.message}`);
      throw new Error(`Failed to clear memory collection: ${error.message}`)
    }
  }
}
