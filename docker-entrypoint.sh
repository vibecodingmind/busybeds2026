#!/bin/sh
# BusyBeds Docker Entrypoint
# Runs migrations and starts the app

set -e

echo "🚀 Starting BusyBeds..."

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, trying db push..."
  npx prisma db push --accept-data-loss
}

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database (only if empty - check if users table has records)
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(c => { console.log(c); prisma.\$disconnect(); }).catch(() => { console.log('0'); prisma.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts 2>/dev/null || npx prisma db seed 2>/dev/null || echo "⚠️  Seed may have partially failed"
else
  echo "📊 Database already has $USER_COUNT users, skipping seed"
fi

# Start the Next.js server
echo "🌐 Starting Next.js server on port $PORT..."
exec node server.js
