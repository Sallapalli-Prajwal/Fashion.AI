# Deployment Status

## 🚀 Deployment in Progress

Your application is being deployed to Google Cloud Run. This process typically takes 5-10 minutes.

## What's Happening

1. ✅ **APIs Enabled** - All required Google Cloud APIs are enabled
2. ✅ **Frontend Built** - React app compiled successfully
3. 🔄 **Building Container** - Cloud Build is creating your Docker image
4. ⏳ **Deploying** - Container will be deployed to Cloud Run

## Check Deployment Status

Run this command to check if deployment is complete:

```powershell
gcloud run services describe outfit-vision --region us-central1
```

Or check the build status:

```powershell
gcloud builds list --limit=1
```

## Once Deployment Completes

### Step 1: Get Your Service URL

```powershell
$url = gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)'
Write-Host "Your app URL: $url"
```

### Step 2: Update Environment Variables

Run the update script:

```powershell
.\update-env-vars.ps1
```

This will prompt you for:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_VISION_API_KEY
- GOOGLE_GEMINI_API_KEY
- SESSION_SECRET (or generate one)

### Step 3: Update OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://YOUR-SERVICE-URL.run.app/api/auth/google/callback`
5. Save

### Step 4: Test Your Deployment

Visit your service URL and test:
- ✅ Homepage loads
- ✅ Login with Google
- ✅ Photo upload
- ✅ Analysis works
- ✅ Dashboard shows data

## Manual Environment Variable Update

If you prefer to update manually:

```powershell
$SERVICE_URL = "https://outfit-vision-XXXXX.run.app"  # Replace with your actual URL

gcloud run services update outfit-vision `
  --region us-central1 `
  --update-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLIENT_ID=your_id,GOOGLE_CLIENT_SECRET=your_secret,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback,GOOGLE_VISION_API_KEY=your_key,GOOGLE_GEMINI_API_KEY=your_key,GOOGLE_PROJECT_ID=outfit-vision,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=your_secret,CLIENT_URL=$SERVICE_URL"
```

## Troubleshooting

### Deployment Failed?

Check build logs:
```powershell
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### Service Not Found?

The deployment might still be in progress. Wait a few more minutes and check again.

### Need to Redeploy?

```powershell
gcloud run deploy outfit-vision --source . --region us-central1 --quiet
```

