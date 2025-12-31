/**
 * Cookie Consent Manager
 * 
 * Manages cookie consent preferences and provides API for tracking scripts
 * 
 * Usage:
 *   window.CookieConsent.hasConsent('analytics')
 *   window.CookieConsent.setConsent({ analytics: true, marketing: false })
 *   window.CookieConsent.getPreferences()
 */

(function() {
  'use strict';

  // Ensure config is loaded
  if (!window.CookieConsentConfig) {
    console.error('[Cookie Consent] Config not loaded. Ensure tracking/cookies/config.js is loaded first.');
  }

  const CookieConsent = {
    /**
     * Get stored consent preferences
     * @returns {Object|null} Consent preferences or null if not set
     */
    getPreferences: function() {
      try {
        const stored = localStorage.getItem(window.CookieConsentConfig.storageKey);
        if (!stored) return null;

        const preferences = JSON.parse(stored);
        
        // Validate preferences structure
        if (!preferences || typeof preferences !== 'object') {
          return null;
        }

        // Ensure essential is always true
        preferences.essential = true;

        return preferences;
      } catch (error) {
        console.error('[Cookie Consent] Error reading preferences:', error);
        return null;
      }
    },

    /**
     * Check if consent has been given for a specific category
     * @param {string} category - Cookie category: 'essential', 'analytics', 'marketing'
     * @returns {boolean} True if consent given, false otherwise
     */
    hasConsent: function(category) {
      // Essential cookies are always allowed
      if (category === 'essential') {
        return true;
      }

      const preferences = this.getPreferences();
      if (!preferences) {
        return false;
      }

      // Check if category exists in config
      if (!window.CookieConsentConfig.categories[category]) {
        console.warn('[Cookie Consent] Unknown category:', category);
        return false;
      }

      // Check if category is always enabled
      if (window.CookieConsentConfig.categories[category].alwaysEnabled) {
        return true;
      }

      return preferences[category] === true;
    },

    /**
     * Check if any consent has been given (user has made a choice)
     * @returns {boolean} True if user has made a choice, false otherwise
     */
    hasMadeChoice: function() {
      const preferences = this.getPreferences();
      return preferences !== null && preferences.timestamp !== undefined;
    },

    /**
     * Set consent preferences
     * @param {Object} preferences - Consent preferences object
     * @param {boolean} preferences.essential - Essential cookies (always true)
     * @param {boolean} preferences.analytics - Analytics cookies
     * @param {boolean} preferences.marketing - Marketing cookies
     */
    setConsent: function(preferences) {
      try {
        // Ensure essential is always true
        const consentData = {
          essential: true,
          analytics: preferences.analytics || false,
          marketing: preferences.marketing || false,
          timestamp: new Date().toISOString()
        };

        // Store in localStorage
        localStorage.setItem(
          window.CookieConsentConfig.storageKey,
          JSON.stringify(consentData)
        );

        // Dispatch custom event for components to listen
        const event = new CustomEvent('cookieConsentUpdated', {
          detail: consentData
        });
        window.dispatchEvent(event);

        if (window.APIConfig?.debug) {
          console.log('[Cookie Consent] Preferences saved:', consentData);
        }
      } catch (error) {
        console.error('[Cookie Consent] Error saving preferences:', error);
      }
    },

    /**
     * Clear consent preferences (reset to no consent)
     */
    clearConsent: function() {
      try {
        localStorage.removeItem(window.CookieConsentConfig.storageKey);
        
        // Dispatch custom event
        const event = new CustomEvent('cookieConsentUpdated', {
          detail: null
        });
        window.dispatchEvent(event);

        if (window.APIConfig?.debug) {
          console.log('[Cookie Consent] Preferences cleared');
        }
      } catch (error) {
        console.error('[Cookie Consent] Error clearing preferences:', error);
      }
    },

    /**
     * Check if consent has expired
     * @returns {boolean} True if expired or no expiration set, false if still valid
     */
    isExpired: function() {
      const preferences = this.getPreferences();
      if (!preferences || !preferences.timestamp) {
        return true;
      }

      const expirationDays = window.CookieConsentConfig.expirationDays;
      if (expirationDays === null) {
        return false; // No expiration
      }

      const timestamp = new Date(preferences.timestamp);
      const now = new Date();
      const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);

      return daysDiff > expirationDays;
    },

    /**
     * Get all available cookie categories
     * @returns {Object} Cookie categories from config
     */
    getCategories: function() {
      return window.CookieConsentConfig.categories;
    }
  };

  // Expose globally
  window.CookieConsent = CookieConsent;

})();

