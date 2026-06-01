#!/usr/bin/env python3
"""Wait for rebuild and check"""
import paramiko, time

for i in range(20):
    time.sleep(30)
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c.exec_command("screen -ls 2>/dev/null | grep rebuild2 && echo RUNNING || echo DONE", timeout=10)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    c.close()
    print(f"[{i+1}/20] {out[:40]}")
    if "DONE" in out:
        print("Build finished! Checking...")
        break

# Final check
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
for cmd in [
    "docker ps --format '{{.Names}}: {{.Status}}'",
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo FAIL",
    "docker logs busybeds-app --tail 20 2>&1",
]:
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"\n{out[-800:]}")
c.close()
