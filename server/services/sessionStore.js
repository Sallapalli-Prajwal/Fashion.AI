/**
 * Firestore Session Store for express-session
 * Persists sessions in Firestore for Cloud Run's stateless environment
 */

const { Firestore } = require('@google-cloud/firestore');

class FirestoreSessionStore {
  constructor(options = {}) {
    this.collectionName = options.collectionName || 'sessions';
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    this._getDb = options.getDb || null;
  }

  _getFirestoreDb() {
    if (this._getDb) {
      return this._getDb();
    }
    // Try to get from firestoreService
    try {
      const firestoreService = require('./firestoreService');
      return firestoreService.getFirestoreDb();
    } catch (error) {
      console.error('❌ Failed to get Firestore DB:', error);
      return null;
    }
  }

  async get(sessionId, callback) {
    try {
      const db = this._getFirestoreDb();
      if (!db) {
        // Silently return null - Firestore might not be initialized yet
        return callback(null, null);
      }

      const doc = await db.collection(this.collectionName).doc(sessionId).get();
      
      if (!doc.exists) {
        return callback(null, null);
      }

      const data = doc.data();
      const now = Date.now();

      // Check if session expired
      if (data.expires && data.expires < now) {
        await this.destroy(sessionId, () => {});
        return callback(null, null);
      }

      // Parse session data - express-session stores it as JSON string
      let sessionData = {};
      if (data.session) {
        if (typeof data.session === 'string') {
          sessionData = JSON.parse(data.session);
        } else {
          sessionData = data.session;
        }
      }
      callback(null, sessionData);
    } catch (error) {
      console.error('❌ Firestore session get error:', error);
      callback(error, null);
    }
  }

  async set(sessionId, session, callback) {
    try {
      const db = this._getFirestoreDb();
      if (!db) {
        // Silently skip - Firestore might not be initialized yet
        // This allows the app to start even if Firestore isn't ready
        return callback(null);
      }

      const expires = Date.now() + this.ttl;
      
      // Serialize session data - express-session expects JSON string
      const sessionData = typeof session === 'string' ? session : JSON.stringify(session);
      
      await db.collection(this.collectionName).doc(sessionId).set({
        session: sessionData,
        expires: expires,
        updatedAt: new Date()
      }, { merge: true });

      callback(null);
    } catch (error) {
      console.error('❌ Firestore session set error:', error);
      callback(error);
    }
  }

  async destroy(sessionId, callback) {
    try {
      const db = this._getFirestoreDb();
      if (!db) {
        return callback(null);
      }

      await db.collection(this.collectionName).doc(sessionId).delete();
      callback(null);
    } catch (error) {
      console.error('❌ Firestore session destroy error:', error);
      callback(error);
    }
  }

  async touch(sessionId, session, callback) {
    // Update expiration time
    this.set(sessionId, session, callback);
  }
}

module.exports = FirestoreSessionStore;

