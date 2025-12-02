# Update OAuth Scope for Photos Picker

## The Issue
The code was using `photoslibrary.readonly` scope, but Photos Picker API requires `photospicker.mediaitems.readonly` scope.

## What Changed
Updated the OAuth scope in `server/routes/auth.js` from:
- ❌ `https://www.googleapis.com/auth/photoslibrary.readonly`

To:
- ✅ `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`

## What You Need to Do

### Step 1: Verify OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > OAuth consent screen
3. Make sure `https://www.googleapis.com/auth/photospicker.mediaitems.readonly` is in the scopes list
4. If not, add it and save

### Step 2: Re-authenticate (CRITICAL!)
Since the scope changed, you MUST re-authenticate:

1. **Logout** from the app
2. **Clear browser cookies** for localhost (recommended)
3. **Login again** - this will request the NEW scope

### Step 3: Test
1. Go to Gallery page
2. Click "📷 Pick from Google Photos"
3. Should work now!

## Why This Matters

- `photoslibrary.readonly` - For Photos Library API (fetching all photos)
- `photospicker.mediaitems.readonly` - For Photos Picker API (selecting photos via dialog)

These are different scopes for different APIs!

## Quick Checklist

- [x] Code updated to use `photospicker.mediaitems.readonly`
- [ ] OAuth consent screen has `photospicker.mediaitems.readonly` scope
- [ ] Photos Picker API is enabled
- [ ] Logged out from app
- [ ] Logged in again (to get new scope)
- [ ] Tested picker

