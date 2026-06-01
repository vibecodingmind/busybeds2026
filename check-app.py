#!/usr/bin/env python3
"""Wait for app to start and check status"""
import paramiko, time

VPS_IP = "45.151.123.253"
VPS_USER = "root"
VPS_PASS = "R@tir@dH@ro2030"

def run(cmd, timeout=20):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS, timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    c.close()
    return ec, out

# Wait for app to be healthy
print("Waiting for app to become healthy...")
for i in range(15):
    time.sleep(10)
    ec, out = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'FAIL'", timeout=10)
    print(f"  [{i+1}/15] HTTP: {out}")
    if "200" in out:
        print("  ✅ APP IS UP!")
        break
    if "301" in out or "302" in out:
        print("  ✅ APP IS RESPONDING (redirect)!")
        break

# Show container status
ec, out = run("docker ps --format '{{.Names}}: {{.Status}}'", timeout=10)
print(f"\nContainers: {out}")

# If still not up, show logs
ec, http = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'FAIL'", timeout=10)
if "200" not in http and "301" not in http:
    print("\n⚠️ App still not responding. Checking logs...")
    ec, out = run("docker logs busybeds-app --tail 30 2>&1", timeout=15)
    print(out[-1000:])
else:
    # App is up! Check via Nginx too
    ec, out = run("curl -s -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null", timeout=10)
    print(f"Nginx: HTTP {out}")
    
    # Check domain
    ec, out = run("curl -s -o /dev/null -w '%{http_code}' http://busybeds.com 2>/dev/null || echo 'FAIL'", timeout=10)
    print(f"Domain (http): HTTP {out}")
