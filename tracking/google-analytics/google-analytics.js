/**
 * Google Analytics 4 (GA4) Integration
 * 
 * Handles Google Analytics tracking using gtag.js.
 * Auto-initializes with Measurement ID: G-5M7RJPFF5V
 * 
 * Usage:
 *   window.GoogleAnalytics.trackPageView();
 *   window.GoogleAnalytics.track('event_name', { parameter: 'value' });
 */

(function() {
  'use strict';

  // GA4 Measurement ID
  const MEASUREMENT_ID = 'G-5M7RJPFF5V';

  // Initialize dataLayer and gtag function early (before gtag.js loads)
  // This is required for Consent Mode API
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;

  // Set default consent state to 'denied' before gtag.js loads
  // This is required for GDPR compliance
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  // Load gtag.js script immediately (tracking blocked by consent mode until consent granted)
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(script);

  // Set current date for gtag
  gtag('js', new Date());

  // Initialize GA4 config immediately (tracking blocked by consent defaults)
  gtag('config', MEASUREMENT_ID);

  const GoogleAnalytics = {
    /**
     * Measurement ID
     */
    measurementId: MEASUREMENT_ID,

    /**
     * Whether GA is initialized
     */
    initialized: true, // Set to true since we initialize immediately

    /**
     * Initialize Google Analytics (already initialized on load, this method for backward compatibility)
     * 
     * @param {string} measurementId - GA4 Measurement ID (optional, defaults to MEASUREMENT_ID)
     */
    init: function(measurementId) {
      // Guard: prevent re-initialization if already initialized
      if (this.initialized) {
        if (window.APIConfig?.debug) {
          console.log('[Google Analytics] Already initialized. Skipping re-initialization.');
        }
        return;
      }

      const id = measurementId || MEASUREMENT_ID;
      
      if (!id) {
        console.warn('[Google Analytics] Measurement ID not provided');
        return;
      }

      this.measurementId = id;
      this.initialized = true;

      // dataLayer and gtag are already initialized at module level
      // Set current date
      window.gtag('js', new Date());

      // Load gtag.js script asynchronously
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      document.head.appendChild(script);

      // Configure GA4
      gtag('config', id);

      if (window.APIConfig?.debug) {
        console.log('[Google Analytics] Initialized with Measurement ID:', id);
      }
    },

    /**
     * Track a page view
     */
    trackPageView: function() {
      if (!this.initialized || !window.gtag) {
        if (window.APIConfig?.debug) {
          console.warn('[Google Analytics] GA not initialized. Call init() first.');
        }
        return;
      }

      try {
        window.gtag('config', this.measurementId, {
          page_path: window.location.pathname,
          page_title: document.title
        });

        if (window.APIConfig?.debug) {
          console.log('[Google Analytics] Page view tracked:', window.location.pathname);
        }
      } catch (error) {
        console.error('[Google Analytics] Error tracking page view:', error);
      }
    },

    /**
     * Track a custom event
     * 
     * @param {string} eventName - Event name
     * @param {Object} [eventData] - Optional event data
     */
    track: function(eventName, eventData) {
      if (!this.initialized || !window.gtag) {
        if (window.APIConfig?.debug) {
          console.warn('[Google Analytics] GA not initialized. Call init() first.');
        }
        return;
      }

      try {
        if (eventData) {
          window.gtag('event', eventName, eventData);
        } else {
          window.gtag('event', eventName);
        }

        if (window.APIConfig?.debug) {
          console.log('[Google Analytics] Event tracked:', eventName, eventData || '');
        }
      } catch (error) {
        console.error('[Google Analytics] Error tracking event:', error);
      }
    },

    /**
     * Update Google Analytics consent state
     * 
     * @param {boolean} analytics - Analytics consent
     * @param {boolean} marketing - Marketing consent (for ads)
     */
    updateConsent: function(analytics, marketing) {
      if (!window.gtag) {
        // Initialize gtag if not already done
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
      }
      
      const consentState = {
        'analytics_storage': analytics ? 'granted' : 'denied',
        'ad_storage': marketing ? 'granted' : 'denied',
        'ad_user_data': marketing ? 'granted' : 'denied',
        'ad_personalization': marketing ? 'granted' : 'denied'
      };
      
      window.gtag('consent', 'update', consentState);
      
      if (window.APIConfig?.debug) {
        console.log('[Google Analytics] Consent updated:', consentState);
      }
    }
  };

  // Expose globally
  window.GoogleAnalytics = GoogleAnalytics;

  // Listen for consent updates and update consent state when user grants permission
  window.addEventListener('cookieConsentUpdated', function(event) {
    const preferences = event.detail;
    if (preferences) {
      // Update consent state (GA already initialized, just update consent)
      GoogleAnalytics.updateConsent(
        preferences.analytics || false,
        preferences.marketing || false
      );
    }
  });

})();

