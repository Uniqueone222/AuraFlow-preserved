# ⚡ Quick Reference - Persistent Memory & RAG

## 🎯 What Was Set Up

✅ **Qdrant Vector Database** - Running in Docker on `localhost:6333`  
✅ **Persistent Memory Storage** - Auto-saves all workflow agent outputs  
✅ **RAG Query Engine** - Semantic search across stored memories  
✅ **CLI Commands** - Easy access to memory operations  

---

## 🚀 Getting Started

### 1. Initialize Memory (First Time Only)
```bash
auraflow init-memory
```
Creates the Qdrant collection for storing memories.

### 2. Run a Workflow
```bash
auraflow run examples/basic-sequential-example.yaml
```
Automatically saves all agent outputs to the vector database with embeddings.

### 3. Query Memories with RAG
```bash
# Search all memories
auraflow query "your search query"

# Search with filters
auraflow query "climate change" --agent researcher --limit 5

# Show memory statistics
auraflow memory-stats
```

---

## 📋 Commands Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `init-memory` | Initialize vector collection | `auraflow init-memory` |
| `query TEXT` | Search memories by natural language | `auraflow query "sustainable energy"` |
| `query TEXT --agent ID` | Search specific agent's memories | `auraflow query "research" --agent researcher` |
| `query TEXT --workflow ID` | Search specific workflow's memories | `auraflow query "findings" --workflow demo` |
| `query TEXT --limit N` | Limit result count | `auraflow query "topic" --limit 10` |
| `memory-stats` | Show system statistics | `auraflow memory-stats` |

---

## 🗂️ Files Modified/Created

```
src/
├── rag/
│   ├── RAGQuery.ts          ← NEW: Query engine for memory retrieval
│   └── index.ts             ← NEW: Export RAG module
├── memory/
│   └── QdrantMemoryProvider.ts ← UPDATED: Improved search filtering
├── cli/
│   └── initialize-qdrant.ts ← NEW: Collection initialization
└── cli.ts                   ← UPDATED: Added commands (init-memory, query, memory-stats)

MEMORY_SETUP.md              ← NEW: Complete setup documentation
```

---

## 💡 How It Works

**Memory Flow:**
```
Agent Executes → Output Generated → Convert to Embedding
    ↓                                         ↓
Context Updated → Metadata Attached → Store in Qdrant
```

**Query Flow:**
```
User Query → Convert to Embedding → Semantic Search in Qdrant
         ↓                                    ↓
    384-dim vector          Cosine Similarity Ranking
                                    ↓
                          Return Top-K Results
```

---

## 🎨 Memory Features

- **Semantic Understanding**: Finds similar content by meaning
- **Multi-Agent Awareness**: Knows which agent generated each memory
- **Workflow Tracking**: Tracks execution history
- **Timestamp Recording**: Knows when memories were created
- **Flexible Filtering**: Query by agent, workflow, or globally

---

## 🔧 Docker Management

```bash
# Check if Qdrant is running
docker ps | findstr qdrant

# View logs
docker logs qdrant

# Restart Qdrant
docker restart qdrant

# Access Qdrant UI (if available)
# Some versions include web UI on port 6333
```

---

## 📊 Example Queries

```bash
# Topic-based search
auraflow query "artificial intelligence"

# Health-related queries
auraflow query "mental health benefits"

# Environmental topics
auraflow query "renewable energy sustainability"

# Specific agent's research
auraflow query "findings" --agent researcher

# Limited results
auraflow query "climate" --limit 3
```

---

## ✨ Key Benefits

| Feature | Benefit |
|---------|---------|
| **Persistent Storage** | Memories survive workflow executions |
| **Semantic Search** | Find by meaning, not just keywords |
| **Fast Retrieval** | Sub-millisecond vector DB queries |
| **Scalable** | Qdrant handles millions of vectors |
| **Traceable** | Know source and context of each memory |
| **Future-Proof** | Ready for advanced RAG applications |

---

## 🛠️ Troubleshooting

### Qdrant Connection Issues
```bash
# Test connection
curl -H "api-key: qdrant-api-key-123" http://localhost:6333/collections

# Check .env file
cat .env | grep QDRANT
```

### Memory Not Saving
```bash
# Run init-memory again
auraflow init-memory

# Check Qdrant logs
docker logs qdrant
```

### Query Returns No Results
```bash
# Run a workflow first to generate memories
auraflow run examples/basic-sequential-example.yaml

# Then query
auraflow query "your search"
```

---

## 📚 Next Steps

1. **Run Multiple Workflows**
   - Build up memory database
   - Query across different executions

2. **Explore Query Patterns**
   - Test different search terms
   - Use filters for specific agents

3. **Integrate with New Workflows**
   - Create new YAML workflows
   - Watch memories accumulate

4. **Advanced RAG Uses**
   - Feed query results as context to new agents
   - Build memory-aware workflows
   - Create knowledge retention systems

---

## 📞 Support

For detailed setup info, see: [MEMORY_SETUP.md](./MEMORY_SETUP.md)  
For AuraFlow docs, see: [ARCHITECTURE.md](./ARCHITECTURE.md)  
For usage guide, see: [HTU.md](./HTU.md)

---

**System Status: ✅ Ready**  
*Persistent memory with RAG is fully operational!*
