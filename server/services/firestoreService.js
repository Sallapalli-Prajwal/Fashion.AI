/**
 * Google Firestore Service
 * Handles database operations for storing and retrieving outfit analysis results
 */

const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
const fs = require('fs');
const { logAPICall } = require('../middleware/logging');

// Initialize Firestore client
let db;

// Export getter function for session store
function getFirestoreDb() {
  return db;
}

function initializeFirestore() {
  try {
    const projectId = process.env.GOOGLE_PROJECT_ID || 'outfit-vision';
    const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
    
    // In Cloud Run, use Application Default Credentials (ADC)
    // The service account attached to Cloud Run will be used automatically
    if (process.env.NODE_ENV === 'production') {
      // Production: Use ADC (no credentials file needed)
      // Firestore will automatically use the service account attached to Cloud Run
      const config = {
        projectId: projectId,
        databaseId: databaseId
        // No credentials specified - will use ADC from Cloud Run service account
      };
      
      db = new Firestore(config);
      console.log(`✅ Firestore client initialized with Application Default Credentials (Cloud Run)`);
      console.log(`   Project ID: ${projectId}, Database ID: ${databaseId}`);
    } else {
      // Development: Try to load credentials from file
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      let credentials = null;
      
      if (credentialsPath) {
        // Resolve path (handle relative paths)
        const resolvedPath = path.isAbsolute(credentialsPath) 
          ? credentialsPath 
          : path.join(__dirname, '../../', credentialsPath);
        
        if (fs.existsSync(resolvedPath)) {
          try {
            const credentialsContent = fs.readFileSync(resolvedPath, 'utf8');
            credentials = JSON.parse(credentialsContent);
            console.log('✅ Loaded service account credentials from:', resolvedPath);
          } catch (parseError) {
            console.warn('⚠️  Failed to parse credentials file:', parseError.message);
          }
        } else {
          console.warn('⚠️  Credentials file not found at:', resolvedPath);
        }
      }
      
      // Initialize Firestore with credentials
      if (credentials) {
        db = new Firestore({
          projectId: credentials.project_id || projectId,
          databaseId: databaseId,
          credentials: credentials
        });
        console.log('✅ Firestore client initialized with service account');
      } else {
        // Fallback: try with keyFilename or default credentials
        const config = {
          projectId: projectId,
          databaseId: databaseId
        };
        
        if (credentialsPath && fs.existsSync(path.resolve(credentialsPath))) {
          config.keyFilename = path.resolve(credentialsPath);
        }
        
        db = new Firestore(config);
        console.log('✅ Firestore client initialized (using default credentials or keyFilename)');
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error('   Make sure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account JSON file');
    }
    // Don't throw in production - let it fail gracefully and use memory store
    if (process.env.NODE_ENV === 'production') {
      console.error('   Will fall back to memory session store (sessions will not persist)');
    } else {
      throw error;
    }
  }
}

// Initialize on module load - but don't crash if it fails
// In Cloud Run, Firestore will use Application Default Credentials
try {
  initializeFirestore();
} catch (error) {
  console.error('❌ Firestore initialization failed:', error.message);
  console.error('   The app will continue but Firestore features will not work.');
  console.error('   Session persistence will use memory store (sessions will not persist across instances).');
  // Don't throw - let the app start
  db = null;
}

/**
 * Check if photo URL already exists in database
 * @param {string} userId - User ID
 * @param {string} photoURL - Photo URL
 * @returns {Promise<boolean>} True if exists
 */
const photoExists = async (userId, photoURL) => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error('Firestore not initialized. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
  }
  
  try {
    const outfitsRef = db.collection('users').doc(userId).collection('outfits');
    const query = outfitsRef.where('photoURL', '==', photoURL).limit(1);
    const snapshot = await query.get();
    
    const duration = Date.now() - startTime;
    const exists = !snapshot.empty;
    
    logAPICall('Firestore (Check Photo)', {
      userId,
      photoURL: photoURL.substring(0, 50) + '...'
    }, { exists }, duration);
    
    return exists;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Firestore (Check Photo)', { userId, photoURL }, null, duration, error);
    throw new Error(`Firestore error: ${error.message}`);
  }
};

/**
 * Store outfit analysis result
 * @param {string} userId - User ID
 * @param {Object} outfitData - Outfit analysis data
 * @returns {Promise<string>} Document ID
 */
const storeOutfit = async (userId, outfitData) => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error('Firestore not initialized. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
  }
  
  try {
    // Ensure user document exists (create if it doesn't)
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    
    // Create document reference for outfit subcollection
    const outfitsRef = userRef.collection('outfits');
    
    // Use photoURL hash as document ID for deduplication
    const crypto = require('crypto');
    const docId = crypto.createHash('md5').update(outfitData.photoURL).digest('hex');
    
    // Prepare document data
    const docData = {
      ...outfitData,
      userId,
      processedAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store document
    await outfitsRef.doc(docId).set(docData, { merge: true });
    
    console.log('✅ Stored outfit in Firestore:', {
      userId,
      docId,
      photoURL: outfitData.photoURL.substring(0, 50),
      styleCategory: outfitData.styleCategory
    });
    
    const duration = Date.now() - startTime;
    
    // Verify the document was stored
    const storedDoc = await outfitsRef.doc(docId).get();
    if (!storedDoc.exists) {
      throw new Error('Failed to verify outfit was stored in Firestore');
    }
    
    logAPICall('Firestore (Store Outfit)', {
      userId,
      docId,
      photoURL: outfitData.photoURL.substring(0, 50) + '...',
      styleCategory: outfitData.styleCategory
    }, { success: true, verified: true }, duration);
    
    console.log('✅ Verified outfit stored in Firestore:', {
      userId,
      docId,
      exists: storedDoc.exists,
      dataFields: Object.keys(storedDoc.data() || {})
    });
    
    return docId;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Firestore (Store Outfit)', { userId }, null, duration, error);
    throw new Error(`Firestore store error: ${error.message}`);
  }
};

/**
 * Get all outfits for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of outfit documents
 */
const getUserOutfits = async (userId, limit = 100) => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error('Firestore not initialized. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
  }
  
  try {
    const outfitsRef = db.collection('users').doc(userId).collection('outfits');
    
    // Try to order by processedAt, but handle case where field might not exist
    let snapshot;
    try {
      snapshot = await outfitsRef
        .orderBy('processedAt', 'desc')
        .limit(limit)
        .get();
    } catch (orderError) {
      // If ordering fails (e.g., no index), just get all without ordering
      console.warn('⚠️  Could not order by processedAt, fetching without order:', orderError.message);
      snapshot = await outfitsRef
        .limit(limit)
        .get();
    }
    
    const outfits = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      outfits.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort manually if needed (fallback)
    outfits.sort((a, b) => {
      const aTime = a.processedAt?.toDate?.() || a.processedAt || new Date(0);
      const bTime = b.processedAt?.toDate?.() || b.processedAt || new Date(0);
      return bTime - aTime;
    });
    
    const duration = Date.now() - startTime;
    
    console.log('📥 Retrieved', outfits.length, 'outfits from Firestore for user:', userId);
    if (outfits.length > 0) {
      console.log('📋 All outfits:', outfits.map(o => ({
        id: o.id,
        photoURL: o.photoURL,
        driveFileId: o.driveFileId,
        styleCategory: o.styleCategory,
        processedAt: o.processedAt?.toDate?.() || o.processedAt
      })));
    }
    
    logAPICall('Firestore (Get User Outfits)', {
      userId,
      limit
    }, { count: outfits.length }, duration);
    
    return outfits;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Firestore (Get User Outfits)', { userId }, null, duration, error);
    throw new Error(`Firestore get error: ${error.message}`);
  }
};

/**
 * Delete an outfit record
 * @param {string} userId - User ID
 * @param {string} outfitId - Outfit document ID
 * @returns {Promise<boolean>} Success status
 */
const deleteOutfit = async (userId, outfitId) => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error('Firestore not initialized. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
  }
  
  try {
    const outfitRef = db.collection('users').doc(userId).collection('outfits').doc(outfitId);
    await outfitRef.delete();
    
    const duration = Date.now() - startTime;
    
    logAPICall('Firestore (Delete Outfit)', {
      userId,
      outfitId
    }, { success: true }, duration);
    
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Firestore (Delete Outfit)', { userId, outfitId }, null, duration, error);
    throw new Error(`Firestore delete error: ${error.message}`);
  }
};

/**
 * Get aggregated statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
const getUserStats = async (userId) => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error('Firestore not initialized. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
  }
  
  try {
    const outfits = await getUserOutfits(userId, 1000);
    
    // Calculate statistics
    const styleCounts = {};
    const colorCounts = {};
    const occasionCounts = {};
    const seasonCounts = {};
    
    outfits.forEach(outfit => {
      // Style categories
      if (outfit.styleCategory) {
        styleCounts[outfit.styleCategory] = (styleCounts[outfit.styleCategory] || 0) + 1;
      }
      
      // Colors
      if (outfit.topColors && Array.isArray(outfit.topColors)) {
        outfit.topColors.forEach(color => {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        });
      }
      
      // Occasions
      if (outfit.occasion) {
        occasionCounts[outfit.occasion] = (occasionCounts[outfit.occasion] || 0) + 1;
      }
      
      // Seasons
      if (outfit.season) {
        seasonCounts[outfit.season] = (seasonCounts[outfit.season] || 0) + 1;
      }
    });
    
    const stats = {
      totalOutfits: outfits.length,
      styleCounts,
      colorCounts,
      occasionCounts,
      seasonCounts,
      lastUpdated: new Date().toISOString()
    };
    
    const duration = Date.now() - startTime;
    
    logAPICall('Firestore (Get Stats)', {
      userId
    }, { totalOutfits: outfits.length }, duration);
    
    return stats;
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Firestore (Get Stats)', { userId }, null, duration, error);
    throw new Error(`Firestore stats error: ${error.message}`);
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<void>}
 */
const updateUserProfile = async (userId, profileData) => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error('Firestore not initialized. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
  }
  
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      ...profileData,
      updatedAt: new Date()
    }, { merge: true });
    
    const duration = Date.now() - startTime;
    
    logAPICall('Firestore (Update Profile)', {
      userId
    }, { success: true }, duration);
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall('Firestore (Update Profile)', { userId }, null, duration, error);
    throw new Error(`Firestore profile update error: ${error.message}`);
  }
};

// Export getter for session store
function getFirestoreDb() {
  return db;
}

module.exports = {
  photoExists,
  storeOutfit,
  getUserOutfits,
  deleteOutfit,
  getUserStats,
  updateUserProfile,
  getFirestoreDb
};

