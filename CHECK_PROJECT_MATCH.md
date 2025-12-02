# Check API Key and OAuth Client Match

## The Issue
Even with unrestricted API key and enabled Picker API, you're getting 403. This usually means:
- API key and OAuth client are from **different Google Cloud projects**
- Or there's a mismatch in project configuration

## Solution: Verify They're From Same Project

### Step 1: Check OAuth Client Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your **OAuth 2.0 Client ID** (the one starting with `4018057728-...`)
4. Note which **project** it's in (should be "outfit-vision")

### Step 2: Check API Key Project

1. Still in **APIs & Services** > **Credentials**
2. Find your **API Key** (the one in your `.env`)
3. Click on it
4. Check which **project** it belongs to
5. **IMPORTANT**: It must be the SAME project as your OAuth client

### Step 3: If They're Different Projects

**Option A: Create API Key in Same Project (Recommended)**

1. Make sure you're in the **outfit-vision** project
2. Go to **APIs & Services** > **Credentials**
3. Click **+ CREATE CREDENTIALS** > **API Key**
4. Copy the new API key
5. Update `.env`:
   ```env
   VITE_GOOGLE_API_KEY=new_api_key_here
   ```
6. Restart dev server

**Option B: Move OAuth Client to API Key's Project**

Not recommended - better to keep everything in one project.

## Verify Everything is in Same Project

All of these should be in the **same Google Cloud project** (outfit-vision):
- ✅ OAuth 2.0 Client ID
- ✅ API Key
- ✅ Photos Picker API (enabled)
- ✅ Service Account
- ✅ Firestore Database

## Additional Checks

### Check 1: API Key Restrictions
Even if "unrestricted", check:
1. Click on API key
2. Under "API restrictions" - should say "Don't restrict key"
3. Under "Application restrictions" - should say "None"

### Check 2: OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Make sure you're in the **outfit-vision** project
3. Verify scopes include: `photospicker.mediaitems.readonly`

### Check 3: Try Creating Fresh API Key
Sometimes old API keys have issues:
1. Create a **new** API key in outfit-vision project
2. Don't restrict it
3. Update `.env` with new key
4. Restart server
5. Test

## Debug: Check API Key in Console

In browser console (F12), after clicking picker:
```javascript
// Check what API key is being used
console.log('API Key:', import.meta.env.VITE_GOOGLE_API_KEY)

// Check OAuth token
fetch('http://localhost:3001/api/auth/token')
  .then(r => r.json())
  .then(d => console.log('Token:', d))
```

## Still Not Working?

1. **Try different API key**: Create a brand new one
2. **Check browser console** for exact error message
3. **Verify project name**: Make sure everything says "outfit-vision"
4. **Check API quotas**: Make sure you haven't hit any limits
5. **Try incognito mode**: Fresh session might help

