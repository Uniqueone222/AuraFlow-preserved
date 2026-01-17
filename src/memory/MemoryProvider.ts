export interface MemoryEntry {
  agentId: string
  workflowId: string
  step: number
  content: string
  timestamp: number
}

export interface MemoryProvider {
  save(entry: MemoryEntry): Promise<void>

  query(
    query: string,
    workflowId: string,
    limit: number
  ): Promise<MemoryEntry[]>
}
