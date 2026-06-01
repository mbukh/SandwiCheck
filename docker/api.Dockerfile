FROM node:24.16.0-alpine

WORKDIR /app

# Enable corepack; pnpm resolves to the version pinned in package.json's
# "packageManager" field (pnpm@11.5.0, integrity-checked) — reproducible, not "latest".
RUN corepack enable

# Copy workspace manifests, lockfile, and patches first for better layer caching.
# (Lockfile + patches make `--frozen-lockfile` reproducible.)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY patches ./patches

# Copy only the manifests this image needs: the server app and its workspace
# dependency @sandwicheck/shared, so the workspace link resolves at install time.
COPY ./apps/server/package.json ./apps/server/
COPY ./packages/shared/package.json ./packages/shared/

# Production install of the server subtree only (server + shared), runtime deps only.
RUN pnpm install --frozen-lockfile --prod --filter "@sandwicheck/server..."

# Copy application code and the shared package the server imports at runtime.
COPY ./apps/server ./apps/server
COPY ./packages/shared ./packages/shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5001

# Healthcheck - simple TCP connection test (adjust if you add a /health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('net').createConnection(5001, 'localhost', () => process.exit(0)).on('error', () => process.exit(1))"

CMD ["pnpm", "--filter", "@sandwicheck/server", "run", "start"]
