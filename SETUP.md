# OutfitVision Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Project with the following APIs enabled:
  - Google Photos Library API
  - Cloud Vision API
  - Gemini API
  - Firestore API

## Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

## Step 2: Configure Google Cloud

### 2.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click **Create Credentials** > **OAuth client ID**
4. Choose **Web application**
5. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Save the **Client ID** and **Client Secret**

### 2.2 Get API Keys

1. **Vision API Key:**
   - Go to **APIs & Services** > **Credentials**
   - Create API Key (or use existing)
   - Restrict it to Vision API

2. **Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API Key

### 2.3 Set Up Firestore

1. Go to **Firestore Database** in Google Cloud Console
2. Create database (Native mode)
3. Note your **Project ID** and **Database ID** (usually "(default)")

## Step 3: Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

GOOGLE_VISION_API_KEY=your_vision_api_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PROJECT_ID=your_project_id_here

FIRESTORE_DATABASE_ID=(default)
SESSION_SECRET=generate_a_random_string_here
```

## Step 4: Run the Application

### Development Mode (Both Server and Client)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- React frontend on `http://localhost:5173`

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Step 5: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Connect with Google Photos"
3. Authorize the application
4. You should be redirected to the dashboard
5. Go to Gallery to see your photos or upload a local photo
6. Select photos and click "Analyze" to process them

## Troubleshooting

### OAuth Issues
- Make sure redirect URI matches exactly in Google Cloud Console
- Check that Google Photos Library API is enabled
- Verify client ID and secret are correct

### Vision API Issues
- Ensure Vision API is enabled in your project
- Check API key restrictions
- Verify billing is enabled (Vision API requires billing)

### Gemini API Issues
- Get API key from Google AI Studio
- Check API key is valid
- Ensure Gemini API is enabled in your project

### Firestore Issues
- Verify Firestore is created in Native mode
- Check project ID is correct
- Ensure Firestore API is enabled

### CORS Issues
- Make sure `CLIENT_URL` in `.env` matches your frontend URL
- Check CORS settings in `server/index.js`

## Production Deployment

### Deploy to Google Cloud Run

1. Build the client:
```bash
cd client
npm run build
cd ..
```

2. Create `Dockerfile` (see deployment guide)

3. Deploy to Cloud Run:
```bash
gcloud run deploy outfit-vision --source .
```

### Environment Variables in Production

Set environment variables in Cloud Run:
- Go to Cloud Run service
- Edit & Deploy New Revision
- Add environment variables
- Deploy

## Project Structure

```
outfit-vision/
├── server/              # Express backend
│   ├── index.js        # Main server
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── middleware/     # Middleware functions
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   └── pages/      # Page components
│   └── package.json
├── logs/               # Application logs (created automatically)
├── uploads/            # Uploaded files (created automatically)
└── package.json       # Root package.json
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/auth/google` - Initiate OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/status` - Check auth status
- `POST /api/auth/logout` - Logout
- `GET /api/photos` - Get photos from Google Photos
- `POST /api/photos/upload` - Upload local photo
- `POST /api/analyze` - Analyze single photo
- `POST /api/analyze/batch` - Analyze multiple photos
- `GET /api/records` - Get outfit records
- `DELETE /api/records/:id` - Delete record
- `GET /api/stats` - Get statistics
- `GET /api/stats/recommendations` - Get AI recommendations

## Next Steps

1. Set up GitHub repository
2. Create GitHub Issues for each component
3. Set up CI/CD pipeline
4. Add unit tests
5. Create documentation wiki
6. Prepare presentation

