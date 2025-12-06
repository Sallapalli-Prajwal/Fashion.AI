/**
 * Google Analytics Service (Backend)
 * Sends events to GA4 using Measurement Protocol
 * Tracks API calls: Vision, Gemini, Firestore, etc.
 */

const axios = require('axios');

// GA4 Measurement Protocol endpoint
const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const GA4_MEASUREMENT_ID = process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || '';

// Client ID (can be generated or use session-based ID)
function getClientId(req) {
  // Use session ID as client ID for tracking
  if (req && req.session && req.sessionID) {
    return req.sessionID;
  }
  // Fallback: generate a client ID
  return `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Send event to Google Analytics
 * @param {string} eventName - Event name
 * @param {Object} eventParams - Event parameters
 * @param {Object} req - Express request object (optional, for client ID)
 */
const trackEvent = async (eventName, eventParams = {}, req = null) => {
  if (!GA4_MEASUREMENT_ID) {
    // Silently fail if GA is not configured
    return;
  }

  try {
    const clientId = getClientId(req);
    
    // Prepare event data
    const eventData = {
      client_id: clientId,
      events: [{
        name: eventName,
        params: {
          ...eventParams,
          timestamp_micros: Date.now() * 1000 // Convert to microseconds
        }
      }]
    };

    // Send to GA4 Measurement Protocol
    // Note: API secret is optional but recommended for production
    const apiSecret = process.env.GA_API_SECRET || '';
    const url = apiSecret 
      ? `${GA4_ENDPOINT}?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${apiSecret}`
      : `${GA4_ENDPOINT}?measurement_id=${GA4_MEASUREMENT_ID}`;
    
    await axios.post(
      url,
      eventData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 GA Event (Backend): ${eventName}`, eventParams);
    }
  } catch (error) {
    // Don't throw - GA tracking should never break the app
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  GA tracking failed:', error.message);
    }
  }
};

/**
 * Track API call
 * @param {string} apiName - Name of the API (e.g., 'Google Vision API', 'Google Gemini API')
 * @param {Object} requestData - Request data
 * @param {Object} responseData - Response data
 * @param {number} duration - Duration in milliseconds
 * @param {Error} error - Error object if call failed
 * @param {Object} req - Express request object (optional)
 */
const trackAPICall = async (apiName, requestData = {}, responseData = {}, duration = 0, error = null, req = null) => {
  const eventParams = {
    api_name: apiName,
    duration_ms: duration,
    success: !error,
    error_message: error ? (error.message || 'Unknown error') : null
  };

  // Add request data
  if (requestData) {
    if (requestData.userId) eventParams.user_id = requestData.userId;
    if (requestData.labelsCount !== undefined) eventParams.labels_count = requestData.labelsCount;
    if (requestData.colorsCount !== undefined) eventParams.colors_count = requestData.colorsCount;
    if (requestData.objectsCount !== undefined) eventParams.objects_count = requestData.objectsCount;
    if (requestData.outfitsCount !== undefined) eventParams.outfits_count = requestData.outfitsCount;
    if (requestData.limit) eventParams.limit = requestData.limit;
    if (requestData.count !== undefined) eventParams.count = requestData.count;
    if (requestData.styleCategory) eventParams.style_category = requestData.styleCategory;
    if (requestData.occasion) eventParams.occasion = requestData.occasion;
    if (requestData.provider) eventParams.provider = requestData.provider;
    if (requestData.action) eventParams.action = requestData.action;
  }

  // Add response data
  if (responseData) {
    if (responseData.labelsCount !== undefined) eventParams.response_labels_count = responseData.labelsCount;
    if (responseData.colorsCount !== undefined) eventParams.response_colors_count = responseData.colorsCount;
    if (responseData.objectsCount !== undefined) eventParams.response_objects_count = responseData.objectsCount;
    if (responseData.exists !== undefined) eventParams.exists = responseData.exists;
    if (responseData.count !== undefined) eventParams.response_count = responseData.count;
    if (responseData.totalOutfits !== undefined) eventParams.total_outfits = responseData.totalOutfits;
    if (responseData.styleCategory) eventParams.response_style_category = responseData.styleCategory;
    if (responseData.occasion) eventParams.response_occasion = responseData.occasion;
    if (responseData.success !== undefined) eventParams.response_success = responseData.success;
  }

  // Map API names to event names
  const eventNameMap = {
    'Google Vision API': 'api_vision_call',
    'Google Vision API (REST)': 'api_vision_call',
    'Google Gemini API': 'api_gemini_call',
    'Google Gemini API (Recommendations)': 'api_gemini_recommendations',
    'Firestore (Store Outfit)': 'api_firestore_store',
    'Firestore (Get User Outfits)': 'api_firestore_get',
    'Firestore (Delete Outfit)': 'api_firestore_delete',
    'Firestore (Check Photo)': 'api_firestore_check',
    'Firestore (Get Stats)': 'api_firestore_stats',
    'Firestore (Update Profile)': 'api_firestore_update_profile',
    'Google Photos API': 'api_photos_call',
    'Google Drive API': 'api_drive_call',
    'OAuth': 'api_oauth_call',
    'OAuth (Initiate)': 'api_oauth_initiate',
    'OAuth (Callback)': 'api_oauth_callback'
  };

  const eventName = eventNameMap[apiName] || 'api_call';

  await trackEvent(eventName, eventParams, req);
};

module.exports = {
  trackEvent,
  trackAPICall
};

