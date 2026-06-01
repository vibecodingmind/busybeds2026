#!/bin/bash
#===============================================================================
# BusyBeds Auto-Deploy Script
# Triggered by GitHub webhook when a push is made to the main branch.
#
# This script:
# 1. Pulls the latest code from GitHub
# 2. Rebuilds and restarts Docker containers
# 3. Logs all output
#===============================================================================

set -e

APP_DIR="/var/www/busybeds"
LOG_FILE="/var/www/busybeds/auto-deploy/deploy.log"
LOCK_FILE="/var/www/busybeds/auto-deploy/deploy.lock"

# Prevent concurrent deploys
if [ -f "$LOCK_FILE" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
  if [ "$LOCK_AGE" -lt 300 ]; then
    echo "[$(date -Iseconds)] Deploy already in progress (lock file age: ${LOCK_AGE}s). Skipping."
    exit 0
  else
    echo "[$(date -Iseconds)] Stale lock file detected (${LOCK_AGE}s old). Removing."
    rm -f "$LOCK_FILE"
  fi
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

echo ""
echo "========================================="
echo "[$(date -Iseconds)] Auto-Deploy Started"
echo "========================================="

cd "$APP_DIR"

# Step 1: Pull latest code
echo "[$(date -Iseconds)] Pulling latest code..."
git fetch origin
git reset --hard origin/main
echo "[$(date -Iseconds)] Code updated to: $(git log --oneline -1)"

# Step 2: Rebuild and restart Docker containers
echo "[$(date -Iseconds)] Rebuilding Docker containers..."
docker compose down 2>/dev/null || true
docker compose up -d --build 2>&1

# Step 3: Wait for app to be healthy
echo "[$(date -Iseconds)] Waiting for app to start..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "[$(date -Iseconds)] App is healthy after ${i}0 seconds"
    break
  fi
  if [ "$i" = "30" ]; then
    echo "[$(date -Iseconds)] WARNING: App health check timed out (5 minutes)"
  fi
  sleep 10
done

# Step 4: Show status
echo "[$(date -Iseconds)] Container status:"
docker compose ps

echo ""
echo "========================================="
echo "[$(date -Iseconds)] Auto-Deploy Complete!"
echo "========================================="

# Clean up old log entries (keep last 500 lines)
if [ -f "$LOG_FILE" ]; then
  tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

rm -f "$LOCK_FILE"
