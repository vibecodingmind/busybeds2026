#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=4096" npx next start -p 3000 -H 0.0.0.0
  echo "Server died at $(date), restarting in 3s..."
  sleep 3
done
