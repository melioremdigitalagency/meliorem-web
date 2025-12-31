/**
 * Make.com Webhook Configuration
 * 
 * This file contains Make.com-specific configuration.
 * Webhook URLs are defined in the main integrations/config.js file.
 */

(function() {
  'use strict';

  window.MakeComConfig = {
    /**
     * Default headers for all webhook requests
     */
    defaultHeaders: {
      'Content-Type': 'application/json'
    },

    /**
     * Request timeout in milliseconds
     */
    timeout: 10000, // 10 seconds

    /**
     * Number of retry attempts for failed requests
     */
    retryAttempts: 1,

    /**
     * Delay between retry attempts in milliseconds
     */
    retryDelay: 1000 // 1 second
  };

})();

