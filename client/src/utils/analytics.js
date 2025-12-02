/**
 * Google Analytics Utility
 * Handles page views and event tracking
 */

// Google Analytics Measurement ID (GA4)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️  Google Analytics Measurement ID not configured');
    return;
  }

  // Only initialize in production or if explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    // Load gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
    });

    console.log('✅ Google Analytics initialized');
  }
};

// Track page view
export const trackPageView = (path) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path || window.location.pathname,
    });
  }
};

// Track custom events
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, eventParams);
    console.log('📊 GA Event:', eventName, eventParams);
  }
};

// Predefined event tracking functions
export const analytics = {
  // Core tracking functions
  trackEvent: trackEvent,
  trackPageView: trackPageView,
  
  // Authentication events
  login: () => trackEvent('login', { method: 'Google OAuth' }),
  logout: () => trackEvent('logout'),

  // Photo events
  photoUploaded: (source) => trackEvent('photo_uploaded', { source }),
  photoSelected: (source) => trackEvent('photo_selected', { source }),

  // Analysis events
  analysisStarted: () => trackEvent('analysis_started'),
  analysisCompleted: (styleCategory) => 
    trackEvent('analysis_completed', { style_category: styleCategory }),
  analysisFailed: (error) => 
    trackEvent('analysis_failed', { error: error?.message || 'Unknown error' }),

  // Navigation events
  pageView: (pageName) => trackPageView(pageName),
  
  // User engagement events
  outfitViewed: (outfitId) => trackEvent('outfit_viewed', { outfit_id: outfitId }),
  outfitDeleted: (outfitId) => trackEvent('outfit_deleted', { outfit_id: outfitId }),
  
  // Feature usage
  galleryOpened: () => trackEvent('gallery_opened'),
  analyticsOpened: () => trackEvent('analytics_opened'),
  profileOpened: () => trackEvent('profile_opened'),
};

export default analytics;

