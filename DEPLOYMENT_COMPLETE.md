# 🚀 Deployment Setup Complete!

## ✅ What I've Done For You

1. **✅ Switched to correct project**: `outfit-vision`
2. **✅ Enabled all required APIs**:
   - Cloud Run API
   - Cloud Build API
   - Vision API
   - Generative Language API (Gemini)
   - Firestore API
3. **✅ Built frontend**: React app compiled successfully
4. **✅ Started Cloud Run deployment**: Currently building and deploying

## ⏳ Current Status

Your app is being deployed to Cloud Run. This takes **5-10 minutes**.

## 📋 Next Steps (After Deployment Completes)

### Step 1: Check Deployment Status

Wait a few minutes, then run:

```powershell
gcloud run services list --region us-central1
```

If you see `outfit-vision` in the list, deployment is complete!

### Step 2: Get Your Service URL

```powershell
$url = gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)'
Write-Host "Your app URL: $url"
```

### Step 3: Update Environment Variables

I've created a script to make this easy. Run:

```powershell
.\update-env-vars.ps1
```

This will:
- Get your service URL automatically
- Prompt you for required credentials
- Update all environment variables at once

**You'll need to provide:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console > Credentials
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console > Credentials  
- `GOOGLE_VISION_API_KEY` - Your Vision API key
- `GOOGLE_GEMINI_API_KEY` - Your Gemini API key
- `SESSION_SECRET` - (Can be auto-generated)

### Step 4: Update OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your **OAuth 2.0 Client ID**
4. Click **Edit**
5. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-SERVICE-URL.run.app/api/auth/google/callback
   ```
   (Replace `YOUR-SERVICE-URL` with your actual Cloud Run URL)
6. Click **Save**

### Step 5: Test Your App

Visit your Cloud Run URL and test:
- ✅ Homepage loads
- ✅ Login with Google works
- ✅ Photo upload works
- ✅ Analysis works
- ✅ Dashboard shows data

## 🔍 Check Deployment Progress

### View Build Logs

```powershell
gcloud builds list --limit=5
```

### View Service Logs (after deployment)

```powershell
gcloud run services logs tail outfit-vision --region us-central1
```

### Check Service Status

```powershell
gcloud run services describe outfit-vision --region us-central1
```

## 🛠️ Manual Commands (If Scripts Don't Work)

### Update Environment Variables Manually

```powershell
$SERVICE_URL = "https://outfit-vision-XXXXX.run.app"  # Your actual URL

gcloud run services update outfit-vision `
  --region us-central1 `
  --update-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLIENT_ID=your_id,GOOGLE_CLIENT_SECRET=your_secret,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback,GOOGLE_VISION_API_KEY=your_key,GOOGLE_GEMINI_API_KEY=your_key,GOOGLE_PROJECT_ID=outfit-vision,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=your_secret,CLIENT_URL=$SERVICE_URL"
```

## 📝 Files Created

- `DEPLOY_CLOUD_RUN.md` - Full deployment guide
- `QUICK_DEPLOY.md` - Quick reference
- `update-env-vars.ps1` - Script to update environment variables
- `deploy-cloud-run.ps1` - Full deployment script
- `DEPLOYMENT_STATUS.md` - Status tracking

## ⚠️ Important Notes

1. **First deployment takes longer** - Building the container image takes 5-10 minutes
2. **Environment variables are required** - App won't work until you set them
3. **OAuth redirect URI must match exactly** - Include `https://` and the full path
4. **Service account for Firestore** - Cloud Run uses default service account, ensure it has Firestore permissions

## 🆘 Troubleshooting

### Deployment Failed?

```powershell
# Check recent builds
gcloud builds list --limit=5

# View build logs
gcloud builds log BUILD_ID
```

### Service Not Found?

Wait a few more minutes - deployment is still in progress.

### Need to Redeploy?

```powershell
gcloud run deploy outfit-vision --source . --region us-central1 --quiet
```

## 🎉 Once Everything Works

Your app will be live at: `https://outfit-vision-XXXXX.run.app`

You can:
- Share the URL with others
- Set up a custom domain (optional)
- Monitor usage in Cloud Console
- Set up billing alerts

---

**Need help?** Check the logs or run the troubleshooting commands above!

