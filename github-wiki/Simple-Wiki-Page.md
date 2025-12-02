# Fashion.AI - CS651 Project 2 Wiki

## Application Name
**Fashion.AI** - AI-Powered Outfit Analysis Platform

## Deployed Application URL
🔗 https://outfit-vision-4018057728.us-central1.run.app

---

## 1. Intro

### Screenshot: GitHub Commit History
**📸 ADD SCREENSHOT HERE** - Show your GitHub repository commit history with multiple commits

**Where to get it**: GitHub → Your repo → Commits page

---

## 2. Description

### Screenshot: GitHub Issues Board (5 screenshots showing evolution)
**📸 SCREENSHOT 1** - Issues board early in development (Week 1)

**📸 SCREENSHOT 2** - Issues board during active development (Week 2-3)

**📸 SCREENSHOT 3** - Issues board as features complete (Week 4-5)

**📸 SCREENSHOT 4** - Issues board final state (before submission)

**📸 SCREENSHOT 5** - Current issues board

**Where to get it**: GitHub → Your repo → Issues tab

### Major Code Files
- **Frontend**: `client/src/App.jsx`, `client/src/pages/*.jsx`, `client/src/utils/analytics.js`
- **Backend**: `server/index.js`, `server/routes/*.js`, `server/services/*.js`
- **APIs**: Vision API (`server/services/visionService.js`), Gemini API (`server/services/geminiService.js`)
- **Database**: Firestore (`server/services/firestoreService.js`)
- **Logging**: `server/middleware/logging.js`

---

## 3. Demonstration

### Team Member 1 Screenshots
**📸 SCREENSHOT** - Login page

**📸 SCREENSHOT** - Dashboard after login

**📸 SCREENSHOT** - Gallery with photos

**📸 SCREENSHOT** - Analysis results

**📸 SCREENSHOT** - Analytics page

### Team Member 2 Screenshots
**📸 SCREENSHOT** - Login page

**📸 SCREENSHOT** - Dashboard

**📸 SCREENSHOT** - Analysis results

### Adding New Image Flow
**📸 SCREENSHOT** - Dashboard before adding new image

**📸 SCREENSHOT** - New image in Google Photos

**📸 SCREENSHOT** - Gallery showing new image

**📸 SCREENSHOT** - Analysis of new image

**📸 SCREENSHOT** - Dashboard after analysis (showing updated count)

### Firestore Database
**📸 SCREENSHOT** - Firestore database structure (collections/documents)

**📸 SCREENSHOT** - Sample outfit document with all fields

**📸 SCREENSHOT** - Adding a new document

**📸 SCREENSHOT** - Deleting a document

**Where to get it**: Google Cloud Console → Firestore → Data

### Google Vision API Usage
**📸 SCREENSHOT** - Vision API request/response in logs (`/logs/analytics-*.log`)

**📸 SCREENSHOT** - Vision API call in browser DevTools Network tab

**📸 SCREENSHOT** - Vision API results (labels, colors, objects detected)

**Where to get it**: 
- Logs: `logs/analytics-YYYY-MM-DD.log` files
- Network: Browser DevTools (F12) → Network tab → Find Vision API request

### Google Gemini API Usage
**📸 SCREENSHOT** - Gemini API request/response in logs

**📸 SCREENSHOT** - Gemini API call in browser DevTools Network tab

**📸 SCREENSHOT** - Gemini API results (style category, recommendations)

**Where to get it**: Same as Vision API - logs and Network tab

---

## 4. Google Database

### Setup
**📸 SCREENSHOT** - Firestore database in Google Cloud Console

### Structure
**📸 SCREENSHOT** - Collection structure: `users/{userId}/outfits/{outfitId}`

### Operations
**📸 SCREENSHOT** - Adding data (when analyzing outfit)

**📸 SCREENSHOT** - Querying data (getting user outfits)

**📸 SCREENSHOT** - Deleting data (removing outfit)

**Where to get it**: Google Cloud Console → Firestore → Data

---

## 5. Code Styling and Comments

All code uses **camelCase** naming and is **fully commented**.

See code files in repository for examples.

---

## 6. Code

🔗 **Repository**: https://github.com/Sallapalli-Prajwal/Fashion.AI

All code, HTML, images, and supporting files are in the repository.

---

## 7. Presentation

**📄 PDF** - Upload `Presentation.pdf` here

**📹 VIDEO** - Upload `Presentation.mp4` here

**🔗 YouTube** - Add unlisted YouTube video URL here: [TO BE ADDED]

---

## 8. Analytics+Logging

**📄 PDF** - Upload `Analytics+Logging-Report.pdf` here

The PDF should contain:
- API call statistics (Vision, Gemini, Firestore)
- Google Analytics screenshots
- Sample log entries
- Performance metrics
- User behavior analysis

---

## 9. Proposal

**📄 PDF** - Upload `Proposal.pdf` here (original proposal with mockups and diagrams)

---

## Summary: Where to Add Screenshots

1. **GitHub**: Commits page, Issues tab
2. **Application**: Your deployed app (login, dashboard, gallery, etc.)
3. **Firestore**: Google Cloud Console → Firestore
4. **API Logs**: `/logs/analytics-*.log` files
5. **Browser DevTools**: Network tab (F12) for API calls
6. **Google Analytics**: analytics.google.com

**Total Screenshots Needed**: ~30-40 screenshots across all sections above

