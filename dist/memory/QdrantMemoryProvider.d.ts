import { MemoryEntry, MemoryProvider } from "./MemoryProvider";
export declare class QdrantMemoryProvider implements MemoryProvider {
    private client;
    private collection;
    constructor();
    save(entry: MemoryEntry): Promise<void>;
    query(query: string, workflowId: string, limit: number): Promise<MemoryEntry[]>;
    clear(): Promise<void>;
}
