# Quick Deploy to Cloud Run

## 🚀 Fastest Way to Deploy

### For Linux/Mac:

```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

### For Windows (PowerShell):

```powershell
.\deploy-cloud-run.ps1
```

### Manual Deploy (if scripts don't work):

```bash
gcloud run deploy outfit-vision \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

## 📋 Before You Deploy

1. **Authenticate:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable APIs:**
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com vision.googleapis.com generativelanguage.googleapis.com firestore.googleapis.com
   ```

3. **Set Environment Variables:**
   After first deployment, update with your actual URL:
   ```bash
   SERVICE_URL=$(gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)')
   
   gcloud run services update outfit-vision \
     --region us-central1 \
     --update-env-vars "CLIENT_URL=$SERVICE_URL,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback,GOOGLE_CLIENT_ID=your_id,GOOGLE_CLIENT_SECRET=your_secret,GOOGLE_VISION_API_KEY=your_key,GOOGLE_GEMINI_API_KEY=your_key,GOOGLE_PROJECT_ID=your_project,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=your_secret"
   ```

4. **Update OAuth Redirect URI:**
   - Go to Google Cloud Console > Credentials
   - Edit OAuth Client ID
   - Add: `https://YOUR-SERVICE-URL.run.app/api/auth/google/callback`

## ✅ That's It!

Your app will be live at: `https://outfit-vision-XXXXX.run.app`

For detailed instructions, see `DEPLOY_CLOUD_RUN.md`

