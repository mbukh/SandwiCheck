#!/usr/bin/env bash
#
# redeploy.sh — poll the git remote and (re)deploy the SandwiCheck API container.
#
# Each run:
#   1. git fetch the deploy branch.
#   2. If new commits touch server-relevant paths (apps/server, packages/shared,
#      root manifests, docker/api.Dockerfile, patches) — OR the container isn't
#      running, OR FORCE=true — it fast-forwards the working tree, rebuilds the
#      API image from docker/api.Dockerfile, and replaces the running container.
#   3. Uploaded/generated files survive across rebuilds because
#      apps/server/uploads is a host bind-mount, not baked into the image.
#      The database is MongoDB Atlas (remote) — nothing to run locally.
#
# Built to run unattended on a timer (systemd .timer or cron). Safe to run often:
# a single-instance flock prevents overlap and it no-ops when already up to date.
#
# SETUP (Debian):
#   1.  Install Docker Engine + git, and add your deploy user to the 'docker' group:
#         sudo apt-get update && sudo apt-get install -y git
#         # Docker: https://docs.docker.com/engine/install/debian/
#         sudo usermod -aG docker "$USER"   # then re-login
#   2.  Clone the repo (it deploys the default branch, main):
#         git clone <repo> /app/sandwicheck
#   3.  Create the production env file from the template and fill MONGO_URI (Atlas),
#       JWT_SECRET, mail creds, etc. Keep PORT=5001 to match the image HEALTHCHECK:
#         cp apps/server/config/.env.example apps/server/config/.env && edit it
#   4.  cp scripts/deploy/redeploy.config.example scripts/deploy/redeploy.config
#       and edit paths for this machine (or rely on the defaults below).
#   5.  First run (also seeds the container):  ./scripts/deploy/redeploy.sh
#   6.  Schedule it — see scripts/deploy/sandwicheck-redeploy.{service,timer}
#       (systemd) or the cron one-liner in redeploy.config.example.
#
# Configure via env vars or scripts/deploy/redeploy.config (same dir as this file).
#
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
[ -f "$SCRIPT_DIR/redeploy.config" ] && . "$SCRIPT_DIR/redeploy.config"

# --- Configuration (env / redeploy.config override these defaults) ---
REPO_DIR="${REPO_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"  # repo root: two levels up from scripts/deploy
# Git branch the box deploys. Branch protection on `main` keeps it CI-clean (no merge
# without green checks), so the box tracks it directly; the build + health gate below
# is the deploy-time backstop.
BRANCH="${BRANCH:-main}"
DOCKERFILE="${DOCKERFILE:-docker/api.Dockerfile}"
IMAGE_NAME="${IMAGE_NAME:-sandwicheck-api}"
CONTAINER_NAME="${CONTAINER_NAME:-sandwicheck-api}"
HOST_PORT="${HOST_PORT:-5001}"
# Bind the published port to loopback only — Hestia's nginx reverse-proxies to it,
# so nothing but the local proxy should reach the API. Publishing on 0.0.0.0 would
# expose it to the internet even behind a host firewall, because Docker inserts its
# port-forwarding in iptables nat/FORWARD *before* the UFW/INPUT chain. Override
# (e.g. BIND_ADDR=0.0.0.0) only if you deliberately want it on all interfaces.
BIND_ADDR="${BIND_ADDR:-127.0.0.1}"
CONTAINER_PORT="${CONTAINER_PORT:-5001}"  # must equal PORT in ENV_FILE and the Dockerfile HEALTHCHECK
# The image runs as a non-root user (uid 1001 'nodejs' in api.Dockerfile), so the
# bind-mounted uploads dir must be writable by that uid. (Under rootless Docker the
# effective host uid would differ — revisit CONTAINER_UID if you move to rootless.)
CONTAINER_UID="${CONTAINER_UID:-1001}"
ENV_FILE="${ENV_FILE:-$REPO_DIR/apps/server/config/.env}"
UPLOADS_DIR="${UPLOADS_DIR:-$REPO_DIR/apps/server/uploads}"
LOCK_FILE="${LOCK_FILE:-/tmp/sandwicheck-redeploy.lock}"
HEALTH_RETRIES="${HEALTH_RETRIES:-30}"
FORCE="${FORCE:-false}"

# Paths whose changes require an image rebuild + container restart.
SERVER_PATHS=(apps/server packages/shared package.json pnpm-lock.yaml pnpm-workspace.yaml "$DOCKERFILE" patches)

log() { printf '%s  %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*"; }
die() { log "ERROR: $*"; exit 1; }
trap 'die "unexpected failure near line $LINENO"' ERR

# --- Single-instance lock (skip if a previous run is still going) ---
exec 9>"$LOCK_FILE" || die "cannot open lock file: $LOCK_FILE"
if ! flock -n 9; then
  log "another redeploy is already running; exiting"
  exit 0
fi

# --- Preconditions ---
command -v git >/dev/null 2>&1 || die "git not found"
command -v docker >/dev/null 2>&1 || die "docker not found"
[ -d "$REPO_DIR/.git" ] || die "REPO_DIR is not a git repo: $REPO_DIR"
[ -f "$ENV_FILE" ] || die "env file not found: $ENV_FILE (copy apps/server/config/.env.example and fill MONGO_URI, JWT_SECRET, ...)"

cd "$REPO_DIR"

# We deploy whatever is on $BRANCH, so the working tree must be ON that branch — the
# ff-only merge below advances the checked-out branch, not some other one.
current_branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$current_branch" = "$BRANCH" ] || die "repo is on '$current_branch' but BRANCH=$BRANCH — run: git -C \"$REPO_DIR\" checkout $BRANCH"

# --- Detect new commits on the deploy branch ---
git fetch --quiet origin "$BRANCH" || die "git fetch failed"
local_sha="$(git rev-parse "$BRANCH")"
remote_sha="$(git rev-parse "origin/$BRANCH")"
running="$(docker ps --filter "name=^/${CONTAINER_NAME}$" --filter status=running --format '{{.Names}}' || true)"

need_deploy=false
reason=""
[ "$FORCE" = "true" ] && { need_deploy=true; reason="forced"; }
[ -z "$running" ] && { need_deploy=true; reason="${reason:+$reason; }container not running"; }

if [ "$local_sha" != "$remote_sha" ]; then
  log "new commits on $BRANCH: ${local_sha:0:7} -> ${remote_sha:0:7}; updating working tree"
  git merge --ff-only "origin/$BRANCH" || die "cannot fast-forward (local branch diverged from origin/$BRANCH)"
  if git diff --quiet "$local_sha" HEAD -- "${SERVER_PATHS[@]}"; then
    log "update contains no server-relevant changes"
  else
    need_deploy=true
    reason="${reason:+$reason; }server files changed"
  fi
fi

if [ "$need_deploy" != "true" ]; then
  log "up to date ($(git rev-parse --short HEAD)); nothing to deploy"
  exit 0
fi

new_sha="$(git rev-parse --short HEAD)"
log "deploying ($reason) @ $new_sha"

# --- Build the image (tag with the commit for traceability + a stable 'latest') ---
log "building $IMAGE_NAME:$new_sha from $DOCKERFILE"
docker build "$REPO_DIR" --file "$DOCKERFILE" --tag "$IMAGE_NAME:$new_sha" --tag "$IMAGE_NAME:latest"

# --- Ensure the stateful uploads dir exists and is writable by the container user ---
mkdir -p "$UPLOADS_DIR"
# The container runs as uid $CONTAINER_UID (non-root); a root-owned bind-mount would
# make image writes fail. chown only when ownership is wrong (cheap + idempotent).
if [ "$(stat -c %u "$UPLOADS_DIR" 2>/dev/null)" != "$CONTAINER_UID" ]; then
  log "setting uploads ownership to uid $CONTAINER_UID"
  chown -R "$CONTAINER_UID:$CONTAINER_UID" "$UPLOADS_DIR"
fi

# --- Replace the container ---
log "replacing container $CONTAINER_NAME"
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run --detach \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  --publish "${BIND_ADDR}:${HOST_PORT}:${CONTAINER_PORT}" \
  --volume "${UPLOADS_DIR}:/app/apps/server/uploads" \
  "$IMAGE_NAME:$new_sha"

# --- Wait for the container HEALTHCHECK to report healthy ---
log "waiting for health check..."
for _ in $(seq 1 "$HEALTH_RETRIES"); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER_NAME" 2>/dev/null || echo unknown)"
  case "$status" in
    healthy) log "container healthy"; break ;;
    unhealthy) die "container is unhealthy — inspect: docker logs $CONTAINER_NAME" ;;
    none) log "image has no HEALTHCHECK; skipping health wait"; break ;;
  esac
  sleep 2
done

# --- Tidy dangling images to keep disk usage in check ---
docker image prune --force >/dev/null 2>&1 || true

log "deploy complete: $IMAGE_NAME:$new_sha listening on ${BIND_ADDR}:${HOST_PORT}"
