/**
 * Environment Detection Utility
 * Determines if code is running in development environment
 */
(function() {
  'use strict';

  const Environment = {
    /**
     * Check if running on localhost
     * @returns {boolean} True if on localhost
     */
    isLocalhost: function() {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.hostname === '[::1]';
    },

    /**
     * Check if debug mode is enabled
     * @returns {boolean} True if debug mode is enabled
     */
    isDebugMode: function() {
      return window.APIConfig?.debug === true;
    },

    /**
     * Check if should log (development environment)
     * @returns {boolean} True if should log
     */
    shouldLog: function() {
      return this.isLocalhost() || this.isDebugMode();
    }
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.Environment = Environment;
  }
})();

