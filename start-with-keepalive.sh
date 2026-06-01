#!/bin/bash
cd /home/z/my-project

# Start Next.js in background
NODE_OPTIONS="--max-old-space-size=384" npx next start -p 3000 &
NEXT_PID=$!

# Keepalive loop - ping health endpoint every 3 seconds
while kill -0 $NEXT_PID 2>/dev/null; do
  sleep 3
  curl -s -o /dev/null --max-time 3 http://localhost:3000/api/health 2>/dev/null
done

# If Next.js dies, restart it
while true; do
  NODE_OPTIONS="--max-old-space-size=384" npx next start -p 3000 &
  NEXT_PID=$!
  while kill -0 $NEXT_PID 2>/dev/null; do
    sleep 3
    curl -s -o /dev/null --max-time 3 http://localhost:3000/api/health 2>/dev/null
  done
  sleep 2
done
