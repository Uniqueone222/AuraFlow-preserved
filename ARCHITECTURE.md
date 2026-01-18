# AuraFlow – Architecture & System Design

This document describes the **internal architecture** and **execution model** of AuraFlow.

---

## 1. Design Principles

AuraFlow is built around these core principles:

| Principle | Description |
|-----------|-------------|
| **Declarative** | Workflows defined in YAML, not code |
| **Deterministic** | Same inputs produce same execution behavior |
| **Auditable** | Clear execution logs and context passing |
| **Extensible** | Pluggable LLM providers, tools, and memory backends |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      YAML Workflow                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Parser & Validator                         │
│            (Schema validation, dependency checks)           │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Execution Engine                          │
│         (Sequential, Parallel, Conditional flows)           │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│    ┌─────────┐    ┌─────────┐    ┌─────────────────────┐   │
│    │ Agents  │◄──►│  Tools  │◄──►│  Memory (Qdrant)    │   │
│    └─────────┘    └─────────┘    └─────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Console Output                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Components

### CLI (`src/cli.ts`)
The main entry point handling:
- Command-line argument parsing
- YAML workflow loading and validation
- Workflow execution orchestration
- Memory and RAG commands

### Models (`src/models/`)

| Model | Purpose |
|-------|---------|
| **Agent** | Represents an AI agent with role, goal, and tools |
| **Workflow** | Encapsulates workflow type and step definitions |
| **Executor** | Handles execution of different workflow patterns |
| **Context** | Shared state for inter-agent communication |

### Services (`src/services/`)
- **LLMClient** – Multi-provider abstraction supporting Groq, Gemini, and OpenAI

### Tools (`src/tools/`)
- **web_search** – DuckDuckGo-based internet search
- **file_system** – File and directory operations via MCP

### Memory (`src/memory/`)
- **QdrantMemoryProvider** – Vector database integration for persistent memory

### RAG (`src/rag/`)
- **RAGQuery** – Semantic search across stored agent outputs

---

## 4. Workflow Types

### Sequential
Steps execute one after another. Each step receives context from all previous steps.

```yaml
workflow:
  type: sequential
  steps:
    - id: step1
      agent: researcher
    - id: step2
      agent: writer
```

### Parallel
Multiple branches execute simultaneously. A `then` step aggregates results.

```yaml
workflow:
  type: parallel
  branches:
    - agent: analyst1
    - agent: analyst2
  then:
    agent: summarizer
```

### Conditional
Execution path determined by agent output.

```yaml
workflow:
  type: conditional
  condition:
    stepId: evaluator
    cases:
      - condition: "approve"
        step: { agent: approver }
    default: { agent: reviewer }
```

---

## 5. Context & Memory

### Runtime Context
- **Messages**: Ordered array of agent outputs with timestamps
- **Outputs**: Key-value store for named data sharing between steps

### Persistent Memory (Qdrant)
- Agent outputs converted to 384-dimensional embeddings
- Stored with metadata (agent ID, workflow ID, timestamp)
- Semantic search via cosine similarity

---

## 6. Data Flow

```
Agent Executes
      │
      ▼
┌─────────────┐     ┌──────────────────┐
│   Output    │────►│  Context.addMsg  │
└─────────────┘     └────────┬─────────┘
                             │
      ┌──────────────────────┴──────────────────────┐
      ▼                                             ▼
┌─────────────────┐                    ┌─────────────────────┐
│  Next Agent     │                    │  Qdrant (Persist)   │
│  (via Context)  │                    │  384-dim embedding  │
└─────────────────┘                    └─────────────────────┘
```

---

## 7. Determinism

AuraFlow ensures deterministic execution through:
- Explicit workflow definitions in YAML
- Ordered message passing with timestamps
- Consistent context initialization per run
- No hidden state between workflow executions

---

## 8. Extension Points

| Extension | How to Add |
|-----------|------------|
| **New LLM Provider** | Implement in `LLMClient.ts` |
| **New Tool** | Add to `src/tools/` and register in `ToolRegistry` |
| **New Workflow Type** | Add execution method in `Executor.ts` |
| **New Memory Backend** | Implement `MemoryProvider` interface |

---

For usage instructions, see [README.md](README.md).  
For Docker deployment, see [DOCKER.md](DOCKER.md).
