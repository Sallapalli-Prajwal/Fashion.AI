# Troubleshoot VITE_GOOGLE_API_KEY Not Loading

## Common Issues

### Issue 1: .env File in Wrong Location

The `.env` file must be in the **ROOT directory** (same folder as `package.json`), NOT in the `client/` folder.

**Correct structure:**
```
outfit-vision/
├── .env              ← HERE (root directory)
├── package.json
├── client/
│   ├── src/
│   └── package.json
└── server/
```

**Wrong structure:**
```
outfit-vision/
├── package.json
├── client/
│   ├── .env         ← WRONG LOCATION
│   └── src/
```

### Issue 2: Variable Name Must Start with VITE_

Vite only exposes environment variables that start with `VITE_`.

**Correct:**
```env
VITE_GOOGLE_API_KEY=your_key_here
```

**Wrong:**
```env
GOOGLE_API_KEY=your_key_here          # Won't work
REACT_APP_GOOGLE_API_KEY=your_key     # Won't work (this is for Create React App)
```

### Issue 3: Server Not Restarted

After adding to `.env`, you MUST restart:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue 4: Browser Cache

Clear browser cache or do hard refresh:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

## Step-by-Step Fix

### Step 1: Verify .env File Location

1. Open your project root folder
2. Check if `.env` is in the same folder as `package.json`
3. If it's in `client/` folder, move it to root

### Step 2: Check Variable Name

Open `.env` and verify:
```env
VITE_GOOGLE_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8
```

**Important:**
- No spaces around `=`
- No quotes (unless value has spaces)
- Must start with `VITE_`
- Case-sensitive

### Step 3: Restart Dev Server

1. **Stop** the server completely (Ctrl+C)
2. **Wait** a few seconds
3. **Start** again: `npm run dev`
4. **Wait** for both client and server to start

### Step 4: Hard Refresh Browser

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or press `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)

### Step 5: Check in Browser Console

Open browser console (F12) and type:
```javascript
import.meta.env.VITE_GOOGLE_API_KEY
```

**Expected:** Should show your API key
**If undefined:** Environment variable not loaded

## Debug Steps

1. **Check .env file exists in root:**
   ```bash
   # In root directory
   ls -la | grep .env
   # Should show .env
   ```

2. **Check variable is in .env:**
   ```bash
   # In root directory
   grep VITE_GOOGLE_API_KEY .env
   # Should show the line
   ```

3. **Check Vite is reading it:**
   - Look at terminal when starting `npm run dev`
   - Should not show any errors about .env

4. **Check browser console:**
   - After clicking "Pick from Google Photos"
   - Look for "Environment check:" log
   - Should show `hasApiKey: true`

## Alternative: Use .env.local

If `.env` doesn't work, try `.env.local`:
1. Create `.env.local` in root directory
2. Add: `VITE_GOOGLE_API_KEY=your_key`
3. Restart server

## Still Not Working?

1. **Check for typos:**
   - Variable name: `VITE_GOOGLE_API_KEY` (exact)
   - File name: `.env` (with dot at start)

2. **Try different approach:**
   - Create `.env.local` instead of `.env`
   - Restart server

3. **Verify API key is valid:**
   - Check it's not expired
   - Verify it's from the correct Google Cloud project

4. **Check terminal output:**
   - When starting server, look for any errors
   - Vite should load .env silently

## Quick Test

After fixing, click "Pick from Google Photos" and check browser console. You should see:
```
Environment check: {
  hasApiKey: true,
  apiKeyPrefix: "AIzaSyBa-n...",
  allEnvKeys: ["VITE_GOOGLE_API_KEY", ...]
}
```

If `hasApiKey: false`, the variable is still not loading.

