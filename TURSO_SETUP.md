# Turso Database Setup Guide

## Overview
Your Maya & Ahmad Wedding RSVP system has been successfully migrated to use Turso database instead of SQLite. This guide will help you set up and run the application.

## What's Been Done

### 1. **Updated Files**
- ✅ `package.json` - Added Turso dependencies (`@libsql/client` and `dotenv`)
- ✅ `server-turso.js` - New server file using Turso database
- ✅ `dashboard.html` - Updated to connect to API for all operations
- ✅ `.env.example` - Template for environment variables

### 2. **Features Implemented**
- ✅ RSVP forms (desktop & mobile) already had API integration
- ✅ Dashboard now loads guests from API
- ✅ Dashboard CRUD operations (Create, Read, Update, Delete) use API
- ✅ Export to CSV uses API endpoint
- ✅ Fallback to localStorage if API is unavailable

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Turso Database

#### Option A: Using Turso CLI (Recommended)
1. Install Turso CLI:
   ```bash
   # Windows (PowerShell)
   iwr -useb https://turso.tech/install.ps1 | iex
   
   # macOS/Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. Sign up/Login to Turso:
   ```bash
   turso auth signup
   # or
   turso auth login
   ```

3. Create a new database:
   ```bash
   turso db create maya-ahmad-wedding
   ```

4. Get your database URL:
   ```bash
   turso db show maya-ahmad-wedding --url
   ```

5. Create an auth token:
   ```bash
   turso db tokens create maya-ahmad-wedding
   ```

#### Option B: Using Turso Web Dashboard
1. Go to https://turso.tech/
2. Sign up or log in
3. Create a new database named "maya-ahmad-wedding"
4. Copy the database URL and auth token from the dashboard

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Turso credentials:
   ```
   TURSO_DATABASE_URL=libsql://maya-ahmad-wedding-[your-org].turso.io
   TURSO_AUTH_TOKEN=your-actual-auth-token-here
   PORT=3000
   ```

### Step 4: Update package.json Start Script
Update the `start` script in `package.json` to use the new server:
```json
"scripts": {
  "start": "node server-turso.js",
  "dev": "nodemon server-turso.js"
}
```

### Step 5: Run the Server
```bash
npm start
```

The server will:
- Start on http://localhost:3000
- Automatically create the `guests` table in Turso
- Connect to your Turso database

## Testing the Integration

### 1. Test RSVP Form Submission
1. Open http://localhost:3000/maya-ahmad-wedding-desktop.html
2. Fill out the RSVP form
3. Submit the form
4. Check the dashboard to see if the guest appears

### 2. Test Dashboard
1. Open http://localhost:3000/dashboard
2. Verify guests are loaded from the database
3. Try adding a new guest manually
4. Try editing an existing guest
5. Try deleting a guest
6. Try exporting to CSV

### 3. Verify Data in Turso
```bash
turso db shell maya-ahmad-wedding
```
Then run:
```sql
SELECT * FROM guests;
```

## API Endpoints

The server provides the following endpoints:

- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get single guest
- `POST /api/guests` - Create new guest (RSVP submission)
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest
- `GET /api/stats` - Get dashboard statistics
- `GET /api/export/csv` - Export guests to CSV
- `GET /api/health` - Health check

## Troubleshooting

### "Failed to connect to API" error
- Make sure the server is running (`npm start`)
- Check that your `.env` file has correct Turso credentials
- Verify your Turso database is active

### "UNIQUE constraint failed" error
- A guest with that email already exists
- Use the dashboard to update the existing guest instead

### Database not initializing
- Check your Turso auth token is valid
- Verify your database URL is correct
- Check server logs for detailed error messages

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up Turso database
3. ✅ Configure `.env` file
4. ✅ Update `package.json` start script
5. ✅ Run the server: `npm start`
6. ✅ Test RSVP form submission
7. ✅ Test dashboard functionality

## Support

For Turso-specific issues, visit:
- Documentation: https://docs.turso.tech/
- Discord: https://discord.gg/turso
- GitHub: https://github.com/tursodatabase/libsql

