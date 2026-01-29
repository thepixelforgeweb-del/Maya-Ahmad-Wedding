@echo off
REM Simple push script for Windows (uses your git credentials when prompted)
cd /d "%~dp0"
necho Initializing repo (if not already initialized)...
ngit init
necho Adding files...
ngit add .
necho Committing...
ngit commit -m "Add site files and countdown fix" || echo "No changes to commit or commit failed"
necho Setting remote origin...
ngit remote remove origin 2>nul || rem ignore if not present
ngit remote add origin https://github.com/thepixelforgeweb-del/Maya-Ahmad-Wedding.git
ngit branch -M main
necho Pushing to origin/main... (you will be prompted for credentials)
ngit push -u origin main
necho Done.