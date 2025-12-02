# Google Analytics Quick Start

## Quick Setup (3 Steps)

### 1. Get Your Measurement ID
- Go to [Google Analytics](https://analytics.google.com/)
- Create account → Create property → Create web stream
- Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Add to Cloud Run
```bash
gcloud run services update outfit-vision \
  --region=us-central1 \
  --update-env-vars VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Redeploy
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

**Done!** Analytics will start tracking automatically.

---

## What's Being Tracked

✅ **Page Views** - All route changes  
✅ **Login/Logout** - Authentication events  
✅ **Photo Actions** - Uploads, selections  
✅ **Analysis Events** - Started, completed, failed  
✅ **User Engagement** - Gallery, analytics, profile views  

---

## Files Added/Modified

- ✅ `client/src/utils/analytics.js` - Analytics utility
- ✅ `client/src/main.jsx` - Initializes GA
- ✅ `client/src/App.jsx` - Tracks page views & auth
- ✅ `client/src/pages/Dashboard.jsx` - Tracks dashboard views
- ✅ `client/src/pages/Gallery.jsx` - Tracks gallery views
- ✅ `client/src/pages/Analytics.jsx` - Tracks analytics views
- ✅ `client/src/pages/Profile.jsx` - Tracks profile views

---

## Verify It's Working

1. Open your app in browser
2. Open DevTools → Network tab
3. Look for requests to `googletagmanager.com`
4. Go to GA → Realtime reports
5. You should see active users!

---

For detailed setup, see `GOOGLE_ANALYTICS_SETUP.md`

