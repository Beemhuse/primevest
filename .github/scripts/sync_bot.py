#!/usr/bin/env python3
"""
Fork Sync Bot - Automatically syncs a forked repository with its upstream
"""

import os
import subprocess
import tempfile
import shutil
from github import Github
import sys

def run_command(cmd, check=True):
    """Run a shell command and return the result"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"Error: {result.stderr}")
        raise Exception(f"Command failed: {cmd}")
    return result

def sync_fork():
    # Configuration - Update these values
    UPSTREAM_REPO = "ThadDev/primevest"  # Change this
    FORK_REPO = os.getenv('GITHUB_REPOSITORY')  # Auto-detected from environment
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
    BRANCH = "main"  # Change to "master" if needed
    
    if not GITHUB_TOKEN:
        raise Exception("GITHUB_TOKEN environment variable is required")
    
    print(f"Starting sync for {FORK_REPO} with upstream {UPSTREAM_REPO}")
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    original_dir = os.getcwd()
    
    try:
        os.chdir(temp_dir)
        
        # Clone the fork using the token for authentication
        clone_url = f"https://{GITHUB_TOKEN}@github.com/{FORK_REPO}.git"
        run_command(f"git clone {clone_url} .")
        
        # Configure git
        run_command("git config user.name 'github-actions[bot]'")
        run_command("git config user.email 'github-actions[bot]@users.noreply.github.com'")
        
        # Add upstream remote
        run_command(f"git remote add upstream https://github.com/{UPSTREAM_REPO}.git")
        
        # Fetch upstream changes
        run_command("git fetch upstream")
        
        # Checkout target branch
        run_command(f"git checkout {BRANCH}")
        
        # Merge upstream changes (no-edit to avoid interactive merge)
        merge_result = run_command(f"git merge upstream/{BRANCH} --no-edit", check=False)
        
        if merge_result.returncode == 0:
            # Push changes if merge was successful
            run_command(f"git push origin {BRANCH}")
            print("✅ Successfully synced fork with upstream")
            
            # Create a summary for the workflow
            with open(os.getenv('GITHUB_STEP_SUMMARY'), 'a') as f:
                f.write("## 🎉 Sync Successful\n")
                f.write(f"- Synced: {FORK_REPO}\n")
                f.write(f"- With: {UPSTREAM_REPO}\n")
                f.write(f"- Branch: {BRANCH}\n")
                f.write(f"- Timestamp: {subprocess.getoutput('date')}\n")
                
        else:
            print("❌ Merge conflict detected - manual resolution required")
            print(f"Merge error: {merge_result.stderr}")
            
            # Create error summary
            with open(os.getenv('GITHUB_STEP_SUMMARY'), 'a') as f:
                f.write("## ❌ Sync Failed\n")
                f.write("Merge conflict detected. Manual resolution required.\n")
                f.write(f"Error: {merge_result.stderr}\n")
            
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error during sync: {str(e)}")
        
        # Create error summary
        with open(os.getenv('GITHUB_STEP_SUMMARY'), 'a') as f:
            f.write("## ❌ Sync Failed\n")
            f.write(f"Error: {str(e)}\n")
        
        sys.exit(1)
        
    finally:
        # Cleanup
        os.chdir(original_dir)
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    sync_fork()