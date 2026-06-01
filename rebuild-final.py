#!/usr/bin/env python3
"""Force rebuild Docker with --no-cache on VPS"""
import paramiko, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)

# Write the rebuild script
sftp = c.open_sftp()
with sftp.file("/tmp/rebuild2.sh", 'w') as f:
    f.write("""#!/bin/bash
set -e
cd /var/www/busybeds
echo "Pulling latest..."
git pull origin main
echo "Stopping containers..."
docker compose down
echo "Removing old images..."
docker rmi busybeds-app 2>/dev/null || true
echo "Building with --no-cache..."
docker compose build --no-cache app 2>&1 | tail -20
echo "Starting..."
docker compose up -d 2>&1
echo "Waiting 30s for app..."
sleep 30
echo "STATUS:"
docker ps --format '{{.Names}}: {{.Status}}'
echo "HTTP: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo FAIL)"
echo "LOGS:"
docker logs busybeds-app --tail 15 2>&1
""")
sftp.close()
c.close()

# Run via screen
c2 = paramiko.SSHClient()
c2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c2.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c2.exec_command("chmod +x /tmp/rebuild2.sh && screen -dmS rebuild2 bash /tmp/rebuild2.sh", timeout=5)
c2.close()

print("Rebuild started in screen session. Waiting...")

# Poll for completion
for i in range(30):
    time.sleep(20)
    c3 = paramiko.SSHClient()
    c3.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c3.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c3.exec_command("screen -ls 2>/dev/null | grep rebuild2 && echo RUNNING || echo DONE", timeout=10)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    c3.close()
    print(f"  [{i+1}] {out[:30]}")
    if "DONE" in out:
        break

# Get results
c4 = paramiko.SSHClient()
c4.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c4.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c4.exec_command("docker ps --format '{{.Names}}: {{.Status}}' && echo '---' && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null", timeout=20)
print("\n" + stdout.read().decode('utf-8', errors='replace'))
c4.close()

# Get logs
c5 = paramiko.SSHClient()
c5.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c5.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c5.exec_command("docker logs busybeds-app --tail 20 2>&1", timeout=20)
print("App logs:")
print(stdout.read().decode('utf-8', errors='replace'))
c5.close()
