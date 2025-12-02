# Fix Vite Environment Variable Loading

## The Problem
Your `.env` file is in the root directory, but Vite runs from the `client/` directory, so it might not find it.

## Solution Applied
I've updated `client/vite.config.js` to explicitly tell Vite to look for `.env` in the parent directory (root).

## What You Need to Do

### Step 1: Restart Dev Server
**IMPORTANT**: After the config change, you MUST restart:

1. **Stop** the server (Ctrl+C)
2. **Start** again: `npm run dev`

### Step 2: Hard Refresh Browser
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
   - Or press `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)

### Step 3: Check Browser Console
After clicking "Pick from Google Photos", check the console for:
```
Environment check: {
  hasApiKey: true,
  apiKeyPrefix: "AIzaSyBa-n...",
  ...
}
```

## Alternative: Create .env in Client Directory

If the above doesn't work, you can also create a `.env` file in the `client/` directory:

1. Create `client/.env` file
2. Add: `VITE_GOOGLE_API_KEY=AIzaSyBa-nNg3zXhfPeeWAdli2f_fjSZYNWLZt8`
3. Restart server

## Verify It's Working

In browser console (F12), type:
```javascript
import.meta.env.VITE_GOOGLE_API_KEY
```

Should show your API key (not `undefined`).

## Quick Checklist

- [x] `.env` in root directory ✅
- [x] `VITE_GOOGLE_API_KEY` in .env ✅
- [x] Vite config updated to read from root ✅
- [ ] Dev server restarted
- [ ] Browser hard refreshed
- [ ] Tested picker

