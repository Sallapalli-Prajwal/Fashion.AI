# Debug Outfits Not Appearing

## Steps to Debug

### 1. Check Browser Console
After analyzing a photo, open browser console (F12) and look for:
- `📦 Storing outfit data:` - Should show the data being saved
- `✅ Outfit stored successfully with ID:` - Should show the document ID
- `📥 Fetching outfits for user:` - Should show when loading Dashboard/Profile
- `✅ Retrieved X outfits` - Should show how many outfits were found

### 2. Check Server Logs
In your terminal where `npm run dev` is running, look for:
- `📦 Storing outfit data:` - Confirms data is being saved
- `✅ Outfit stored successfully with ID:` - Confirms save was successful
- `📥 Fetching outfits for user:` - Confirms retrieval attempt
- `✅ Retrieved X outfits` - Shows how many were found

### 3. Verify Firestore
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (outfit-vision)
3. Go to Firestore Database
4. Check if data exists:
   - Collection: `users`
   - Document: `{userId}` (your user ID)
   - Subcollection: `outfits`
   - Should see documents with your analyzed outfits

### 4. Check Data Format
In Firestore, verify the outfit document has:
- `photoURL`: Should be `drive-{fileId}` for Drive photos
- `driveFileId`: Should contain the Drive file ID
- `styleCategory`: Should have a value
- `processedAt`: Should be a timestamp

### 5. Common Issues

**Issue 1: No data in Firestore**
- Check if Firestore is initialized correctly
- Check service account credentials
- Look for errors in server logs

**Issue 2: Data exists but not showing**
- Check if `userId` matches in session
- Verify the query is correct
- Check browser console for errors

**Issue 3: Wrong photoURL format**
- Should be `drive-{fileId}` for Drive photos
- Check if it matches when retrieving

### 6. Test Manually

In browser console (F12), try:
```javascript
// Check if outfits are being fetched
fetch('http://localhost:3001/api/records')
  .then(r => r.json())
  .then(d => console.log('Outfits:', d))
```

Should return:
```json
{
  "success": true,
  "count": 1,
  "outfits": [...]
}
```

## Quick Fixes

1. **Refresh Dashboard/Profile** - Sometimes data needs refresh
2. **Check userId** - Make sure you're logged in with same account
3. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
4. **Restart server** - Sometimes helps with session issues

