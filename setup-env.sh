#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# BusyBeds — Configure API Keys
# Run this after quick-install.sh to set your API keys
# Usage: bash /var/www/busybeds/setup-env.sh
# ═══════════════════════════════════════════════════════════════

ENV_FILE="/var/www/busybeds/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found at $ENV_FILE"
  echo "Run quick-install.sh first"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🔑 BusyBeds API Key Configuration"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Current .env file:"
cat "$ENV_FILE"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Opening editor... Save and exit when done."
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Open nano editor
nano "$ENV_FILE"

# Restart containers after editing
echo ""
echo "Restarting BusyBeds with new configuration..."
cd /var/www/busybeds
docker compose restart

echo ""
echo "✅ Configuration updated and BusyBeds restarted!"
echo "Test: curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"
