# Verify Token Scope

## Check Your Token's Scope

After re-authenticating, you can verify your token has the correct scope:

1. Visit: `http://localhost:3001/api/auth/token`
2. Look for `tokenInfo.scope` in the response
3. It should include: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`

## If Token Has Wrong Scope

If the token still shows `photoslibrary.readonly` instead of `photospicker.mediaitems.readonly`:

1. **Logout** from the app
2. **Clear ALL cookies** for localhost:
   - Open DevTools (F12)
   - Application tab > Cookies
   - Delete all cookies for `localhost:5173` and `localhost:3001`
3. **Close and reopen browser** (optional but recommended)
4. **Login again** - this will request the NEW scope

## Why This Happens

- Old login = token with old scope
- New login = token with new scope (from updated code)
- You MUST get a new token by re-authenticating

## Quick Test

1. Check token: `http://localhost:3001/api/auth/token`
2. Look for `tokenInfo.scope`
3. If it has `photospicker.mediaitems.readonly` → Good! Try picker
4. If it has `photoslibrary.readonly` → Need to re-authenticate

## Still Getting 403?

Even with correct scope, if you still get 403:

1. **Verify Photos Picker API is enabled**:
   - Google Cloud Console > APIs & Services > Enabled APIs
   - Should see "Photos Picker API"

2. **Check OAuth Consent Screen**:
   - APIs & Services > OAuth consent screen
   - Should have `photospicker.mediaitems.readonly` in scopes

3. **Try adding API Key** (optional):
   - Create API key in Google Cloud Console
   - Add to `.env`: `VITE_GOOGLE_API_KEY=your_key`
   - Restart dev server

4. **Check browser console** for exact error message

