# ✅ Environment Variables Update Instructions

## Current Status

✅ **Base environment variables are SET:**
- NODE_ENV=production
- CLIENT_URL=https://outfit-vision-4018057728.us-central1.run.app
- GOOGLE_REDIRECT_URI=https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback
- GOOGLE_PROJECT_ID=outfit-vision
- FIRESTORE_DATABASE_ID=(default)
- SESSION_SECRET=(generated)

⏳ **Still need to add:**
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_VISION_API_KEY
- GOOGLE_GEMINI_API_KEY

## 🚀 Quick Update (Easiest Way)

Run this PowerShell script:

```powershell
.\QUICK_UPDATE_ENV.ps1
```

This will:
1. Prompt you for all 4 missing values
2. Update Cloud Run with everything at once
3. Confirm when done

## 📍 Where to Find Your Credentials

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **outfit-vision**
3. Navigate to **APIs & Services** > **Credentials**
4. Find your **OAuth 2.0 Client ID**
5. Click to view details
6. Copy:
   - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xyz123...`)

### GOOGLE_VISION_API_KEY

1. Same page: **APIs & Services** > **Credentials**
2. Look for **API Keys** section
3. Find or create a key for **Cloud Vision API**
4. Copy the key

### GOOGLE_GEMINI_API_KEY

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Or in Google Cloud Console: **APIs & Services** > **Credentials** > **API Keys**
3. Create or find your Gemini API key
4. Copy the key

## 🔧 Manual Update (Alternative)

If you prefer to update manually:

```powershell
$SERVICE_URL = "https://outfit-vision-4018057728.us-central1.run.app"

gcloud run services update outfit-vision `
  --region us-central1 `
  --update-env-vars "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID,GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET,GOOGLE_VISION_API_KEY=YOUR_VISION_KEY,GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_KEY"
```

Replace:
- `YOUR_CLIENT_ID` - Your OAuth Client ID
- `YOUR_CLIENT_SECRET` - Your OAuth Client Secret
- `YOUR_VISION_KEY` - Your Vision API key
- `YOUR_GEMINI_KEY` - Your Gemini API key

## ✅ Verify Update

After updating, verify:

```powershell
gcloud run services describe outfit-vision --region us-central1 --format 'value(spec.template.spec.containers[0].env)'
```

## 🎯 Your App URL

**https://outfit-vision-4018057728.us-central1.run.app**

Once environment variables are set, your app will be fully functional!


