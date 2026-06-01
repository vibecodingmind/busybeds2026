#!/usr/bin/env python3
"""Quick fix - just check app and fix nginx"""
import paramiko, time

VPS_IP = "45.151.123.253"
VPS_USER = "root"
VPS_PASS = "R@tir@dH@ro2030"

def run(cmd, timeout=60):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=20, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    c.close()
    return ec, out[-2000:] if len(out) > 2000 else out, err[-1000:] if len(err) > 1000 else err

# 1. Fix Nginx - HTTP only config
print("Fixing Nginx...")
nginx_conf = """upstream busybeds_upstream { server 127.0.0.1:3000; keepalive 64; }
limit_req_zone $binary_remote_addr zone=bb:10m rate=10r/s;
server {
    listen 80; listen [::]:80;
    server_name busybeds.com www.busybeds.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    include /etc/nginx/snippets/security-headers.conf;
    limit_req zone=bb burst=20 nodelay;
    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml font/woff2;
    client_max_body_size 20M;
    location /_next/static/ { proxy_pass http://busybeds_upstream; expires 365d; add_header Cache-Control "public, immutable"; include /etc/nginx/snippets/proxy-params.conf; }
    location / { proxy_pass http://busybeds_upstream; include /etc/nginx/snippets/proxy-params.conf; }
    location ~ /\\. { deny all; access_log off; log_not_found off; }
    access_log /var/log/nginx/busybeds_access.log;
    error_log /var/log/nginx/busybeds_error.log;
}"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=20, allow_agent=False, look_for_keys=False)
sftp = c.open_sftp()
with sftp.file("/etc/nginx/sites-available/busybeds.com", 'w') as f:
    f.write(nginx_conf)
sftp.close()
c.close()

ec, out, err = run("nginx -t 2>&1 && systemctl reload nginx")
print(f"Nginx: {out}")

# 2. Check app logs
print("\nApp logs (last 20 lines):")
ec, out, err = run("docker logs busybeds-app --tail 20 2>&1", timeout=30)
print(out)
if err:
    print(f"STDERR: {err[:500]}")

# 3. Check app health
print("\nHealth check:")
ec, out, err = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000", timeout=10)
print(f"Port 3000: HTTP {out}")

ec, out, err = run("curl -s -o /dev/null -w '%{http_code}' http://localhost", timeout=10)
print(f"Port 80 (Nginx): HTTP {out}")

# 4. Docker ps
print("\nDocker containers:")
ec, out, err = run("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'", timeout=10)
print(out)
