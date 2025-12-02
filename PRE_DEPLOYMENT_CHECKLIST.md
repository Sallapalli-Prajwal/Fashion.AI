# Pre-Deployment Checklist

## ✅ Before Deploying to App Engine

### 1. Environment Setup
- [ ] Google Cloud SDK installed (`gcloud --version`)
- [ ] Authenticated with Google Cloud (`gcloud auth login`)
- [ ] Project set (`gcloud config set project YOUR_PROJECT_ID`)
- [ ] Billing enabled for your project

### 2. APIs Enabled
Run these commands:
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable generativelanguage.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable storage-component.googleapis.com  # For file uploads
```

### 3. Build Frontend
```bash
cd client
npm install
npm run build
cd ..
```
- [ ] Frontend builds successfully
- [ ] `client/dist` folder exists

### 4. Environment Variables
Update `app.yaml` with your environment variables OR use Secret Manager:

**Required Variables:**
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI` (must be: `https://YOUR_PROJECT_ID.appspot.com/api/auth/google/callback`)
- [ ] `GOOGLE_VISION_API_KEY`
- [ ] `GOOGLE_GEMINI_API_KEY`
- [ ] `GOOGLE_PROJECT_ID`
- [ ] `SESSION_SECRET` (generate a secure random string)
- [ ] `CLIENT_URL` (your App Engine URL)

**Optional:**
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` (if using service account file)
- [ ] `FIRESTORE_DATABASE_ID` (default: `(default)`)

### 5. OAuth Configuration
- [ ] OAuth consent screen configured
- [ ] Authorized redirect URI added: `https://YOUR_PROJECT_ID.appspot.com/api/auth/google/callback`
- [ ] Test users added (if app is in testing mode)

### 6. Firestore Setup
- [ ] Firestore database created
- [ ] Database mode: Native mode (not Datastore mode)
- [ ] Service account has Firestore permissions

### 7. File Storage (Important!)
⚠️ **App Engine has a read-only filesystem!**

You need to handle file uploads differently:
- [ ] Option A: Use Cloud Storage (recommended)
- [ ] Option B: Store files temporarily in memory
- [ ] Option C: Use a different service for file storage

**Current code stores files locally** - this won't work on App Engine!

### 8. Session Storage (Important!)
⚠️ **App Engine instances are stateless!**

Current code uses in-memory sessions - won't work across instances:
- [ ] Option A: Use Firestore for sessions
- [ ] Option B: Use Cloud Memorystore (Redis)
- [ ] Option C: Use signed cookies (less secure)

### 9. Code Review
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] `service-account-key.json` not committed
- [ ] Production-ready error handling
- [ ] CORS configured correctly

### 10. Testing
- [ ] Test locally: `npm run dev`
- [ ] Test build: `npm run build`
- [ ] Test server: `npm start`
- [ ] All features work locally

## 🚀 Deployment Steps

1. **Build frontend:**
   ```bash
   cd client && npm run build && cd ..
   ```

2. **Update app.yaml:**
   - Add your environment variables
   - Or configure Secret Manager

3. **Deploy:**
   ```bash
   gcloud app deploy app.yaml
   ```

4. **Verify:**
   ```bash
   gcloud app browse
   ```

## ⚠️ Critical Issues to Fix Before Deployment

### Issue 1: File Uploads
**Problem:** Code saves files to `uploads/` directory, but App Engine filesystem is read-only.

**Solution Options:**
1. **Use Cloud Storage** (recommended):
   - Create a Cloud Storage bucket
   - Upload files to bucket
   - Serve files from bucket URLs

2. **Store in Firestore:**
   - Convert images to base64
   - Store in Firestore (limited size)

3. **Use Cloud Run instead:**
   - Cloud Run supports writable filesystem
   - Better for file uploads

### Issue 2: Session Storage
**Problem:** In-memory sessions won't persist across App Engine instances.

**Solution Options:**
1. **Use Firestore for sessions:**
   - Store session data in Firestore
   - Use session ID as document ID

2. **Use signed cookies:**
   - Store minimal data in cookies
   - Less secure but simpler

3. **Use Cloud Memorystore:**
   - Redis-compatible session store
   - More complex setup

## 📝 Recommended: Use Cloud Run Instead

For this application, **Cloud Run might be better** because:
- ✅ Supports writable filesystem
- ✅ Better for file uploads
- ✅ More flexible
- ✅ Easier to configure

See `DEPLOYMENT.md` for Cloud Run deployment.

## 🔒 Security Checklist

- [ ] No secrets in `app.yaml` (use Secret Manager)
- [ ] HTTPS only enabled
- [ ] CORS configured correctly
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info

## 📊 After Deployment

- [ ] Test OAuth login
- [ ] Test photo upload
- [ ] Test analysis
- [ ] Check Firestore data
- [ ] Monitor logs: `gcloud app logs tail -s default`
- [ ] Set up billing alerts
- [ ] Configure monitoring

