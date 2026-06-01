#!/usr/bin/env python3
"""Deploy via writing script to VPS and executing"""
import paramiko, time

VPS_IP = "45.151.123.253"
VPS_USER = "root"
VPS_PASS = "R@tir@dH@ro2030"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=20, allow_agent=False, look_for_keys=False)

# Write rebuild script to VPS
rebuild_script = """#!/bin/bash
set -e
cd /var/www/busybeds
echo "Pulling latest code..."
git pull origin main
echo "Stopping containers..."
docker compose down
echo "Rebuilding containers (this takes 3-5 min)..."
docker compose up -d --build
echo "Waiting for app..."
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "000")
  echo "  Attempt $i: HTTP $CODE"
  if [ "$CODE" = "200" ] || [ "$CODE" = "301" ]; then
    echo "APP IS UP!"
    break
  fi
  sleep 5
done
echo "Final status:"
docker ps --format '{{.Names}}: {{.Status}}'
echo ""
echo "App: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null)"
echo "Nginx: $(curl -s -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null)"
echo ""
echo "App logs (last 15 lines):"
docker logs busybeds-app --tail 15 2>&1
"""

sftp = c.open_sftp()
with sftp.file("/tmp/rebuild-busybeds.sh", 'w') as f:
    f.write(rebuild_script)
sftp.close()

# Make it executable and run in background with output to log
stdin, stdout, stderr = c.exec_command("chmod +x /tmp/rebuild-busybeds.sh && nohup /tmp/rebuild-busybeds.sh > /tmp/rebuild-output.log 2>&1 &", timeout=5)
# Don't wait for output - it's backgrounded

print("✅ Rebuild script started in background on VPS")
print("Monitoring progress...")

c.close()

# Now poll for completion
time.sleep(15)
for i in range(40):
    c2 = paramiko.SSHClient()
    c2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c2.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c2.exec_command("tail -5 /tmp/rebuild-output.log 2>/dev/null; echo '---SEPARATOR---'; pgrep -f 'rebuild-busybeds' > /dev/null 2>&1 && echo 'RUNNING' || echo 'DONE'", timeout=15)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    c2.close()
    
    lines = out.split('\n')
    status = lines[-1] if lines else "UNKNOWN"
    log_lines = '\n'.join(lines[:-2])
    
    print(f"  [{i+1}] {status} | {log_lines[-150:]}")
    
    if status == "DONE":
        print("\n✅ Rebuild finished!")
        break
    
    time.sleep(15)

# Get final output
c3 = paramiko.SSHClient()
c3.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c3.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c3.exec_command("cat /tmp/rebuild-output.log", timeout=30)
out = stdout.read().decode('utf-8', errors='replace').strip()
c3.close()

print("\n" + "="*60)
print("BUILD OUTPUT:")
print("="*60)
for line in out.split('\n')[-25:]:
    print(f"  {line}")
