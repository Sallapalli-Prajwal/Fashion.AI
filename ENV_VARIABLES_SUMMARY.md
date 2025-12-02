# Environment Variables Summary

## 📁 Local `.env` File (Development)

```
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# OAuth Credentials
GOOGLE_CLIENT_ID=4018057728-701dtrm2t5uub7epeabcqch64s8on1bn.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# API Keys
GOOGLE_VISION_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8
GOOGLE_GEMINI_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8

# Project Configuration
GOOGLE_PROJECT_ID=outfit-vision
FIRESTORE_DATABASE_ID=(default)
SESSION_SECRET=geethagirish

# Service Account
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Frontend (Vite)
VITE_GOOGLE_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8
```

## ☁️ Cloud Run Environment Variables (Production)

```
NODE_ENV=production
CLIENT_URL=https://outfit-vision-4018057728.us-central1.run.app
GOOGLE_REDIRECT_URI=https://outfit-vision-4018057728.us-central1.run.app/api/auth/google/callback
GOOGLE_PROJECT_ID=outfit-vision
FIRESTORE_DATABASE_ID=(default)
SESSION_SECRET=h65hGuZFmiWO0kdCs9HQVTgrTkKSsqcf0uJR9kRTDiQ=
```

## ⚠️ Missing in Cloud Run

The following variables are **NOT set** in Cloud Run (they need to be added):

- ❌ `GOOGLE_CLIENT_ID` - Missing
- ❌ `GOOGLE_CLIENT_SECRET` - Missing
- ❌ `GOOGLE_VISION_API_KEY` - Missing
- ❌ `GOOGLE_GEMINI_API_KEY` - Missing

## 🔧 Service Account Info

- **Project ID**: outfit-vision
- **Service Account Email**: firebase-adminsdk-fbsvc@outfit-vision.iam.gserviceaccount.com
- **File**: `service-account-key.json` (exists locally)

## 📝 Next Steps

To add the missing credentials to Cloud Run, run:

```powershell
gcloud run services update outfit-vision --region us-central1 --update-env-vars "GOOGLE_CLIENT_ID=4018057728-701dtrm2t5uub7epeabcqch64s8on1bn.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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,GOOGLE_VISION_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8,GOOGLE_GEMINI_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8"
```

Or use the script:
```powershell
.\ADD_CREDENTIALS.ps1
```

