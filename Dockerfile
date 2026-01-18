# AuraFlow Multi-Agent Orchestration Engine

FROM node:18-alpine

LABEL maintainer="AuraFlow Team"
LABEL description="YAML-driven multi-agent orchestration engine"
LABEL version="0.1.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git curl

# Copy package files first (better layer caching)
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Copy example workflows
COPY examples/ ./examples/

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source after build
RUN rm -rf src/ node_modules/.cache

# Create non-root user for security
RUN addgroup -g 1001 -S auraflow && \
    adduser -S auraflow -u 1001 -G auraflow

# Create directories for runtime data
RUN mkdir -p /app/workflow_outputs /app/auraflow_memory && \
    chown -R auraflow:auraflow /app

# Switch to non-root user
USER auraflow

# Expose port for potential API (future feature)
EXPOSE 3000

# Environment defaults
ENV NODE_ENV=production
ENV MEMORY_BACKEND=qdrant
ENV QDRANT_URL=http://qdrant:6333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node dist/cli.js --help > /dev/null || exit 1

# Entry point
ENTRYPOINT ["node", "dist/cli.js"]
CMD ["--help"]
