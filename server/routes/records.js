/**
 * Records Routes
 * Handles retrieving and managing outfit analysis records
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const firestoreService = require('../services/firestoreService');

/**
 * GET /api/records
 * Get all outfit records for the authenticated user
 */
router.get('/', asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const limit = parseInt(req.query.limit) || 100;
  const userId = req.session.userId;
  
  console.log('📥 Fetching outfits for user:', userId);
  const outfits = await firestoreService.getUserOutfits(userId, limit);
  console.log('✅ Retrieved', outfits.length, 'outfits');
  console.log('📋 Sample outfit:', outfits[0] ? {
    id: outfits[0].id,
    photoURL: outfits[0].photoURL,
    driveFileId: outfits[0].driveFileId,
    styleCategory: outfits[0].styleCategory
  } : 'No outfits');
  
  res.json({
    success: true,
    count: outfits.length,
    outfits
  });
}));

/**
 * GET /api/records/:id
 * Get a specific outfit record
 */
router.get('/:id', asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = req.session.userId;
  const outfitId = req.params.id;
  
  const outfits = await firestoreService.getUserOutfits(userId, 1000);
  const outfit = outfits.find(o => o.id === outfitId);
  
  if (!outfit) {
    return res.status(404).json({ error: 'Outfit not found' });
  }
  
  res.json({
    success: true,
    outfit
  });
}));

/**
 * DELETE /api/records/:id
 * Delete an outfit record
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = req.session.userId;
  const outfitId = req.params.id;
  
  await firestoreService.deleteOutfit(userId, outfitId);
  
  res.json({
    success: true,
    message: 'Outfit deleted successfully'
  });
}));

module.exports = router;

