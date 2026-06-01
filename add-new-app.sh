#!/bin/bash
#===============================================================================
# Add New App to VPS — Helper Script
# Adds a new application alongside BusyBeds on the same VPS
#
# Usage: bash add-new-app.sh <app-name> <domain> <port> <repo-url>
# Example: bash add-new-app.sh myapp myapp.com 3001 https://github.com/user/repo.git
#===============================================================================

set -e

APP_NAME="${1:?Usage: bash add-new-app.sh <app-name> <domain> <port> <repo-url>}"
APP_DOMAIN="${2:?Please provide domain name}"
APP_PORT="${3:?Please provide port number}"
GIT_REPO="${4:?Please provide git repo URL}"
APP_DIR="/var/www/$APP_NAME"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo ""
echo "========================================================================"
echo "  Adding New App: $APP_NAME"
echo "  Domain: $APP_DOMAIN | Port: $APP_PORT | Dir: $APP_DIR"
echo "========================================================================"
echo ""

# ─── Step 1: Clone Repository ───────────────────────────────────────────────
info "Cloning repository..."
mkdir -p /var/www

if [ -d "$APP_DIR" ]; then
  warn "Directory $APP_DIR exists, pulling latest..."
  cd "$APP_DIR"
  git pull origin main || true
else
  git clone "$GIT_REPO" "$APP_DIR"
  cd "$APP_DIR"
fi
log "Repository ready"

# ─── Step 2: Install & Build ────────────────────────────────────────────────
info "Installing dependencies..."
export PATH="$HOME/.bun/bin:$PATH"
cd "$APP_DIR"

# Detect package manager
if [ -f "bun.lock" ]; then
  bun install 2>&1 | tail -3
elif [ -f "package-lock.json" ]; then
  npm install 2>&1 | tail -3
else
  npm install 2>&1 | tail -3
fi

info "Building application..."
if [ -f "package.json" ]; then
  npm run build 2>&1 | tail -5 || warn "Build may have issues"
fi
log "Dependencies installed and app built"

# ─── Step 3: Create PM2 Config Entry ────────────────────────────────────────
info "Adding PM2 configuration..."

# Detect app type
if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
  START_CMD="node_modules/.bin/next"
  START_ARGS="start -p $APP_PORT -H 0.0.0.0"
elif [ -f "server.js" ]; then
  START_CMD="server.js"
  START_ARGS=""
else
  START_CMD="node"
  START_ARGS="index.js"
fi

# Create standalone PM2 config for this app
cat > "$APP_DIR/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [{
    name: "$APP_NAME",
    script: "$START_CMD",
    args: "$START_ARGS",
    cwd: "$APP_DIR",
    env: {
      NODE_ENV: "production",
      PORT: $APP_PORT
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    error_file: "/var/log/pm2/${APP_NAME}-error.log",
    out_file: "/var/log/pm2/${APP_NAME}-out.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
EOF

# Start the app
pm2 start "$APP_DIR/ecosystem.config.cjs" --only "$APP_NAME"
pm2 save
log "App started with PM2 on port $APP_PORT"

# ─── Step 4: Create Nginx Config ───────────────────────────────────────────
info "Creating Nginx configuration..."

cat > "/etc/nginx/sites-available/$APP_DOMAIN" << NGINXEOF
# $APP_NAME — $APP_DOMAIN
upstream ${APP_NAME}_upstream {
    server 127.0.0.1:$APP_PORT;
    keepalive 64;
}

limit_req_zone \$binary_remote_addr zone=${APP_NAME}_limit:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name $APP_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$APP_DOMAIN\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $APP_DOMAIN;

    # ssl_certificate /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem;

    include snippets/security-headers.conf;

    limit_req zone=${APP_NAME}_limit burst=20 nodelay;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    client_max_body_size 20M;

    location /_next/static/ {
        proxy_pass http://${APP_NAME}_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
        include snippets/proxy-params.conf;
    }

    location / {
        proxy_pass http://${APP_NAME}_upstream;
        include snippets/proxy-params.conf;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
}
NGINXEOF

ln -sf "/etc/nginx/sites-available/$APP_DOMAIN" "/etc/nginx/sites-enabled/$APP_DOMAIN"
nginx -t && systemctl reload nginx
log "Nginx configured for $APP_DOMAIN"

echo ""
echo "========================================================================"
echo "  ✅ $APP_NAME added successfully!"
echo "========================================================================"
echo ""
echo "  Next: Point DNS for $APP_DOMAIN → $(curl -s ifconfig.me 2>/dev/null)"
echo "  Then: certbot --nginx -d $APP_DOMAIN"
echo ""
echo "  Manage: pm2 status | pm2 logs $APP_NAME | pm2 restart $APP_NAME"
echo "========================================================================"
