#!/usr/bin/env python3
"""Just start the rebuild and check quickly"""
import paramiko, time

VPS_IP = "45.151.123.253"
VPS_USER = "root"  
VPS_PASS = "R@tir@dH@ro2030"

def run(cmd, timeout=30):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    c.close()
    return ec, out

# Step 1: Pull code
print("1. Pulling code...")
ec, out = run("cd /var/www/busybeds && git pull origin main 2>&1", timeout=30)
print(f"  {out[-100:]}")

# Step 2: Write rebuild script to VPS
print("2. Writing rebuild script...")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=15, allow_agent=False, look_for_keys=False)
sftp = c.open_sftp()
with sftp.file("/tmp/rebuild.sh", 'w') as f:
    f.write("""#!/bin/bash
cd /var/www/busybeds
docker compose down 2>/dev/null
docker compose up -d --build 2>&1
sleep 10
echo "HTTP_$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'FAIL')"
""")
sftp.close()
c.close()

# Step 3: Start rebuild with screen/nohup
print("3. Starting rebuild (background)...")
ec, out = run("chmod +x /tmp/rebuild.sh && screen -dmS rebuild bash /tmp/rebuild.sh && echo 'STARTED'", timeout=10)
print(f"  {out}")

# Step 4: Wait and check
print("4. Waiting for rebuild (checking every 20s)...")
for i in range(20):
    time.sleep(20)
    ec, out = run("screen -ls 2>/dev/null | grep rebuild && echo 'STILL_RUNNING' || echo 'FINISHED'", timeout=10)
    print(f"  [{i+1}] {out[:50]}")
    if "FINISHED" in out:
        break

# Step 5: Check result
print("5. Final check...")
ec, out = run("docker ps --format '{{.Names}}: {{.Status}}'", timeout=10)
print(f"  Containers: {out}")

ec, out = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'FAIL'", timeout=10)
print(f"  App HTTP: {out}")

ec, out = run("curl -s -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null || echo 'FAIL'", timeout=10)
print(f"  Nginx HTTP: {out}")

if "200" not in out:
    ec, out = run("docker logs busybeds-app --tail 15 2>&1", timeout=15)
    print(f"  App logs:\n{out[-600:]}")
