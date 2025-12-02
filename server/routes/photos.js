/**
 * Photos Routes
 * Handles fetching photos from Google Photos and local uploads
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAPICall } = require('../middleware/logging');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'outfit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * GET /api/photos
 * Fetch photos from Google Drive
 */
router.get('/', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  if (!req.session.googleAccessToken) {
    return res.status(401).json({ error: 'Not authenticated. Please connect Google account.' });
  }
  
  try {
    const accessToken = req.session.googleAccessToken;
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 50);
    const pageToken = req.query.pageToken || '';
    
    // Search for image files in Google Drive
    const searchParams = new URLSearchParams({
      q: "mimeType contains 'image/' and trashed=false",
      pageSize: String(pageSize),
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, createdTime, size)',
      orderBy: 'createdTime desc'
    });
    
    if (pageToken) {
      searchParams.append('pageToken', pageToken);
    }
    
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const { files, nextPageToken } = response.data;
    
    // Format photos for frontend
    // Use proxy endpoint for images (requires authentication)
    const photos = (files || []).map(file => ({
      id: file.id,
      url: `/api/photos/drive-image/${file.id}`, // Proxy endpoint for display
      webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      thumbnailUrl: `/api/photos/drive-image/${file.id}?thumbnail=true`, // Proxy endpoint for thumbnails
      filename: file.name,
      mimeType: file.mimeType,
      creationTime: file.createdTime,
      size: file.size,
      driveFileId: file.id // Store Drive file ID for later use
    }));
    
    const duration = Date.now() - startTime;
    logAPICall('Google Drive API', {
      pageSize,
      hasPageToken: !!pageToken
    }, {
      photosCount: photos.length,
      hasNextPage: !!nextPageToken
    }, duration);
    
    res.json({
      photos,
      nextPageToken: nextPageToken || null
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Google Drive API', {}, null, duration, error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Authentication expired. Please reconnect.' });
    }
    
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error('❌ Google Drive API 403 Error:', errorMessage);
      return res.status(403).json({ 
        error: 'Access denied to Google Drive',
        message: 'Make sure Google Drive API is enabled and you have granted the required permissions.',
        details: errorMessage
      });
    }
    
    throw error;
  }
}));

/**
 * GET /api/photos/drive-image/:fileId
 * Proxy endpoint to serve Google Drive images with authentication
 */
router.get('/drive-image/:fileId', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { fileId } = req.params;
  const isThumbnail = req.query.thumbnail === 'true';
  
  if (!req.session.googleAccessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const accessToken = req.session.googleAccessToken;
    
    // For thumbnails, try to get thumbnail first
    let imageUrl;
    if (isThumbnail) {
      // Try to get thumbnail from Drive API
      try {
        const fileResponse = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (fileResponse.data.thumbnailLink) {
          // Download thumbnail
          const thumbResponse = await axios.get(fileResponse.data.thumbnailLink, {
            responseType: 'arraybuffer',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          res.set('Content-Type', 'image/jpeg');
          res.set('Cache-Control', 'public, max-age=3600');
          res.send(Buffer.from(thumbResponse.data));
          return;
        }
      } catch (thumbError) {
        console.warn('Thumbnail fetch failed, using full image:', thumbError.message);
      }
    }
    
    // Get full image from Drive
    const imageResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Determine content type from response or default to jpeg
    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
    
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    
    const duration = Date.now() - startTime;
    logAPICall('Drive Image Proxy', { fileId, isThumbnail }, { success: true }, duration);
    
    res.send(Buffer.from(imageResponse.data));
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Drive Image Proxy', { fileId }, null, duration, error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Authentication expired' });
    }
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'Access denied to file' });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    console.error('Drive image proxy error:', error.message);
    res.status(500).json({ error: 'Failed to load image' });
  }
}));

/**
 * POST /api/photos/upload
 * Upload local photo
 */
router.post('/upload', upload.single('photo'), asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    // Read file and convert to base64
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    
    // Create a URL for the uploaded file (in production, upload to cloud storage)
    // For local development, serve files statically
    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/${req.file.filename}`;
    
    const duration = Date.now() - startTime;
    logAPICall('Photo Upload', {
      filename: req.file.originalname,
      size: req.file.size
    }, {
      fileUrl,
      success: true
    }, duration);
    
    res.json({
      success: true,
      photo: {
        id: `local-${Date.now()}`,
        url: fileUrl,
        thumbnailUrl: fileUrl,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        creationTime: new Date().toISOString(),
        localPath: filePath,
        base64: base64Image
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Photo Upload', {}, null, duration, error);
    
    // Clean up file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    throw error;
  }
}));

/**
 * GET /api/photos/:id
 * Get specific photo details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  if (!req.session.googleAccessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const accessToken = req.session.googleAccessToken;
    const photoId = req.params.id;
    
    const response = await axios.get(
      `https://photoslibrary.googleapis.com/v1/mediaItems/${photoId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const item = response.data;
    const photo = {
      id: item.id,
      url: item.baseUrl,
      thumbnailUrl: item.baseUrl + '=w300-h300',
      filename: item.filename,
      mimeType: item.mimeType,
      creationTime: item.mediaMetadata?.creationTime
    };
    
    const duration = Date.now() - startTime;
    logAPICall('Google Photos API (Get Photo)', {
      photoId
    }, { success: true }, duration);
    
    res.json({ photo });
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Google Photos API (Get Photo)', { photoId: req.params.id }, null, duration, error);
    throw error;
  }
}));

module.exports = router;

