# Fix Redirect URI Mismatch Error

## The Problem
You're getting `Error 400: redirect_uri_mismatch` because the redirect URI in your code doesn't exactly match what's configured in Google Cloud Console.

## Solution Steps

### Step 1: Save Your Service Account (for Firestore)
1. Create a file named `service-account-key.json` in the root directory
2. Paste your service account JSON content into it
3. Add to `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   GOOGLE_PROJECT_ID=outfit-vision
   ```

### Step 2: Create OAuth 2.0 Client ID (for User Login)
**This is different from the service account!**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **outfit-vision** project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: `OutfitVision`
   - User support email: Your email
   - Developer contact: Your email
   - Click **SAVE AND CONTINUE**
   - Add scopes:
     - `https://www.googleapis.com/auth/photoslibrary.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Click **SAVE AND CONTINUE**
   - Add test users (your email)
   - Click **SAVE AND CONTINUE** > **BACK TO DASHBOARD**

6. Now create OAuth client:
   - Application type: **Web application**
   - Name: `OutfitVision Web Client`
   - **Authorized redirect URIs**: 
     ```
     http://localhost:3001/api/auth/google/callback
     ```
     ⚠️ **IMPORTANT**: Copy this EXACTLY - no trailing slash, no spaces!
   - Click **CREATE**

7. Copy the **Client ID** and **Client Secret**

### Step 3: Update Your .env File
```env
# OAuth 2.0 Credentials (for user login)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz123
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Service Account (for Firestore)
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GOOGLE_PROJECT_ID=outfit-vision

# API Keys
GOOGLE_VISION_API_KEY=your_vision_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Firestore
FIRESTORE_DATABASE_ID=(default)

# Other
SESSION_SECRET=any_random_string_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

### Step 4: Verify Redirect URI Match
The redirect URI must be **EXACTLY** the same in:
1. Your `.env` file: `GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback`
2. Google Cloud Console OAuth client settings

**Common mistakes:**
- ❌ `http://localhost:3001/api/auth/google/callback/` (trailing slash)
- ❌ `http://localhost:3001/api/auth/google/callback ` (trailing space)
- ❌ `https://localhost:3001/api/auth/google/callback` (https instead of http)
- ✅ `http://localhost:3001/api/auth/google/callback` (correct)

### Step 5: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 6: Test
1. Visit `http://localhost:5173`
2. Click "Connect with Google Photos"
3. Check server console - it should log the redirect URI being used
4. The OAuth flow should work now!

## Quick Checklist

- [ ] Service account saved as `service-account-key.json`
- [ ] OAuth 2.0 Client ID created (not service account!)
- [ ] Redirect URI in Google Cloud Console: `http://localhost:3001/api/auth/google/callback`
- [ ] Redirect URI in `.env`: `http://localhost:3001/api/auth/google/callback` (exact match)
- [ ] OAuth consent screen configured
- [ ] Google Photos Library API enabled
- [ ] Server restarted after changes

## Still Not Working?

1. Check server logs for the exact redirect URI being used
2. Visit `http://localhost:3001/api/debug/env` to verify environment variables
3. Double-check the redirect URI in Google Cloud Console (no trailing slash!)
4. Make sure you're using the correct Google Cloud project

