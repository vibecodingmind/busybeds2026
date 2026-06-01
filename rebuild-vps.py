#!/usr/bin/env python3
"""Rebuild Docker on VPS with fixed Prisma version"""
import paramiko, time

VPS_IP = "45.151.123.253"
VPS_USER = "root"
VPS_PASS = "R@tir@dH@ro2030"

def run(cmd, timeout=300):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=20, allow_agent=False, look_for_keys=False)
    print(f"🔧 {cmd[:70]}...")
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        for line in out.split('\n')[-10:]:
            print(f"  {line}")
    if err and "warning" not in err.lower():
        for line in err.split('\n')[-3:]:
            print(f"  E: {line}")
    c.close()
    return ec, out, err

# Pull latest code
print("="*60)
print("Pulling latest code with Prisma fix...")
print("="*60)
run("cd /var/www/busybeds && git pull origin main", timeout=60)

# Stop and rebuild
print("\n" + "="*60)
print("Rebuilding Docker containers...")
print("="*60)
run("cd /var/www/busybeds && docker compose down", timeout=60)
run("cd /var/www/busybeds && docker compose up -d --build", timeout=900)

# Wait for app
print("\n⏳ Waiting for app to start...")
for i in range(20):
    time.sleep(8)
    ec, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 000", timeout=10)
    code = out.strip().replace("'","")
    print(f"  Attempt {i+1}/20: HTTP {code}")
    if code in ["200", "301", "302"]:
        print("  ✅ App is UP!")
        break

# Check logs if still failing
if code not in ["200", "301", "302"]:
    print("\n📋 App logs:")
    run("docker logs busybeds-app --tail 30 2>&1", timeout=30)

# Final status
print("\n" + "="*60)
print("Status:")
print("="*60)
run("docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'", timeout=10)
ec, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000", timeout=10)
print(f"\n🌐 App HTTP: {out}")
ec, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost", timeout=10)
print(f"🌐 Nginx HTTP: {out}")
