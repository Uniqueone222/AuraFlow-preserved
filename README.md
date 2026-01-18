# AuraFlow

<div align="center">

**A YAML-driven multi-agent orchestration engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)

</div>

---

AuraFlow enables you to orchestrate multiple AI agents through simple YAML configuration files. Define agents, specify their roles and goals, and let the engine handle the execution—whether sequential, parallel, or conditional.

## ✨ Features

- **Declarative Workflows** – Define complex agent interactions in YAML
- **Multiple Workflow Types** – Sequential, parallel, and conditional execution
- **Multi-Provider LLM Support** – Groq, Google Gemini, and OpenAI
- **Built-in Tools** – Web search (DuckDuckGo) and file system operations
- **Persistent Memory** – Vector database storage with RAG capabilities (Qdrant)
- **Sub-Agent Delegation** – Hierarchical agent structures
- **Visual Feedback** – ASCII workflow visualization and execution logs

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for Qdrant vector database)
- An API key from Groq, Gemini, or OpenAI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/AuraFlow.git
cd AuraFlow

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configure Your LLM Provider

Edit `.env` and add your API key:

```env
# Choose one provider
LLM_PROVIDER=groq          # or: gemini, openai

# Add your API key
GROQ_API_KEY=gsk_your_key_here
# GEMINI_API_KEY=AIza_your_key_here
# OPENAI_API_KEY=sk_your_key_here
```

### Start Qdrant (Vector Database)

```bash
docker run -d \
  -p 6333:6333 \
  -e QDRANT_API_KEY=default-api-key \
  -v qdrant_storage:/qdrant/storage \
  --name qdrant \
  qdrant/qdrant
```

### Build and Run

```bash
# Build TypeScript
npm run build

# Run a workflow
node dist/cli.js run examples/basic-sequential-example.yaml
```

---

## 📖 Usage

### Basic Commands

```bash
# Run a workflow
auraflow run examples/basic-sequential-example.yaml

# Dry run (validate without executing)
auraflow run examples/basic-sequential-example.yaml --dry-run

# Run with web search enabled
auraflow run examples/web-search-demo.yaml --enable-web-search

# Get help
auraflow --help
```

### Memory Commands

```bash
# Initialize vector database (first time)
auraflow init-memory

# Query stored memories
auraflow query "your search query"
auraflow query "topic" --agent researcher --limit 5

# View memory statistics
auraflow memory-stats

# Clear all memories
auraflow clear-memory
```

---

## 📝 Workflow Examples

### Sequential Workflow

Agents execute one after another, passing context between steps:

```yaml
id: research-workflow
agents:
  - id: researcher
    role: Research Assistant
    goal: Find insights on a topic

  - id: writer
    role: Content Writer
    goal: Summarize research findings

workflow:
  type: sequential
  steps:
    - id: research
      agent: researcher
      action: Research the topic
    - id: summarize
      agent: writer
      action: Write a summary
```

### Parallel Workflow

Multiple agents execute simultaneously:

```yaml
workflow:
  type: parallel
  branches:
    - id: backend-analysis
      agent: backend_expert
      action: Analyze backend requirements
    - id: frontend-analysis
      agent: frontend_expert
      action: Analyze frontend requirements
  then:
    agent: architect
    action: Combine analyses into a unified plan
```

### Conditional Workflow

Route execution based on agent output:

```yaml
workflow:
  type: conditional
  steps:
    - id: evaluate
      agent: evaluator
      action: Assess the situation
  condition:
    stepId: evaluate
    cases:
      - condition: "approve"
        step:
          agent: approver
          action: Process approval
      - condition: "reject"
        step:
          agent: reviewer
          action: Handle rejection
    default:
      agent: escalator
      action: Escalate to human
```

---

## 🔧 Available Tools

### Web Search

Enable agents to search the internet using DuckDuckGo:

```yaml
agents:
  - id: researcher
    role: Research Assistant
    goal: Find current information
    tools: ["web_search"]
```

### File System

Enable agents to read/write files:

```yaml
agents:
  - id: file_manager
    role: File Manager
    goal: Manage project files
    tools: ["file_system"]
```

---

## 🧠 LLM Providers

### Groq (Free Tier Available)

1. Get API key: https://console.groq.com
2. Add to `.env`:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=gsk_your_key
   CURRENT_AI_MODEL=llama-3.1-8b-instant
   ```

### Google Gemini (Free Tier Available)

1. Get API key: https://ai.google.dev
2. Add to `.env`:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=AIza_your_key
   CURRENT_AI_MODEL=gemini-1.5-flash
   ```

### OpenAI (Paid)

1. Get API key: https://platform.openai.com/api-keys
2. Add to `.env`:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk_your_key
   CURRENT_AI_MODEL=gpt-3.5-turbo
   ```

---

## 💾 Memory & RAG

AuraFlow includes persistent memory with Retrieval Augmented Generation (RAG):

- **Automatic Storage** – Agent outputs are automatically saved as embeddings
- **Semantic Search** – Query memories by meaning, not just keywords
- **Multi-Agent Awareness** – Track which agent generated each memory
- **Workflow Tracking** – Associate memories with specific workflow executions

### How It Works

```
Agent Executes → Output Generated → Convert to Embedding (384-dim)
                                            ↓
                              Store in Qdrant with Metadata
                                            ↓
                              Ready for Future Retrieval
```

---

## 📁 Project Structure

```
AuraFlow/
├── src/
│   ├── cli.ts                 # Main CLI entry point
│   ├── models/                # Core models (Agent, Workflow, Executor)
│   ├── services/              # LLMClient (multi-provider support)
│   ├── tools/                 # Tool implementations (web_search, file_system)
│   ├── memory/                # Memory providers (Qdrant)
│   ├── rag/                   # RAG query engine
│   ├── mcp/                   # Model Context Protocol server
│   └── visualization/         # ASCII workflow visualization
├── examples/                  # Workflow YAML examples
├── config/                    # Configuration files
├── Dockerfile                 # Docker image definition
├── docker-compose.yml         # Multi-service orchestration
├── .env.example               # Configuration template
├── ARCHITECTURE.md            # System design documentation
└── DOCKER.md                  # Docker deployment guide
```

---

## 🐳 Docker Deployment

For containerized deployment, see [DOCKER.md](DOCKER.md).

Quick start with Docker Compose:

```bash
# Start Qdrant and AuraFlow
docker-compose up -d

# Run a workflow
docker-compose run --rm auraflow run examples/basic-sequential-example.yaml
```

---

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) – System design and internal architecture
- [DOCKER.md](DOCKER.md) – Complete Docker deployment guide

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

<div align="center">

**Happy orchestrating!** 🎉

</div>
