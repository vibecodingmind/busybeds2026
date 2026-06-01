#!/usr/bin/env python3
"""Wait for rebuild3 and check result"""
import paramiko, time

for i in range(40):
    time.sleep(20)
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c.exec_command("screen -ls 2>/dev/null | grep rebuild3 && echo RUNNING || echo DONE", timeout=10)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    c.close()
    print(f"[{i+1}/40] {out[:30]}")
    if "DONE" in out:
        print("Build finished!")
        break

# Check result
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)

stdin, stdout, stderr = c.exec_command("docker ps --format '{{.Names}}: {{.Status}}'", timeout=10)
print(f"\nContainers:\n{stdout.read().decode()}")

stdin, stdout, stderr = c.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo FAIL", timeout=10)
print(f"App HTTP: {stdout.read().decode().strip()}")

stdin, stdout, stderr = c.exec_command("docker logs busybeds-app --tail 20 2>&1", timeout=15)
print(f"\nApp logs:\n{stdout.read().decode()[-800:]}")

c.close()
