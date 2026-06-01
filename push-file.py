#!/usr/bin/env python3
"""Push a local file to the VPS via paramiko SFTP"""
import sys
import os
import paramiko

HOST = "45.151.123.253"
USER = "root"
PASS = "R@tir@dH@ro2030"

def push_file(local_path, remote_path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASS, timeout=30)
    sftp = client.open_sftp()
    
    # Ensure remote directory exists
    remote_dir = os.path.dirname(remote_path)
    if remote_dir:
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
            # Create directories recursively
            dirs_to_create = []
            d = remote_dir
            while d and d != '/':
                try:
                    sftp.stat(d)
                    break
                except FileNotFoundError:
                    dirs_to_create.append(d)
                    d = os.path.dirname(d)
            for d in reversed(dirs_to_create):
                try:
                    sftp.mkdir(d)
                except:
                    pass
    
    sftp.put(local_path, remote_path)
    sftp.close()
    client.close()
    print(f"✓ Pushed {local_path} -> {remote_path}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <local_path> <remote_path>")
        sys.exit(1)
    push_file(sys.argv[1], sys.argv[2])
