# Fix Firestore Credentials Error

## The Problem
You're getting: `Could not load the default credentials` when trying to access Firestore.

## Solution

### Step 1: Verify Service Account File Location
Your `service-account-key.json` should be in the **root directory** (same folder as `package.json`).

### Step 2: Update .env File
Make sure your `.env` file has:

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GOOGLE_PROJECT_ID=outfit-vision
```

**Important**: 
- Use `./service-account-key.json` (relative path from root)
- Or use absolute path: `C:\Users\prajw\OneDrive\Desktop\outfit-vision\service-account-key.json`

### Step 3: Verify File Exists
Check that the file exists:
```bash
# In root directory
dir service-account-key.json
# or
ls service-account-key.json
```

### Step 4: Restart Server
After updating `.env`, restart your server:
```bash
npm run dev
```

### Step 5: Test
The server should now show:
```
✅ Loaded service account credentials from: [path]
✅ Firestore client initialized with service account
```

## Alternative: Use Absolute Path

If relative path doesn't work, use absolute path in `.env`:

**Windows:**
```env
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\prajw\OneDrive\Desktop\outfit-vision\service-account-key.json
```

**Linux/Mac:**
```env
GOOGLE_APPLICATION_CREDENTIALS=/full/path/to/service-account-key.json
```

## Verify It's Working

After restarting, check the server logs. You should see:
- ✅ `Loaded service account credentials from: ...`
- ✅ `Firestore client initialized with service account`

If you still see errors, check:
1. File path is correct in `.env`
2. File exists at that location
3. File is valid JSON (not corrupted)
4. Server was restarted after changing `.env`

