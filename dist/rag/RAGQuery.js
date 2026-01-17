"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGQuery = void 0;
const QdrantMemoryProvider_1 = require("../memory/QdrantMemoryProvider");
const chalk_1 = __importDefault(require("chalk"));
/**
 * RAG (Retrieval Augmented Generation) Query Engine
 * Enables retrieval of persistent memories from Qdrant vector database
 */
class RAGQuery {
    memoryProvider;
    constructor() {
        this.memoryProvider = new QdrantMemoryProvider_1.QdrantMemoryProvider();
    }
    /**
     * Query the memory database for relevant workflows or agent outputs
     * @param query - Natural language query
     * @param workflowId - Optional filter by workflow ID
     * @param limit - Number of results to return (default: 5)
     * @returns Promise resolving to relevant memory entries
     */
    async query(query, workflowId, limit = 5) {
        try {
            console.log(chalk_1.default.cyan.bold(`\n🔍 RAG QUERY INITIATED`));
            console.log(chalk_1.default.cyan(`Query: "${query}"`));
            if (workflowId && workflowId !== 'all-workflows') {
                console.log(chalk_1.default.cyan(`Workflow Filter: ${workflowId}`));
            }
            console.log(chalk_1.default.cyan(`Results Limit: ${limit}\n`));
            // Query without workflow filter to get all memories
            const results = await this.memoryProvider.query(query, 'all-workflows', limit);
            if (results.length === 0) {
                console.log(chalk_1.default.yellow('No relevant memories found.'));
                return [];
            }
            // Format results for display
            console.log(chalk_1.default.green.bold(`✓ Found ${results.length} relevant memories:\n`));
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
                console.log(chalk_1.default.blue.bold(`─ Result ${result.rank} (Relevance Rank)`));
                console.log(chalk_1.default.blue(`  Agent: ${result.agentId}`));
                console.log(chalk_1.default.blue(`  Workflow: ${result.workflowId}`));
                console.log(chalk_1.default.blue(`  Step: ${result.step}`));
                console.log(chalk_1.default.blue(`  Timestamp: ${result.timestamp}`));
                console.log(chalk_1.default.blue(`  Content: ${result.content}`));
                console.log();
            });
            return formattedResults;
        }
        catch (error) {
            console.error(chalk_1.default.red(`✘ RAG Query failed: ${error.message}`));
            throw error;
        }
    }
    /**
     * Search for memories across all workflows
     * @param query - Natural language search query
     * @param limit - Number of results to return
     */
    async searchGlobal(query, limit = 10) {
        return this.query(query, undefined, limit);
    }
    /**
     * Search for memories from a specific workflow
     * @param query - Natural language search query
     * @param workflowId - Workflow ID to search within
     * @param limit - Number of results to return
     */
    async searchWorkflow(query, workflowId, limit = 5) {
        return this.query(query, workflowId, limit);
    }
    /**
     * Search for memories from a specific agent
     * @param query - Natural language search query
     * @param agentId - Agent ID to search for
     * @param limit - Number of results to return
     */
    async searchAgent(query, agentId, limit = 5) {
        try {
            console.log(chalk_1.default.cyan.bold(`\n🔍 AGENT MEMORY SEARCH`));
            console.log(chalk_1.default.cyan(`Agent: ${agentId}`));
            console.log(chalk_1.default.cyan(`Query: "${query}"\n`));
            const results = await this.searchGlobal(query, limit);
            const agentResults = results.filter((r) => r.agentId === agentId);
            if (agentResults.length === 0) {
                console.log(chalk_1.default.yellow(`No memories found for agent "${agentId}".`));
                return [];
            }
            console.log(chalk_1.default.green.bold(`✓ Found ${agentResults.length} agent memories:\n`));
            return agentResults;
        }
        catch (error) {
            console.error(chalk_1.default.red(`✘ Agent search failed: ${error.message}`));
            throw error;
        }
    }
    /**
     * Get memory statistics
     */
    async getStats() {
        try {
            console.log(chalk_1.default.cyan.bold(`\n📊 MEMORY STATISTICS\n`));
            // Note: This would require additional Qdrant API calls
            console.log(chalk_1.default.cyan('Memory backend: Qdrant Vector Database'));
            console.log(chalk_1.default.cyan('Collection: auraflow_memory'));
            console.log(chalk_1.default.cyan('Embedding Model: Xenova/all-MiniLM-L6-v2'));
            console.log(chalk_1.default.cyan('Embedding Dimension: 384'));
            return {
                backend: 'qdrant',
                collection: 'auraflow_memory',
                embeddingModel: 'Xenova/all-MiniLM-L6-v2',
                embeddingDimension: 384
            };
        }
        catch (error) {
            console.error(chalk_1.default.red(`✘ Failed to get stats: ${error.message}`));
            throw error;
        }
    }
}
exports.RAGQuery = RAGQuery;
//# sourceMappingURL=RAGQuery.js.map