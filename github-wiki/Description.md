# Description

## Screenshot: GitHub Commit History

**📸 SCREENSHOT #1 REQUIRED HERE**

Screenshot showing the commit history with multiple commits over time.

**Location**: GitHub repository → Commits page or main page with commit graph

---

## Screenshots: GitHub Issues Board Evolution

**📸 SCREENSHOT #2 REQUIRED HERE** - Issues Board (Week 1 - Initial Setup)

Show the Issues board early in development with initial issues created.

**How to get it:**
1. Go to GitHub repository → Issues
2. Filter by "All" or "Open"
3. Take screenshot showing initial issues

---

**📸 SCREENSHOT #3 REQUIRED HERE** - Issues Board (Week 2-3 - Active Development)

Show the Issues board during active development phase.

**What to show:**
- Multiple issues in progress
- Issues being closed
- Labels assigned
- Milestones (if used)

---

**📸 SCREENSHOT #4 REQUIRED HERE** - Issues Board (Week 4-5 - Feature Completion)

Show the Issues board as features are being completed.

**What to show:**
- Most issues closed
- Remaining issues
- Progress indicators

---

**📸 SCREENSHOT #5 REQUIRED HERE** - Issues Board (Final - Before Submission)

Show the final state of the Issues board.

**What to show:**
- All or most issues closed
- Final project state
- Any remaining documentation issues

---

**📸 SCREENSHOT #6 REQUIRED HERE** - Issues Board (Current/Final State)

Show the current state of all issues.

**Location**: GitHub repository → Issues → View all issues

---

## Major Code Files and Their Functions

### Frontend (React) - `client/src/`

#### **App.jsx**
- **Function**: Main application component
- **Responsibilities**:
  - Handles routing (React Router)
  - Manages authentication state
  - Tracks page views for analytics
  - Provides navigation structure

#### **pages/Login.jsx**
- **Function**: User authentication page
- **Responsibilities**:
  - Initiates Google OAuth flow
  - Handles login redirects
  - Displays login interface

#### **pages/Dashboard.jsx**
- **Function**: Main dashboard showing user overview
- **Responsibilities**:
  - Displays user statistics (total outfits, style categories, colors)
  - Shows recent analyzed outfits
  - Provides quick access to features
  - Tracks dashboard views for analytics

#### **pages/Gallery.jsx**
- **Function**: Photo gallery and analysis interface
- **Responsibilities**:
  - Fetches photos from Google Photos/Drive
  - Displays user's photos
  - Handles photo selection and upload
  - Initiates outfit analysis
  - Shows analyzed outfits
  - Tracks gallery interactions for analytics

#### **pages/Analytics.jsx**
- **Function**: Analytics and statistics visualization
- **Responsibilities**:
  - Displays style trends (charts)
  - Shows color frequency analysis
  - Displays occasion distribution
  - Shows personalized recommendations
  - Tracks analytics page views

#### **pages/Profile.jsx**
- **Function**: User profile management
- **Responsibilities**:
  - Displays user information
  - Shows user's outfit history
  - Allows outfit deletion
  - Tracks profile views

#### **components/Navbar.jsx**
- **Function**: Navigation bar component
- **Responsibilities**:
  - Provides navigation links
  - Displays user information
  - Handles logout functionality

#### **utils/analytics.js**
- **Function**: Google Analytics utility
- **Responsibilities**:
  - Initializes Google Analytics (GA4)
  - Tracks page views
  - Tracks custom events
  - Provides analytics helper functions

#### **config.js**
- **Function**: API configuration
- **Responsibilities**:
  - Centralizes API URL configuration
  - Handles environment-based URLs
  - Provides API base URL for all requests

### Backend (Express.js) - `server/`

#### **index.js**
- **Function**: Main Express server entry point
- **Responsibilities**:
  - Initializes Express application
  - Configures middleware (CORS, sessions, logging)
  - Sets up routes
  - Serves static files (React build)
  - Starts HTTP server

#### **routes/auth.js**
- **Function**: Authentication routes
- **Responsibilities**:
  - Handles Google OAuth initiation (`/api/auth/google`)
  - Processes OAuth callback (`/api/auth/google/callback`)
  - Checks authentication status (`/api/auth/status`)
  - Handles logout (`/api/auth/logout`)
  - Provides access token (`/api/auth/token`)

#### **routes/photos.js**
- **Function**: Photo management routes
- **Responsibilities**:
  - Fetches photos from Google Drive (`/api/photos`)
  - Handles photo uploads (`/api/photos/upload`)
  - Serves Drive images (`/api/photos/drive-image/:fileId`)

#### **routes/analyze.js**
- **Function**: Outfit analysis routes
- **Responsibilities**:
  - Main analysis endpoint (`/api/analyze`)
  - Orchestrates Vision API and Gemini API calls
  - Handles photo processing (Drive, local, URL)
  - Saves results to Firestore
  - Prevents duplicate analysis

#### **routes/records.js**
- **Function**: Outfit records management
- **Responsibilities**:
  - Retrieves user's outfits (`/api/records`)
  - Gets specific outfit (`/api/records/:id`)
  - Deletes outfits (`/api/records/:id`)

#### **routes/stats.js**
- **Function**: Statistics and analytics routes
- **Responsibilities**:
  - Gets user statistics (`/api/stats`)
  - Provides recommendations (`/api/stats/recommendations`)

#### **services/visionService.js**
- **Function**: Google Vision API integration
- **Responsibilities**:
  - Analyzes images using Vision API
  - Detects labels, colors, objects, text
  - Logs all Vision API calls
  - Handles errors and fallbacks

#### **services/geminiService.js**
- **Function**: Google Gemini API integration
- **Responsibilities**:
  - Analyzes style using Gemini AI
  - Generates style recommendations
  - Provides personalized suggestions
  - Logs all Gemini API calls
  - Handles model fallbacks

#### **services/firestoreService.js**
- **Function**: Firestore database operations
- **Responsibilities**:
  - Stores outfit analysis results
  - Retrieves user outfits
  - Checks for duplicate photos
  - Gets user statistics
  - Deletes outfits
  - Updates user profiles
  - Logs database operations

#### **services/sessionStore.js**
- **Function**: Session storage (for future Firestore-based sessions)
- **Responsibilities**:
  - Provides session store interface
  - Currently uses memory store
  - Ready for Firestore-based persistence

#### **middleware/logging.js**
- **Function**: Request and API call logging
- **Responsibilities**:
  - Logs all HTTP requests/responses
  - Logs all API calls (Vision, Gemini, Firestore)
  - Logs errors
  - Creates daily log files
  - Provides analytics data

#### **middleware/errorHandler.js**
- **Function**: Centralized error handling
- **Responsibilities**:
  - Catches and formats errors
  - Provides consistent error responses
  - Logs errors

### Configuration Files

#### **Dockerfile**
- **Function**: Container definition for Cloud Run
- **Responsibilities**:
  - Defines build process
  - Sets up Node.js environment
  - Builds React frontend
  - Configures production environment

#### **cloudbuild.yaml**
- **Function**: Google Cloud Build configuration
- **Responsibilities**:
  - Defines build steps
  - Builds Docker image
  - Deploys to Cloud Run
  - Passes build arguments (API URLs, Analytics ID)

#### **package.json**
- **Function**: Node.js dependencies and scripts
- **Responsibilities**:
  - Lists all dependencies
  - Defines npm scripts (dev, build, start)
  - Manages project metadata

---

## Development Timeline

**Week 1**: Project setup, OAuth integration, basic structure  
**Week 2**: Vision API integration, image analysis  
**Week 3**: Gemini API integration, style analysis  
**Week 4**: Frontend UI, dashboard, gallery  
**Week 5**: Analytics, Firestore integration, testing  
**Week 6**: Deployment, documentation, final polish

---

## Technology Stack Summary

- **Frontend Framework**: React 18.2.0 with Vite
- **Backend Framework**: Express.js 4.18.2
- **Runtime**: Node.js 18
- **Cloud Platform**: Google Cloud Run
- **Database**: Google Firestore
- **APIs Used**:
  - Google Vision API (v1)
  - Google Gemini API (gemini-pro)
  - Google Photos/Drive API (v3)
  - Google OAuth 2.0
- **Analytics**: Google Analytics 4 (GA4)
- **Styling**: CSS3 with custom components
- **Charts**: Chart.js with react-chartjs-2

