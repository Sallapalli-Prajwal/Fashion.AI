/**
 * Google Vision API Service
 * Handles image analysis using Google Cloud Vision API
 */

const vision = require('@google-cloud/vision');
const { logAPICall } = require('../middleware/logging');

// Initialize Vision client
let visionClient;
try {
  visionClient = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId: process.env.GOOGLE_PROJECT_ID
  });
} catch (error) {
  console.warn('⚠️  Vision client initialization warning:', error.message);
  // Will use API key if credentials file not available
}

/**
 * Analyze image using Google Vision API
 * @param {string} imageUri - URL or base64 image data
 * @param {boolean} isBase64 - Whether imageUri is base64 encoded
 * @returns {Promise<Object>} Analysis results
 */
const analyzeImage = async (imageUri, isBase64 = false) => {
  const startTime = Date.now();
  
  try {
    // Prepare image source
    let imageSource;
    if (isBase64) {
      imageSource = { content: imageUri };
    } else {
      imageSource = { source: { imageUri } };
    }

    // Prepare request
    const request = {
      image: imageSource,
      features: [
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'IMAGE_PROPERTIES', maxResults: 1 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'TEXT_DETECTION', maxResults: 5 }
      ]
    };

    // Call Vision API
    const [result] = await visionClient.annotateImage(request);
    const duration = Date.now() - startTime;

    // Extract relevant data
    const labels = result.labelAnnotations?.map(label => ({
      description: label.description,
      score: label.score,
      mid: label.mid
    })) || [];

    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
      color: {
        red: color.color.red,
        green: color.color.green,
        blue: color.color.blue
      },
      score: color.score,
      pixelFraction: color.pixelFraction
    })) || [];

    const objects = result.localizedObjectAnnotations?.map(obj => ({
      name: obj.name,
      score: obj.score,
      boundingPoly: obj.boundingPoly
    })) || [];

    const text = result.textAnnotations?.[0]?.description || '';

    // Prepare response
    const response = {
      labels,
      colors,
      objects,
      text,
      fullResponse: result
    };

    // Log API call
    logAPICall('Google Vision API', {
      imageUri: isBase64 ? '[BASE64]' : imageUri,
      features: request.features.map(f => f.type)
    }, {
      labelsCount: labels.length,
      colorsCount: colors.length,
      objectsCount: objects.length
    }, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Google Vision API', { imageUri }, null, duration, error);
    throw new Error(`Vision API error: ${error.message}`);
  }
};

/**
 * Analyze image using Vision API with API key (fallback method)
 * @param {string} imageUri - URL or base64 image data
 * @param {boolean} isBase64 - Whether imageUri is base64 encoded
 * @returns {Promise<Object>} Analysis results
 */
const analyzeImageWithAPIKey = async (imageUri, isBase64 = false) => {
  const axios = require('axios');
  const startTime = Date.now();

  try {
    // Prepare image source
    let imageSource;
    if (isBase64) {
      imageSource = { content: imageUri };
    } else {
      imageSource = { source: { imageUri } };
    }

    // Prepare request
    const requestBody = {
      requests: [{
        image: imageSource,
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'IMAGE_PROPERTIES', maxResults: 1 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
        ]
      }]
    };

    // Call Vision API via REST
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_VISION_API_KEY not configured');
    }

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      requestBody,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const duration = Date.now() - startTime;
    const result = response.data.responses[0];

    // Extract relevant data
    const labels = result.labelAnnotations?.map(label => ({
      description: label.description,
      score: label.score,
      mid: label.mid
    })) || [];

    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
      color: {
        red: color.color.red,
        green: color.color.green,
        blue: color.color.blue
      },
      score: color.score,
      pixelFraction: color.pixelFraction
    })) || [];

    const objects = result.localizedObjectAnnotations?.map(obj => ({
      name: obj.name,
      score: obj.score,
      boundingPoly: obj.boundingPoly
    })) || [];

    // Prepare response
    const visionData = {
      labels,
      colors,
      objects,
      fullResponse: result
    };

    // Log API call
    logAPICall('Google Vision API (REST)', {
      imageUri: isBase64 ? '[BASE64]' : imageUri
    }, {
      labelsCount: labels.length,
      colorsCount: colors.length,
      objectsCount: objects.length
    }, duration);

    return visionData;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Google Vision API (REST)', { imageUri }, null, duration, error);
    throw new Error(`Vision API error: ${error.message}`);
  }
};

/**
 * Main analyze function - tries SDK first, falls back to REST API
 */
const analyze = async (imageUri, isBase64 = false) => {
  // Try SDK first if available
  if (visionClient && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await analyzeImage(imageUri, isBase64);
    } catch (error) {
      console.warn('Vision SDK failed, trying REST API:', error.message);
    }
  }
  
  // Fall back to REST API with API key
  return await analyzeImageWithAPIKey(imageUri, isBase64);
};

module.exports = {
  analyze,
  analyzeImage,
  analyzeImageWithAPIKey
};

