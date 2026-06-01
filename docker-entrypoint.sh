#!/bin/sh
# BusyBeds Docker Entrypoint
# Runs migrations and starts the app
set -e

echo "🚀 Starting BusyBeds..."

# Use LOCAL prisma from node_modules (not npx which downloads latest)
PRISMA="./node_modules/.bin/prisma"

# Run Prisma migrations
echo "📦 Running database migrations..."
$PRISMA migrate deploy 2>&1 || {
  echo "⚠️  Migration failed, trying db push..."
  $PRISMA db push --accept-data-loss 2>&1 || {
    echo "⚠️  DB push also failed, continuing anyway..."
  }
}

# Generate Prisma client
echo "🔧 Generating Prisma client..."
$PRISMA generate 2>&1 || echo "⚠️  Prisma generate had issues"

# Check if database is seeded
echo "🌱 Checking if database needs seeding..."
USER_COUNT=$(node -e "
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.user.count().then(c => { console.log(c); prisma.\$disconnect(); }).catch(() => { console.log('0'); prisma.\$disconnect(); });
} catch(e) { console.log('0'); }
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts 2>&1 || echo "⚠️  Seed may have partially failed"
else
  echo "📊 Database already has data, skipping seed"
fi

# Start the Next.js server
echo "🌐 Starting Next.js server on port $PORT..."
exec node server.js
