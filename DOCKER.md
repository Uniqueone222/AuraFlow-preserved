# Docker Deployment Guide

## Quick Start

### 1. Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/AuraFlow.git
cd AuraFlow

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

### 3. Configure API Keys

Edit `.env` and add your LLM provider API key:

```env
# For Groq (free tier available)
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here

# OR for Gemini (free tier available)
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIza_your_key_here

# OR for OpenAI (paid)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk_your_key_here
```

### 4. Start Services

```bash
# Start Qdrant and AuraFlow
docker-compose up -d

# View logs
docker-compose logs -f auraflow

# Stop services
docker-compose down
```

## Running Workflows

### Via Docker Compose

```bash
# Run with default workflow
docker-compose up

# Run specific workflow
docker-compose run --rm auraflow run examples/openai-sequential-test.yaml

# Run with environment override
docker-compose run --rm \
  -e LLM_PROVIDER=gemini \
  -e GEMINI_API_KEY=your_key \
  auraflow run examples/gemini-test-demo.yaml
```

### Direct Docker Commands

```bash
# Build image
docker build -t auraflow:latest .

# Run container (Qdrant must be running separately)
docker run -it \
  -e GROQ_API_KEY=your_key \
  -e LLM_PROVIDER=groq \
  -v $(pwd)/examples:/app/examples \
  -v $(pwd)/workflow_outputs:/app/workflow_outputs \
  --network host \
  auraflow:latest run examples/basic-sequential-example.yaml
```

## Configuration

### Environment Variables

All configuration via `.env`:

```env
# LLM Provider
LLM_PROVIDER=groq              # groq, gemini, or openai
CURRENT_AI_MODEL=llama-3.1-8b-instant
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza_...
OPENAI_API_KEY=sk_...

# Qdrant Vector Database
MEMORY_BACKEND=qdrant
QDRANT_URL=http://qdrant:6333  # Inside Docker
QDRANT_API_KEY=your-api-key
QDRANT_COLLECTION=auraflow_memory

# Application
NODE_ENV=production
```

### Qdrant Configuration

- **Port**: 6333 (exposed to host)
- **Health check**: Enabled (10s interval)
- **Storage**: Persistent volume `qdrant_storage`
- **API Key**: Set in `QDRANT_API_KEY` env var

### AuraFlow Configuration

- **Port**: 3000 (exposed for future API)
- **Restart policy**: `unless-stopped`
- **Stdin/TTY**: Enabled for interactive workflows
- **Volumes**:
  - `/app/examples` - read-only workflow examples
  - `/app/workflow_outputs` - output storage
  - `/app/config` - configuration files
  - `/app/auraflow_memory` - memory persistence

## Common Tasks

### View Qdrant API

```bash
# Health check
curl http://localhost:6333/health

# List collections
curl http://localhost:6333/collections \
  -H "api-key: your-api-key"

# Collection info
curl http://localhost:6333/collections/auraflow_memory \
  -H "api-key: your-api-key"
```

### Clear Memory

```bash
# Access Qdrant container
docker exec -it auraflow-qdrant sh

# Or use curl to delete collection
curl -X DELETE http://localhost:6333/collections/auraflow_memory \
  -H "api-key: your-api-key"
```

### View Application Logs

```bash
# Real-time logs
docker-compose logs -f auraflow

# Last 100 lines
docker-compose logs --tail=100 auraflow

# Qdrant logs
docker-compose logs -f qdrant
```

### Stop and Remove Everything

```bash
# Stop containers but keep volumes
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 6333
lsof -i :6333  # macOS/Linux
netstat -ano | findstr :6333  # Windows

# Use different port
docker-compose down
# Edit docker-compose.yml: change "6333:6333" to "6334:6333"
docker-compose up -d
```

### Qdrant Health Check Fails

```bash
# Check if curl is available in container
docker-compose exec qdrant apk add --no-cache curl

# Test manually
docker-compose exec qdrant curl -f http://localhost:6333/health
```

### API Key Not Recognized

```bash
# Verify .env is loaded
docker-compose config | grep GROQ_API_KEY

# Check container environment
docker exec auraflow-app env | grep API_KEY

# Verify value in .env
cat .env | grep API_KEY
```

### Memory Not Persisting

```bash
# Check volume exists
docker volume ls | grep auraflow

# Inspect volume
docker volume inspect auraflow_qdrant_storage

# Manually back up data
docker run --rm -v auraflow_qdrant_storage:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/qdrant-backup.tar.gz -C /data .
```

## Production Deployment

### Using Docker Stack (Swarm)

```bash
# Initialize Swarm
docker swarm init

# Create overlay network
docker network create --driver overlay auraflow-net

# Deploy stack
docker stack deploy -c docker-compose.yml auraflow
```

### Using Kubernetes (Helm)

Example Helm values:

```yaml
image:
  repository: yourusername/auraflow
  tag: latest

qdrant:
  enabled: true
  storage: 10Gi

env:
  LLM_PROVIDER: groq
  GROQ_API_KEY: (from secret)
  QDRANT_URL: http://qdrant:6333

resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

### Environment-Specific Compose Files

```bash
# Development
docker-compose -f docker-compose.yml \
               -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml \
               -f docker-compose.prod.yml up -d
```

## Security Best Practices

1. **Never commit `.env`** - Use `.env.example` template instead
2. **Rotate API keys** - Change GROQ/GEMINI/OPENAI keys regularly
3. **Use secrets management** - Docker Secrets or HashiCorp Vault
4. **Network isolation** - Use `auraflow-network` bridge
5. **API key access** - Limit who can read `.env`
6. **Qdrant authentication** - Always set `QDRANT_API_KEY`
7. **Volume permissions** - Set appropriate ownership
8. **Resource limits** - Define CPU/memory limits in production

## Performance Tuning

### Memory

```yaml
# docker-compose.yml
services:
  auraflow:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Qdrant Optimization

```bash
# In docker-compose.yml environment:
QDRANT_PREFER_DIRECT_MAPPING: "false"
QDRANT_SEGMENT_VECTOR_SIZE: "768"
```

## Monitoring

### Health Checks

```bash
# Check both services
docker-compose ps

# Manual health check
docker-compose exec qdrant curl -f http://localhost:6333/health
```

### Using Portainer (Optional)

```bash
docker run -d -p 8000:8000 -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Visit http://localhost:9000 for UI

## Advanced: Build Custom Image

```dockerfile
# Dockerfile.custom
FROM auraflow:latest

# Add custom tools
RUN npm install custom-package

# Override entry point
CMD ["run", "examples/custom-workflow.yaml"]
```

Build and run:

```bash
docker build -f Dockerfile.custom -t auraflow:custom .
docker run -e GROQ_API_KEY=your_key auraflow:custom
```

---

**For more information**, see:
- [README.md](README.md) - Project overview
- [GEMINI_SETUP.md](GEMINI_SETUP.md) - Gemini configuration
- [OPENAI_SETUP.md](OPENAI_SETUP.md) - OpenAI configuration
- [.env.example](.env.example) - Configuration template
