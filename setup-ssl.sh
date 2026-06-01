#!/bin/bash
#===============================================================================
# BusyBeds SSL Setup — Let's Encrypt with Certbot
# Run AFTER deploy-vps.sh AND after DNS is pointed to the VPS
#===============================================================================

set -e

APP_DOMAIN="busybeds.com"

echo ""
echo "========================================================================"
echo "  Setting up SSL for $APP_DOMAIN"
echo "========================================================================"
echo ""

# Check if DNS is pointed
info "Checking DNS resolution..."
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "UNKNOWN")
DOMAIN_IP=$(dig +short $APP_DOMAIN 2>/dev/null | tail -1)

if [ -z "$DOMAIN_IP" ]; then
  echo "⚠️  DNS for $APP_DOMAIN is not resolving yet!"
  echo "   Please point your domain's A record to: $VPS_IP"
  echo "   Then re-run this script."
  exit 1
fi

if [ "$DOMAIN_IP" != "$VPS_IP" ]; then
  echo "⚠️  DNS for $APP_DOMAIN points to $DOMAIN_IP, but VPS IP is $VPS_IP"
  echo "   Please update your A record to point to: $VPS_IP"
  echo "   Then re-run this script."
  exit 1
fi

echo "✅ DNS correctly points $APP_DOMAIN → $VPS_IP"

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
  apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
fi

# Create certbot webroot
mkdir -p /var/www/certbot

# Obtain certificate
echo ""
echo "Obtaining SSL certificate..."
certbot --nginx \
  -d "$APP_DOMAIN" \
  -d "www.$APP_DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "admin@$APP_DOMAIN" \
  --redirect

# Enable HSTS
echo ""
echo "Enabling HSTS header..."
sed -i 's/# add_header Strict-Transport-Security/add_header Strict-Transport-Security/' /etc/nginx/sites-available/$APP_DOMAIN

# Reload nginx
nginx -t && systemctl reload nginx

# Setup auto-renewal cron
echo ""
echo "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook \"systemctl reload nginx\"") | sort -u | crontab -

echo ""
echo "========================================================================"
echo "  ✅ SSL Setup Complete!"
echo "========================================================================"
echo ""
echo "  Your site is now available at: https://$APP_DOMAIN"
echo "  Certificates will auto-renew via cron job."
echo ""
echo "  Test: curl -I https://$APP_DOMAIN"
echo "========================================================================"
