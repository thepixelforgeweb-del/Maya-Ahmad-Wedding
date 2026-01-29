# PowerShell push helper. Run from repository folder.
Set-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
Write-Host "Initializing git repo (if needed)"
git init | Out-Null
Write-Host "Staging files"
git add .
try {
    git commit -m "Add site files and countdown fix" -q
} catch {
    Write-Host "No changes to commit or commit failed"
}
Write-Host "Setting remote origin"
git remote remove origin 2>$null | Out-Null
git remote add origin https://github.com/thepixelforgeweb-del/Maya-Ahmad-Wedding.git
git branch -M main
Write-Host "Pushing to origin/main (you will be prompted for credentials)..."
git push -u origin main
Write-Host "Done."