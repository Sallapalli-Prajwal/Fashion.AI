import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import { analytics } from '../utils/analytics';
import './Profile.css';

const Profile = ({ user }) => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutfits();
    analytics.profileOpened(); // Track profile page view
    
    // Listen for outfit analyzed event
    const handleOutfitAnalyzed = () => {
      console.log('🔄 Outfit analyzed event received, refreshing profile...');
      loadOutfits();
    };
    
    window.addEventListener('outfitAnalyzed', handleOutfitAnalyzed);
    
    return () => {
      window.removeEventListener('outfitAnalyzed', handleOutfitAnalyzed);
    };
  }, []);

  const loadOutfits = async () => {
    try {
      const response = await axios.get(`${config.API_BASE}/records`);
      console.log('📥 Profile loaded outfits:', {
        count: response.data.outfits?.length || 0,
        outfits: response.data.outfits
      });
      setOutfits(response.data.outfits || []);
    } catch (error) {
      console.error('Failed to load outfits:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (outfitId) => {
    if (!window.confirm('Are you sure you want to delete this outfit analysis?')) {
      return;
    }

    try {
      await axios.delete(`${config.API_BASE}/records/${outfitId}`);
      await loadOutfits();
      alert('Outfit deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete outfit');
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>Profile & History</h1>
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2>{user?.name || 'User'}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="section">
          <h2>Outfit History ({outfits.length})</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : outfits.length === 0 ? (
            <div className="empty-state">
              <p>No outfits analyzed yet.</p>
            </div>
          ) : (
            <div className="outfits-list">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="outfit-item">
                  <div className="outfit-image">
                    <img
                      src={
                        (() => {
                          let imageUrl = outfit.photoURL || '/placeholder.jpg';
                          if (outfit.photoURL?.startsWith('drive-')) {
                            const driveFileId = outfit.photoURL.replace('drive-', '');
                            imageUrl = `${config.API_BASE}/photos/drive-image/${driveFileId}?thumbnail=true`;
                          } else if (outfit.driveFileId) {
                            imageUrl = `${config.API_BASE}/photos/drive-image/${outfit.driveFileId}?thumbnail=true`;
                          }
                          return imageUrl;
                        })()
                      }
                      alt="Outfit"
                      onError={(e) => {
                        console.error('❌ Profile image failed to load:', outfit.photoURL);
                        e.target.src = 'https://via.placeholder.com/150x150?text=Outfit';
                      }}
                    />
                  </div>
                  <div className="outfit-details">
                    <h3>{outfit.styleCategory || 'Unknown Style'}</h3>
                    <p className="outfit-summary">{outfit.geminiSummary}</p>
                    <div className="outfit-meta">
                      <span className="meta-item">
                        <strong>Occasion:</strong> {outfit.occasion || 'N/A'}
                      </span>
                      <span className="meta-item">
                        <strong>Season:</strong> {outfit.season || 'N/A'}
                      </span>
                      <span className="meta-item">
                        <strong>Processed:</strong>{' '}
                        {new Date(outfit.processedAt?.toDate?.() || outfit.processedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {outfit.topColors && outfit.topColors.length > 0 && (
                      <div className="outfit-colors">
                        <strong>Colors:</strong>
                        {outfit.topColors.map((color, idx) => (
                          <span key={idx} className="color-chip">{color}</span>
                        ))}
                      </div>
                    )}
                    {outfit.suggestions && outfit.suggestions.length > 0 && (
                      <div className="outfit-suggestions">
                        <strong>Suggestions:</strong>
                        <ul>
                          {outfit.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(outfit.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

