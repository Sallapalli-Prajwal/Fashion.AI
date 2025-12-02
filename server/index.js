/**
 * OutfitVision - Express Server
 * Main entry point for the backend API server
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const photosRoutes = require('./routes/photos');
const analyzeRoutes = require('./routes/analyze');
const recordsRoutes = require('./routes/records');
const statsRoutes = require('./routes/stats');

// Import middleware
const { logRequest, logError } = require('./middleware/logging');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - FIX 3: Enable CORS to allow cookies
// Must return Access-Control-Allow-Credentials: true and specific origin
const corsOptions = {
  origin: function (origin, callback) {
    // In production, use the specific origin (required for credentials: true)
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [process.env.CLIENT_URL || 'https://outfit-vision-4018057728.us-central1.run.app']
      : ['http://localhost:5173', 'http://localhost:3001'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      // In production, allow no-origin requests (for server-to-server)
      return callback(null, process.env.NODE_ENV === 'production' ? true : false);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production' && origin.includes('outfit-vision')) {
      // Allow any outfit-vision subdomain in production
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRITICAL: Must be true to allow cookies
  optionsSuccessStatus: 200,
  // Explicitly set headers
  exposedHeaders: ['Set-Cookie'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
// NOTE: Using memory store for now. For production with multiple instances,
// you'll need to implement a persistent session store (Redis, Firestore, etc.)
// The current implementation works but sessions won't persist across instance restarts
let sessionStore = null;
console.log('📦 Using memory session store');
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: Sessions will not persist across Cloud Run instances!');
  console.warn('   For production, consider implementing a persistent session store.');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'outfit-vision-secret-key-change-in-production',
  store: sessionStore, // Firestore store in production, null (memory) in development
  resave: true, // Changed to true for Cloud Run
  saveUninitialized: true, // Changed to true to save state immediately
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production (REQUIRED for sameSite: 'none')
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' requires secure: true for cross-domain
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/', // Ensure cookie is available for all paths
    // CRITICAL: Don't set domain - let browser handle it (important for Cloud Run)
    // Setting domain explicitly can break cookie setting in some browsers
  },
  name: 'outfitvision.sid', // Custom session name
  // Ensure cookie is set on every response
  proxy: process.env.NODE_ENV === 'production', // Trust proxy in production (Cloud Run)
  genid: function(req) {
    return require('crypto').randomBytes(16).toString('hex');
  }
}));

// Request logging middleware
app.use(logRequest);

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Firestore test endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test/firestore', async (req, res) => {
    try {
      const firestoreService = require('./services/firestoreService');
      const testUserId = 'test-user-' + Date.now();
      
      // Test storing an outfit
      const testOutfit = {
        photoURL: 'http://localhost:3001/api/uploads/test.jpg',
        styleCategory: 'Test',
        geminiSummary: 'Test outfit',
        topColors: ['Red', 'Blue'],
        occasion: 'Test',
        season: 'All-Season',
        suggestions: ['Test suggestion'],
        visionTags: ['test'],
        visionLabels: [],
        dominantColors: [],
        objects: []
      };
      
      const docId = await firestoreService.storeOutfit(testUserId, testOutfit);
      
      // Test retrieving
      const outfits = await firestoreService.getUserOutfits(testUserId);
      
      res.json({
        success: true,
        message: 'Firestore is working!',
        testUserId,
        docId,
        outfitsCount: outfits.length,
        outfit: outfits[0] || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
}

// Debug endpoint (remove in production)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/env', (req, res) => {
    res.json({
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'Using default',
      hasVisionKey: !!process.env.GOOGLE_VISION_API_KEY,
      hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      projectId: process.env.GOOGLE_PROJECT_ID || 'NOT SET'
    });
  });
}

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
// Wrap in try-catch to ensure server starts even if there are initialization errors
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OutfitVision server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

module.exports = app;

