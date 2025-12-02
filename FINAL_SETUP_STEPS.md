# 🎉 Deployment Complete! Final Setup Steps

## ✅ Your App is Live!

**Deployed URL:** https://outfit-vision-6hbozqgviq-uc.a.run.app

## 📋 Final Steps to Make It Work

### Step 1: Update Environment Variables

Run this PowerShell script to set all environment variables:

```powershell
.\update-env-vars.ps1
```

**OR** update manually with this command (replace the placeholder values):

```powershell
$SERVICE_URL = "https://outfit-vision-6hbozqgviq-uc.a.run.app"

gcloud run services update outfit-vision `
  --region us-central1 `
  --update-env-vars "NODE_ENV=production,PORT=8080,CLIENT_URL=$SERVICE_URL,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback,GOOGLE_CLIENT_ID=YOUR_CLIENT_ID,GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET,GOOGLE_VISION_API_KEY=YOUR_VISION_KEY,GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_KEY,GOOGLE_PROJECT_ID=outfit-vision,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=YOUR_SESSION_SECRET"
```

**Replace:**
- `YOUR_CLIENT_ID` - Your OAuth Client ID
- `YOUR_CLIENT_SECRET` - Your OAuth Client Secret
- `YOUR_VISION_KEY` - Your Vision API key
- `YOUR_GEMINI_KEY` - Your Gemini API key
- `YOUR_SESSION_SECRET` - Generate with: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`

### Step 2: Update OAuth Redirect URI (CRITICAL!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **outfit-vision**
3. Navigate to **APIs & Services** > **Credentials**
4. Find your **OAuth 2.0 Client ID** and click **Edit**
5. Under **Authorized redirect URIs**, add:
   ```
   https://outfit-vision-6hbozqgviq-uc.a.run.app/api/auth/google/callback
   ```
6. Click **SAVE**

### Step 3: Test Your App

Visit: **https://outfit-vision-6hbozqgviq-uc.a.run.app**

Test these features:
- ✅ Homepage loads
- ✅ Login with Google
- ✅ Upload photo
- ✅ Analyze outfit
- ✅ View dashboard
- ✅ Check analytics

## 🔍 Verify Everything Works

### Check Service Status

```powershell
gcloud run services describe outfit-vision --region us-central1
```

### View Logs

```powershell
gcloud run services logs tail outfit-vision --region us-central1
```

### Test Health Endpoint

Visit: https://outfit-vision-6hbozqgviq-uc.a.run.app/api/health

Should return: `{"status":"ok","timestamp":"..."}`

## 📝 Quick Reference

**Service URL:** https://outfit-vision-6hbozqgviq-uc.a.run.app

**OAuth Redirect URI:** https://outfit-vision-6hbozqgviq-uc.a.run.app/api/auth/google/callback

**Project ID:** outfit-vision

**Region:** us-central1

## 🎯 What's Next?

1. ✅ Set environment variables (Step 1 above)
2. ✅ Update OAuth redirect URI (Step 2 above)
3. ✅ Test your app (Step 3 above)
4. 🎉 Share your app with others!

## 🆘 Troubleshooting

### App shows errors?

Check logs:
```powershell
gcloud run services logs tail outfit-vision --region us-central1 --limit 50
```

### OAuth not working?

- Verify redirect URI matches exactly (including https://)
- Check environment variables are set correctly
- Ensure OAuth consent screen is configured

### Environment variables not updating?

Wait 30 seconds after update, then check:
```powershell
gcloud run services describe outfit-vision --region us-central1 --format 'value(spec.template.spec.containers[0].env)'
```

---

**Your app is deployed and ready! Just complete the 3 steps above and you're all set! 🚀**


