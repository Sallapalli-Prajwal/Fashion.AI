# Fix Google Photos Picker 403 Error

## The Problem
You're getting a 403 error when trying to open the Google Photos Picker. This means:
- The OAuth token doesn't have the right permissions, OR
- Photos Picker API is not enabled, OR
- The token is expired/invalid

## Solution Steps

### Step 1: Enable Photos Picker API (NOT Photos Library API)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **outfit-vision** project
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Photos Picker API"** (important: it's "Picker", not "Library")
5. Click **ENABLE**

**Note**: Photos Picker API and Photos Library API are different:
- ✅ **Photos Picker API** - For the picker dialog (what we need)
- ❌ **Photos Library API** - For fetching all photos (not needed)

### Step 2: Verify OAuth Scopes

1. Go to **APIs & Services** > **OAuth consent screen**
2. Make sure these scopes are added:
   - `https://www.googleapis.com/auth/photoslibrary.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### Step 3: Re-authenticate (IMPORTANT!)

The old OAuth token doesn't have picker permissions. You must:

1. **Logout** from the app
2. **Clear browser cookies** for localhost (optional but recommended)
3. **Login again** - this will request the correct scopes

### Step 4: Verify Token Has Correct Scopes

After re-authenticating, the token should include:
- `photoslibrary.readonly` scope
- Valid access token

## Quick Checklist

- [ ] Photos Picker API is enabled (not Photos Library API)
- [ ] OAuth consent screen has `photoslibrary.readonly` scope
- [ ] Logged out from the app
- [ ] Cleared browser cookies (optional)
- [ ] Logged in again
- [ ] Tested opening the picker

## Still Getting 403?

### Check 1: Verify API is Enabled
- Go to APIs & Services > Enabled APIs
- Look for "Photos Picker API" (should be listed)
- If not, enable it

### Check 2: Check OAuth Token
Visit: `http://localhost:3001/api/auth/token`
- Should return: `{ "accessToken": "...", "userId": "..." }`
- If 401, you need to login again

### Check 3: Check Browser Console
- Look for any CORS errors
- Check if picker scripts loaded correctly
- Verify `window.google.picker` exists

### Check 4: Try Incognito Mode
- Open app in incognito/private window
- Login fresh
- Try picker again

## Alternative: Use Local Upload Only

If Photos Picker continues to have issues, you can:
1. Use "Upload Photo" button to upload from your computer
2. The analysis will work the same way
3. No Google Photos integration needed

## Common Mistakes

❌ **Wrong API**: Enabling "Photos Library API" instead of "Photos Picker API"
❌ **Old Token**: Not re-authenticating after enabling API
❌ **Wrong Scope**: Missing `photoslibrary.readonly` in OAuth consent screen
❌ **Wrong Project**: Enabling API in wrong Google Cloud project

## Debug Steps

1. Check server logs for token requests
2. Check browser console for picker errors
3. Verify token endpoint returns valid token
4. Test picker in incognito mode
5. Check Google Cloud Console for API status

