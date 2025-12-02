# Fix Redirect URI Mismatch Error

## Current Redirect URI
Your Cloud Run service is using:
```
https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback
```

## Steps to Fix

### 1. Go to Google Cloud Console
1. Open: https://console.cloud.google.com/apis/credentials?project=outfit-vision
2. Find your OAuth 2.0 Client ID (the one with Client ID starting with `4018057728-...`)
3. Click on it to edit

### 2. Add Authorized Redirect URIs
In the "Authorized redirect URIs" section, make sure you have EXACTLY:

```
https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback
```

**Important:**
- Must start with `https://` (not `http://`)
- No trailing slash
- Must match EXACTLY (case-sensitive)
- Include the full path: `/api/auth/google/callback`

### 3. Save Changes
Click "SAVE" at the bottom of the page.

### 4. Wait a Few Minutes
Google's changes can take 1-2 minutes to propagate.

### 5. Test Again
Try logging in again at: https://outfit-vision-4018057728.us-central1.run.app

## Common Mistakes to Avoid

❌ **Wrong:**
- `http://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback` (missing 's' in https)
- `https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback/` (trailing slash)
- `https://outfit-vision-4018057728.us-central1.run.app/auth/google/callback` (missing `/api`)

✅ **Correct:**
- `https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback`

## If You Still Have Issues

1. Check the browser console for the exact redirect URI being used
2. Verify the OAuth Client ID matches in both places
3. Make sure you're editing the correct OAuth client (not a service account)

