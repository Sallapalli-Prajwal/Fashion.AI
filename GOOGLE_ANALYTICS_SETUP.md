# Google Analytics Setup Guide for OutfitVision

This guide will walk you through setting up Google Analytics (GA4) for your OutfitVision project.

## Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Start measuring"** or **"Create Account"**
3. Fill in your account details:
   - Account name: `OutfitVision` (or your preferred name)
   - Click **"Next"**

## Step 2: Create a Property

1. Enter property details:
   - Property name: `OutfitVision Web App`
   - Reporting time zone: Choose your timezone
   - Currency: Choose your currency
2. Click **"Next"**

## Step 3: Configure Business Information

1. Select your industry category: `Technology` or `Fashion`
2. Select business size: Choose appropriate size
3. Select how you intend to use Google Analytics: Select relevant options
4. Click **"Create"**
5. Accept the Terms of Service

## Step 4: Set Up Data Stream

1. Choose platform: **Web**
2. Enter your website details:
   - Website URL: `https://outfit-vision-4018057728.us-central1.run.app` (your Cloud Run URL)
   - Stream name: `OutfitVision Production` (or your preferred name)
3. Click **"Create stream"**

## Step 5: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID**
   - Format: `G-XXXXXXXXXX` (starts with G-)
2. **Copy this Measurement ID** - you'll need it in the next step

## Step 6: Add Measurement ID to Your Project

### Option A: Environment Variable (Recommended for Production)

1. Add to your Cloud Run environment variables:
   ```bash
   gcloud run services update outfit-vision \
     --region=us-central1 \
     --update-env-vars VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID.

2. Or add it via Google Cloud Console:
   - Go to Cloud Run → outfit-vision service
   - Edit & Deploy New Revision
   - Variables & Secrets → Add Variable
   - Name: `VITE_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX`

### Option B: Local Development (.env file)

1. Create or edit `.env` file in the `client` directory:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_ENABLE_GA=true
   ```

2. For local development, you can also add it to root `.env`:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_ENABLE_GA=true
   ```

## Step 7: Rebuild and Redeploy

After adding the environment variable:

1. **For Production (Cloud Run):**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml .
   ```

2. **For Local Development:**
   ```bash
   cd client
   npm run dev
   ```

## Step 8: Verify Installation

1. Open your deployed app in a browser
2. Open browser DevTools → Network tab
3. Look for requests to `google-analytics.com` or `googletagmanager.com`
4. Go to Google Analytics → Reports → Realtime
5. You should see active users if someone is on your site

## Step 9: Test Event Tracking

The following events are automatically tracked:

### Authentication Events
- `login` - When user logs in via Google OAuth
- `logout` - When user logs out

### Photo Events
- `photo_uploaded` - When user uploads a photo
- `photo_selected` - When user selects a photo from Google Photos

### Analysis Events
- `analysis_started` - When outfit analysis begins
- `analysis_completed` - When analysis finishes (includes style category)
- `analysis_failed` - When analysis fails (includes error info)

### Navigation Events
- Page views are automatically tracked on route changes

### User Engagement Events
- `outfit_viewed` - When user views a specific outfit
- `outfit_deleted` - When user deletes an outfit
- `gallery_opened` - When user opens gallery
- `analytics_opened` - When user opens analytics page
- `profile_opened` - When user opens profile

## Step 10: View Your Data

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Navigate to:
   - **Reports → Realtime** - See live activity
   - **Reports → Engagement → Events** - See all tracked events
   - **Reports → Acquisition** - See how users find your site
   - **Reports → Engagement → Pages and screens** - See page views

## Custom Event Tracking

To add custom event tracking in your components:

```javascript
import { analytics } from '../utils/analytics';

// Track a custom event
analytics.trackEvent('custom_event_name', {
  custom_parameter: 'value',
  another_param: 123
});

// Or use predefined functions
analytics.photoUploaded('google_drive');
analytics.analysisCompleted('casual');
```

## Troubleshooting

### Analytics not working?

1. **Check Measurement ID:**
   - Verify `VITE_GA_MEASUREMENT_ID` is set correctly
   - Format should be `G-XXXXXXXXXX`

2. **Check Browser Console:**
   - Look for errors related to Google Analytics
   - Check if gtag is loaded: `console.log(window.gtag)`

3. **Check Network Tab:**
   - Look for requests to `googletagmanager.com`
   - Check if requests are being blocked by ad blockers

4. **Development Mode:**
   - Analytics only runs in production by default
   - To enable in dev, set `VITE_ENABLE_GA=true` in `.env`

5. **Ad Blockers:**
   - Some ad blockers prevent Google Analytics
   - Test in incognito mode or disable ad blockers

### Events not showing up?

1. Wait 24-48 hours for data to appear in standard reports
2. Check Realtime reports for immediate verification
3. Verify events are being sent (check Network tab for GA requests)

## Privacy Considerations

- Google Analytics collects user data
- Consider adding a privacy policy
- For GDPR compliance, you may need cookie consent
- You can disable analytics for specific users if needed

## Next Steps

1. Set up custom dashboards in Google Analytics
2. Create conversion goals (e.g., "outfit analyzed")
3. Set up email reports
4. Configure audience segments
5. Set up data retention policies

## Files Modified

- `client/src/utils/analytics.js` - Analytics utility functions
- `client/src/main.jsx` - Initializes GA on app load
- `client/src/App.jsx` - Tracks page views and auth events

## Environment Variables

- `VITE_GA_MEASUREMENT_ID` - Your Google Analytics Measurement ID (required)
- `VITE_ENABLE_GA` - Set to `true` to enable GA in development (optional)

---

**Need Help?** Check the [Google Analytics Help Center](https://support.google.com/analytics)

