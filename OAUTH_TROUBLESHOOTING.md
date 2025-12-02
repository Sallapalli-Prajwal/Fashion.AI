# OAuth Troubleshooting Guide

## Error: "Access blocked: Authorization Error - invalid_client"

This error means Google cannot find your OAuth client. Here's how to fix it:

### Step 1: Verify Your .env File

1. Make sure you have a `.env` file in the root directory
2. Check that it contains:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
   ```

3. **Important**: Make sure there are NO spaces around the `=` sign
   - ✅ Correct: `GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com`
   - ❌ Wrong: `GOOGLE_CLIENT_ID = 123456789-abc.apps.googleusercontent.com`

### Step 2: Get Your OAuth Credentials from Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Look for **OAuth 2.0 Client IDs**
5. If you don't have one, create it:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Application type: **Web application**
   - Name: `OutfitVision` (or any name)
   - Authorized redirect URIs: 
     - `http://localhost:3001/api/auth/google/callback`
     - (For production, add your Cloud Run URL)
   - Click **CREATE**
6. Copy the **Client ID** and **Client Secret**

### Step 3: Update Your .env File

1. Open `.env` file
2. Replace the placeholder values:
   ```
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
   ```

### Step 4: Enable Required APIs

Make sure these APIs are enabled in your Google Cloud project:

1. **Google Photos Library API**
   - Go to **APIs & Services** > **Library**
   - Search for "Photos Library API"
   - Click **ENABLE**

2. **Google+ API** (for user info)
   - Search for "Google+ API" or "People API"
   - Enable it

### Step 5: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in required fields:
   - App name: `OutfitVision`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/photoslibrary.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your email) if app is in testing mode
6. Save

### Step 6: Restart Your Server

After updating `.env`, restart your server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 7: Verify Environment Variables Are Loaded

Add this temporary route to check (remove after debugging):

```javascript
// In server/index.js, add before routes:
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });
});
```

Visit `http://localhost:3001/api/debug/env` to verify.

### Common Issues

#### Issue 1: "Redirect URI mismatch"
- **Solution**: Make sure the redirect URI in `.env` EXACTLY matches the one in Google Cloud Console
- Check for trailing slashes, http vs https, port numbers

#### Issue 2: "Client ID not found"
- **Solution**: 
  - Verify you're using the correct project in Google Cloud Console
  - Check that the Client ID is copied correctly (no extra spaces)
  - Make sure the OAuth client exists and is not deleted

#### Issue 3: "Access blocked: This app isn't verified"
- **Solution**: 
  - If in testing mode, add your email as a test user
  - Go to OAuth consent screen > Test users > Add users

#### Issue 4: Environment variables not loading
- **Solution**:
  - Make sure `.env` is in the root directory (same level as `package.json`)
  - Restart the server after changing `.env`
  - Check that `dotenv` is installed: `npm install dotenv`

### Quick Checklist

- [ ] `.env` file exists in root directory
- [ ] `GOOGLE_CLIENT_ID` is set (no spaces around `=`)
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] `GOOGLE_REDIRECT_URI` matches Google Cloud Console exactly
- [ ] OAuth client exists in Google Cloud Console
- [ ] Redirect URI is added in OAuth client settings
- [ ] Google Photos Library API is enabled
- [ ] OAuth consent screen is configured
- [ ] Server restarted after `.env` changes
- [ ] Using correct Google Cloud project

### Still Having Issues?

1. Check server logs for error messages
2. Verify the OAuth URL being generated:
   - Look at browser network tab when clicking "Connect with Google Photos"
   - Check the `client_id` parameter in the URL
3. Test OAuth client directly:
   - Use Google's OAuth 2.0 Playground to test your credentials
   - Or use a simple test script to verify credentials work

### Need More Help?

- Check Google Cloud Console logs
- Review OAuth 2.0 documentation
- Verify your project has billing enabled (some APIs require it)

