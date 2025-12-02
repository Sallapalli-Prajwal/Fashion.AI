# Restart Dev Server After Adding Environment Variable

## The Issue
You've added `VITE_GOOGLE_API_KEY` to `.env`, but Vite needs to be restarted to load it.

## Solution: Restart Dev Server

### Step 1: Stop the Current Server
1. Go to your terminal where `npm run dev` is running
2. Press **Ctrl+C** to stop it

### Step 2: Start It Again
```bash
npm run dev
```

### Step 3: Refresh Browser
1. Go to your browser
2. Press **F5** or **Ctrl+R** to refresh
3. Try the picker again

## Why This Is Needed

- Vite reads `.env` file when it starts
- New environment variables are only loaded on startup
- Restarting ensures Vite picks up `VITE_GOOGLE_API_KEY`

## Verify It's Loaded

After restarting, you can check in browser console:
```javascript
console.log(import.meta.env.VITE_GOOGLE_API_KEY)
```

It should show your API key (not `undefined`).

## Quick Checklist

- [x] `VITE_GOOGLE_API_KEY` added to `.env` ✅
- [ ] Dev server restarted
- [ ] Browser refreshed
- [ ] Tested picker

## Still Not Working?

1. **Check `.env` file location**:
   - Should be in **root directory** (same folder as `package.json`)
   - Not in `client/` folder

2. **Check variable name**:
   - Must start with `VITE_` for Vite to expose it
   - Case-sensitive: `VITE_GOOGLE_API_KEY` (not `vite_google_api_key`)

3. **Check for typos**:
   - No spaces around `=`
   - No quotes needed (unless value has spaces)

4. **Verify in browser console**:
   - Open DevTools (F12)
   - Console tab
   - Type: `import.meta.env.VITE_GOOGLE_API_KEY`
   - Should show your API key

