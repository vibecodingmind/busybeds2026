#!/bin/bash
#===============================================================================
# BusyBeds VPS Deployment Script
# Hosts BusyBeds on Contabo VPS with Nginx reverse proxy (multi-app ready)
# 
# Usage: ssh root@YOUR_VPS_IP "bash -s" < deploy-vps.sh
# Or:   Copy to VPS and run: bash deploy-vps.sh
#===============================================================================

set -e

# ─── Configuration ───────────────────────────────────────────────────────────
APP_NAME="busybeds"
APP_DIR="/var/www/busybeds"
APP_PORT=3000
APP_DOMAIN="busybeds.com"
APP_WWW_DOMAIN="www.busybeds.com"
DB_NAME="busybeds_prod"
DB_USER="busybeds"
DB_PASS=$(openssl rand -base64 18 | tr -d '/+=')  # Auto-generated secure password
GIT_REPO="https://github.com/vibecodingmind/busybeds2026.git"
NODE_VERSION="22"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo ""
echo "========================================================================"
echo "  BusyBeds VPS Deployment — Multi-App Architecture"
echo "  Domain: $APP_DOMAIN | Port: $APP_PORT | Dir: $APP_DIR"
echo "========================================================================"
echo ""

# ─── Step 1: System Update ──────────────────────────────────────────────────
info "Step 1/12: Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
log "System updated"

# ─── Step 2: Install Essential Packages ─────────────────────────────────────
info "Step 2/12: Installing essential packages..."
apt-get install -y \
  nginx postgresql postgresql-contrib \
  certbot python3-certbot-nginx \
  git curl wget unzip \
  ufw fail2ban \
  software-properties-common apt-transport-https \
  build-essential libssl-dev \
  > /dev/null 2>&1
log "Essential packages installed"

# ─── Step 3: Install Node.js ────────────────────────────────────────────────
info "Step 3/12: Installing Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - > /dev/null 2>&1
  apt-get install -y nodejs > /dev/null 2>&1
fi
NODE_VER=$(node -v)
NPM_VER=$(npm -v)
log "Node.js $NODE_VER | npm $NPM_VER installed"

# ─── Step 4: Install Bun ────────────────────────────────────────────────────
info "Step 4/12: Installing Bun..."
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash > /dev/null 2>&1
  export PATH="$HOME/.bun/bin:$PATH"
  echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
fi
BUN_VER=$(bun -v 2>/dev/null || echo "checking...")
log "Bun $BUN_VER installed"

# ─── Step 5: Install PM2 ────────────────────────────────────────────────────
info "Step 5/12: Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2 > /dev/null 2>&1
fi
log "PM2 installed (supports multiple apps)"

# ─── Step 6: Configure PostgreSQL ───────────────────────────────────────────
info "Step 6/12: Configuring PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database user if not exists
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ "$USER_EXISTS" != "1" ]; then
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" > /dev/null
  log "Created database user: $DB_USER"
else
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" > /dev/null
  warn "Database user $DB_USER already exists, password updated"
fi

# Create database if not exists
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME && echo "yes" || echo "no")
if [ "$DB_EXISTS" = "no" ]; then
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" > /dev/null
  log "Created database: $DB_NAME"
else
  warn "Database $DB_NAME already exists"
fi

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" > /dev/null
log "PostgreSQL configured"

# ─── Step 7: Clone/Update Repository ────────────────────────────────────────
info "Step 7/12: Cloning BusyBeds repository..."
mkdir -p /var/www

if [ -d "$APP_DIR" ]; then
  warn "Directory $APP_DIR exists, pulling latest..."
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
  log "Repository updated"
else
  git clone "$GIT_REPO" "$APP_DIR"
  cd "$APP_DIR"
  log "Repository cloned"
fi

# ─── Step 8: Configure Environment ──────────────────────────────────────────
info "Step 8/12: Configuring environment variables..."

# Create .env from template
if [ -f "$APP_DIR/.env.production" ]; then
  cp "$APP_DIR/.env.production" "$APP_DIR/.env"
  log "Copied .env.production to .env"
elif [ -f "$APP_DIR/.env" ]; then
  warn ".env already exists, keeping it"
else
  cat > "$APP_DIR/.env" << 'ENVEOF'
# ═══════════════════════════════════════════════════════════════
# BusyBeds Production Environment Configuration
# SET YOUR ACTUAL VALUES BELOW — This file should NOT be in git
# ═══════════════════════════════════════════════════════════════

# ── Database ──
DATABASE_URL="postgresql://busybeds:${DB_PASS}@localhost:5432/busybeds_prod"

# ── Auth ──
JWT_SECRET="CHANGE_ME_to_a_random_string"
NEXTAUTH_SECRET="CHANGE_ME_to_a_random_string"

# ── App ──
NEXT_PUBLIC_APP_URL="https://busybeds.com"
NEXT_PUBLIC_APP_NAME="BusyBeds"
NODE_ENV="production"
PORT=3000

# ── Stripe ──
STRIPE_SECRET_KEY="CHANGE_ME"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="CHANGE_ME"
STRIPE_WEBHOOK_SECRET="CHANGE_ME"

# ── PayPal ──
PAYPAL_CLIENT_ID="CHANGE_ME"
PAYPAL_CLIENT_SECRET="CHANGE_ME"
PAYPAL_MODE="live"

# ── Pesapal ──
PESAPAL_CONSUMER_KEY="CHANGE_ME"
PESAPAL_CONSUMER_SECRET="CHANGE_ME"
PESAPAL_ENV="live"

# ── Google OAuth ──
GOOGLE_CLIENT_ID="CHANGE_ME"
GOOGLE_CLIENT_SECRET="CHANGE_ME"
GOOGLE_REDIRECT_URI="https://busybeds.com/api/auth/google/callback"

# ── LinkedIn OAuth ──
LINKEDIN_CLIENT_ID="CHANGE_ME"
LINKEDIN_CLIENT_SECRET="CHANGE_ME"

# ── reCAPTCHA ──
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="CHANGE_ME"
RECAPTCHA_SECRET_KEY="CHANGE_ME"

# ── Google Maps ──
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="CHANGE_ME"

# ── Google Places (Hotel Import) ──
GOOGLE_PLACES_API_KEY="CHANGE_ME"

# ── Cloudinary (Image Uploads) ──
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ── Email (SMTP) ──
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@busybeds.com"

# ── SMS (Africa's Talking) ──
AFRICASTALKING_API_KEY=""
AFRICASTALKING_USERNAME=""
AFRICASTALKING_SENDER_ID=""
ENVEOF
  warn "⚠️  .env created with PLACEHOLDER values!"
  warn "    You MUST edit /var/www/busybeds/.env with your actual API keys"
  warn "    Then run: pm2 restart busybeds"
fi

# Secure the .env file
chmod 600 "$APP_DIR/.env"
log "Environment configured (.env file ready)"

# ─── Step 9: Install Dependencies & Build ───────────────────────────────────
info "Step 9/12: Installing dependencies and building..."
cd "$APP_DIR"

# Install dependencies with bun
export PATH="$HOME/.bun/bin:$PATH"
bun install 2>&1 | tail -3
log "Dependencies installed"

# Generate Prisma client
npx prisma generate 2>&1 | tail -3
log "Prisma client generated"

# Run migrations
npx prisma migrate deploy 2>&1 | tail -5 || {
  warn "Migrate deploy had issues, running migrate dev..."
  npx prisma migrate dev --name init 2>&1 | tail -5 || {
    warn "Migrate dev also had issues, using db push..."
    npx prisma db push --accept-data-loss 2>&1 | tail -3
  }
}
log "Database migrated"

# Seed database (only if empty)
SEED_CHECK=$(sudo -u postgres psql -d $DB_NAME -tAc "SELECT COUNT(*) FROM \"User\" LIMIT 1;" 2>/dev/null || echo "0")
if [ "$SEED_CHECK" = "0" ] || [ -z "$SEED_CHECK" ]; then
  npx tsx prisma/seed.ts 2>&1 | tail -5 || npx prisma db seed 2>&1 | tail -5 || warn "Seed may have partially failed"
  log "Database seeded"
else
  warn "Database already has data ($SEED_CHECK users), skipping seed"
fi

# Build the application
info "Building Next.js application (this takes a few minutes)..."
npm run build 2>&1 | tail -10
log "Application built successfully"

# ─── Step 10: Configure PM2 ─────────────────────────────────────────────────
info "Step 10/12: Configuring PM2 (multi-app process manager)..."

mkdir -p /var/log/pm2

cat > "$APP_DIR/ecosystem.config.cjs" << 'EOF'
// ═══════════════════════════════════════════════════════════════
// PM2 Ecosystem — Multi-App Configuration
// ═══════════════════════════════════════════════════════════════
// 
// To add another app:
// 1. Clone your app to /var/www/your-app
// 2. Add a new entry in the 'apps' array below
// 3. Create an Nginx config in /etc/nginx/sites-available/your-app.com
// 4. Run: pm2 start ecosystem.config.cjs --only your-app-name
// 5. Run: pm2 save
//
module.exports = {
  apps: [
    {
      name: "busybeds",
      script: "node_modules/.bin/next",
      args: "start -p 3000 -H 0.0.0.0",
      cwd: "/var/www/busybeds",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "/var/log/pm2/busybeds-error.log",
      out_file: "/var/log/pm2/busybeds-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
    // ── Add more apps below ──
    // {
    //   name: "another-app",
    //   script: "node_modules/.bin/next",
    //   args: "start -p 3001 -H 0.0.0.0",
    //   cwd: "/var/www/another-app",
    //   env: { NODE_ENV: "production", PORT: 3001 },
    //   instances: 1,
    //   autorestart: true,
    //   max_memory_restart: "1G",
    //   error_file: "/var/log/pm2/another-app-error.log",
    //   out_file: "/var/log/pm2/another-app-out.log",
    //   merge_logs: true,
    //   log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    // }
  ]
};
EOF

# Start the app
pm2 delete busybeds 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.cjs" --only busybeds
pm2 save

# Setup PM2 to start on boot
PM2_STARTUP=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo" || true)
if [ -n "$PM2_STARTUP" ]; then
  eval "$PM2_STARTUP" 2>/dev/null || true
fi
log "PM2 configured and BusyBeds started"

# ─── Step 11: Configure Nginx ───────────────────────────────────────────────
info "Step 11/12: Configuring Nginx (multi-site reverse proxy)..."

# Create directory structure for multi-site hosting
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/nginx/snippets
mkdir -p /var/log/nginx

# Security snippet (reusable across all sites)
cat > /etc/nginx/snippets/security-headers.conf << 'EOF'
# Security Headers — Include in all site configs
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;
EOF

# Proxy params snippet (reusable)
cat > /etc/nginx/snippets/proxy-params.conf << 'EOF'
# Proxy Parameters — Include in all site location blocks
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;
proxy_cache_bypass $http_upgrade;
proxy_read_timeout 300s;
proxy_connect_timeout 75s;
proxy_send_timeout 300s;
EOF

# BusyBeds Nginx config
cat > /etc/nginx/sites-available/busybeds.com << 'NGINXEOF'
# ═══════════════════════════════════════════════════════════════
# BusyBeds — busybeds.com
# Nginx Reverse Proxy Configuration
# ═══════════════════════════════════════════════════════════════
# 
# Multi-App VPS: Each app gets its own config file here.
# To add another app:
#   1. Create /etc/nginx/sites-available/yourapp.com
#   2. ln -s /etc/nginx/sites-available/yourapp.com /etc/nginx/sites-enabled/
#   3. nginx -t && systemctl reload nginx
#

upstream busybeds_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Rate limiting zone (per-site)
limit_req_zone $binary_remote_addr zone=busybeds_limit:10m rate=10r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name busybeds.com www.busybeds.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://busybeds.com$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name busybeds.com www.busybeds.com;

    # ── SSL (will be configured by Certbot) ──
    # ssl_certificate /etc/letsencrypt/live/busybeds.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/busybeds.com/privkey.pem;

    # ── Redirect www to non-www ──
    if ($host = www.busybeds.com) {
        return 301 https://busybeds.com$request_uri;
    }

    # ── Security Headers ──
    include snippets/security-headers.conf;

    # Strict-Transport-Security (enable after SSL is set up)
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # ── Rate Limiting ──
    limit_req zone=busybeds_limit burst=20 nodelay;

    # ── Gzip Compression ──
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
      text/plain
      text/css
      application/json
      application/javascript
      text/xml
      application/xml
      application/xml+rss
      text/javascript
      image/svg+xml
      font/woff2;

    # ── Max Upload Size ──
    client_max_body_size 20M;

    # ── Next.js Static Assets (long cache) ──
    location /_next/static/ {
        proxy_pass http://busybeds_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
        include snippets/proxy-params.conf;
    }

    # ── Next.js Image Optimization ──
    location /_next/image {
        proxy_pass http://busybeds_upstream;
        include snippets/proxy-params.conf;
    }

    # ── All Other Requests ──
    location / {
        proxy_pass http://busybeds_upstream;
        include snippets/proxy-params.conf;
    }

    # ── Block Hidden Files ──
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # ── Logs ──
    access_log /var/log/nginx/busybeds_access.log;
    error_log /var/log/nginx/busybeds_error.log;
}
NGINXEOF

# Enable the site
ln -sf /etc/nginx/sites-available/busybeds.com /etc/nginx/sites-enabled/busybeds.com

# Remove default site (optional - keep if you want a default page)
# rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
systemctl enable nginx
log "Nginx configured for $APP_DOMAIN"

# ─── Step 12: Configure Firewall ────────────────────────────────────────────
info "Step 12/12: Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
log "Firewall configured (SSH + Nginx Full allowed)"

# ─── Setup Certbot directory ────────────────────────────────────────────────
mkdir -p /var/www/certbot

# ─── Final Status ───────────────────────────────────────────────────────────
echo ""
echo "========================================================================"
echo -e "  ${GREEN}BusyBeds VPS Deployment Complete!${NC}"
echo "========================================================================"
echo ""
echo "  App Status:"
pm2 status
echo ""
echo "  Nginx Status:"
systemctl status nginx --no-pager | head -5
echo ""
echo "  PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5
echo ""
echo "  Quick Health Check:"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "000")
echo "  - App on port 3000: HTTP $HTTP_CODE"
HTTP_NGINX=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:80 2>/dev/null || echo "000")
echo "  - Nginx on port 80: HTTP $HTTP_NGINX"
echo ""
echo "  ─── Next Steps ───"
echo "  1. Point DNS: busybeds.com → $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VPS_IP')"
echo "  2. Install SSL:  certbot --nginx -d busybeds.com -d www.busybeds.com"
echo "  3. Test:         curl -I https://busybeds.com"
echo ""
echo "  ─── Multi-App Setup ───"
echo "  To add another app to this VPS:"
echo "    1. Clone app to /var/www/your-app"
echo "    2. Add entry in /var/www/busybeds/ecosystem.config.cjs"
echo "    3. Create Nginx config in /etc/nginx/sites-available/your-app.com"
echo "    4. ln -s /etc/nginx/sites-available/your-app.com /etc/nginx/sites-enabled/"
echo "    5. pm2 start ecosystem.config.cjs --only your-app-name"
echo "    6. certbot --nginx -d your-app.com"
echo ""
echo "  ─── Useful Commands ───"
echo "  pm2 status          - Check all running apps"
echo "  pm2 logs busybeds   - View BusyBeds logs"
echo "  pm2 restart busybeds - Restart BusyBeds"
echo "  pm2 monit           - Live monitoring dashboard"
echo "  nginx -t && reload  - Test & reload Nginx config"
echo "========================================================================"
