import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import { analytics } from '../utils/analytics';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentOutfits, setRecentOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Track dashboard view
    analytics.trackEvent('dashboard_viewed');
    
    // Listen for outfit analyzed event
    const handleOutfitAnalyzed = () => {
      console.log('🔄 Outfit analyzed event received, refreshing dashboard...');
      loadDashboardData();
    };
    
    window.addEventListener('outfitAnalyzed', handleOutfitAnalyzed);
    
    // Refresh dashboard data every 30 seconds to catch new analyses (less frequent)
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => {
      window.removeEventListener('outfitAnalyzed', handleOutfitAnalyzed);
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, recordsRes] = await Promise.all([
        axios.get(`${config.API_BASE}/stats`),
        axios.get(`${config.API_BASE}/records?limit=5`)
      ]);

      const outfits = recordsRes.data.outfits || [];
      
      // Only log if outfits count changed or first time
      if (outfits.length !== recentOutfits.length) {
        console.log('📊 Dashboard data loaded (NEW DATA):', {
          stats: statsRes.data.stats,
          outfitsCount: outfits.length,
          previousCount: recentOutfits.length,
          outfits: outfits.map(o => ({
            id: o.id,
            photoURL: o.photoURL,
            driveFileId: o.driveFileId,
            styleCategory: o.styleCategory,
            isDrivePhoto: !!o.driveFileId || o.photoURL?.startsWith('drive-')
          }))
        });
      }

      setStats(statsRes.data.stats);
      setRecentOutfits(outfits);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p>Here's your outfit analysis overview</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📸</div>
            <div className="stat-content">
              <h3>{stats.totalOutfits || 0}</h3>
              <p>Outfits Analyzed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎨</div>
            <div className="stat-content">
              <h3>{Object.keys(stats.styleCounts || {}).length}</h3>
              <p>Style Categories</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌈</div>
            <div className="stat-content">
              <h3>{Object.keys(stats.colorCounts || {}).length}</h3>
              <p>Unique Colors</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>
                {Object.keys(stats.styleCounts || {}).length > 0
                  ? Object.entries(stats.styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                  : 'N/A'}
              </h3>
              <p>Top Style</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-sections">
        <div className="section">
          <h2>Recent Outfits</h2>
          {recentOutfits.length > 0 ? (
            <div className="outfits-grid">
              {recentOutfits.map((outfit) => {
                // Determine image URL
                let imageUrl = outfit.photoURL || '/placeholder.jpg';
                
                if (outfit.photoURL?.startsWith('drive-')) {
                  // Extract Drive file ID (only if it's a real Drive file, not local-*)
                  const driveFileId = outfit.photoURL.replace('drive-', '');
                  if (driveFileId && !driveFileId.startsWith('local-')) {
                    imageUrl = `${config.API_BASE}/photos/drive-image/${driveFileId}?thumbnail=true`;
                  } else {
                    // This is a local file incorrectly stored with drive- prefix
                    // Try to find the actual file - check if we can extract from driveFileId or use a placeholder
                    console.warn('⚠️  Local file incorrectly stored with drive- prefix:', outfit.photoURL);
                    // For now, use a placeholder - in production, you'd want to fix the database
                    imageUrl = '/placeholder.jpg';
                  }
                } else if (outfit.driveFileId && !outfit.driveFileId.startsWith('local-')) {
                  // Use driveFileId if available and it's a real Drive file
                  imageUrl = `${config.API_BASE}/photos/drive-image/${outfit.driveFileId}?thumbnail=true`;
                } else if (outfit.photoURL && outfit.photoURL.startsWith('http')) {
                  // Valid HTTP URL (local file)
                  imageUrl = outfit.photoURL;
                }
                // Otherwise, use photoURL as-is or placeholder
                
                console.log('🖼️ Rendering outfit:', {
                  id: outfit.id,
                  photoURL: outfit.photoURL,
                  driveFileId: outfit.driveFileId,
                  imageUrl: imageUrl,
                  styleCategory: outfit.styleCategory
                });
                
                return (
                  <div key={outfit.id || `outfit-${outfit.photoURL}`} className="outfit-card">
                    <div className="outfit-image">
                      <img 
                        src={imageUrl}
                        alt="Outfit"
                        onError={(e) => {
                          console.error('❌ Image failed to load:', imageUrl);
                          e.target.src = 'https://via.placeholder.com/300x300?text=Outfit+Photo';
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', imageUrl);
                        }}
                      />
                    </div>
                    <div className="outfit-info">
                      <h4>{outfit.styleCategory || 'Unknown Style'}</h4>
                      <p className="outfit-summary">
                        {outfit.geminiSummary || 'No summary available'}
                      </p>
                      <div className="outfit-tags">
                        {outfit.topColors?.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="color-tag">{color}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No outfits analyzed yet. Go to Gallery to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

