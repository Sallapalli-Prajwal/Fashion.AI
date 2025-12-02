# Fix OAuth Scope Issues - "Insufficient authentication scopes"

## The Problem
You're getting: `Request had insufficient authentication scopes` when trying to access Google Photos.

This means your OAuth token doesn't have the `photoslibrary.readonly` scope.

## Solution

### Step 1: Verify OAuth Scopes in Code
The code already requests the correct scope. Check `server/routes/auth.js` line 22:
```javascript
const scope = 'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
```

### Step 2: Verify OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **OAuth consent screen**
3. Make sure these scopes are added:
   - `https://www.googleapis.com/auth/photoslibrary.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### Step 3: Enable Google Photos Library API
1. Go to **APIs & Services** > **Library**
2. Search for "Photos Library API"
3. Click **ENABLE**

### Step 4: Clear Session and Re-authenticate
**This is the most important step!**

The old OAuth token doesn't have the photos scope. You need to:

1. **Logout** from the app
2. **Clear browser cookies** for localhost (optional but recommended)
3. **Login again** - this will request the correct scopes

### Step 5: Verify Token Has Correct Scopes
After re-authenticating, check the server logs. You should see successful API calls.

## Why This Happens

When you first authenticated, the OAuth token was created without the photos scope. Even if you add the scope later, the existing token won't have it. You must re-authenticate to get a new token with the correct scopes.

## Quick Fix Checklist

- [ ] OAuth consent screen has `photoslibrary.readonly` scope
- [ ] Google Photos Library API is enabled
- [ ] Logged out from the app
- [ ] Cleared browser cookies (optional)
- [ ] Logged in again
- [ ] Tested fetching photos

## Still Not Working?

1. **Check OAuth consent screen status**:
   - If "Testing", make sure you're added as a test user
   - If "In production", scopes should work for all users

2. **Verify the scope is in the OAuth URL**:
   - When you click "Connect with Google Photos", check the URL
   - It should include `scope=...photoslibrary.readonly...`

3. **Check server logs**:
   - Look for the OAuth redirect URI being used
   - Verify the scope is included in the request

4. **Try incognito/private browsing**:
   - This ensures no old tokens are cached

