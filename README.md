# Fashion.AI

> AI-Powered Outfit Analysis Platform

Previously known as OutfitVision - A Single Page Application (SPA) that analyzes outfit photos using Google Vision API and Google Gemini API, providing style insights and recommendations.

A Single Page Application (SPA) that analyzes outfit photos using Google Vision API and Google Gemini API, providing style insights and recommendations.

## Features

- **Google Photos Integration**: Connect your Google Photos account via OAuth
- **Local Photo Upload**: Upload photos directly from your device
- **AI Analysis**: 
  - Google Vision API for clothing detection, colors, and patterns
  - Google Gemini API for style categorization and personalized recommendations
- **Data Persistence**: Store analysis results in Google Firestore
- **Analytics Dashboard**: View style trends, color frequency, and outfit insights

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Express.js / Node.js
- **Cloud Services**: 
  - Google Cloud Run (deployment)
  - Google Firestore (database)
  - Google Vision API
  - Google Gemini API
  - Google Photos API

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Create `.env` file in root directory:
```
PORT=3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
GOOGLE_VISION_API_KEY=your_vision_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PROJECT_ID=your_project_id
FIRESTORE_DATABASE_ID=your_database_id
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

3. Run development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173` (React) and `http://localhost:3001` (API)

## Project Structure

```
outfit-vision/
├── server/           # Express backend
│   ├── index.js      # Main server file
│   ├── routes/       # API routes
│   ├── services/     # Business logic (Vision, Gemini, Firestore)
│   └── middleware/   # Auth, logging, etc.
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── package.json      # Root package.json
```

## Deployment

Deploy to Google Cloud Run following Google Cloud documentation.

