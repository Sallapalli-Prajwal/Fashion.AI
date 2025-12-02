# Fix API Key 403 Error - Permissions Issue

## The Problem
Your API key is loading (`hasApiKey: true`), but you're still getting 403 errors. This means the API key doesn't have permission to access Google Picker API.

## Solution: Configure API Key Restrictions

### Step 1: Go to API Key Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your API key (the one you're using for `VITE_GOOGLE_API_KEY`)
4. Click on it to edit

### Step 2: Remove or Configure Restrictions

**Option A: Remove Restrictions (Easiest for Testing)**

1. Under "API restrictions", select **"Don't restrict key"**
2. Click **SAVE**
3. Wait a few seconds for changes to propagate
4. Try the picker again

**Option B: Allow Specific APIs (More Secure)**

1. Under "API restrictions", select **"Restrict key"**
2. Choose **"Restrict key to specific APIs"**
3. Click **"Select APIs"**
4. Make sure these are selected:
   - ✅ **Google Picker API**
   - ✅ **Google Photos Picker API** (if available)
5. Click **SAVE**
6. Wait a few seconds
7. Try the picker again

### Step 3: Verify APIs Are Enabled

Make sure these APIs are enabled in your project:

1. Go to **APIs & Services** > **Enabled APIs**
2. Check for:
   - ✅ **Photos Picker API** (must be enabled)
   - ✅ **Google Picker API** (if available, enable it)

If not enabled:
- Go to **APIs & Services** > **Library**
- Search for "Photos Picker API"
- Click **ENABLE**

### Step 4: Test Again

1. **Hard refresh** browser (Ctrl+Shift+R)
2. Click "📷 Pick from Google Photos"
3. Should work now!

## Why This Happens

API keys can be restricted to:
- Specific APIs (only allow certain APIs)
- Specific IPs (only allow from certain locations)
- HTTP referrers (only allow from certain websites)

If your API key is restricted but doesn't include Picker API, you'll get 403 errors.

## Quick Checklist

- [ ] API key restrictions removed OR Picker API added to restrictions
- [ ] Photos Picker API is enabled
- [ ] API key changes saved
- [ ] Waited a few seconds for propagation
- [ ] Browser hard refreshed
- [ ] Tested picker

## Still Not Working?

1. **Create a new API key** (unrestricted for testing):
   - APIs & Services > Credentials
   - Create new API key
   - Don't restrict it
   - Update `.env` with new key
   - Restart server

2. **Check API key in console**:
   - Browser console: `import.meta.env.VITE_GOOGLE_API_KEY`
   - Should match the key in Google Cloud Console

3. **Verify OAuth token**:
   - Visit: `http://localhost:3001/api/auth/token`
   - Should return valid token with correct scope

4. **Try incognito mode**:
   - Open app in incognito/private window
   - Login fresh
   - Test picker

