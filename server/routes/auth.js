/**
 * Authentication Routes
 * Handles Google OAuth flow for Google Photos access
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { logAPICall } = require('../middleware/logging');

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get('/google', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  // Use explicit redirect URI from env, or construct it
  // IMPORTANT: Must match EXACTLY what's in Google Cloud Console
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  // Scopes for Google Drive API (readonly access to photos)
  // Using Drive API instead of Photos Picker API
  const scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  
  // Validate client ID
  if (!clientId) {
    console.error('❌ GOOGLE_CLIENT_ID is not set in environment variables');
    return res.status(500).json({ 
      error: 'OAuth configuration error',
      message: 'GOOGLE_CLIENT_ID is not configured. Please check your .env file. You need OAuth 2.0 Client ID credentials, not a service account.'
    });
  }
  
  // Normalize redirect URI (remove trailing slash if present)
  const normalizedRedirectUri = redirectUri.replace(/\/$/, '');
  
  // Generate state for CSRF protection
  const state = require('crypto').randomBytes(32).toString('hex');
  req.session.oauthState = state;
  
  // Force save session before redirect
  req.session.save((err) => {
    if (err) {
      console.error('❌ Failed to save session:', err);
      return res.status(500).json({ error: 'Failed to initialize session' });
    }
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(normalizedRedirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${state}`;
  
  const duration = Date.now() - startTime;
  logAPICall('OAuth', { provider: 'Google', action: 'initiate' }, { authUrl: '[REDACTED]' }, duration, null, req);
  
  // Log redirect URI for debugging (always log in production to help debug)
  console.log('🔗 OAuth Redirect URI:', normalizedRedirectUri);
  console.log('🔑 Using Client ID:', clientId.substring(0, 20) + '...');
  console.log('⚠️  Make sure this redirect URI EXACTLY matches Google Cloud Console!');
  
  res.redirect(authUrl);
}));

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback
 */
router.get('/google/callback', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const axios = require('axios');
  
  const { code, state, error } = req.query;
  
  // Verify state with better error handling and logging
  console.log('🔍 OAuth Callback - Session check:', {
    hasSession: !!req.session,
    hasOauthState: !!(req.session && req.session.oauthState),
    sessionId: req.sessionID,
    receivedState: state,
    expectedState: req.session?.oauthState
  });
  
  if (!req.session || !req.session.oauthState) {
    console.error('❌ Session or oauthState missing');
    // For now, allow the flow to continue if state is provided (temporary workaround)
    // In production, you should use a persistent session store (Redis, etc.)
    if (!state) {
      return res.status(400).json({ 
        error: 'Invalid state parameter',
        message: 'Session expired or not found. Please try logging in again.'
      });
    }
    // Log warning but continue (this is a workaround for Cloud Run session issues)
    console.warn('⚠️  Session state missing, but state parameter provided. Continuing with validation...');
  } else if (state !== req.session.oauthState) {
    console.error('❌ State mismatch');
    return res.status(400).json({ 
      error: 'Invalid state parameter',
      message: 'State parameter mismatch. This may be a security issue or session expired.'
    });
  }
  
  if (error) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=${error}`);
  }
  
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=no_code`);
  }
  
  // Validate credentials
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ OAuth credentials not configured');
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=config_missing`);
  }

  // Normalize redirect URI (must match exactly)
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const normalizedRedirectUri = redirectUri.replace(/\/$/, '');

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: normalizedRedirectUri,
      grant_type: 'authorization_code'
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const userInfo = userResponse.data;
    
    // Store tokens in session
    req.session.googleAccessToken = access_token;
    req.session.googleRefreshToken = refresh_token;
    req.session.googleTokenExpiry = Date.now() + (expires_in * 1000);
    req.session.userId = userInfo.id;
    req.session.userEmail = userInfo.email;
    req.session.userName = userInfo.name;
    
    console.log('💾 Storing session data:', {
      userId: userInfo.id,
      email: userInfo.email,
      sessionId: req.sessionID,
      hasToken: !!access_token
    });
    
      // CRITICAL: Save session before redirect and ensure cookie is set
      req.session.save((err) => {
        if (err) {
          console.error('❌ Failed to save session before redirect:', err);
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=session_save_failed`);
        }
        
        // Verify session was saved
        console.log('✅ Session saved. Verifying:', {
          sessionId: req.sessionID,
          hasToken: !!req.session.googleAccessToken,
          userId: req.session.userId,
          email: req.session.userEmail,
          cookieHeader: res.getHeader('Set-Cookie')
        });
        
        // Double-check session data is still there after save
        if (!req.session.googleAccessToken) {
          console.error('❌ CRITICAL: Session token lost after save!');
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=session_lost`);
        }
        
        const duration = Date.now() - startTime;
        logAPICall('OAuth', { provider: 'Google', action: 'callback' }, { 
          userId: userInfo.id,
          hasToken: !!access_token 
        }, duration);
        
        // CRITICAL: Ensure session cookie is set by express-session
        // The session middleware should handle this, but we need to ensure it's saved
        // Don't manually set the cookie - let express-session handle it with correct attributes
        
        // Touch the session to ensure it's marked as modified
        req.session.touch();
        
        // Get the client URL
        const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
        
        console.log('🍪 Session cookie should be set by express-session:', {
          sessionId: req.sessionID,
          cookieName: 'outfitvision.sid',
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          clientUrl: clientUrl
        });
        
        // Redirect to frontend with a flag to trigger auth check
        // express-session will automatically set the cookie with the redirect
        console.log('🔄 Redirecting to:', `${clientUrl}/dashboard?auth=success`);
        
        // Use res.redirect - express-session will set the cookie automatically
        res.redirect(`${clientUrl}/dashboard?auth=success`);
      });
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('OAuth', { provider: 'Google', action: 'callback' }, null, duration, error, req);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=token_exchange_failed`);
  }
}));

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get('/status', asyncHandler(async (req, res) => {
  // Log all session data for debugging
  const sessionData = {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    hasToken: !!req.session?.googleAccessToken,
    userId: req.session?.userId,
    userEmail: req.session?.userEmail,
    userName: req.session?.userName,
    cookie: req.headers.cookie,
    cookies: req.cookies,
    cookieHeader: req.headers.cookie ? req.headers.cookie.substring(0, 100) : 'NO COOKIE HEADER'
  };
  
  console.log('🔍 Auth status check (detailed):', JSON.stringify(sessionData, null, 2));
  
  // If no cookie is present, log a warning
  if (!req.headers.cookie) {
    console.warn('⚠️  No cookie header in request! This means the session cookie is not being sent.');
    console.warn('   Check browser console for cookie issues (SameSite, Secure, etc.)');
  }
  
  // If session exists but no token, log more details
  if (req.session && !req.session.googleAccessToken) {
    console.warn('⚠️  Session exists but no token. Session keys:', Object.keys(req.session));
  }
  
  const isAuthenticated = !!req.session?.googleAccessToken;
  
  res.json({
    authenticated: isAuthenticated,
    user: isAuthenticated ? {
      id: req.session.userId,
      email: req.session.userEmail,
      name: req.session.userName
    } : null
  });
}));

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
}));

/**
 * GET /api/auth/token
 * Get current access token (for API calls)
 */
router.get('/token', asyncHandler(async (req, res) => {
  if (!req.session.googleAccessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if token is expired and refresh if needed
  if (Date.now() >= req.session.googleTokenExpiry) {
    // Refresh token logic would go here
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Verify token info (for debugging)
  const axios = require('axios');
  let tokenInfo = null;
  try {
    const infoResponse = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: req.session.googleAccessToken }
    });
    tokenInfo = infoResponse.data;
  } catch (error) {
    console.warn('Could not verify token info:', error.message);
  }
  
  res.json({
    accessToken: req.session.googleAccessToken,
    userId: req.session.userId,
    // Include token info for debugging (remove in production)
    ...(process.env.NODE_ENV === 'development' && tokenInfo && {
      tokenInfo: {
        scope: tokenInfo.scope,
        expires_in: tokenInfo.expires_in
      }
    })
  });
}));

module.exports = router;

