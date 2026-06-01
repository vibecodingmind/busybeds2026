#!/usr/bin/env python3
"""Start rebuild in background and check status"""
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
    return ec, out[-1500:], err[-500:]

# 1. Pull latest code
print("Pulling code...")
ec, out, _ = run("cd /var/www/busybeds && git pull origin main", timeout=30)
print(out[-200:])

# 2. Start rebuild in background using nohup
print("Starting background rebuild...")
ec, out, _ = run("cd /var/www/busybeds && nohup bash -c 'docker compose down && docker compose up -d --build' > /tmp/rebuild.log 2>&1 &", timeout=10)
print("Rebuild started in background. Checking progress...")

# 3. Monitor progress
for i in range(60):
    time.sleep(10)
    ec, out, _ = run("tail -3 /tmp/rebuild.log 2>/dev/null", timeout=10)
    print(f"  [{i+1}] {out[-150:]}")
    
    # Check if build is done
    ec2, out2, _ = run("pgrep -f 'docker compose' > /dev/null; echo $?", timeout=5)
    if out2.strip() == "1":  # Process finished
        print("\nBuild process finished!")
        break

# 4. Check final status
print("\n" + "="*50)
print("Final status:")
ec, out, _ = run("docker ps --format '{{.Names}}: {{.Status}}'", timeout=10)
print(out)

ec, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'fail'", timeout=10)
print(f"App HTTP: {out}")

ec, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null || echo 'fail'", timeout=10)
print(f"Nginx HTTP: {out}")

# If app not up, show logs
if "200" not in out and "301" not in out:
    print("\nApp logs:")
    ec, out, _ = run("docker logs busybeds-app --tail 20 2>&1", timeout=15)
    print(out[-800:])
