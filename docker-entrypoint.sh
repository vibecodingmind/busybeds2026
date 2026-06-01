#!/bin/sh
# BusyBeds Docker Entrypoint
# Runs migrations and starts the app
set -e

echo "=== BusyBeds Starting ==="

# Use LOCAL prisma from node_modules
PRISMA="./node_modules/.bin/prisma"

# Run Prisma migrations
echo ">> Running database migrations..."
$PRISMA migrate deploy 2>&1 || {
  echo "!! Migration failed, trying db push..."
  $PRISMA db push --accept-data-loss 2>&1 || {
    echo "!! DB push also failed, continuing anyway..."
  }
}

# Check if database is seeded
echo ">> Checking if database needs seeding..."
USER_COUNT=$($PRISMA db execute --stdin 2>/dev/null <<'SQL' 2>/dev/null || echo "0"
SELECT COUNT(*) FROM "User";
SQL
)

if [ "$USER_COUNT" = "0" ] 2>/dev/null || [ -z "$USER_COUNT" ]; then
  echo ">> Seeding database..."
  node -e "
    const { execSync } = require('child_process');
    try {
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } catch(e) {
      console.log('Seed may have partially failed, continuing...');
    }
  " 2>/dev/null || echo "!! Seed had issues, continuing..."
else
  echo ">> Database already has data, skipping seed"
fi

# Start the Next.js standalone server
echo ">> Starting Next.js server on port $PORT..."
exec node server.js
