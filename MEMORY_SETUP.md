# AuraFlow Persistent Memory & RAG Setup - Complete Guide

## ✅ What Was Implemented

You now have a **fully functional persistent memory system** with Retrieval Augmented Generation (RAG) capabilities enabled for AuraFlow. Here's what's been set up:

---

## 🏗️ Architecture

### 1. **Vector Database: Qdrant**
- **Container**: Running on `localhost:6333` with persistent storage
- **Collection**: `auraflow_memory` with 384-dimensional vectors
- **Embedding Model**: Xenova/all-MiniLM-L6-v2 (CSS embeddings)
- **Distance Metric**: Cosine similarity for semantic search

### 2. **Memory System Components**

#### Memory Provider (`src/memory/`)
- **MemoryProvider.ts**: Interface for memory backends
- **QdrantMemoryProvider.ts**: Qdrant integration
  - Converts workflow outputs to embeddings
  - Stores in vector database with metadata
  - Supports semantic search across memories

#### RAG Query Engine (`src/rag/RAGQuery.ts`)
- `query(query, workflowId, limit)` - Global or workflow-specific search
- `searchGlobal(query, limit)` - Search all memories
- `searchWorkflow(query, workflowId, limit)` - Filter by workflow
- `searchAgent(query, agentId, limit)` - Filter by agent
- `getStats()` - Display memory statistics

### 3. **CLI Commands Added**

```bash
# Initialize the vector database collection (one-time setup)
auraflow init-memory

# Query memories using natural language
auraflow query "your search query"

# Query with filters
auraflow query "climate change" --agent researcher --limit 5
auraflow query "renewable energy" --workflow demo-workflow --limit 10

# Display memory statistics
auraflow memory-stats
```

---

## 🚀 How It Works

### Workflow Execution with Memory Persistence

```
┌─────────────────────────────────────┐
│  Run Workflow                       │
│  (e.g., auraflow run example.yaml)  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Agent Executes & Produces Output   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Output Saved to Context            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Convert to Embedding (384-dim)     │
│  Store in Qdrant with Metadata      │
│  (agentId, workflowId, content)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Memory Persisted in Vector DB      │
│  Ready for Future Retrieval         │
└─────────────────────────────────────┘
```

### RAG Query Flow

```
User Query: "social media mental health"
             │
             ▼
Convert to Embedding (384-dim)
             │
             ▼
Semantic Search in Qdrant
(Find similar memories using cosine similarity)
             │
             ▼
Return Top K Results Ranked by Relevance
             │
             ▼
Display with Metadata:
- Agent that generated it
- Workflow ID
- Execution step
- Timestamp
- Full content
```

---

## 📊 Memory Metadata

Each stored memory includes:

```javascript
{
  agentId: string,           // Which agent generated this
  workflowId: string,        // Which workflow execution
  step: number,              // Execution step number
  content: string,           // Full agent output
  timestamp: number,         // When it was created
  vector: number[]           // 384-dimensional embedding
}
```

---

## 💾 Data Storage

### Docker Setup
```bash
# Qdrant container running with persistent storage
Container: qdrant
Image: qdrant/qdrant:latest
Ports: 6333 (REST API), 6334 (gRPC)
Volume: qdrant_storage:/qdrant/storage (persists between restarts)
```

### Environment Configuration (`.env`)
```env
MEMORY_BACKEND=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=qdrant-api-key-123
QDRANT_COLLECTION=auraflow_memory
```

---

## 🎯 Example Usage

### 1. Run a Workflow (Automatically Saves Memory)
```bash
auraflow run examples/basic-sequential-example.yaml
# Output is automatically stored in Qdrant with embeddings
```

### 2. Query Memories Later
```bash
# Search all memories
auraflow query "renewable energy"

# Search by agent
auraflow query "climate research" --agent researcher

# Search specific workflow
auraflow query "mental health" --workflow demo-workflow

# Limit results
auraflow query "sustainability" --limit 10
```

### 3. Check Memory Statistics
```bash
auraflow memory-stats
# Shows:
# - Backend: Qdrant Vector Database
# - Collection: auraflow_memory
# - Embedding Model: Xenova/all-MiniLM-L6-v2
# - Dimension: 384
```

---

## 🔍 How RAG Enables Future Capabilities

This persistent memory with RAG enables:

1. **Knowledge Reuse**
   - Query past agent outputs across workflows
   - Feed relevant memories as context to new agents

2. **Contextual Awareness**
   - New workflows can access learnings from previous executions
   - Agents can build on past experiences

3. **Semantic Search**
   - Find memories by meaning, not just keywords
   - "climate" matches discussions about "global warming"

4. **Performance Optimization**
   - Avoid redundant computations
   - Retrieve cached results for similar queries

5. **Workflow Analysis**
   - Track what agents have learned over time
   - Identify patterns across multiple executions

6. **Enhanced Decision Making**
   - Conditional workflows can query memory
   - Route decisions based on historical context

---

## 🛠️ Technical Stack

| Component | Technology |
|-----------|-----------|
| Vector Database | Qdrant |
| Embeddings | Xenova/transformers (all-MiniLM-L6-v2) |
| Storage | Docker volume (persistent) |
| Dimension | 384-dimensional vectors |
| Distance | Cosine similarity |
| Serialization | JSON (Qdrant payloads) |

---

## 📝 Key Features

✅ **Persistent Storage**
- Memories survive workflow execution
- Docker volume ensures data persistence

✅ **Fast Retrieval**
- Qdrant optimized for vector search
- Sub-millisecond query times at scale

✅ **Semantic Understanding**
- Embeddings capture meaning
- Queries find semantically similar content

✅ **Metadata Tracking**
- Know which agent generated each memory
- Track workflow and step information
- Timestamps for temporal analysis

✅ **Flexible Querying**
- Global search across all memories
- Filter by workflow or agent
- Configurable result limits

---

## 🚀 Next Steps & Potential Enhancements

1. **Implement Feedback Loop**
   - Store relevance scores
   - Track which memories helped agents succeed

2. **Add Time-based Filtering**
   - Query memories from last N days
   - Temporal memory decay

3. **Implement Memory Summarization**
   - Compress long memories periodically
   - Keep most important information

4. **Create Memory Dashboards**
   - Visualize memory access patterns
   - Show agent effectiveness over time

5. **Advanced RAG Features**
   - Combine multiple retrieved memories
   - Use memories as context for new agent runs
   - Implement memory-aware agents

6. **Multi-workspace Support**
   - Isolate memories by workspace
   - Cross-workspace memory sharing

---

## 🐳 Docker Management

```bash
# Check Qdrant status
docker ps | grep qdrant

# View logs
docker logs qdrant

# Restart Qdrant
docker restart qdrant

# Stop Qdrant
docker stop qdrant

# Remove Qdrant (keeps data)
docker rm qdrant

# Remove storage volume (deletes all memories!)
docker volume rm qdrant_storage
```

---

## ✨ Summary

Your AuraFlow system now has:

✅ Persistent vector database (Qdrant)
✅ Automatic memory capture during workflow execution  
✅ 384-dimensional semantic embeddings
✅ RAG query engine for memory retrieval
✅ Filter and search capabilities
✅ Full CLI integration
✅ Ready for advanced multi-agent scenarios

**The memory system is live and ready to use!**
