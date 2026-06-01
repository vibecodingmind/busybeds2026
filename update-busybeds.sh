#!/bin/bash
#===============================================================================
# BusyBeds Quick Update — Pull latest code and restart
# Usage: bash update-busybeds.sh
#===============================================================================

set -e

APP_DIR="/var/www/busybeds"
APP_NAME="busybeds"

echo "🔄 Updating BusyBeds..."
cd "$APP_DIR"

# Pull latest code
echo "  ↓ Pulling latest code..."
git fetch origin
git reset --hard origin/main

# Install dependencies
echo "  ↓ Installing dependencies..."
export PATH="$HOME/.bun/bin:$PATH"
bun install 2>&1 | tail -1

# Generate Prisma client
echo "  ↓ Generating Prisma client..."
npx prisma generate 2>&1 | tail -1

# Run migrations
echo "  ↓ Running migrations..."
npx prisma migrate deploy 2>&1 | tail -1 || true

# Build
echo "  ↓ Building application..."
npm run build 2>&1 | tail -3

# Restart
echo "  ↓ Restarting application..."
pm2 restart "$APP_NAME"

echo "✅ BusyBeds updated and restarted!"
pm2 status
