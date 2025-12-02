/**
 * Analyze Routes
 * Handles image analysis using Vision API and Gemini API
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const { asyncHandler } = require('../middleware/errorHandler');
const visionService = require('../services/visionService');
const geminiService = require('../services/geminiService');
const firestoreService = require('../services/firestoreService');

/**
 * POST /api/analyze
 * Analyze a single photo or multiple photos
 */
router.post('/', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { photoUrl, photoId, isBase64, localPath, driveFileId } = req.body;
  
  if (!photoUrl && !isBase64 && !localPath) {
    return res.status(400).json({ error: 'Photo URL, base64 data, or local path required' });
  }
  
  try {
    const userId = req.session.userId;
    let imageUri = photoUrl;
    let isBase64Flag = isBase64 || false;
    
    // Handle Google Drive file - get download URL with auth
    if (driveFileId && req.session.googleAccessToken) {
      // Use Drive API to get download URL
      const axios = require('axios');
      try {
        const driveResponse = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`,
          {
            headers: {
              'Authorization': `Bearer ${req.session.googleAccessToken}`
            },
            responseType: 'arraybuffer'
          }
        );
        // Convert to base64 for Vision API
        imageUri = Buffer.from(driveResponse.data).toString('base64');
        isBase64Flag = true;
      } catch (driveError) {
        console.warn('Failed to download from Drive, using provided URL:', driveError.message);
        // Fall back to provided URL
      }
    }
    
    // Handle local file path
    if (localPath) {
      try {
        // Check if file exists
        if (!fs.existsSync(localPath)) {
          return res.status(400).json({ error: `Local file not found: ${localPath}` });
        }
        const fileBuffer = fs.readFileSync(localPath);
        imageUri = fileBuffer.toString('base64');
        isBase64Flag = true;
        console.log(`📁 Using local file: ${localPath}`);
      } catch (fileError) {
        console.error('Error reading local file:', fileError);
        return res.status(400).json({ error: `Failed to read local file: ${fileError.message}` });
      }
    }
    
    // Check if photo already processed
    if (photoUrl && !isBase64Flag) {
      const exists = await firestoreService.photoExists(userId, photoUrl);
      if (exists) {
        return res.json({
          success: true,
          message: 'Photo already analyzed',
          skipped: true
        });
      }
    }
    
    // Step 1: Analyze with Vision API
    const visionData = await visionService.analyze(imageUri, isBase64Flag);
    
    // Step 2: Analyze style with Gemini API
    const geminiData = await geminiService.analyzeStyle(visionData, photoUrl);
    
    // Step 3: Combine results
    // Use consistent photoURL format: drive-{fileId} for Drive files, actual URL for local files
    let storagePhotoURL;
    let actualDriveFileId = null;
    
    if (driveFileId && !driveFileId.startsWith('local-')) {
      // Real Drive file
      storagePhotoURL = `drive-${driveFileId}`;
      actualDriveFileId = driveFileId;
    } else if (localPath) {
      // Local file - use the actual file URL from upload
      // Extract filename from localPath and construct URL
      const filename = localPath.split(/[/\\]/).pop();
      // Use the same URL format as the upload endpoint returns
      storagePhotoURL = `${req.protocol}://${req.get('host')}/api/uploads/${filename}`;
      actualDriveFileId = null;
    } else if (photoUrl && photoUrl.startsWith('http')) {
      // Already a valid URL (from local upload)
      storagePhotoURL = photoUrl;
      actualDriveFileId = null;
    } else {
      // Fallback to provided photoUrl (should be a valid URL)
      storagePhotoURL = photoUrl || `local-${Date.now()}`;
      actualDriveFileId = null;
    }
    
    const outfitData = {
      photoURL: storagePhotoURL, // Actual URL for local files, drive-{id} for Drive files
      photoId: photoId || actualDriveFileId || null,
      driveFileId: actualDriveFileId,
      userId: userId,
      visionTags: visionData.labels.map(l => l.description),
      visionLabels: visionData.labels,
      topColors: geminiData.topColors || [],
      dominantColors: visionData.colors.map(c => ({
        rgb: `rgb(${c.color.red}, ${c.color.green}, ${c.color.blue})`,
        score: c.score
      })),
      objects: visionData.objects.map(o => o.name),
      geminiSummary: geminiData.summary,
      styleCategory: geminiData.styleCategory,
      occasion: geminiData.occasion,
      season: geminiData.season,
      suggestions: geminiData.suggestions || [],
      processedAt: new Date()
    };
    
    // Step 4: Store in Firestore
    console.log('📦 Storing outfit data:', {
      userId,
      photoURL: outfitData.photoURL,
      driveFileId: outfitData.driveFileId,
      styleCategory: outfitData.styleCategory,
      isDrivePhoto: !!outfitData.driveFileId,
      photoURLFormat: outfitData.photoURL?.startsWith('drive-') ? 'drive-format' : 'other'
    });
    
    const docId = await firestoreService.storeOutfit(userId, outfitData);
    
    console.log('✅ Outfit stored successfully!', {
      docId,
      photoURL: outfitData.photoURL,
      driveFileId: outfitData.driveFileId,
      styleCategory: outfitData.styleCategory
    });
    
    const duration = Date.now() - startTime;
    
    res.json({
      success: true,
      outfit: {
        id: docId,
        ...outfitData
      },
      processingTime: `${duration}ms`
    });
  } catch (error) {
    throw error;
  }
}));

/**
 * POST /api/analyze/batch
 * Analyze multiple photos
 */
router.post('/batch', asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { photos } = req.body;
  
  if (!Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ error: 'Photos array required' });
  }
  
  const results = [];
  const errors = [];
  
  // Process photos sequentially to avoid rate limits
  for (const photo of photos) {
    try {
      const analyzeReq = {
        ...req,
        body: {
          photoUrl: photo.url || photo.photoUrl,
          photoId: photo.id || photo.photoId,
          driveFileId: photo.driveFileId || photo.id, // Use Drive file ID if available
          isBase64: photo.isBase64 || false,
          localPath: photo.localPath || null
        }
      };
      
      // Check if already processed using consistent format
      const checkPhotoURL = photo.driveFileId 
        ? `drive-${photo.driveFileId}` 
        : (photo.url || photo.photoUrl);
      
      if (checkPhotoURL) {
        const exists = await firestoreService.photoExists(req.session.userId, checkPhotoURL);
        if (exists) {
          results.push({
            photoId: photo.id,
            skipped: true,
            message: 'Already analyzed'
          });
          continue;
        }
      }
      
      // Handle Google Drive file - get download URL with auth
      let imageUri = photo.isBase64 ? photo.base64 : (photo.url || photo.photoUrl);
      let isBase64Flag = photo.isBase64 || false;
      
      if (photo.driveFileId && req.session.googleAccessToken) {
        const axios = require('axios');
        try {
          const driveResponse = await axios.get(
            `https://www.googleapis.com/drive/v3/files/${photo.driveFileId}?alt=media`,
            {
              headers: {
                'Authorization': `Bearer ${req.session.googleAccessToken}`
              },
              responseType: 'arraybuffer'
            }
          );
          imageUri = Buffer.from(driveResponse.data).toString('base64');
          isBase64Flag = true;
        } catch (driveError) {
          console.warn('Failed to download from Drive, using provided URL:', driveError.message);
        }
      }
      
      // Analyze photo
      const visionData = await visionService.analyze(imageUri, isBase64Flag);
      const geminiData = await geminiService.analyzeStyle(visionData, checkPhotoURL);
      
      // Use consistent photoURL format for storage
      const storagePhotoURL = photo.driveFileId 
        ? `drive-${photo.driveFileId}` 
        : (photo.url || photo.photoUrl || `local-${Date.now()}`);
      
      const outfitData = {
        photoURL: storagePhotoURL, // Consistent format
        photoId: photo.id || photo.driveFileId || null,
        driveFileId: photo.driveFileId || photo.id || null,
        userId: req.session.userId,
        visionTags: visionData.labels.map(l => l.description),
        visionLabels: visionData.labels,
        topColors: geminiData.topColors || [],
        dominantColors: visionData.colors.map(c => ({
          rgb: `rgb(${c.color.red}, ${c.color.green}, ${c.color.blue})`,
          score: c.score
        })),
        objects: visionData.objects.map(o => o.name),
        geminiSummary: geminiData.summary,
        styleCategory: geminiData.styleCategory,
        occasion: geminiData.occasion,
        season: geminiData.season,
        suggestions: geminiData.suggestions || [],
        processedAt: new Date()
      };
      
      const docId = await firestoreService.storeOutfit(req.session.userId, outfitData);
      
      results.push({
        photoId: photo.id,
        success: true,
        outfitId: docId,
        outfit: outfitData
      });
    } catch (error) {
      errors.push({
        photoId: photo.id,
        error: error.message
      });
    }
  }
  
  console.log('✅ Batch analysis complete:', {
    processed: results.length,
    errors: errors.length,
    results: results.map(r => ({
      photoId: r.photoId,
      success: r.success,
      skipped: r.skipped,
      outfitId: r.outfitId
    }))
  });
  
  res.json({
    success: true,
    processed: results.length,
    errors: errors.length,
    results,
    errors
  });
}));

module.exports = router;

