/**
 * Stats Routes
 * Handles statistics and analytics endpoints
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const firestoreService = require('../services/firestoreService');
const geminiService = require('../services/geminiService');

/**
 * GET /api/stats
 * Get aggregated statistics for the authenticated user
 */
router.get('/', asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = req.session.userId;
  const stats = await firestoreService.getUserStats(userId);
  
  res.json({
    success: true,
    stats
  });
}));

/**
 * GET /api/stats/recommendations
 * Get personalized outfit recommendations
 */
router.get('/recommendations', asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = req.session.userId;
  
  // Get user's outfit history
  const outfits = await firestoreService.getUserOutfits(userId, 50);
  
  if (outfits.length === 0) {
    return res.json({
      success: true,
      recommendations: {
        message: 'Analyze more outfits to get personalized recommendations',
        recommendedStyles: [],
        colorSuggestions: [],
        tips: [],
        nextOutfitIdeas: []
      }
    });
  }
  
  // Generate recommendations using Gemini
  const recommendations = await geminiService.generateRecommendations(outfits);
  
  res.json({
    success: true,
    recommendations,
    basedOn: outfits.length
  });
}));

module.exports = router;

