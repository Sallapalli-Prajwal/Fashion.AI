# Deploy to Google App Engine (GAE)

## Prerequisites

1. **Google Cloud SDK installed**
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   # Or use: gcloud --version to check if installed
   ```

2. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable required APIs**
   ```bash
   gcloud services enable appengine.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable vision.googleapis.com
   gcloud services enable generativelanguage.googleapis.com
   gcloud services enable firestore.googleapis.com
   ```

## Step 1: Build Frontend

```bash
cd client
npm install
npm run build
cd ..
```

This creates `client/dist` with production build.

## Step 2: Set Up Environment Variables

Create a `.env.production` file (DO NOT commit this):

```env
NODE_ENV=production
PORT=8080
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://YOUR_PROJECT_ID.appspot.com/api/auth/google/callback
GOOGLE_VISION_API_KEY=your_vision_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
FIRESTORE_DATABASE_ID=(default)
SESSION_SECRET=your_secure_random_secret
CLIENT_URL=https://YOUR_PROJECT_ID.appspot.com
```

## Step 3: Configure App Engine

The `app.yaml` file is already created. Review it and adjust if needed:

- `runtime: nodejs18` - Node.js version
- `instance_class: F2` - Instance size (F1 is free tier, F2 recommended for better performance)
- `automatic_scaling` - Auto-scaling configuration

## Step 4: Update OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://YOUR_PROJECT_ID.appspot.com/api/auth/google/callback
   ```
5. Save

## Step 5: Deploy to App Engine

### Option A: Deploy with Environment Variables in app.yaml

Update `app.yaml` to include your environment variables:

```yaml
env_variables:
  NODE_ENV: production
  PORT: 8080
  GOOGLE_CLIENT_ID: your_client_id
  GOOGLE_CLIENT_SECRET: your_client_secret
  GOOGLE_REDIRECT_URI: https://YOUR_PROJECT_ID.appspot.com/api/auth/google/callback
  GOOGLE_VISION_API_KEY: your_vision_api_key
  GOOGLE_GEMINI_API_KEY: your_gemini_api_key
  GOOGLE_PROJECT_ID: your_project_id
  FIRESTORE_DATABASE_ID: (default)
  SESSION_SECRET: your_secure_random_secret
  CLIENT_URL: https://YOUR_PROJECT_ID.appspot.com
```

**⚠️ Security Note**: For production, use [Secret Manager](https://cloud.google.com/secret-manager) instead of storing secrets in app.yaml.

### Option B: Use Secret Manager (Recommended for Production)

1. Create secrets:
   ```bash
   echo -n "your_client_secret" | gcloud secrets create google-client-secret --data-file=-
   echo -n "your_gemini_key" | gcloud secrets create google-gemini-key --data-file=-
   # ... etc
   ```

2. Grant App Engine access:
   ```bash
   gcloud secrets add-iam-policy-binding SECRET_NAME \
     --member="serviceAccount:YOUR_PROJECT_ID@appspot.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. Update code to read from Secret Manager (modify `server/index.js`)

### Deploy Command

```bash
# Make sure you're in the project root
gcloud app deploy app.yaml

# Follow prompts:
# - Confirm project: Y
# - Confirm service account: Y
```

## Step 6: Verify Deployment

1. Get your app URL:
   ```bash
   gcloud app browse
   ```

2. Visit the URL and test:
   - Login with Google
   - Upload a photo
   - Check analysis works
   - Verify Firestore data

## Step 7: View Logs

```bash
# Stream logs
gcloud app logs tail -s default

# Or view in console
# https://console.cloud.google.com/appengine/logs
```

## Step 8: Update Service Account for Firestore

App Engine uses a default service account. Ensure it has Firestore permissions:

1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find: `YOUR_PROJECT_ID@appspot.gserviceaccount.com`
3. Ensure it has:
   - **Cloud Datastore User** (for Firestore)
   - **Service Account User**

Or use your service account key file (upload to App Engine or use Secret Manager).

## Important Notes

### File Storage
- App Engine has a read-only filesystem
- Uploaded files should be stored in:
  - **Cloud Storage** (recommended)
  - **Firestore** (for metadata)
  - **Memory** (temporary only)

### Session Storage
- App Engine instances are stateless
- Use **Cloud Firestore** or **Cloud Memorystore (Redis)** for sessions
- Current code uses in-memory sessions (won't work across instances)

### Environment Variables
- Sensitive data should use Secret Manager
- Non-sensitive config can go in app.yaml

## Troubleshooting

### Build Failures
```bash
# Check build logs
gcloud app logs tail -s default

# Test locally
gcloud app deploy app.yaml --no-promote
```

### Runtime Errors
- Check logs: `gcloud app logs tail -s default`
- Verify environment variables are set
- Check API permissions
- Verify Firestore access

### OAuth Issues
- Verify redirect URI matches exactly
- Check OAuth consent screen
- Ensure APIs are enabled

## Cost Optimization

- Use F1 instance class for free tier
- Set `min_instances: 0` to scale to zero
- Monitor usage in Cloud Console
- Set up billing alerts

## Next Steps

1. Set up Cloud Storage for file uploads
2. Implement Redis/Memorystore for sessions
3. Set up monitoring and alerts
4. Configure custom domain (optional)
5. Set up CI/CD pipeline

