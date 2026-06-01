#!/usr/bin/env python3
"""Fix Nginx and check app status"""
import paramiko
import time

VPS_IP = "45.151.123.253"
VPS_USER = "root"
VPS_PASS = "R@tir@dH@ro2030"

def ssh_exec(cmd, timeout=120, label=""):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS,
                  timeout=30, allow_agent=False, look_for_keys=False)
    if label:
        print(f"🔧 {label}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        for line in out.split('\n')[-20:]:
            print(f"  {line}")
    if err and "warning" not in err.lower():
        for line in err.split('\n')[-5:]:
            print(f"  ERR: {line}")
    client.close()
    return exit_code, out, err

# Fix 1: Check app container logs
print("="*60)
print("Checking app container logs...")
print("="*60)
ssh_exec("docker logs busybeds-app --tail 50 2>&1", timeout=30, label="App container logs:")

# Fix 2: Check if app is listening
print("\n" + "="*60)
print("Checking if port 3000 is responding...")
print("="*60)
ssh_exec("curl -v http://localhost:3000 2>&1 | head -20", timeout=15, label="Curl test:")
ssh_exec("docker exec busybeds-app wget -q -O- http://localhost:3000 2>&1 | head -5", timeout=15, label="Inside container test:")

# Fix 3: Rewrite Nginx config with ONLY HTTP for now (SSL later)
print("\n" + "="*60)
print("Fixing Nginx config (HTTP only until SSL is ready)...")
print("="*60)

nginx_http_only = '''upstream busybeds_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}
limit_req_zone $binary_remote_addr zone=bb:10m rate=10r/s;

# HTTP server (until SSL is installed by certbot)
server {
    listen 80;
    listen [::]:80;
    server_name busybeds.com www.busybeds.com;

    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    include /etc/nginx/snippets/security-headers.conf;
    limit_req zone=bb burst=20 nodelay;

    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml font/woff2;

    client_max_body_size 20M;

    location /_next/static/ {
        proxy_pass http://busybeds_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location / {
        proxy_pass http://busybeds_upstream;
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location ~ /\\. { deny all; access_log off; log_not_found off; }

    access_log /var/log/nginx/busybeds_access.log;
    error_log /var/log/nginx/busybeds_error.log;
}
'''

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=30, allow_agent=False, look_for_keys=False)
sftp = client.open_sftp()
with sftp.file("/etc/nginx/sites-available/busybeds.com", 'w') as f:
    f.write(nginx_http_only)
sftp.close()
client.close()

ssh_exec("nginx -t 2>&1", timeout=10, label="Test Nginx config:")
ssh_exec("systemctl reload nginx", timeout=10, label="Reload Nginx:")

# Fix 4: Wait more for app and test
print("\n" + "="*60)
print("Waiting for app to fully start...")
print("="*60)
for i in range(10):
    time.sleep(10)
    ec, out, _ = ssh_exec("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null", timeout=10)
    code = out.strip().replace("'","")
    print(f"  Attempt {i+1}/10: HTTP {code}")
    if code in ["200", "301", "302", "307", "308"]:
        print("  ✅ App is UP!")
        break

# Final status
print("\n" + "="*60)
print("FINAL STATUS")
print("="*60)
ssh_exec("docker compose -f /var/www/busybeds/docker-compose.yml ps", timeout=10, label="Containers:")
ssh_exec("curl -sI http://localhost:3000 | head -5", timeout=10, label="App headers:")
ssh_exec("curl -sI http://localhost | head -5", timeout=10, label="Nginx headers:")
