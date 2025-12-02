# Final Fix for Google Photos Picker 403 Error

## The Problem
Even with the correct scope, you're still getting 403 errors. This is likely because:
1. You haven't re-authenticated yet (old token doesn't have new scope)
2. Photos Picker API might need a Developer Key (API Key)

## Solution Steps

### Step 1: Get a Google API Key (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click **+ CREATE CREDENTIALS** > **API Key**
4. Copy the API key
5. Add to your `.env` file (client side):
   ```env
   VITE_GOOGLE_API_KEY=your_api_key_here
   ```
6. Restart your dev server

**Note**: The API key is optional but can help with Photos Picker API access.

### Step 2: Re-authenticate (CRITICAL!)

You MUST re-authenticate to get a token with the new scope:

1. **Logout** from the app
2. **Clear browser cookies** for localhost:
   - Open DevTools (F12)
   - Application tab > Cookies > localhost
   - Delete all cookies
3. **Login again** - this will request `photospicker.mediaitems.readonly` scope

### Step 3: Verify Everything

Check these in Google Cloud Console:

1. **Photos Picker API is enabled**:
   - APIs & Services > Enabled APIs
   - Should see "Photos Picker API" in the list

2. **OAuth Consent Screen has correct scope**:
   - APIs & Services > OAuth consent screen
   - Should have: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`

3. **OAuth Client ID is correct**:
   - APIs & Services > Credentials
   - Verify your OAuth 2.0 Client ID exists

### Step 4: Test Token Scope

After re-authenticating, you can verify the token has the right scope by checking the OAuth consent screen - it should show the new scope was granted.

## Why Re-authentication is Required

When you change OAuth scopes in code:
- Old tokens still have old scopes
- New tokens will have new scopes
- You must get a NEW token by re-authenticating

## Alternative: Use Local Upload Only

If Photos Picker continues to have issues, you can:
1. Use "Upload Photo" button to upload from computer
2. Analysis works the same way
3. No Google Photos integration needed

## Debug Checklist

- [ ] Code updated to use `photospicker.mediaitems.readonly` scope ✅
- [ ] Photos Picker API enabled in Google Cloud Console
- [ ] OAuth consent screen has `photospicker.mediaitems.readonly` scope
- [ ] Logged out from app
- [ ] Cleared browser cookies
- [ ] Logged in again (to get new token)
- [ ] API key added to `.env` (optional)
- [ ] Dev server restarted after adding API key
- [ ] Tested picker

## Still Not Working?

1. Check browser console for exact error message
2. Verify token endpoint: `http://localhost:3001/api/auth/token` returns valid token
3. Try incognito/private browsing mode
4. Check Google Cloud Console for any quota/restriction issues
5. Verify you're using the correct Google account

## Important Notes

- The scope change requires re-authentication
- API key is optional but recommended
- Photos Picker API is different from Photos Library API
- Make sure you're testing with a fresh login session

