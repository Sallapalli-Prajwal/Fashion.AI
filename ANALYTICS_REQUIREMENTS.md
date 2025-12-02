# CS651 Project 2 - Analytics Requirements & Implementation

## Project Requirements Summary

Based on the CS651 Project 2 requirements, here's what analytics are needed:

### 1. **API Call Logging (Required)**
   - **Requirement**: "LOG all calls to APIs"
   - **APIs to Log**:
     - Google Vision API calls
     - Google Gemini API calls
     - Social Network X API calls (Google Photos/Drive)
     - Firestore Database operations
   - **What to Log**:
     - Request details (URL, parameters, image info)
     - Response details (results, data returned)
     - Duration/timing
     - Success/failure status
     - Error messages (if any)

### 2. **Google Analytics Implementation (50 points)**
   - **Requirement**: "Analytics Implementation & Comparison"
   - **What's Needed**:
     - User behavior tracking
     - Page views
     - User interactions (clicks, uploads, analysis)
     - Event tracking for key actions
     - User flow analysis

### 3. **Analytics+Logging Report (Required)**
   - **Requirement**: Wiki page "Analytics+Logging" with PDF report
   - **Content Should Include**:
     - Summary of analytics implementation
     - API call logging statistics
     - User behavior patterns
     - Performance metrics
     - Comparison/analysis of data

---

## What's Already Implemented ✅

### ✅ 1. API Call Logging System

**Location**: `server/middleware/logging.js`

**Features**:
- ✅ Logs all HTTP requests/responses
- ✅ Logs Google Vision API calls with:
  - Request data (image URI, features requested)
  - Response data (labels count, colors count, objects count)
  - Duration in milliseconds
  - Success/failure status
- ✅ Logs Google Gemini API calls
- ✅ Logs Firestore operations
- ✅ Logs errors separately
- ✅ Daily log files (analytics-YYYY-MM-DD.log, api-YYYY-MM-DD.log, errors-YYYY-MM-DD.log)

**Example Log Entry**:
```json
{
  "timestamp": "2025-12-02T05:13:25.123Z",
  "api": "Google Vision API",
  "request": {
    "imageUri": "https://...",
    "features": ["LABEL_DETECTION", "IMAGE_PROPERTIES", "OBJECT_LOCALIZATION"]
  },
  "response": {
    "labelsCount": 15,
    "colorsCount": 5,
    "objectsCount": 8
  },
  "duration": "1234ms",
  "success": true
}
```

### ✅ 2. Google Analytics (GA4) Implementation

**Location**: `client/src/utils/analytics.js`

**Features**:
- ✅ Page view tracking (automatic on route changes)
- ✅ User authentication events (login/logout)
- ✅ Photo upload/selection events
- ✅ Analysis events (started, completed, failed)
- ✅ User engagement events (gallery views, analytics views, profile views)
- ✅ Custom event tracking capability

**Tracked Events**:
- `login` - User logs in via Google OAuth
- `logout` - User logs out
- `photo_uploaded` - Photo uploaded from device
- `photo_selected` - Photo selected from Google Photos
- `analysis_started` - Outfit analysis begins
- `analysis_completed` - Analysis finishes (includes style category)
- `analysis_failed` - Analysis fails (includes error info)
- `dashboard_viewed` - Dashboard page viewed
- `gallery_opened` - Gallery page opened
- `analytics_opened` - Analytics page opened
- `profile_opened` - Profile page opened
- `outfit_viewed` - Specific outfit viewed
- `outfit_deleted` - Outfit deleted

### ✅ 3. Log Files Location

**Directory**: `/logs/`

**Files Created**:
- `analytics-YYYY-MM-DD.log` - API call logs (Vision, Gemini, Firestore)
- `api-YYYY-MM-DD.log` - HTTP request/response logs
- `errors-YYYY-MM-DD.log` - Error logs

---

## What You Need to Do for the Report

### 1. **Collect Analytics Data** (Run the app for a few days)

Use the app and generate some activity:
- Login/logout multiple times
- Upload/analyze several photos
- View different pages
- Generate API calls to Vision and Gemini

### 2. **Extract Log Data**

**From Log Files** (`/logs/` directory):
```bash
# View analytics logs
cat logs/analytics-2025-12-02.log

# Count API calls
grep -c "Google Vision API" logs/analytics-*.log
grep -c "Gemini" logs/analytics-*.log

# Calculate average response times
# (You'll need to parse the JSON and calculate)
```

**From Google Analytics**:
- Go to [Google Analytics](https://analytics.google.com/)
- Navigate to Reports → Engagement → Events
- Export data for your report

### 3. **Create Analytics+Logging Report PDF**

**Required Sections**:

#### A. **API Call Logging Summary**
- Total number of Vision API calls
- Total number of Gemini API calls
- Total number of Firestore operations
- Average response times for each API
- Success rate for each API
- Error rate and common errors

#### B. **User Behavior Analytics**
- Total page views
- Most visited pages
- User flow (login → upload → analyze → view results)
- Average session duration
- Most common user actions

#### C. **Performance Metrics**
- API response time distribution
- Slowest API calls
- Error frequency
- Peak usage times

#### D. **Comparison/Analysis**
- Compare Vision API vs Gemini API usage
- Compare different user behaviors
- Identify bottlenecks
- Recommendations for optimization

#### E. **Screenshots**
- Google Analytics dashboard screenshots
- Sample log file entries
- API call statistics charts

---

## How to Generate the Report

### Step 1: Analyze Log Files

Create a script to analyze logs:

```javascript
// analyze-logs.js
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
const analyticsLogs = fs.readdirSync(logsDir)
  .filter(f => f.startsWith('analytics-'))
  .map(f => path.join(logsDir, f));

let stats = {
  vision: { count: 0, totalDuration: 0, errors: 0 },
  gemini: { count: 0, totalDuration: 0, errors: 0 },
  firestore: { count: 0, totalDuration: 0, errors: 0 }
};

analyticsLogs.forEach(logFile => {
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  lines.forEach(line => {
    if (!line.trim()) return;
    try {
      const entry = JSON.parse(line);
      const api = entry.api.toLowerCase();
      
      if (api.includes('vision')) {
        stats.vision.count++;
        stats.vision.totalDuration += parseInt(entry.duration) || 0;
        if (!entry.success) stats.vision.errors++;
      } else if (api.includes('gemini')) {
        stats.gemini.count++;
        stats.gemini.totalDuration += parseInt(entry.duration) || 0;
        if (!entry.success) stats.gemini.errors++;
      } else if (api.includes('firestore')) {
        stats.firestore.count++;
        stats.firestore.totalDuration += parseInt(entry.duration) || 0;
        if (!entry.success) stats.firestore.errors++;
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });
});

// Calculate averages
Object.keys(stats).forEach(api => {
  if (stats[api].count > 0) {
    stats[api].avgDuration = stats[api].totalDuration / stats[api].count;
    stats[api].errorRate = (stats[api].errors / stats[api].count * 100).toFixed(2) + '%';
  }
});

console.log(JSON.stringify(stats, null, 2));
```

### Step 2: Export Google Analytics Data

1. Go to Google Analytics
2. Reports → Engagement → Events
3. Export to CSV/PDF
4. Reports → Acquisition → Overview
5. Export user acquisition data

### Step 3: Create PDF Report

Use the data to create a comprehensive PDF report with:
- Charts/graphs (use Excel, Google Sheets, or Python matplotlib)
- Screenshots from Google Analytics
- Sample log entries
- Analysis and conclusions

---

## Checklist for Analytics Requirements

- [x] **API Call Logging** - All API calls are logged
- [x] **Google Vision API Logging** - Request/response/duration logged
- [x] **Google Gemini API Logging** - Request/response/duration logged
- [x] **Firestore Logging** - Database operations logged
- [x] **Google Analytics Setup** - GA4 implemented and tracking events
- [x] **User Event Tracking** - Login, upload, analysis events tracked
- [ ] **Analytics Report** - PDF report needs to be created (you'll do this)
- [ ] **Log Analysis** - Statistics need to be extracted (you'll do this)

---

## Next Steps

1. **Run the application** and generate activity for a few days
2. **Collect log files** from `/logs/` directory
3. **Export Google Analytics data**
4. **Create analysis script** (or use the one above)
5. **Generate PDF report** with charts and screenshots
6. **Upload to GitHub Wiki** under "Analytics+Logging" page

---

## Files to Reference

- **Logging Implementation**: `server/middleware/logging.js`
- **Vision API Logging**: `server/services/visionService.js` (lines 89-96, 184-190)
- **Gemini API Logging**: `server/services/geminiService.js` (check for logAPICall usage)
- **Analytics Implementation**: `client/src/utils/analytics.js`
- **Log Files**: `/logs/analytics-*.log`, `/logs/api-*.log`, `/logs/errors-*.log`

---

**Note**: The logging and analytics infrastructure is fully implemented. You just need to:
1. Use the app to generate data
2. Analyze the logs
3. Create the PDF report
4. Upload to GitHub Wiki

