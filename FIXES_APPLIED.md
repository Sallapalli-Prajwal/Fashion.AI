# Fixes Applied

## Issue 1: Gemini Model Not Found ✅ FIXED

**Problem**: `gemini-2.5-pro` and `gemini-1.5-pro` models not found

**Solution**: 
- Updated code to use `gemini-1.5-flash` as default (most reliable)
- Added fallback to try other models if specified
- Available models: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`

**What to do**:
1. Remove `GEMINI_MODEL=gemini-2.5-pro` from `.env` (if you added it)
2. Or set `GEMINI_MODEL=gemini-1.5-flash` (recommended)
3. Restart server

## Issue 2: Google Photos 403 - Insufficient Scopes ⚠️ NEEDS ACTION

**Problem**: `Request had insufficient authentication scopes`

**Solution**: You need to re-authenticate to get a token with the correct scopes.

**Steps to fix**:

1. **Enable Google Photos Library API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services > Library
   - Search "Photos Library API"
   - Click **ENABLE**

2. **Verify OAuth Consent Screen**:
   - APIs & Services > OAuth consent screen
   - Make sure scope `https://www.googleapis.com/auth/photoslibrary.readonly` is added
   - Save

3. **Clear session and re-authenticate**:
   - **Logout** from the app
   - **Clear browser cookies** for localhost (optional)
   - **Login again** - this will request the correct scopes

4. **Test**:
   - Try fetching photos from Gallery
   - Should work now!

## Quick Checklist

- [x] Gemini model fixed (uses gemini-1.5-flash)
- [ ] Google Photos Library API enabled
- [ ] OAuth consent screen has photoslibrary.readonly scope
- [ ] Logged out and logged back in
- [ ] Tested fetching photos

## After Fixing

Once both issues are resolved:
1. ✅ Firestore - Working
2. ✅ OAuth - Working  
3. ✅ Gemini - Fixed (will use gemini-1.5-flash)
4. ⏳ Google Photos - Needs re-authentication

## Model Options

You can set in `.env`:
```env
# Fast and efficient (recommended)
GEMINI_MODEL=gemini-1.5-flash

# More capable, slower
GEMINI_MODEL=gemini-1.5-pro

# Older model (still works)
GEMINI_MODEL=gemini-pro
```

**Note**: `gemini-2.5-pro` doesn't exist. Use one of the models above.

