FROM node:24.16.0-alpine

# Create the non-root user BEFORE copying app code so files land with the right
# owner via `COPY --chown`. A trailing `chown -R /app` would instead duplicate the
# entire tree into a new layer, roughly doubling the image size.
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Enable corepack; pnpm resolves to the version pinned in package.json's
# "packageManager" field (pnpm@11.5.0, integrity-checked) — reproducible, not "latest".
RUN corepack enable

# Copy workspace manifests, lockfile, and patches first for better layer caching.
# (Lockfile + patches make `--frozen-lockfile` reproducible.)
COPY --chown=nodejs:nodejs package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY --chown=nodejs:nodejs patches ./patches

# Copy only the manifests this image needs: the server app and its workspace
# dependency @sandwicheck/shared, so the workspace link resolves at install time.
COPY --chown=nodejs:nodejs ./apps/server/package.json ./apps/server/
COPY --chown=nodejs:nodejs ./packages/shared/package.json ./packages/shared/

# Production install of the server subtree only (server + shared), runtime deps only.
RUN pnpm install --frozen-lockfile --prod --filter "@sandwicheck/server..."

# Copy application code and the shared package the server imports at runtime.
COPY --chown=nodejs:nodejs ./apps/server ./apps/server
COPY --chown=nodejs:nodejs ./packages/shared ./packages/shared

USER nodejs

# The start script set NODE_ENV=production; the direct CMD below must set it too.
ENV NODE_ENV=production

# Run from the server workspace so node_modules resolution matches the workspace and
# the module-relative CLIENT_DIR/UPLOADS_DIR paths resolve exactly as they did under
# `pnpm --filter @sandwicheck/server run start` (whose cwd was apps/server).
WORKDIR /app/apps/server

EXPOSE 5001

# Healthcheck - simple TCP connection test (adjust if you add a /health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('net').createConnection(5001, 'localhost', () => process.exit(0)).on('error', () => process.exit(1))"

# Start node directly. The previous `pnpm ... run start` re-invoked corepack at
# runtime, but the nodejs user's corepack cache is empty, so it would re-download
# pnpm from the registry on every container start — and fail with no network.
CMD ["node", "server.ts"]
