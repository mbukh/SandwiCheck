FROM node:24-alpine

WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root package.json and workspace config (for better layer caching)
COPY package.json pnpm-workspace.yaml ./

# Copy server package files (maintain workspace structure)
COPY ./apps/server/package*.json ./apps/server/

# Install dependencies (this layer will be cached if package files don't change)
# Using --frozen-lockfile ensures reproducible builds if pnpm-lock.yaml exists
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application code (maintain workspace structure: apps/server/)
COPY ./apps/server/ ./apps/server/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5001

# Healthcheck - simple TCP connection test (adjust if you add a /health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('net').createConnection(5001, 'localhost', () => process.exit(0)).on('error', () => process.exit(1))"

CMD ["pnpm", "run", "start"]