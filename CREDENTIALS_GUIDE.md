# Credentials Guide - OAuth vs Service Account

## Two Different Types of Credentials Needed

### 1. OAuth 2.0 Client ID (for User Authentication)
**Purpose**: Allow users to sign in with their Google account and access Google Photos

**Where to get it**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
4. Application type: **Web application**
5. Name: `OutfitVision OAuth Client`
6. **Authorized redirect URIs**: 
   ```
   http://localhost:3001/api/auth/google/callback
   ```
7. Click **CREATE**
8. Copy **Client ID** and **Client Secret**

**Add to .env**:
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz123
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

### 2. Service Account (for Firestore/Backend Services)
**Purpose**: Allow your backend to access Firestore without user authentication

**You already have this!** The JSON file you showed is a service account.

**How to use it**:
1. Save the JSON file as `service-account-key.json` in the root directory
2. Add to `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   ```

**OR** use the service account email and project ID directly in Firestore initialization.

## Quick Setup Steps

### Step 1: Create OAuth Client ID
1. Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Copy Client ID and Client Secret

### Step 2: Save Service Account
1. Save your service account JSON as `service-account-key.json`
2. Place it in the root directory (same level as `package.json`)
3. Add to `.gitignore` to keep it secure

### Step 3: Update .env File
```env
# OAuth Credentials (for user login)
GOOGLE_CLIENT_ID=your_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_oauth_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Service Account (for Firestore)
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GOOGLE_PROJECT_ID=outfit-vision

# API Keys
GOOGLE_VISION_API_KEY=your_vision_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Firestore
FIRESTORE_DATABASE_ID=(default)

# Other
SESSION_SECRET=your_random_secret_here
CLIENT_URL=http://localhost:5173
```

## Important Notes

- **OAuth Client ID** = For users to sign in
- **Service Account** = For backend to access Firestore
- **API Keys** = For Vision and Gemini APIs

All three are different and serve different purposes!

