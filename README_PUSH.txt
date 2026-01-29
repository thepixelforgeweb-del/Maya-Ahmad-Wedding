DO NOT paste your PAT anywhere public. Revoke the token you accidentally shared immediately: 

1) Revoke exposed token:
   - Sign in to GitHub as thepixelforgeweb@gmail.com
   - Settings → Developer settings → Personal access tokens → Fine-grained tokens (or Tokens (classic))
   - Find the token starting with ghp_V1Te4... and revoke/delete it.

2) Create a new token (recommended: Fine-grained token) with repo write permissions or use SSH keys.

3) How to push using the included scripts:
   - Using the batch script (Windows): double-click `push.bat` or run in PowerShell/CMD:
     push.bat
     (You will be prompted for username and password; use your GitHub username and the new PAT as the password.)

   - Using PowerShell helper:
     Right-click `push-ps1.ps1` → Run with PowerShell, or run:
     .\push-ps1.ps1

4) Manual commands (copy/paste):
   cd "c:\Users\PAK COMPUTERS\Desktop\Maya Ahmad Wedding"
   git init
   git add .
   git commit -m "Add site files and countdown fix"
   git remote add origin https://github.com/thepixelforgeweb-del/Maya-Ahmad-Wedding.git
   git branch -M main
   git push -u origin main

Notes:
- When prompted for credentials, use username `thepixelforgeweb@gmail.com` and the new PAT as the password.
- If you prefer SSH (no tokens), create an SSH key pair and add the public key to GitHub (Settings → SSH and GPG keys). Then change the remote to the SSH URL: git remote set-url origin git@github.com:thepixelforgeweb-del/Maya-Ahmad-Wedding.git

If you want, I can prepare an SSH setup guide or create a tiny script that uses `gh` CLI (requires interactive auth).