# Add Google API Key for Photos Picker

## The Issue
Your token has the correct scope, but Photos Picker API **requires a Developer Key (API Key)** to work. This is why you're still getting 403 errors.

## Solution: Get and Add API Key

### Step 1: Create API Key in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **outfit-vision** project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **API Key**
5. Copy the API key that's generated

### Step 2: (Optional) Restrict the API Key

For security, you can restrict the API key:
1. Click on the API key you just created
2. Under "API restrictions", select "Restrict key"
3. Choose "Restrict key to specific APIs"
4. Select:
   - **Photos Picker API**
   - **Google Picker API** (if available)
5. Click **SAVE**

### Step 3: Add API Key to Your Project

1. Open your `.env` file in the **root directory** (same folder as `package.json`)
2. Add this line:
   ```env
   VITE_GOOGLE_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with the API key you copied.

3. Save the file

### Step 4: Restart Your Dev Server

**Important**: You must restart your dev server for the environment variable to load:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Test

1. Refresh your browser
2. Go to Gallery page
3. Click "📷 Pick from Google Photos"
4. Should work now!

## Why API Key is Required

- OAuth token = User authentication (you have this ✅)
- API key = Application identification (you need this ❌)
- Photos Picker API needs BOTH to work

## Quick Checklist

- [ ] API key created in Google Cloud Console
- [ ] API key added to `.env` as `VITE_GOOGLE_API_KEY`
- [ ] Dev server restarted
- [ ] Browser refreshed
- [ ] Tested picker

## Still Not Working?

1. **Verify API key is loaded**:
   - Open browser console
   - Check if there's an error about missing API key
   - The code will show an alert if API key is missing

2. **Check API key restrictions**:
   - Make sure Photos Picker API is allowed
   - Or remove restrictions temporarily to test

3. **Verify Photos Picker API is enabled**:
   - Google Cloud Console > APIs & Services > Enabled APIs
   - Should see "Photos Picker API"

4. **Check browser console** for exact error message

## Security Note

- Never commit `.env` file to Git (it's already in `.gitignore`)
- API key is safe to use in frontend (it's meant to be public)
- You can restrict it to specific APIs for extra security

