# GitHub Quick Start Guide

## Clone and Run in 5 Minutes

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/AuraFlow.git
cd AuraFlow

# 2. Setup environment
cp .env.example .env
# Edit .env with your API key (see below)

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. Run a workflow
docker-compose run --rm auraflow run examples/basic-sequential-example.yaml
```

### Option 2: Local Development

```bash
# 1. Clone repository
git clone https://github.com/yourusername/AuraFlow.git
cd AuraFlow

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your API key

# 4. Start Qdrant (requires Docker)
docker run -d \
  -p 6333:6333 \
  -e QDRANT_API_KEY=default-api-key \
  -v qdrant_storage:/qdrant/storage \
  qdrant/qdrant

# 5. Build and run
npm run build
node dist/cli.js run examples/basic-sequential-example.yaml
```

## Get Your API Key (Choose One)

### Groq (Free Tier - Recommended for Testing)

1. Visit https://console.groq.com
2. Create account
3. Go to API keys
4. Copy key (starts with `gsk_`)
5. Add to `.env`:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=gsk_your_key_here
   ```

### Google Gemini (Free Tier)

1. Visit https://ai.google.dev
2. Click "Get API Key"
3. Create or select project
4. Copy key (starts with `AIza`)
5. Add to `.env`:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=AIza_your_key_here
   ```

### OpenAI (Paid)

1. Visit https://platform.openai.com/api-keys
2. Create account or sign in
3. Create new secret key
4. Copy key (starts with `sk_`)
5. Add to `.env`:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk_your_key_here
   ```

## Project Structure

```
AuraFlow/
├── src/                          # TypeScript source code
│   ├── cli.ts                   # Main CLI entry point
│   ├── models/                  # Core models (Agent, Workflow, etc.)
│   ├── services/                # LLMClient (multi-provider support)
│   ├── visualization/           # ASCII workflow visualization
│   ├── tools/                   # Tool implementations (web_search, file_system)
│   ├── memory/                  # Memory providers (QdrantMemoryProvider)
│   ├── rag/                     # RAG capabilities
│   └── mcp/                     # Model Context Protocol server
├── examples/                    # Workflow YAML examples
│   ├── basic-sequential-example.yaml
│   ├── gemini-sequential-test.yaml
│   ├── openai-sequential-test.yaml
│   └── [more examples...]
├── config/                      # Configuration (in .gitignore)
├── auraflow_memory/             # Memory persistence
├── Dockerfile                   # Docker image definition
├── docker-compose.yml           # Multi-service orchestration
├── .env.example                 # Configuration template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── DOCKER.md                    # Docker deployment guide
├── GEMINI_SETUP.md             # Gemini configuration
├── OPENAI_SETUP.md             # OpenAI configuration
└── README.md                    # This file
```

## Common Commands

### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f auraflow

# Run workflow
docker-compose run --rm auraflow run examples/gemini-sequential-test.yaml

# Switch provider via environment
docker-compose run --rm \
  -e LLM_PROVIDER=gemini \
  -e GEMINI_API_KEY=AIza_your_key \
  auraflow run examples/gemini-test-demo.yaml
```

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run workflow
node dist/cli.js run examples/basic-sequential-example.yaml

# With environment variable
export GROQ_API_KEY=gsk_your_key
export LLM_PROVIDER=groq
node dist/cli.js run examples/basic-sequential-example.yaml
```

## Available LLM Providers

| Provider | Cost | Free Tier | Models | Setup Time |
|----------|------|-----------|--------|------------|
| **Groq** | Free+ | Yes | llama-3.1, mixtral, gemma | 2 min |
| **Gemini** | Free+ | Yes | gemini-1.5-pro, flash | 2 min |
| **OpenAI** | Paid | No | gpt-4, gpt-4-turbo, gpt-3.5 | 5 min |

## Workflow Examples

### Sequential Workflow

Runs agents one after another, passing output as input:

```bash
docker-compose run --rm auraflow run examples/basic-sequential-example.yaml
```

### Parallel Workflow

Runs multiple agents simultaneously:

```bash
docker-compose run --rm auraflow run examples/openai-parallel-test.yaml
```

### Conditional Workflow

Routes to different agents based on conditions:

```bash
docker-compose run --rm auraflow run examples/openai-conditional-test.yaml
```

### With Tools

**Web Search** - Retrieve information from the internet:

```bash
docker-compose run --rm auraflow run examples/gemini-web-search-tool.yaml
```

**File System** - Read/write files:

```bash
docker-compose run --rm auraflow run examples/gemini-file-system-tool.yaml
```

## Troubleshooting

### Docker: "Port 6333 in use"

```bash
# Kill existing process
lsof -i :6333 | awk 'NR!=1 {print $2}' | xargs kill -9

# Or use different port in docker-compose.yml
```

### "API key not valid"

- Check `.env` has correct format
- Verify you copied full key
- Try getting new key from provider
- Check key hasn't expired

### "Cannot connect to Qdrant"

```bash
# Check Qdrant is running
docker-compose ps

# Restart Qdrant
docker-compose restart qdrant

# Check health
curl http://localhost:6333/health
```

### "Module not found"

```bash
# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Local: "Cannot find module"

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

1. **Read Documentation**
   - [DOCKER.md](DOCKER.md) - Full Docker guide
   - [GEMINI_SETUP.md](GEMINI_SETUP.md) - Gemini configuration
   - [OPENAI_SETUP.md](OPENAI_SETUP.md) - OpenAI configuration
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design

2. **Create Your Workflow**
   - Copy example YAML file
   - Modify agents and steps
   - Run with `docker-compose run --rm auraflow run your-workflow.yaml`

3. **Explore Features**
   - Sequential, parallel, conditional workflows
   - Web search integration
   - File system operations
   - Memory persistence with Qdrant
   - Multi-provider support

4. **Contributing**
   - Fork repository
   - Create feature branch
   - Make changes
   - Submit pull request

## Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/AuraFlow/issues)
- **Discussions**: Ask questions on [GitHub Discussions](https://github.com/yourusername/AuraFlow/discussions)
- **Documentation**: See [docs](.) folder

## License

[Your License Here]

## Quick Reference

```bash
# Get API key (5 min)
# → https://console.groq.com (or Gemini/OpenAI)

# Clone and setup (1 min)
git clone https://github.com/yourusername/AuraFlow.git && cd AuraFlow
cp .env.example .env

# Edit .env with your API key (1 min)
nano .env

# Start and run (1 min)
docker-compose up -d
docker-compose run --rm auraflow run examples/basic-sequential-example.yaml

# Done! 🚀
```

---

**Happy orchestrating!** 🎉
