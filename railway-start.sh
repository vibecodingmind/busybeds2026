#!/bin/bash
set -e

echo "Running prisma db push..."
npx prisma db push --accept-data-loss 2>&1 || echo "Warning: prisma db push failed"

echo "Running prisma generate..."
npx prisma generate 2>&1 || echo "Warning: prisma generate failed"

echo "Running seed..."
npx tsx prisma/seed.ts 2>&1 || echo "Warning: seed failed (may already exist)"

echo "Starting Next.js server..."
exec npx next start -p ${PORT:-3000} -H 0.0.0.0
