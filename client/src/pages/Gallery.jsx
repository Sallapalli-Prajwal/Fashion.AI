import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import { analytics } from '../utils/analytics';
import './Gallery.css';

const Gallery = ({ user }) => {
  const [photos, setPhotos] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());

  useEffect(() => {
    loadOutfits();
    loadPhotos(); // Load photos from Google Drive on mount
    analytics.galleryOpened(); // Track gallery view
  }, []);

  const loadOutfits = async () => {
    try {
      const response = await axios.get(`${config.API_BASE}/records`);
      setOutfits(response.data.outfits || []);
    } catch (error) {
      console.error('Failed to load outfits:', error);
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE}/photos`);
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Failed to load photos:', error);
      if (error.response?.status === 401) {
        alert('Please reconnect your Google account');
      } else if (error.response?.status === 403) {
        alert('Access denied. Please:\n1. Enable Google Drive API\n2. Logout and login again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const uploadRes = await axios.post(`${config.API_BASE}/photos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Analyze the uploaded photo
      await analyzePhoto(uploadRes.data.photo);
      await loadOutfits();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const analyzePhoto = async (photo) => {
    try {
      // For Drive photos, use the Drive file ID as the photoURL for storage
      // For local photos, use the actual file URL
      const photoUrl = photo.driveFileId 
        ? `drive-${photo.driveFileId}` 
        : photo.url || `local-${Date.now()}`;
      
      // Only pass driveFileId if it's a real Drive file (not a local file ID)
      const isLocalFile = !photo.driveFileId || photo.id?.startsWith('local-');
      
      await axios.post(`${config.API_BASE}/analyze`, {
        photoUrl: photoUrl, // Use Drive ID format for storage, or actual URL for local files
        photoId: photo.id,
        driveFileId: isLocalFile ? null : (photo.driveFileId || photo.id), // Only pass real Drive file ID
        localPath: photo.localPath,
        isBase64: !!photo.base64
      });
      alert('Photo analyzed successfully!');
      await loadOutfits();
      // Reload photos to show updated analyzed status (for Drive photos)
      // For local photos, they're already in the state, just refresh outfits
      if (photo.driveFileId) {
        await loadPhotos();
      }
      // Trigger event for other components
      window.dispatchEvent(new CustomEvent('outfitAnalyzed'));
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze photo');
    }
  };

  // Removed Google Photos Picker - now using Google Drive API directly

  const handleAnalyzeSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setAnalyzing(true);
    try {
      const photosToAnalyze = Array.from(selectedPhotos).map(id => {
        const photo = photos.find(p => p.id === id);
        // For Drive photos, use Drive ID format for photoURL
        const photoUrl = photo?.driveFileId 
          ? `drive-${photo.driveFileId}` 
          : photo?.url || `local-${Date.now()}`;
        return {
          ...photo,
          url: photoUrl, // Override with storage format
          driveFileId: photo?.driveFileId || photo?.id // Include Drive file ID
        };
      });

      await axios.post(`${config.API_BASE}/analyze/batch`, {
        photos: photosToAnalyze
      });

      alert(`Analyzed ${selectedPhotos.size} photos!`);
      setSelectedPhotos(new Set());
      await loadOutfits();
      // Reload photos to show updated analyzed status
      await loadPhotos();
      
      // Trigger a custom event to notify Dashboard/Profile to refresh
      window.dispatchEvent(new CustomEvent('outfitAnalyzed'));
    } catch (error) {
      console.error('Batch analysis failed:', error);
      alert('Failed to analyze photos');
    } finally {
      setAnalyzing(false);
    }
  };

  const togglePhotoSelection = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const isAnalyzed = (photo) => {
    // Check if photo is analyzed by matching Drive ID or URL
    if (photo.driveFileId) {
      return outfits.some(o => o.photoURL === `drive-${photo.driveFileId}` || o.driveFileId === photo.driveFileId);
    }
    return outfits.some(o => o.photoURL === photo.url);
  };

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h1>Photo Gallery</h1>
        <div className="gallery-actions">
          <button
            onClick={loadPhotos}
            disabled={loading}
            className="google-picker-btn"
            title="Load photos from Google Drive"
          >
            {loading ? 'Loading...' : '📁 Load from Google Drive'}
          </button>
          <label className="upload-btn">
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          {selectedPhotos.size > 0 && (
            <button
              onClick={handleAnalyzeSelected}
              disabled={analyzing}
              className="analyze-btn"
            >
              {analyzing ? 'Analyzing...' : `Analyze ${selectedPhotos.size} Selected`}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <p>No photos found. Click "Load from Google Drive" to fetch your photos or upload a photo to get started.</p>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((photo) => {
            const analyzed = isAnalyzed(photo);
            return (
              <div
                key={photo.id}
                className={`photo-card ${analyzed ? 'analyzed' : ''} ${selectedPhotos.has(photo.id) ? 'selected' : ''}`}
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <div className="photo-image">
                  <img 
                    src={photo.thumbnailUrl || photo.url} 
                    alt={photo.filename}
                    onError={(e) => {
                      // Fallback to webViewLink if proxy fails
                      if (photo.webViewLink && e.target.src !== photo.webViewLink) {
                        e.target.src = photo.webViewLink;
                      }
                    }}
                  />
                  {analyzed && <div className="analyzed-badge">✓ Analyzed</div>}
                  {selectedPhotos.has(photo.id) && (
                    <div className="selected-badge">Selected</div>
                  )}
                </div>
                <div className="photo-info">
                  <p className="photo-filename">{photo.filename}</p>
                  {analyzed && (
                    <button
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find outfit by Drive ID or URL
                        const outfit = photo.driveFileId
                          ? outfits.find(o => o.photoURL === `drive-${photo.driveFileId}` || o.driveFileId === photo.driveFileId)
                          : outfits.find(o => o.photoURL === photo.url);
                        if (outfit) {
                          alert(`Style: ${outfit.styleCategory}\n${outfit.geminiSummary}`);
                        }
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gallery;

