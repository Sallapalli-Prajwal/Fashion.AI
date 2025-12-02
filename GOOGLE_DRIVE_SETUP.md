# Google Drive API Setup

## What Changed

We've switched from Google Photos Picker API to **Google Drive API** to access photos. This is more reliable and easier to set up.

## Benefits

- ✅ More reliable (Drive API is well-established)
- ✅ No picker dialog needed - directly fetch photos
- ✅ Better error handling
- ✅ Works with photos stored in Google Drive

## Setup Steps

### Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in **outfit-vision** project
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Google Drive API"**
5. Click **ENABLE**

### Step 2: Update OAuth Scope (Already Done)

The code now uses:
```
https://www.googleapis.com/auth/drive.readonly
```

This scope allows read-only access to Google Drive files.

### Step 3: Re-authenticate (IMPORTANT!)

Since the scope changed, you MUST re-authenticate:

1. **Logout** from the app
2. **Clear browser cookies** for localhost (optional)
3. **Login again** - this will request the Drive API scope

### Step 4: Test

1. Go to Gallery page
2. Click "📁 Load from Google Drive"
3. Your photos from Google Drive should appear!

## How It Works

1. User clicks "Load from Google Drive"
2. Backend fetches image files from Google Drive using Drive API
3. Photos are displayed in the gallery
4. User can select and analyze them

## What Photos Are Loaded?

The app will fetch:
- All image files from your Google Drive
- Sorted by creation date (newest first)
- Excludes trashed files
- Includes thumbnails for quick loading

## Requirements

- ✅ Google Drive API enabled
- ✅ OAuth scope: `drive.readonly`
- ✅ Re-authenticated to get new scope
- ✅ Photos stored in Google Drive (not just Google Photos)

## Notes

- Photos must be in **Google Drive** (not just Google Photos)
- If you want Google Photos specifically, you'd need to upload them to Drive first
- The app searches for files with `mimeType contains 'image/'`

## Troubleshooting

### No photos showing?
- Make sure you have image files in Google Drive
- Check that Drive API is enabled
- Verify you re-authenticated after enabling Drive API

### 403 Error?
- Make sure Drive API is enabled
- Re-authenticate to get fresh token with Drive scope
- Check OAuth consent screen has `drive.readonly` scope

