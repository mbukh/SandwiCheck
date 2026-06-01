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
# (Lockfile + patches make `--frozen-lockfile` reproducible.)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
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

# Set environment variables for the build process
ENV VITE_HOST=${VITE_HOST}
ENV VITE_API_SERVER=${VITE_API_SERVER}
ENV VITE_ENV=production

# Build the application
RUN pnpm --filter @sandwicheck/client run build

# Production stage
FROM nginx:alpine AS production-stage

# Copy built assets from build stage
COPY --from=build-stage /app/apps/client/build /usr/share/nginx/html

# Copy nginx configuration
COPY ./apps/client/nginx/default.conf /etc/nginx/conf.d/default.conf

# Install wget for healthcheck (lightweight, done as root)
RUN apk add --no-cache wget

# Create nginx cache directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

EXPOSE 80

# Healthcheck - check if nginx is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]