/**
 * Google Gemini API Service
 * Handles style analysis and recommendations using Google Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logAPICall } = require('../middleware/logging');

// Available Gemini models (in order of preference)
// gemini-pro is the stable model for v1 API and works with REST API
// Use gemini-pro as primary since it's most reliable
const AVAILABLE_MODELS = ['gemini-pro'];

// Initialize Gemini client
let genAI;
let model;
let currentModelName;

function initializeGeminiModel(modelToTry = null) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  GOOGLE_GEMINI_API_KEY not configured');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Use specified model or try models in order
    let modelName;
    if (modelToTry) {
      modelName = modelToTry;
    } else if (process.env.GEMINI_MODEL) {
      modelName = process.env.GEMINI_MODEL;
    } else {
      // Default to gemini-pro which is stable for v1 API
      modelName = 'gemini-pro';
    }
    
    // Create the model (errors will occur when actually using it, not here)
    model = genAI.getGenerativeModel({ model: modelName });
    currentModelName = modelName;
    console.log(`✅ Gemini model initialized: ${modelName}`);
    console.log(`   Note: If this model fails, try: ${AVAILABLE_MODELS.join(', ')}`);
    return true;
  } catch (error) {
    console.error('❌ Gemini client initialization failed:', error.message);
    console.error('   Available models:', AVAILABLE_MODELS.join(', '));
    return false;
  }
}

// Initialize on module load
initializeGeminiModel();

/**
 * Analyze outfit style using Gemini API
 * @param {Object} visionData - Results from Vision API
 * @param {string} imageUri - Optional image URL for vision model
 * @returns {Promise<Object>} Style analysis results
 */
const analyzeStyle = async (visionData, imageUri = null) => {
  const startTime = Date.now();

  // Try with current model, fallback to other models if it fails
  let lastError;
  for (let attempt = 0; attempt < AVAILABLE_MODELS.length; attempt++) {
    try {
      // Initialize or reinitialize with the model for this attempt
      const modelToTry = AVAILABLE_MODELS[attempt];
      if (attempt === 0 && model && currentModelName === modelToTry) {
        // Use existing model if it's already the one we want
      } else {
        console.log(`🔄 Initializing Gemini model: ${modelToTry}`);
        const initialized = initializeGeminiModel(modelToTry);
        if (!initialized || !model) {
          console.warn(`⚠️  Failed to initialize ${modelToTry}, trying next model...`);
          continue;
        }
      }

      return await tryAnalyzeStyle(visionData, imageUri, startTime);
    } catch (error) {
      lastError = error;
      // Check if it's a model not found error (could be in error.message or error.toString())
      const errorMessage = error.message || error.toString() || '';
      const isModelNotFound = errorMessage.includes('not found') || 
                               errorMessage.includes('404') ||
                               errorMessage.includes('is not found for API version');
      
      // If it's a model not found error, try next model
      if (isModelNotFound && attempt < AVAILABLE_MODELS.length - 1) {
        console.warn(`⚠️  Model ${currentModelName} failed: ${errorMessage.substring(0, 100)}`);
        console.warn(`   Trying next model: ${AVAILABLE_MODELS[attempt + 1]}...`);
        continue;
      }
      // Otherwise, throw the error
      throw error;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All Gemini models failed');
};

const tryAnalyzeStyle = async (visionData, imageUri = null, startTime) => {
  try {
    // Extract relevant information from Vision data
    const labels = visionData.labels?.map(l => l.description).join(', ') || 'No labels detected';
    const colors = visionData.colors?.slice(0, 5).map(c => {
      const rgb = c.color;
      return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
    }).join(', ') || 'No colors detected';
    const objects = visionData.objects?.map(o => o.name).join(', ') || 'No objects detected';

    // Construct prompt
    const prompt = `You are a professional fashion stylist. Analyze this outfit based on the following information from image analysis:

Vision API Results:
- Detected Items/Labels: ${labels}
- Dominant Colors: ${colors}
- Objects: ${objects}

Please provide a comprehensive analysis in the following JSON format:
{
  "styleCategory": "one of: Streetwear, Formal, Casual Chic, Vintage, Athleisure, Bohemian, Minimalist, Classic, Trendy, Eclectic",
  "summary": "A brief 2-3 sentence description of the outfit's overall style and aesthetic",
  "topColors": ["array of 3-5 main colors identified"],
  "suggestions": ["array of 3-5 practical styling suggestions or improvements"],
  "occasion": "suggested occasion for this outfit (e.g., 'Daytime Meeting', 'Casual Weekend', 'Evening Event')",
  "season": "suggested season (Spring, Summer, Fall, Winter, All-Season)"
}

Be concise, practical, and fashion-forward in your analysis.`;

    // Try REST API with v1beta endpoint (supports newer models), then v1, then fallback
    let text;
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const axios = require('axios');
    
    // Try v1beta first (supports gemini-1.5 models), then v1
    const apiVersions = ['v1beta', 'v1'];
    let apiError = null;
    
    for (const version of apiVersions) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/${version}/models/${currentModelName}:generateContent?key=${apiKey}`;
        const restResponse = await axios.post(restUrl, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        if (restResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          text = restResponse.data.candidates[0].content.parts[0].text;
          console.log(`✅ Used REST API (${version}) for ${currentModelName}`);
          break;
        } else {
          throw new Error('Invalid REST API response format');
        }
      } catch (restError) {
        apiError = restError;
        const errorMsg = restError.response?.data?.error?.message || restError.message || 'Unknown error';
        console.log(`⚠️  REST API (${version}) failed: ${errorMsg.substring(0, 100)}`);
        // Continue to next version
      }
    }
    
    // If REST API failed, try SDK as fallback
    if (!text) {
      try {
        console.log(`⚠️  Trying SDK as fallback...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        console.log(`✅ SDK fallback succeeded`);
      } catch (sdkError) {
        // If SDK also fails, create a fallback response from Vision data
        console.error(`❌ All Gemini API methods failed. Creating fallback from Vision API data.`);
        apiError = sdkError;
      }
    }
    
    // If all API calls failed, create a fallback response from Vision data
    if (!text) {
      console.warn('⚠️  Gemini API unavailable. Creating basic analysis from Vision API data.');
      const styleCategory = labels.toLowerCase().includes('formal') || labels.toLowerCase().includes('suit') ? 'Formal' : 
                           labels.toLowerCase().includes('casual') || labels.toLowerCase().includes('t-shirt') ? 'Casual Chic' : 
                           labels.toLowerCase().includes('vintage') ? 'Vintage' : 'Classic';
      
      text = JSON.stringify({
        styleCategory: styleCategory,
        summary: `Outfit analysis based on detected items: ${labels.split(', ').slice(0, 5).join(', ')}.`,
        topColors: colors.split(', ').slice(0, 5).filter(c => c.trim()),
        suggestions: ['Consider adding accessories to complete the look', 'Try experimenting with different color combinations', 'Mix and match with complementary pieces'],
        occasion: 'Casual',
        season: 'All-Season'
      });
    }
    
    const duration = Date.now() - startTime;

    // Parse JSON from response (may be wrapped in markdown code blocks)
    let geminiData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      geminiData = JSON.parse(jsonText);
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
      console.warn('Failed to parse Gemini JSON, using text fallback');
      geminiData = {
        styleCategory: 'Casual Chic',
        summary: text.substring(0, 200),
        topColors: colors.split(', ').slice(0, 5),
        suggestions: ['Consider adding accessories', 'Try different color combinations', 'Experiment with layering'],
        occasion: 'Casual',
        season: 'All-Season'
      };
    }

    // Log API call
    logAPICall('Google Gemini API', {
      labelsCount: visionData.labels?.length || 0,
      colorsCount: visionData.colors?.length || 0
    }, {
      styleCategory: geminiData.styleCategory,
      occasion: geminiData.occasion
    }, duration, null, global.currentReq || null);

    return geminiData;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Google Gemini API', { visionData: 'present' }, null, duration, error, global.currentReq || null);
    throw error; // Re-throw to allow fallback logic
  }
};

/**
 * Generate outfit recommendations based on user's style profile
 * @param {Array} userOutfits - Array of previously analyzed outfits
 * @returns {Promise<Object>} Personalized recommendations
 */
const generateRecommendations = async (userOutfits) => {
  const startTime = Date.now();

  // Try with current model, fallback to other models if it fails
  let lastError;
  for (let attempt = 0; attempt < AVAILABLE_MODELS.length; attempt++) {
    try {
      // Initialize or reinitialize with the model for this attempt
      const modelToTry = AVAILABLE_MODELS[attempt];
      if (attempt === 0 && model && currentModelName === modelToTry) {
        // Use existing model if it's already the one we want
      } else {
        console.log(`🔄 Initializing Gemini model: ${modelToTry}`);
        const initialized = initializeGeminiModel(modelToTry);
        if (!initialized || !model) {
          console.warn(`⚠️  Failed to initialize ${modelToTry}, trying next model...`);
          continue;
        }
      }

      return await tryGenerateRecommendations(userOutfits, startTime);
    } catch (error) {
      lastError = error;
      // Check if it's a model not found error (could be in error.message or error.toString())
      const errorMessage = error.message || error.toString() || '';
      const isModelNotFound = errorMessage.includes('not found') || 
                               errorMessage.includes('404') ||
                               errorMessage.includes('is not found for API version');
      
      // If it's a model not found error, try next model
      if (isModelNotFound && attempt < AVAILABLE_MODELS.length - 1) {
        console.warn(`⚠️  Model ${currentModelName} failed: ${errorMessage.substring(0, 100)}`);
        console.warn(`   Trying next model: ${AVAILABLE_MODELS[attempt + 1]}...`);
        continue;
      }
      // Otherwise, throw the error
      throw error;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All Gemini models failed');
};

const tryGenerateRecommendations = async (userOutfits, startTime) => {
  try {
    // Analyze user's style profile
    const styleCategories = userOutfits.map(o => o.styleCategory).filter(Boolean);
    const allColors = userOutfits.flatMap(o => o.topColors || []).filter(Boolean);
    const commonStyles = styleCategories.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {});

    const prompt = `Based on a user's outfit history, provide personalized fashion recommendations:

Style Profile:
- Most Common Styles: ${JSON.stringify(commonStyles)}
- Frequently Used Colors: ${allColors.slice(0, 10).join(', ')}

Provide recommendations in JSON format:
{
  "recommendedStyles": ["array of 2-3 style categories to try"],
  "colorSuggestions": ["array of 3-5 color combinations to experiment with"],
  "tips": ["array of 3-5 personalized styling tips"],
  "nextOutfitIdeas": ["array of 3-5 specific outfit ideas based on their style"]
}`;

    // Try REST API with v1beta endpoint (supports newer models), then v1, then fallback
    let text;
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const axios = require('axios');
    
    // Try v1beta first (supports gemini-1.5 models), then v1
    const apiVersions = ['v1beta', 'v1'];
    let apiError = null;
    
    for (const version of apiVersions) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/${version}/models/${currentModelName}:generateContent?key=${apiKey}`;
        const restResponse = await axios.post(restUrl, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        if (restResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          text = restResponse.data.candidates[0].content.parts[0].text;
          console.log(`✅ Used REST API (${version}) for ${currentModelName}`);
          break;
        } else {
          throw new Error('Invalid REST API response format');
        }
      } catch (restError) {
        apiError = restError;
        const errorMsg = restError.response?.data?.error?.message || restError.message || 'Unknown error';
        console.log(`⚠️  REST API (${version}) failed: ${errorMsg.substring(0, 100)}`);
        // Continue to next version
      }
    }
    
    // If REST API failed, try SDK as fallback
    if (!text) {
      try {
        console.log(`⚠️  Trying SDK as fallback...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        console.log(`✅ SDK fallback succeeded`);
      } catch (sdkError) {
        console.error(`❌ All Gemini API methods failed for recommendations.`);
        apiError = sdkError;
      }
    }
    
    // If all API calls failed, create a fallback response
    if (!text) {
      console.warn('⚠️  Gemini API unavailable. Creating basic recommendations.');
      text = JSON.stringify({
        recommendedStyles: ['Casual Chic', 'Minimalist'],
        colorSuggestions: ['Navy and White', 'Black and Beige'],
        tips: ['Try mixing textures', 'Experiment with accessories'],
        nextOutfitIdeas: ['Smart casual blazer combo', 'Layered casual look']
      });
    }
    
    const duration = Date.now() - startTime;

    // Parse JSON response
    let recommendations;
    try {
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      recommendations = JSON.parse(jsonText);
    } catch (parseError) {
      recommendations = {
        recommendedStyles: ['Casual Chic', 'Minimalist'],
        colorSuggestions: ['Navy and White', 'Black and Beige'],
        tips: ['Try mixing textures', 'Experiment with accessories'],
        nextOutfitIdeas: ['Smart casual blazer combo', 'Layered casual look']
      };
    }

    logAPICall('Google Gemini API (Recommendations)', {
      outfitsCount: userOutfits.length
    }, {
      recommendedStylesCount: recommendations.recommendedStyles?.length || 0
    }, duration, null, global.currentReq || null);

    return recommendations;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Google Gemini API (Recommendations)', {}, null, duration, error, global.currentReq || null);
    throw error; // Re-throw to allow fallback logic
  }
};

module.exports = {
  analyzeStyle,
  generateRecommendations
};

