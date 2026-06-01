#!/bin/bash
cd /var/www/busybeds
export PATH=$HOME/.bun/bin:$PATH
rm -rf .next
echo "Starting build at $(date)"
npm run build 2>&1 | tail -10
echo "Build done at $(date), exit=$?"
if [ -f .next/BUILD_ID ]; then
  echo "BUILD SUCCESS"
  pm2 restart busybeds
  pm2 save
  sleep 5
  echo "HTTP=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo FAIL)"
else
  echo "BUILD FAILED"
fi
