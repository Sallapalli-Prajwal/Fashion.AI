# Step-by-Step: Fix Redirect URI

## Current Problem
Your redirect URI is missing `/callback` at the end.

**Current (WRONG):**
```
https://outfit-vision-4018057728.us-central1.run.app/api/auth/google
```

**Should be (CORRECT):**
```
https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback
```

## Steps to Fix

1. **In the "Authorized redirect URIs" section:**
   - Find the URI: `https://outfit-vision-4018057728.us-central1.run.app/api/auth/google`
   - Click the **"Delete item"** button (gray button to the right)

2. **Click the "+ Add URI" button**

3. **Enter the COMPLETE URI:**
   ```
   https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback
   ```
   ⚠️ **IMPORTANT:** Make sure it ends with `/callback`

4. **Click "SAVE"** (blue button at the bottom)

5. **Wait 5-10 minutes** for Google's changes to propagate

6. **Clear your browser cache** or try in an incognito window

7. **Try logging in again**

## Verification Checklist

✅ Redirect URI ends with `/callback`
✅ Starts with `https://` (not `http://`)
✅ No trailing slash after `callback`
✅ Matches exactly: `https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback`

