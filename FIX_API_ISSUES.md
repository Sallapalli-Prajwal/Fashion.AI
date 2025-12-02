# Fix API Issues

## Issue 1: Google Photos API 403 Error

**Error**: `Request failed with status code 403`

### Solution:

1. **Enable Google Photos Library API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Library**
   - Search for "Photos Library API"
   - Click **ENABLE**

2. **Verify OAuth Scopes**:
   - Make sure your OAuth consent screen includes:
     - `https://www.googleapis.com/auth/photoslibrary.readonly`
   - Re-authenticate if you added scopes after initial login

3. **Check OAuth Consent Screen**:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Make sure the app is published or you're added as a test user
   - Verify all required scopes are added

4. **Re-authenticate**:
   - Logout and login again to get fresh tokens with correct scopes

## Issue 2: Gemini Model Not Found

**Error**: `models/gemini-pro-vision is not found`

### Solution:

The model name has been updated. The code now uses:
- `gemini-1.5-flash` (default - faster, cheaper)
- `gemini-1.5-pro` (more capable)

You can optionally set in `.env`:
```env
GEMINI_MODEL=gemini-1.5-pro
```

**Available Gemini Models**:
- `gemini-1.5-flash` - Fast and efficient (recommended)
- `gemini-1.5-pro` - More capable, slower
- `gemini-pro` - Older model (still works)

The code has been updated to use `gemini-1.5-flash` by default.

## Quick Fix Steps

1. **Enable Photos Library API**:
   ```
   Google Cloud Console > APIs & Services > Library > 
   Search "Photos Library API" > ENABLE
   ```

2. **Restart Server**:
   ```bash
   npm run dev
   ```

3. **Re-authenticate**:
   - Logout from the app
   - Login again with Google Photos

4. **Test**:
   - Try fetching photos again
   - Try analyzing a photo

## Verify APIs Are Enabled

Check in Google Cloud Console that these APIs are enabled:
- ✅ Google Photos Library API
- ✅ Cloud Vision API
- ✅ Generative Language API (Gemini)

## Still Having Issues?

### Google Photos 403:
- Check that Photos Library API is enabled
- Verify OAuth scopes include `photoslibrary.readonly`
- Re-authenticate to get fresh tokens
- Check if your Google account has photos (test with a different account)

### Gemini Errors:
- Verify `GOOGLE_GEMINI_API_KEY` is set correctly
- Check API key is valid in [Google AI Studio](https://makersuite.google.com/app/apikey)
- Try a different model name in `.env`: `GEMINI_MODEL=gemini-1.5-pro`

