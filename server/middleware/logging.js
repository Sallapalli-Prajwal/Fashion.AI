/**
 * Logging Middleware
 * Logs all API requests and responses for analytics
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log request details
 */
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;

  // Log request
  const requestLog = {
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      ...requestLog,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    // Write to log file
    const logFile = path.join(logsDir, `api-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(responseLog) + '\n');

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${responseLog.timestamp}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
};

/**
 * Log API call (Vision, Gemini, Firestore, etc.)
 * Also sends event to Google Analytics
 */
const logAPICall = (apiName, requestData, responseData, duration, error = null, req = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    api: apiName,
    request: requestData,
    response: responseData,
    duration: `${duration}ms`,
    error: error ? error.message : null,
    success: !error
  };

  // Write to analytics log
  const logFile = path.join(logsDir, `analytics-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

  // Send to Google Analytics (non-blocking)
  try {
    const gaService = require('../services/gaService');
    gaService.trackAPICall(apiName, requestData, responseData, duration, error, req)
      .catch(err => {
        // Silently fail - GA tracking should never break the app
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️  GA tracking error:', err.message);
        }
      });
  } catch (gaError) {
    // Silently fail if GA service not available
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    const status = error ? '❌' : '✅';
    console.log(`${status} [${apiName}] ${duration}ms`);
  }
};

/**
 * Log error
 */
const logError = (error, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req?.requestId,
    method: req?.method,
    path: req?.path,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    }
  };

  const logFile = path.join(logsDir, `errors-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(errorLog) + '\n');

  console.error('❌ Error:', error.message);
};

module.exports = {
  logRequest,
  logAPICall,
  logError
};

