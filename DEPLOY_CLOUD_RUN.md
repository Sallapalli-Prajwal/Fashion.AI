# Deploy to Google Cloud Run - Step by Step Guide

## Prerequisites

1. **Google Cloud SDK installed**
   ```bash
   # Check if installed
   gcloud --version
   
   # If not installed, download from:
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate and set project**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable vision.googleapis.com
   gcloud services enable generativelanguage.googleapis.com
   gcloud services enable firestore.googleapis.com
   ```

## Step 1: Prepare Environment Variables

Create a file with your environment variables (don't commit this):

```bash
# Create .env.production (optional, for reference)
cat > .env.production << EOF
NODE_ENV=production
PORT=8080
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://outfit-vision-XXXXX.run.app/api/auth/google/callback
GOOGLE_VISION_API_KEY=your_vision_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json
FIRESTORE_DATABASE_ID=(default)
SESSION_SECRET=generate_a_secure_random_string_here
CLIENT_URL=https://outfit-vision-XXXXX.run.app
EOF
```

**Generate a secure SESSION_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 2: Prepare Service Account Key

For Firestore access, you need a service account key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Find or create a service account
4. Grant roles:
   - **Cloud Datastore User** (for Firestore)
   - **Storage Object Admin** (if using Cloud Storage later)
5. Create a key:
   - Click on the service account
   - Go to **Keys** tab
   - Click **Add Key** > **Create new key** > **JSON**
   - Save as `service-account-key.json` in project root

**⚠️ Important:** Add `service-account-key.json` to `.dockerignore` if you're not including it in the image, or use Secret Manager instead.

## Step 3: Update OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI (you'll update this after first deployment with actual URL):
   ```
   https://outfit-vision-XXXXX.run.app/api/auth/google/callback
   ```
   (Replace XXXXX with your actual service URL)

## Step 4: Deploy to Cloud Run

### Option A: Quick Deploy (Recommended)

Use the deployment script:

```bash
# Make script executable (Linux/Mac)
chmod +x deploy-cloud-run.sh

# Run deployment
./deploy-cloud-run.sh
```

### Option B: Manual Deploy

#### 4.1 Build and Deploy with Environment Variables

```bash
gcloud run deploy outfit-vision \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLIENT_ID=your_id,GOOGLE_CLIENT_SECRET=your_secret,GOOGLE_VISION_API_KEY=your_key,GOOGLE_GEMINI_API_KEY=your_key,GOOGLE_PROJECT_ID=your_project,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=your_secret"
```

#### 4.2 Update CLIENT_URL and REDIRECT_URI After First Deploy

After first deployment, you'll get a URL. Update environment variables:

```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)')

# Update environment variables
gcloud run services update outfit-vision \
  --region us-central1 \
  --update-env-vars "CLIENT_URL=$SERVICE_URL,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback"
```

#### 4.3 Update OAuth Redirect URI

Update the OAuth redirect URI in Google Cloud Console with your actual service URL.

### Option C: Deploy with Secret Manager (Recommended for Production)

For better security, use Secret Manager:

1. **Create secrets:**
   ```bash
   echo -n "your_client_secret" | gcloud secrets create google-client-secret --data-file=-
   echo -n "your_gemini_key" | gcloud secrets create google-gemini-key --data-file=-
   echo -n "your_vision_key" | gcloud secrets create google-vision-key --data-file=-
   echo -n "your_session_secret" | gcloud secrets create session-secret --data-file=-
   ```

2. **Grant Cloud Run access:**
   ```bash
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
   
   gcloud secrets add-iam-policy-binding google-client-secret \
     --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   
   # Repeat for other secrets...
   ```

3. **Deploy with secrets:**
   ```bash
   gcloud run deploy outfit-vision \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-secrets="GOOGLE_CLIENT_SECRET=google-client-secret:latest,GOOGLE_GEMINI_API_KEY=google-gemini-key:latest,GOOGLE_VISION_API_KEY=google-vision-key:latest,SESSION_SECRET=session-secret:latest" \
     --set-env-vars="NODE_ENV=production,PORT=8080,GOOGLE_CLIENT_ID=your_id,GOOGLE_PROJECT_ID=your_project,FIRESTORE_DATABASE_ID=(default)"
   ```

## Step 5: Verify Deployment

1. **Get your service URL:**
   ```bash
   gcloud run services describe outfit-vision \
     --region us-central1 \
     --format 'value(status.url)'
   ```

2. **Visit the URL** and test:
   - ✅ Homepage loads
   - ✅ Login with Google works
   - ✅ Photo upload works
   - ✅ Analysis works
   - ✅ Dashboard shows data

3. **Check logs:**
   ```bash
   gcloud run services logs read outfit-vision --region us-central1 --limit 50
   ```

## Step 6: Configure Service Account for Firestore

Cloud Run uses a default service account. Ensure it has Firestore permissions:

```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')

# Grant Firestore permissions
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

Or use your service account key file (upload to Cloud Run or use Secret Manager).

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Set to `8080` (Cloud Run default) |
| `GOOGLE_CLIENT_ID` | Yes | OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | Yes | Must match your Cloud Run URL + `/api/auth/google/callback` |
| `GOOGLE_VISION_API_KEY` | Yes | Vision API key |
| `GOOGLE_GEMINI_API_KEY` | Yes | Gemini API key |
| `GOOGLE_PROJECT_ID` | Yes | Your GCP project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Path to service account key (if using file) |
| `FIRESTORE_DATABASE_ID` | Optional | Default: `(default)` |
| `SESSION_SECRET` | Yes | Secure random string for session encryption |
| `CLIENT_URL` | Yes | Your Cloud Run service URL |

## Troubleshooting

### Build Failures
```bash
# Check build logs
gcloud builds list --limit=5

# View specific build
gcloud builds log BUILD_ID
```

### Runtime Errors
```bash
# View logs
gcloud run services logs read outfit-vision --region us-central1

# Stream logs
gcloud run services logs tail outfit-vision --region us-central1
```

### Common Issues

1. **"Permission denied" errors:**
   - Check service account has Firestore permissions
   - Verify API keys are correct

2. **OAuth redirect errors:**
   - Verify redirect URI matches exactly
   - Check OAuth consent screen is configured

3. **File upload errors:**
   - Cloud Run supports writable filesystem
   - Files are ephemeral (lost when container restarts)
   - Consider Cloud Storage for persistent storage

4. **Session issues:**
   - Sessions are in-memory (lost on restart)
   - Consider Firestore or Redis for persistent sessions

## Updating Deployment

To update your deployment:

```bash
# Just redeploy (uses same config)
gcloud run deploy outfit-vision --source . --region us-central1

# Update environment variables
gcloud run services update outfit-vision \
  --region us-central1 \
  --update-env-vars "NEW_VAR=value"

# Update resource limits
gcloud run services update outfit-vision \
  --region us-central1 \
  --memory 4Gi \
  --cpu 4
```

## Monitoring

- **View metrics:** Cloud Run > Metrics tab
- **Set up alerts:** Cloud Run > Alerts
- **Monitor costs:** Billing > Reports
- **API usage:** APIs & Services > Dashboard

## Cost Optimization

- Set `--min-instances 0` (scale to zero)
- Adjust `--max-instances` based on traffic
- Monitor API usage (Vision, Gemini)
- Set up billing alerts

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure Cloud Storage for file persistence
3. ✅ Set up Firestore/Redis for session storage
4. ✅ Enable Cloud CDN (optional)
5. ✅ Set up CI/CD pipeline
6. ✅ Configure monitoring and alerts

