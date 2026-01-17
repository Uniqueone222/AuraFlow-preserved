import { MemoryEntry, MemoryProvider } from './MemoryProvider';
/**
 * File-based persistent memory provider
 * Stores workflow execution history as JSON files
 */
export declare class FileMemoryProvider implements MemoryProvider {
    private storageDir;
    constructor(storageDir?: string);
    /**
     * Ensure storage directory exists
     */
    private ensureStorageDir;
    /**
     * Get the path for a workflow's memory file
     */
    private getWorkflowPath;
    /**
     * Load all entries for a workflow
     */
    private loadWorkflowEntries;
    /**
     * Save all entries for a workflow
     */
    private saveWorkflowEntries;
    /**
     * Save a single memory entry
     */
    save(entry: MemoryEntry): Promise<void>;
    /**
     * Query memory entries by workflow and search term
     */
    query(query: string, workflowId: string, limit?: number): Promise<MemoryEntry[]>;
    /**
     * Get all entries for a workflow
     */
    getAllEntries(workflowId: string): Promise<MemoryEntry[]>;
    /**
     * Clear all entries for a workflow
     */
    clearWorkflow(workflowId: string): Promise<void>;
    /**
     * Get storage directory path
     */
    getStorageDir(): string;
}
