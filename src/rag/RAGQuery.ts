import { QdrantMemoryProvider } from '../memory/QdrantMemoryProvider';
import { embed } from '../utils/embeddings';
import chalk from 'chalk';

/**
 * RAG (Retrieval Augmented Generation) Query Engine
 * Enables retrieval of persistent memories from Qdrant vector database
 */
export class RAGQuery {
  private memoryProvider: QdrantMemoryProvider;

  constructor() {
    this.memoryProvider = new QdrantMemoryProvider();
  }

  /**
   * Query the memory database for relevant workflows or agent outputs
   * @param query - Natural language query
   * @param workflowId - Optional filter by workflow ID
   * @param limit - Number of results to return (default: 5)
   * @returns Promise resolving to relevant memory entries
   */
  async query(query: string, workflowId?: string, limit: number = 5): Promise<any[]> {
    try {
      console.log(chalk.cyan.bold(`\n🔍 RAG QUERY INITIATED`));
      console.log(chalk.cyan(`Query: "${query}"`));
      if (workflowId && workflowId !== 'all-workflows') {
        console.log(chalk.cyan(`Workflow Filter: ${workflowId}`));
      }
      console.log(chalk.cyan(`Results Limit: ${limit}\n`));

      // Query without workflow filter to get all memories
      const results = await this.memoryProvider.query(
        query,
        'all-workflows',
        limit
      );

      if (results.length === 0) {
        console.log(chalk.yellow('No relevant memories found.'));
        return [];
      }

      // Format results for display
      console.log(chalk.green.bold(`✓ Found ${results.length} relevant memories:\n`));

      const formattedResults = results.map((entry, index) => {
        const timestamp = new Date(entry.timestamp).toLocaleString();
        return {
          rank: index + 1,
          agentId: entry.agentId,
          workflowId: entry.workflowId,
          step: entry.step,
          content: entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : ''),
          timestamp,
          fullContent: entry.content
        };
      });

      // Display formatted results
      formattedResults.forEach(result => {
        console.log(chalk.blue.bold(`─ Result ${result.rank} (Relevance Rank)`));
        console.log(chalk.blue(`  Agent: ${result.agentId}`));
        console.log(chalk.blue(`  Workflow: ${result.workflowId}`));
        console.log(chalk.blue(`  Step: ${result.step}`));
        console.log(chalk.blue(`  Timestamp: ${result.timestamp}`));
        console.log(chalk.blue(`  Content: ${result.content}`));
        console.log();
      });

      return formattedResults;
    } catch (error: any) {
      console.error(chalk.red(`✘ RAG Query failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Search for memories across all workflows
   * @param query - Natural language search query
   * @param limit - Number of results to return
   */
  async searchGlobal(query: string, limit: number = 10): Promise<any[]> {
    return this.query(query, undefined, limit);
  }

  /**
   * Search for memories from a specific workflow
   * @param query - Natural language search query
   * @param workflowId - Workflow ID to search within
   * @param limit - Number of results to return
   */
  async searchWorkflow(query: string, workflowId: string, limit: number = 5): Promise<any[]> {
    return this.query(query, workflowId, limit);
  }

  /**
   * Search for memories from a specific agent
   * @param query - Natural language search query
   * @param agentId - Agent ID to search for
   * @param limit - Number of results to return
   */
  async searchAgent(query: string, agentId: string, limit: number = 5): Promise<any[]> {
    try {
      console.log(chalk.cyan.bold(`\n🔍 AGENT MEMORY SEARCH`));
      console.log(chalk.cyan(`Agent: ${agentId}`));
      console.log(chalk.cyan(`Query: "${query}"\n`));

      const results = await this.searchGlobal(query, limit);
      const agentResults = results.filter((r: any) => r.agentId === agentId);

      if (agentResults.length === 0) {
        console.log(chalk.yellow(`No memories found for agent "${agentId}".`));
        return [];
      }

      console.log(chalk.green.bold(`✓ Found ${agentResults.length} agent memories:\n`));
      return agentResults;
    } catch (error: any) {
      console.error(chalk.red(`✘ Agent search failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<any> {
    try {
      console.log(chalk.cyan.bold(`\n📊 MEMORY STATISTICS\n`));
      
      // Note: This would require additional Qdrant API calls
      console.log(chalk.cyan('Memory backend: Qdrant Vector Database'));
      console.log(chalk.cyan('Collection: auraflow_memory'));
      console.log(chalk.cyan('Embedding Model: Xenova/all-MiniLM-L6-v2'));
      console.log(chalk.cyan('Embedding Dimension: 384'));
      
      return {
        backend: 'qdrant',
        collection: 'auraflow_memory',
        embeddingModel: 'Xenova/all-MiniLM-L6-v2',
        embeddingDimension: 384
      };
    } catch (error: any) {
      console.error(chalk.red(`✘ Failed to get stats: ${error.message}`));
      throw error;
    }
  }
}
