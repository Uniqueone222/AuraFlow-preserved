/**
 * RAG (Retrieval Augmented Generation) Query Engine
 * Enables retrieval of persistent memories from Qdrant vector database
 */
export declare class RAGQuery {
    private memoryProvider;
    constructor();
    /**
     * Query the memory database for relevant workflows or agent outputs
     * @param query - Natural language query
     * @param workflowId - Optional filter by workflow ID
     * @param limit - Number of results to return (default: 5)
     * @returns Promise resolving to relevant memory entries
     */
    query(query: string, workflowId?: string, limit?: number): Promise<any[]>;
    /**
     * Search for memories across all workflows
     * @param query - Natural language search query
     * @param limit - Number of results to return
     */
    searchGlobal(query: string, limit?: number): Promise<any[]>;
    /**
     * Search for memories from a specific workflow
     * @param query - Natural language search query
     * @param workflowId - Workflow ID to search within
     * @param limit - Number of results to return
     */
    searchWorkflow(query: string, workflowId: string, limit?: number): Promise<any[]>;
    /**
     * Search for memories from a specific agent
     * @param query - Natural language search query
     * @param agentId - Agent ID to search for
     * @param limit - Number of results to return
     */
    searchAgent(query: string, agentId: string, limit?: number): Promise<any[]>;
    /**
     * Get memory statistics
     */
    getStats(): Promise<any>;
}
