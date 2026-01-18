# AuraFlow Multi-Agent Orchestration Engine
# Docker image with Node.js runtime

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install git (required for some dependencies)
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY examples/ ./examples/
COPY config/ ./config/
COPY auraflow_memory/ ./auraflow_memory/

# Build TypeScript
RUN npm run build

# Expose port for potential API (future feature)
EXPOSE 3000

# Set environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV MEMORY_BACKEND=qdrant
ENV QDRANT_URL=http://qdrant:6333

# Entry point - run CLI
ENTRYPOINT ["node", "dist/cli.js"]
CMD ["--help"]
