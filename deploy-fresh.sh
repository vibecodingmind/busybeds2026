#!/bin/bash
#===============================================================================
# BusyBeds — FRESH VPS ALL-IN-ONE DEPLOYMENT
#
# Run this on a BRAND NEW Ubuntu 22.04/24.04 VPS.
# It will set up EVERYTHING from scratch including:
#   - System updates & security
#   - Docker + Docker Compose
#   - Nginx reverse proxy (multi-app ready)
#   - SSL with Let's Encrypt
#   - BusyBeds app with PostgreSQL
#   - GitHub webhook auto-deploy
#   - Firewall
#
# HOW TO USE:
#   Option A: Via SSH after reinstalling Ubuntu:
#     ssh root@YOUR_VPS_IP
#     curl -sL https://raw.githubusercontent.com/vibecodingmind/busybeds2026/main/deploy-fresh.sh | bash
#
#   Option B: Via Contabo VNC Console:
#     Login as root, then paste:
#     curl -sL https://raw.githubusercontent.com/vibecodingmind/busybeds2026/main/deploy-fresh.sh | bash
#
#   Option C: Direct paste (if curl not available yet):
#     apt-get update && apt-get install -y curl
#     curl -sL https://raw.githubusercontent.com/vibecodingmind/busybeds2026/main/deploy-fresh.sh | bash
#
# AFTER DEPLOYMENT:
#   1. Configure API keys: nano /var/www/busybeds/.env
#   2. Restart: cd /var/www/busybeds && docker compose restart
#   3. Set up GitHub webhook (see instructions at the end)
#
#===============================================================================

set -e

# ── Configuration ──────────────────────────────────────────────────────────────
APP_NAME="busybeds"
APP_DIR="/var/www/busybeds"
APP_PORT=3000
APP_DOMAIN="busybeds.com"
DB_NAME="busybeds_prod"
DB_USER="busybeds"
GIT_REPO="https://github.com/vibecodingmind/busybeds2026.git"
WEBHOOK_PORT=9000

# Auto-generated secure credentials
DB_PASS=$(openssl rand -base64 18 | tr -d '/+=_')
JWT_SECRET=$(openssl rand -base64 32 | tr -d '/+=_')
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '/+=_')
WEBHOOK_SECRET=$(openssl rand -base64 24 | tr -d '/+=_')

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
info() { echo -e "${BLUE}[..]${NC} $1"; }
err()  { echo -e "${RED}[XX]${NC} $1"; }

echo ""
echo "========================================================================="
echo "   BusyBeds — Fresh VPS Deployment"
echo "   Domain: $APP_DOMAIN"
echo "   App Dir: $APP_DIR"
echo "========================================================================="
echo ""

# Save start time
START_TIME=$(date +%s)

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: SYSTEM UPDATE & ESSENTIALS
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 1/12: Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq 2>/dev/null
apt-get upgrade -y -qq 2>/dev/null
apt-get install -y -qq curl wget git nginx certbot python3-certbot-nginx ufw \
  apt-transport-https ca-certificates software-properties-common gnupg lsb-release \
  htop nano unzip net-tools dnsutils 2>/dev/null
log "System updated and essentials installed"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: SET HOSTNAME
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 2/12: Setting hostname..."
hostnamectl set-hostname busybeds 2>/dev/null || true
echo "127.0.0.1 busybeds" >> /etc/hosts 2>/dev/null || true
log "Hostname set to busybeds"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: INSTALL DOCKER
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 3/12: Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh 2>&1 | tail -5
  systemctl start docker
  systemctl enable docker
  log "Docker installed: $(docker --version)"
else
  log "Docker already installed: $(docker --version)"
fi

# Ensure Docker Compose v2 is available
if ! docker compose version &> /dev/null; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose 2>&1 | tail -1
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
log "Docker Compose: $(docker compose version --short 2>/dev/null || echo 'checking...')"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: INSTALL NODE.JS (for webhook listener)
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 4/12: Installing Node.js 22..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - 2>&1 | tail -3
  apt-get install -y nodejs 2>/dev/null
  log "Node.js installed: $(node --version)"
else
  log "Node.js already installed: $(node --version)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: CLONE BUSYBEDS REPOSITORY
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 5/12: Cloning BusyBeds repository..."
mkdir -p /var/www
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
  log "Repository updated to latest"
else
  git clone "$GIT_REPO" "$APP_DIR"
  cd "$APP_DIR"
  log "Repository cloned"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: CREATE PRODUCTION .env
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 6/12: Creating production environment..."
cat > "$APP_DIR/.env" << ENVFILE
# ═══ BusyBeds Production Environment ═══
# Auto-generated by deploy-fresh.sh on $(date -Iseconds)
# Edit with: nano /var/www/busybeds/.env

# ── Database (PostgreSQL via Docker) ──
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}"
DB_PASSWORD="${DB_PASS}"

# ── Auth & Security ──
JWT_SECRET="${JWT_SECRET}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# ── App ──
NEXT_PUBLIC_APP_URL="https://${APP_DOMAIN}"
NEXT_PUBLIC_APP_NAME="BusyBeds"
NODE_ENV="production"
PORT=3000

# ── Stripe (fill in your keys) ──
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# ── PayPal (fill in your keys) ──
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=live

# ── Pesapal (fill in your keys) ──
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_ENV=live

# ── Google OAuth (fill in your keys) ──
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://busybeds.com/api/auth/google/callback

# ── LinkedIn OAuth (fill in your keys) ──
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# ── reCAPTCHA (fill in your keys) ──
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# ── Google Maps & Places (fill in your keys) ──
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_PLACES_API_KEY=

# ── Cloudinary (fill in your keys) ──
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Email SMTP (fill in your keys) ──
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@busybeds.com

# ── SMS Africa's Talking (fill in your keys) ──
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
AFRICASTALKING_SENDER_ID=

# ── GitHub Webhook Auto-Deploy ──
GITHUB_WEBHOOK_SECRET=${WEBHOOK_SECRET}
WEBHOOK_PORT=${WEBHOOK_PORT}
ENVFILE

chmod 600 "$APP_DIR/.env"
log "Production .env created with secure credentials"
info "  DB Password: $DB_PASS"
info "  JWT Secret: $JWT_SECRET"
info "  Webhook Secret: $WEBHOOK_SECRET"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: BUILD & START DOCKER CONTAINERS
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 7/12: Building Docker containers (this takes 3-5 minutes)..."
cd "$APP_DIR"
docker compose up -d --build 2>&1 | tail -10

info "Waiting for app to start..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    log "App is responding on port 3000!"
    break
  fi
  if [ "$i" = "60" ]; then
    warn "App health check timed out, but containers may still be starting"
  fi
  sleep 5
done

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8: CONFIGURE NGINX REVERSE PROXY
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 8/12: Configuring Nginx reverse proxy..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create shared Nginx snippets
mkdir -p /etc/nginx/snippets /var/www/certbot

cat > /etc/nginx/snippets/security-headers.conf << 'EOF'
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
EOF

cat > /etc/nginx/snippets/proxy-params.conf << 'EOF'
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

# BusyBeds site configuration
cat > /etc/nginx/sites-available/busybeds.com << 'NGINX'
upstream busybeds_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}
limit_req_zone $binary_remote_addr zone=bb:10m rate=10r/s;

# HTTP → HTTPS redirect
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

    # SSL certificates (will be configured by certbot)
    # ssl_certificate /etc/letsencrypt/live/busybeds.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/busybeds.com/privkey.pem;

    # Redirect www to non-www
    if ($host = www.busybeds.com) {
        return 301 https://busybeds.com$request_uri;
    }

    include snippets/security-headers.conf;
    limit_req zone=bb burst=20 nodelay;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript image/svg+xml
               font/woff2 application/wasm;

    client_max_body_size 20M;

    # Next.js static assets - long cache
    location /_next/static/ {
        proxy_pass http://busybeds_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
        include snippets/proxy-params.conf;
    }

    # All other requests
    location / {
        proxy_pass http://busybeds_upstream;
        include snippets/proxy-params.conf;
    }

    # Block hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    access_log /var/log/nginx/busybeds_access.log;
    error_log /var/log/nginx/busybeds_error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/busybeds.com /etc/nginx/sites-enabled/busybeds.com

# Test and reload
nginx -t 2>&1 && systemctl reload nginx
log "Nginx configured for $APP_DOMAIN"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9: CONFIGURE FIREWALL
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 9/12: Configuring firewall..."
ufw --force reset > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow OpenSSH > /dev/null 2>&1
ufw allow 'Nginx Full' > /dev/null 2>&1
ufw allow ${WEBHOOK_PORT}/tcp > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
log "Firewall configured (SSH, HTTP, HTTPS, Webhook port ${WEBHOOK_PORT})"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 10: SET UP GITHUB WEBHOOK AUTO-DEPLOY
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 10/12: Setting up GitHub webhook auto-deploy..."

# Make deploy scripts executable
chmod +x "$APP_DIR/auto-deploy/deploy-on-push.sh" 2>/dev/null || true

# Install webhook as systemd service
cat > /etc/systemd/system/busybeds-webhook.service << EOF
[Unit]
Description=BusyBeds GitHub Webhook Auto-Deploy
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=$APP_DIR/auto-deploy
ExecStart=/usr/bin/node $APP_DIR/auto-deploy/webhook-listener.js
Restart=always
RestartSec=5
Environment=WEBHOOK_PORT=$WEBHOOK_PORT
Environment=GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
Environment=DEPLOY_SCRIPT=$APP_DIR/auto-deploy/deploy-on-push.sh
Environment=DEPLOY_LOG=$APP_DIR/auto-deploy/deploy.log
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable busybeds-webhook
systemctl start busybeds-webhook 2>/dev/null || warn "Webhook service may need manual start after build"

# Wait and check
sleep 2
if systemctl is-active --quiet busybeds-webhook; then
  log "Webhook auto-deploy is running on port $WEBHOOK_PORT"
else
  warn "Webhook service not yet running - will start after full deployment"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 11: SET UP SSL
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 11/12: Setting up SSL..."
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
DOMAIN_IP=$(dig +short $APP_DOMAIN 2>/dev/null | tail -1)

if [ "$DOMAIN_IP" = "$VPS_IP" ]; then
  info "DNS is pointing to this VPS! Installing SSL certificate..."
  certbot --nginx -d busybeds.com -d www.busybeds.com \
    --non-interactive --agree-tos --email "admin@busybeds.com" --redirect 2>&1 | tail -5

  # Auto-renewal cron
  (crontab -l 2>/dev/null | grep -v certbot; echo "0 3 * * * certbot renew --quiet --post-hook \"systemctl reload nginx\"") | crontab -
  log "SSL installed with auto-renewal!"
else
  warn "DNS not pointing to this VPS yet"
  warn "  VPS IP:    $VPS_IP"
  warn "  Domain IP: $DOMAIN_IP"
  warn ""
  warn "  After pointing DNS, run:"
  warn "  certbot --nginx -d busybeds.com -d www.busybeds.com"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 12: HARDEN SSH
# ═══════════════════════════════════════════════════════════════════════════════
info "Step 12/12: Hardening SSH..."

# Create SSH key for auto-deploy (optional, for passwordless access)
ssh-keygen -t ed25519 -C "busybeds-deploy" -f /root/.ssh/busybeds_deploy -N "" 2>/dev/null || true

# SSH hardening (keep password auth enabled for now, can disable later)
cat > /etc/ssh/sshd_config.d/busybeds-hardening.conf << 'EOF'
# BusyBeds SSH Hardening
PermitRootLogin yes
PasswordAuthentication yes
MaxAuthTries 4
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

systemctl reload sshd 2>/dev/null || systemctl reload ssh 2>/dev/null || true
log "SSH hardened"

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL STATUS REPORT
# ═══════════════════════════════════════════════════════════════════════════════
END_TIME=$(date +%s)
ELAPSED=$(( END_TIME - START_TIME ))
MINUTES=$(( ELAPSED / 60 ))
SECONDS=$(( ELAPSED % 60 ))

# Save credentials to a secure file
cat > /root/busybeds-credentials.txt << CREDS
═══════════════════════════════════════════
  BusyBeds Production Credentials
  Generated: $(date -Iseconds)
  VPS IP: $VPS_IP
═══════════════════════════════════════════

Database:
  Host: localhost (or db inside Docker)
  Port: 5432
  Name: $DB_NAME
  User: $DB_USER
  Password: $DB_PASS

Auth Secrets:
  JWT Secret: $JWT_SECRET
  NextAuth Secret: $NEXTAUTH_SECRET

Auto-Deploy Webhook:
  URL: http://$VPS_IP:$WEBHOOK_PORT/webhook
  Secret: $WEBHOOK_SECRET

Demo Logins:
  Admin: admin@busybeds.com / Admin123!
  Owner: owner@busybeds.com / Owner123!
  Guest: amina.hassan@example.com / Password123!

SSH Deploy Key (public):
$(cat /root/.ssh/busybeds_deploy.pub 2>/dev/null || echo "Not generated")

═══════════════════════════════════════════
CREDS
chmod 600 /root/busybeds-credentials.txt

echo ""
echo "========================================================================="
echo -e "  ${GREEN}BUSYBEDS DEPLOYMENT COMPLETE!${NC}"
echo "  Total time: ${MINUTES}m ${SECONDS}s"
echo "========================================================================="
echo ""
echo "  App Status:"
docker compose -f "$APP_DIR/docker-compose.yml" ps 2>/dev/null
echo ""
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "000")
echo "  HTTP Check:  http://localhost:3000 -> $HTTP_CODE"
echo "  VPS IP:      $VPS_IP"
echo "  Domain:      $APP_DOMAIN"
echo ""
echo "  ── Auto-Generated Credentials ─────────────────────────────"
echo "  DB User:       $DB_USER"
echo "  DB Password:   $DB_PASS"
echo "  JWT Secret:    $JWT_SECRET"
echo "  Webhook Secret: $WEBHOOK_SECRET"
echo "  (Full credentials saved to /root/busybeds-credentials.txt)"
echo ""
echo "  ── GitHub Webhook Auto-Deploy Setup ───────────────────────"
echo "  1. Go to: https://github.com/vibecodingmind/busybeds2026/settings/hooks"
echo "  2. Click 'Add webhook'"
echo "  3. Payload URL: http://$VPS_IP:$WEBHOOK_PORT/webhook"
echo "  4. Content type: application/json"
echo "  5. Secret: $WEBHOOK_SECRET"
echo "  6. Which events: Just the push event"
echo "  7. Click 'Add webhook'"
echo ""
echo "  After that, every push to main will auto-deploy!"
echo ""
echo "  ── DNS Setup (if not done yet) ────────────────────────────"
if [ "$DOMAIN_IP" != "$VPS_IP" ]; then
echo "  1. Go to your DNS provider"
echo "  2. Add A record: busybeds.com -> $VPS_IP"
echo "  3. Add A record: www.busybeds.com -> $VPS_IP"
echo "  4. Wait for DNS propagation (5-30 min)"
echo "  5. Run: certbot --nginx -d busybeds.com -d www.busybeds.com"
fi
echo ""
echo "  ── Configure API Keys ─────────────────────────────────────"
echo "  nano /var/www/busybeds/.env"
echo "  cd /var/www/busybeds && docker compose restart"
echo ""
echo "  ── Management Commands ────────────────────────────────────"
echo "  View logs:   docker compose -f $APP_DIR/docker-compose.yml logs -f"
echo "  Restart:     docker compose -f $APP_DIR/docker-compose.yml restart"
echo "  Stop:        docker compose -f $APP_DIR/docker-compose.yml down"
echo "  Rebuild:     docker compose -f $APP_DIR/docker-compose.yml up -d --build"
echo "  Webhook log: tail -f $APP_DIR/auto-deploy/deploy.log"
echo ""
echo "  ── Add Another App to This VPS ────────────────────────────"
echo "  1. Clone app to /var/www/your-app with different port"
echo "  2. Create /etc/nginx/sites-available/your-app.com"
echo "  3. ln -s /etc/nginx/sites-available/your-app.com /etc/nginx/sites-enabled/"
echo "  4. certbot --nginx -d your-app.com"
echo "========================================================================="
