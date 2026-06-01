#!/bin/bash
#===============================================================================
# BusyBeds Zero-Downtime Blue-Green Auto-Deploy
# Triggered by GitHub webhook when a push is made to the main branch.
#
# This script:
# 1. Pulls the latest code from GitHub
# 2. Builds the NEW version on the inactive port (3001)
# 3. Waits for the new version to be healthy
# 4. Switches nginx to the new version
# 5. Stops the old version
#
# No 502 Bad Gateway during deploys!
#===============================================================================

set -e

APP_DIR="/var/www/busybeds"
LOG_FILE="/var/www/busybeds/auto-deploy/deploy.log"
LOCK_FILE="/var/www/busybeds/auto-deploy/deploy.lock"
STATE_FILE="/var/www/busybeds/auto-deploy/current-slot"
NGINX_CONF="/etc/nginx/sites-enabled/busybeds"

# Prevent concurrent deploys
if [ -f "$LOCK_FILE" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
  if [ "$LOCK_AGE" -lt 600 ]; then
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
echo "[$(date -Iseconds)] Zero-Downtime Deploy Started"
echo "========================================="

cd "$APP_DIR"

# Determine current active slot
if [ -f "$STATE_FILE" ]; then
  CURRENT_SLOT=$(cat "$STATE_FILE")
else
  CURRENT_SLOT="blue"
fi

# Determine next slot
if [ "$CURRENT_SLOT" = "blue" ]; then
  NEXT_SLOT="green"
  CURRENT_PORT=3000
  NEXT_PORT=3001
else
  NEXT_SLOT="blue"
  CURRENT_PORT=3001
  NEXT_PORT=3000
fi

echo "[$(date -Iseconds)] Current: $CURRENT_SLOT (port $CURRENT_PORT)"
echo "[$(date -Iseconds)] Deploying: $NEXT_SLOT (port $NEXT_PORT)"

# Step 1: Pull latest code (preserve .env)
echo "[$(date -Iseconds)] Pulling latest code..."
cp .env .env.backup 2>/dev/null || true
git fetch origin
git reset --hard origin/main
cp .env.backup .env 2>/dev/null || true
echo "[$(date -Iseconds)] Code updated to: $(git log --oneline -1)"

# Step 2: Build the new container on the NEXT port
echo "[$(date -Iseconds)] Building $NEXT_SLOT on port $NEXT_PORT..."

# Stop the next-slot container if it exists from a previous deploy
docker compose -f docker-compose.yml -p "busybeds-$NEXT_SLOT" down 2>/dev/null || true

# Build and start the new version
APP_PORT=$NEXT_PORT docker compose \
  -f docker-compose.yml \
  -p "busybeds-$NEXT_SLOT" \
  up -d --build \
  2>&1

# Step 3: Wait for new app to be healthy
echo "[$(date -Iseconds)] Waiting for $NEXT_SLOT app to start on port $NEXT_PORT..."
HEALTHY=false
for i in $(seq 1 40); do
  if curl -sf "http://localhost:$NEXT_PORT/api/health" > /dev/null 2>&1; then
    echo "[$(date -Iseconds)] $NEXT_SLOT is healthy after $((i * 5)) seconds"
    HEALTHY=true
    break
  fi
  sleep 5
done

if [ "$HEALTHY" = "false" ]; then
  echo "[$(date -Iseconds)] ERROR: $NEXT_SLOT failed health check! Rolling back..."
  docker compose -f docker-compose.yml -p "busybeds-$NEXT_SLOT" down 2>/dev/null || true
  echo "[$(date -Iseconds)] Old version ($CURRENT_SLOT on port $CURRENT_PORT) is still running."
  rm -f "$LOCK_FILE"
  exit 1
fi

# Step 4: Switch nginx to the new port
echo "[$(date -Iseconds)] Switching nginx to $NEXT_SLOT (port $NEXT_PORT)..."

# Update nginx upstream to point to the new port
sed -i "s/server 127.0.0.1:.*/server 127.0.0.1:$NEXT_PORT;/" "$NGINX_CONF"

# Graceful nginx reload - no dropped connections
nginx -t && nginx -s reload

echo "[$(date -Iseconds)] Nginx reloaded. Traffic now goes to $NEXT_SLOT."

# Step 5: Stop the OLD version
echo "[$(date -Iseconds)] Stopping old version ($CURRENT_SLOT)..."
sleep 2  # Brief grace period for in-flight requests
docker compose -f docker-compose.yml -p "busybeds-$CURRENT_SLOT" down 2>/dev/null || true

# Step 6: Save state
echo "$NEXT_SLOT" > "$STATE_FILE"

# Step 7: Show status
echo "[$(date -Iseconds)] Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1

echo ""
echo "========================================="
echo "[$(date -Iseconds)] Zero-Downtime Deploy Complete!"
echo "[$(date -Iseconds)] Active: $NEXT_SLOT on port $NEXT_PORT"
echo "========================================="

# Clean up old log entries (keep last 500 lines)
if [ -f "$LOG_FILE" ]; then
  tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

rm -f "$LOCK_FILE"
