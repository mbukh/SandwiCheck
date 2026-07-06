# Build stage
FROM node:24.16.0-alpine AS build-stage

# Define build arguments
ARG VITE_HOST
ARG VITE_API_SERVER

WORKDIR /app

# Enable corepack; pnpm resolves to the version pinned in package.json's
# "packageManager" field — reproducible, not "latest".
RUN corepack enable

# Copy workspace manifests, lockfile, and patches first for better layer caching.
# (Lockfile + patches make `--frozen-lockfile` reproducible. tsconfig.base.json is
# extended by the app tsconfigs and read by Vite's transform at build time.)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY patches ./patches

# Copy only the manifests this image needs: the client app and its workspace
# dependency @sandwicheck/shared, so the workspace link resolves at install time.
COPY ./apps/client/package.json ./apps/client/
COPY ./packages/shared/package.json ./packages/shared/

# Install just the client subtree (client + shared); skips server-only native deps.
RUN pnpm install --frozen-lockfile --filter "@sandwicheck/client..."

# Copy source for the client and the shared package it imports at build time.
COPY ./apps/client ./apps/client
COPY ./packages/shared ./packages/shared

# Vite inlines import.meta.env.VITE_* into the bundle AT BUILD TIME — these env
# vars must be set before `vite build`; there is no runtime substitution.
ENV VITE_HOST=${VITE_HOST}
ENV VITE_API_SERVER=${VITE_API_SERVER}

# Build the application
RUN pnpm --filter @sandwicheck/client run build

# Production stage: nginx-unprivileged runs as non-root out of the box
# (pid file and temp paths are already relocated to user-writable locations).
FROM nginxinc/nginx-unprivileged:1.29-alpine AS production-stage

# Copy built assets from build stage
COPY --from=build-stage /app/apps/client/build /usr/share/nginx/html

# Copy nginx configuration
COPY ./apps/client/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Healthcheck via busybox wget (single attempt, no full wget needed).
# 127.0.0.1 instead of localhost: busybox wget tries ::1 first and does not
# fall back to IPv4 if the IPv6 connect is refused.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]