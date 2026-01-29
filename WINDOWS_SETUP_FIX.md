# Windows 11 Setup Fix for Turso/libsql

## Problem
Error: The specified module could not be found.
`\node_modules\@libsql\win32-x64-msvc\index.node`

## Solution

### Step 1: Install Microsoft Visual C++ 2015 Redistributable (x64)

1. Download from: https://www.microsoft.com/en-us/download/details.aspx?id=48145
2. Click "Download" button
3. Select `vc_redist.x64.exe`
4. Run the installer
5. Follow the installation wizard

### Step 2: Restart Your Terminal

**Important:** After installing, you MUST restart your terminal/PowerShell for the changes to take effect.

1. Close all PowerShell/Command Prompt windows
2. Close VS Code (if running)
3. Reopen VS Code or your terminal

### Step 3: Start the Server

```bash
node server-turso.js
```

Or use npm:
```bash
npm start
```

## Expected Output

When successful, you should see:
```
Turso database initialized
Wedding RSVP Server running on http://localhost:3000
Using Turso Database
API Documentation:
  GET  /api/guests         - Get all guests
  GET  /api/guests/:id     - Get single guest
  POST /api/guests         - Create new guest
  PUT  /api/guests/:id     - Update guest
  DELETE /api/guests/:id   - Delete guest
  GET  /api/stats          - Get statistics
  GET  /api/export/csv     - Export as CSV
  GET  /api/health         - Health check
```

## Testing the Integration

### 1. Test the API Health Check
Open browser: http://localhost:3000/api/health

Should return:
```json
{
  "status": "ok",
  "message": "Wedding RSVP API is running with Turso"
}
```

### 2. Test RSVP Form
Open: http://localhost:3000/maya-ahmad-wedding-desktop.html
- Fill out the form
- Submit
- Check dashboard to see the guest

### 3. Test Dashboard
Open: http://localhost:3000/dashboard
- View all guests
- Add/Edit/Delete guests
- Export to CSV

## Troubleshooting

### If you still get the error after installing:
1. Make sure you installed the **x64** version (not x86)
2. Restart your computer (not just the terminal)
3. Check if the installation was successful:
   - Go to Control Panel > Programs > Programs and Features
   - Look for "Microsoft Visual C++ 2015-2022 Redistributable (x64)"

### Alternative: Use WSL (Windows Subsystem for Linux)
If the above doesn't work, you can use WSL:
```bash
wsl --install
# Then run your project in WSL Ubuntu
```

## Next Steps After Fix

1. ✅ Server starts successfully
2. ✅ Test RSVP form submission
3. ✅ Test dashboard functionality
4. ✅ Verify data in Turso database

## Support

- Turso Docs: https://docs.turso.tech/
- GitHub Issue: https://github.com/tursodatabase/libsql/issues/1797

