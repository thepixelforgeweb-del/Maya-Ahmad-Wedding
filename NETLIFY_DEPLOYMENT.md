# Netlify Deployment Guide

## Overview

Your wedding RSVP site is now configured to deploy on Netlify using Netlify Functions for the API backend. The frontend HTML/CSS/JS files remain unchanged—they'll continue to call `/api/guests`, `/api/stats`, etc., and Netlify will automatically route those to the serverless functions.

## What's New

### Netlify Functions
- `netlify/functions/guests.js` — Handles GET/POST/PUT/DELETE for guests
- `netlify/functions/stats.js` — Returns dashboard statistics
- `netlify/functions/export-csv.js` — Exports guest data as CSV
- `netlify/functions/health.js` — Health check endpoint
- `netlify/functions/turso-utils.js` — Shared Turso database utilities

### Configuration Files
- `netlify.toml` — Build config and URL redirects
- `.netlifyignore` — Files to exclude from deployment

## Deployment Steps

### 1. Push to GitHub (or your Git provider)

```bash
git add .
git commit -m "Add Netlify Functions for API"
git push origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Select your Git provider (GitHub, GitLab, Bitbucket)
4. Authorize and select your repository
5. Click **"Deploy site"**

Netlify will automatically:
- Detect `netlify.toml`
- Build the functions in `netlify/functions/`
- Deploy your static HTML files
- Set up the redirects

### 3. Set Environment Variables

In Netlify dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"**
3. Add:
   - `TURSO_DATABASE_URL` — Your Turso database URL
   - `TURSO_AUTH_TOKEN` — Your Turso auth token

(Copy these from your `.env` file)

### 4. Trigger Deploy

Once env vars are set, Netlify will automatically redeploy. Or manually trigger:

1. Go to **Deploys**
2. Click **"Trigger deploy"** → **"Deploy site"**

## How It Works

### URL Routing

When your frontend calls `fetch('/api/guests')`:

1. Browser sends request to `https://your-site.netlify.app/api/guests`
2. Netlify's redirect rules (in `netlify.toml`) intercept it
3. Request is routed to `/.netlify/functions/guests`
4. The function executes and returns JSON
5. Browser receives the response

**No frontend code changes needed!** Your existing `fetch('/api/guests')` calls work exactly the same.

### Database Connection

Each function:
- Reads `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from environment
- Uses the same Turso HTTP API code as your Express server
- Connects to your Turso database
- Returns JSON responses

## Local Development

To test Netlify Functions locally before deploying, use Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This runs functions on `http://localhost:8888/.netlify/functions/...` and serves your static files.

## Troubleshooting

### Functions not working?

1. Check **Netlify dashboard** → **Functions** tab for logs
2. Verify env vars are set correctly
3. Check that `netlify.toml` exists in repo root
4. Ensure `netlify/functions/` directory is committed

### CORS errors?

All functions have CORS headers enabled. If you still see errors:
- Check browser console for exact error
- Verify the function is being called (check Netlify logs)

### Database connection errors?

1. Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
2. Check that your Turso database is active
3. Look at function logs in Netlify dashboard

## Rollback

If you need to go back to the Express server:

1. Delete `netlify.toml` and `.netlifyignore`
2. Delete `netlify/functions/` directory
3. Push to GitHub
4. Netlify will redeploy without functions

## Next Steps

- Deploy to Netlify using the steps above
- Test all API endpoints (RSVP form, dashboard, CSV export)
- Monitor function logs in Netlify dashboard
- Set up custom domain if desired

