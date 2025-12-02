# Google Photos Picker Setup

## What Changed

Instead of fetching all photos via API, the app now uses **Google Photos Picker** - a dialog that lets users select specific photos from their Google Photos account.

## Benefits

- ✅ No need for Photos Library API (only Picker API)
- ✅ Users select only the photos they want
- ✅ Better user experience
- ✅ No 403 scope errors

## Setup Steps

### 1. Enable Google Photos Picker API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Photos Picker API" (not Photos Library API)
4. Click **ENABLE**

### 2. Update OAuth Scopes (Already Done)

The OAuth scope is already set to:
```
https://www.googleapis.com/auth/photoslibrary.readonly
```

This works for both Picker and Library API.

### 3. Optional: Add API Key (Optional)

If you want additional features, you can add an API key:

1. Go to **APIs & Services** > **Credentials**
2. Create or use an existing API Key
3. Add to `.env`:
   ```env
   REACT_APP_GOOGLE_API_KEY=your_api_key_here
   ```

**Note**: API key is optional - the picker works without it.

### 4. Re-authenticate

1. **Logout** from the app
2. **Login again** to get fresh OAuth token
3. The picker will now work!

## How It Works

1. User clicks "📷 Pick from Google Photos" button
2. Google Photos Picker dialog opens
3. User selects photos they want
4. Selected photos appear in the gallery
5. User can analyze selected photos

## Troubleshooting

### Picker doesn't open
- Check browser console for errors
- Make sure you're logged in (OAuth token exists)
- Verify Photos Picker API is enabled
- Try refreshing the page

### "Please connect your Google account"
- Logout and login again
- Check OAuth token endpoint works: `http://localhost:3001/api/auth/token`

### Picker loads but shows error
- Check OAuth scopes include `photoslibrary.readonly`
- Verify you're using the correct Google account
- Make sure Photos Picker API is enabled (not just Photos Library API)

## Differences from Before

| Before (Photos Library API) | Now (Photos Picker) |
|----------------------------|---------------------|
| Fetches all photos automatically | User selects photos via dialog |
| Requires Photos Library API | Requires Photos Picker API |
| Shows all photos in gallery | Shows only selected photos |
| 403 errors if scopes wrong | Works with readonly scope |

## API Endpoints

- `GET /api/auth/token` - Get OAuth token for picker (already exists)
- `POST /api/photos/upload` - Upload local photos (still works)
- `GET /api/photos` - No longer used (returns empty array)

The picker works entirely client-side using Google's JavaScript API!

