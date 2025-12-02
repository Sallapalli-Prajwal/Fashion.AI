# Final Fix for 403 Error - Project Matching

## Critical Check: API Key and OAuth Client Must Be From Same Project

Even with unrestricted API key, if it's from a **different Google Cloud project** than your OAuth client, you'll get 403 errors.

## Step 1: Verify Project Match

### Check OAuth Client Project:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in **outfit-vision** project
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (`4018057728-...`)
5. Note the project name (should be "outfit-vision")

### Check API Key Project:
1. Still in **APIs & Services** > **Credentials**
2. Find your API Key (`AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8`)
3. Click on it
4. Check the project name at the top
5. **MUST match** the OAuth client project

## Step 2: If They're Different Projects

**Create API Key in Same Project:**

1. Make sure you're in **outfit-vision** project
2. Go to **APIs & Services** > **Credentials**
3. Click **+ CREATE CREDENTIALS** > **API Key**
4. **Don't restrict it** (for testing)
5. Copy the new API key
6. Update `.env`:
   ```env
   VITE_GOOGLE_API_KEY=new_api_key_from_outfit_vision_project
   ```
7. Restart dev server: `npm run dev`
8. Hard refresh browser: `Ctrl+Shift+R`

## Step 3: Verify All in Same Project

Everything should be in **outfit-vision** project:
- ✅ OAuth 2.0 Client ID
- ✅ API Key (the one you're using)
- ✅ Photos Picker API (enabled)
- ✅ Service Account
- ✅ Firestore

## Step 4: Additional Checks

### Check 1: Application Restrictions
Even if API key is "unrestricted", check:
1. Click on API key
2. Under "Application restrictions" → Should be **"None"**
3. Under "API restrictions" → Should be **"Don't restrict key"**

### Check 2: Try Without API Key
I've updated the code to try without API key if needed. Test both:
- With API key (current)
- Without API key (if above doesn't work)

### Check 3: Browser Console Error
Look at the exact 403 error in browser console:
- What URL is failing?
- What's the exact error message?
- Any CORS errors?

## Step 5: Nuclear Option - Fresh Start

If nothing works:

1. **Create new API key** in outfit-vision project
2. **Don't restrict it at all**
3. **Update .env** with new key
4. **Restart server**
5. **Clear browser cache completely**
6. **Login fresh**
7. **Test picker**

## Debug Commands

In browser console (F12):
```javascript
// Check API key
console.log('API Key:', import.meta.env.VITE_GOOGLE_API_KEY)

// Check OAuth token
fetch('http://localhost:3001/api/auth/token')
  .then(r => r.json())
  .then(d => {
    console.log('Token:', d.accessToken.substring(0, 20) + '...')
    console.log('Token Info:', d.tokenInfo)
  })
```

## Most Likely Issue

**API key and OAuth client are from different projects.** They MUST be from the same project (outfit-vision) to work together.

