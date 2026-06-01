#!/bin/bash
#===============================================================================
# BusyBeds — ALL-IN-ONE VPS DEPLOYMENT SCRIPT
#
# HOW TO USE (pick one):
#
# Option A: SSH into your VPS and run:
#   bash <(curl -sL https://raw.githubusercontent.com/vibecodingmind/busybeds2026/main/quick-install.sh)
#
# Option B: Open Contabo VNC console, paste:
#   curl -sL https://raw.githubusercontent.com/vibecodingmind/busybeds2026/main/quick-install.sh | bash
#
# After deployment, configure API keys:
#   bash /var/www/busybeds/setup-env.sh
#   OR: nano /var/www/busybeds/.env
#   Then: cd /var/www/busybeds && docker compose restart
#
#===============================================================================

set -e

APP_NAME="busybeds"
APP_DIR="/var/www/busybeds"
APP_PORT=3000
APP_DOMAIN="busybeds.com"
DB_NAME="busybeds_prod"
DB_USER="busybeds"
GIT_REPO="https://github.com/vibecodingmind/busybeds2026.git"

# Auto-generated secure passwords
DB_PASS=$(openssl rand -base64 18 | tr -d '/+=')
JWT_SECRET=$(openssl rand -base64 32 | tr -d '/+=')
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '/+=')

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🏨 BusyBeds — VPS Deployment"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─── Step 1: System Update ──────────────────────────────────────────────────
info "1/9: Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq 2>/dev/null
log "System updated"

# ─── Step 2: Install Docker ─────────────────────────────────────────────────
info "2/9: Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh 2>&1 | tail -3
  systemctl start docker
  systemctl enable docker
  log "Docker installed"
else
  log "Docker already installed: $(docker --version)"
fi

if ! docker compose version &> /dev/null; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose 2>&1 | tail -1
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
log "Docker Compose: $(docker compose version --short)"

# ─── Step 3: Install Nginx + Certbot ────────────────────────────────────────
info "3/9: Installing Nginx + Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx git curl wget ufw > /dev/null 2>&1
systemctl start nginx
systemctl enable nginx
log "Nginx + Certbot installed"

# ─── Step 4: Clone BusyBeds ─────────────────────────────────────────────────
info "4/9: Cloning BusyBeds repository..."
mkdir -p /var/www
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" && git fetch origin && git reset --hard origin/main
  log "Repository updated"
else
  git clone "$GIT_REPO" "$APP_DIR"
  cd "$APP_DIR"
  log "Repository cloned"
fi

# ─── Step 5: Create .env with production values ─────────────────────────────
info "5/9: Creating production environment..."
cat > "$APP_DIR/.env" << ENVFILE
# ═══ BusyBeds Production ═══
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXT_PUBLIC_APP_URL=https://${APP_DOMAIN}
NEXT_PUBLIC_APP_NAME=BusyBeds
NODE_ENV=production
PORT=3000

# ── API Keys (configure after deployment) ──
# Run: bash /var/www/busybeds/setup-env.sh
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=live
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_ENV=live
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://busybeds.com/api/auth/google/callback
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_PLACES_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@busybeds.com
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
AFRICASTALKING_SENDER_ID=
ENVFILE

chmod 600 "$APP_DIR/.env"
log "Production .env created"
info "DB Password: $DB_PASS"
info "JWT Secret: $JWT_SECRET"

# ─── Step 6: Build & Start Docker Containers ────────────────────────────────
info "6/9: Building and starting containers (3-5 minutes)..."
cd "$APP_DIR"
docker compose up -d --build 2>&1 | tail -5

info "Waiting for app to start..."
for i in $(seq 1 40); do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    log "App is responding on port 3000"
    break
  fi
  echo "  Waiting... ($i/40)"
  sleep 5
done

# ─── Step 7: Configure Nginx ────────────────────────────────────────────────
info "7/9: Configuring Nginx reverse proxy..."

mkdir -p /etc/nginx/snippets /var/www/certbot

cat > /etc/nginx/snippets/security-headers.conf << 'EOF'
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
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
EOF

cat > /etc/nginx/sites-available/busybeds.com << 'NGINX'
upstream busybeds_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}
limit_req_zone $binary_remote_addr zone=bb:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name busybeds.com www.busybeds.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://busybeds.com$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name busybeds.com www.busybeds.com;

    # SSL (configured by certbot)
    # ssl_certificate /etc/letsencrypt/live/busybeds.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/busybeds.com/privkey.pem;

    if ($host = www.busybeds.com) { return 301 https://busybeds.com$request_uri; }

    include snippets/security-headers.conf;
    limit_req zone=bb burst=20 nodelay;

    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml font/woff2;

    client_max_body_size 20M;

    location /_next/static/ {
        proxy_pass http://busybeds_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
        include snippets/proxy-params.conf;
    }
    location / {
        proxy_pass http://busybeds_upstream;
        include snippets/proxy-params.conf;
    }
    location ~ /\. { deny all; access_log off; log_not_found off; }

    access_log /var/log/nginx/busybeds_access.log;
    error_log /var/log/nginx/busybeds_error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/busybeds.com /etc/nginx/sites-enabled/busybeds.com
nginx -t 2>&1 && systemctl reload nginx
log "Nginx configured"

# ─── Step 8: Firewall ────────────────────────────────────────────────────────
info "8/9: Configuring firewall..."
ufw --force reset > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow OpenSSH > /dev/null 2>&1
ufw allow 'Nginx Full' > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
log "Firewall configured"

# ─── Step 9: Install SSL ────────────────────────────────────────────────────
info "9/9: Checking DNS for SSL setup..."
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
DOMAIN_IP=$(dig +short $APP_DOMAIN 2>/dev/null | tail -1)

if [ "$DOMAIN_IP" = "$VPS_IP" ]; then
  info "DNS is correct! Installing SSL..."
  certbot --nginx -d busybeds.com -d www.busybeds.com --non-interactive --agree-tos --email "admin@busybeds.com" --redirect 2>&1 | tail -5
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook \"systemctl reload nginx\"") | sort -u | crontab -
  log "SSL installed with auto-renewal!"
else
  warn "DNS not pointing to this VPS ($VPS_IP) yet"
  warn "After pointing DNS A record to $VPS_IP, run:"
  warn "  certbot --nginx -d busybeds.com -d www.busybeds.com"
fi

# ─── Final Status ────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ BusyBeds Deployment Complete!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
docker compose -f "$APP_DIR/docker-compose.yml" ps 2>/dev/null
echo ""
HTTP=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "000")
echo "  App:    http://localhost:3000 → HTTP $HTTP"
echo "  VPS IP: $VPS_IP"
echo ""
echo "  ─── Auto-Generated Credentials ───"
echo "  DB User:     $DB_USER"
echo "  DB Password: $DB_PASS"
echo "  JWT Secret:  $JWT_SECRET"
echo ""
echo "  ─── Demo Logins ───"
echo "  Admin: admin@busybeds.com / Admin123!"
echo "  Owner: owner@busybeds.com / Owner123!"
echo "  Guest: amina.hassan@example.com / Password123!"
echo ""
echo "  ─── IMPORTANT: Configure API Keys ───"
echo "  nano /var/www/busybeds/.env"
echo "  cd /var/www/busybeds && docker compose restart"
echo ""
echo "  ─── DNS Setup ───"
if [ "$DOMAIN_IP" != "$VPS_IP" ]; then
  echo "  1. Point DNS: A record busybeds.com → $VPS_IP"
  echo "  2. Install SSL: certbot --nginx -d busybeds.com -d www.busybeds.com"
fi
echo ""
echo "  ─── Manage ───"
echo "  docker compose -f /var/www/busybeds/docker-compose.yml logs -f   # Logs"
echo "  docker compose -f /var/www/busybeds/docker-compose.yml restart    # Restart"
echo "  docker compose -f /var/www/busybeds/docker-compose.yml down       # Stop"
echo "  docker compose -f /var/www/busybeds/docker-compose.yml up -d --build  # Rebuild"
echo ""
echo "  ─── Add Another App ───"
echo "  1. Clone to /var/www/your-app with different port"
echo "  2. Create /etc/nginx/sites-available/your-app.com"
echo "  3. ln -s /etc/nginx/sites-available/your-app.com /etc/nginx/sites-enabled/"
echo "  4. certbot --nginx -d your-app.com"
echo "═══════════════════════════════════════════════════════════════"
