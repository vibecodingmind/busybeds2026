#!/usr/bin/env python3
"""
SSH helper for VPS at 45.151.123.253
Uses paramiko (installed in /home/z/.venv/)

Usage:
  /home/z/.venv/bin/python3 vps-ssh.py                   # Interactive-like: run hostname & uptime
  /home/z/.venv/bin/python3 vps-ssh.py "ls -la /root"    # Run a specific command
  /home/z/.venv/bin/python3 vps-ssh.py --shell            # Drop into an interactive shell
"""

import sys
import paramiko

HOST = "45.151.123.253"
USER = "root"
PASS = "R@tir@dH@ro2030"

def get_client():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASS, timeout=15)
    return client

def run_command(cmd):
    client = get_client()
    try:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print(out, end='')
        if err:
            print(err, end='', file=sys.stderr)
        return stdout.channel.recv_exit_status()
    finally:
        client.close()

def interactive_shell():
    client = get_client()
    try:
        chan = client.invoke_shell(term='xterm')
        import select
        import termios
        import tty
        import os

        oldtty = termios.tcgetattr(sys.stdin)
        try:
            tty.setraw(sys.stdin.fileno())
            tty.setcbreak(sys.stdin.fileno())
            chan.settimeout(0.0)

            while True:
                r, w, e = select.select([chan, sys.stdin], [], [])
                if chan in r:
                    try:
                        x = chan.recv(1024)
                        if len(x) == 0:
                            break
                        sys.stdout.write(x.decode('utf-8', errors='replace'))
                        sys.stdout.flush()
                    except:
                        break
                if sys.stdin in r:
                    x = os.read(sys.stdin.fileno(), 1024)
                    if len(x) == 0:
                        break
                    chan.send(x)
        finally:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, oldtty)
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--shell":
            interactive_shell()
        else:
            cmd = " ".join(sys.argv[1:])
            exit(run_command(cmd))
    else:
        print(f"Connecting to {USER}@{HOST}...")
        run_command("hostname && uptime && free -h && df -h /")
