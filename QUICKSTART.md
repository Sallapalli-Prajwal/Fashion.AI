# Quick Start Guide

## 1. Install Dependencies

```bash
npm run install-all
```

## 2. Set Up Environment

1. Copy `.env.example` to `.env`
2. Fill in your Google Cloud credentials (see SETUP.md for details)

## 3. Run Development Server

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 5173).

## 4. Open Application

Navigate to: `http://localhost:5173`

## 5. Connect Google Photos

1. Click "Connect with Google Photos"
2. Authorize the application
3. You'll be redirected to the dashboard

## 6. Analyze Photos

### Option A: From Google Photos
1. Go to Gallery
2. Select photos
3. Click "Analyze Selected"

### Option B: Upload Local Photo
1. Go to Gallery
2. Click "Upload Photo"
3. Select an image file
4. It will be analyzed automatically

## 7. View Results

- **Dashboard**: Overview of your style
- **Analytics**: Charts and AI recommendations
- **Profile**: Full history of analyzed outfits

## Troubleshooting

- **OAuth not working**: Check redirect URI in Google Cloud Console
- **API errors**: Verify API keys in `.env`
- **Photos not loading**: Ensure Google Photos API is enabled
- **Analysis fails**: Check Vision and Gemini API keys

For detailed setup, see `SETUP.md`

