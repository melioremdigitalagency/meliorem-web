/**
 * Cookie Consent Configuration
 * 
 * Defines cookie categories, storage keys, and default settings
 */

(function() {
  'use strict';

  window.CookieConsentConfig = {
    /**
     * Storage key for consent preferences
     */
    storageKey: 'meliorem_cookie_consent',

    /**
     * Cookie categories
     */
    categories: {
      essential: {
        name: 'Essential',
        description: 'These cookies are necessary for the website to function and cannot be disabled. They are usually set in response to actions made by you such as setting privacy preferences, logging in, or filling in forms.',
        required: true,
        alwaysEnabled: true
      },
      analytics: {
        name: 'Analytics',
        description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website.',
        required: false,
        alwaysEnabled: false
      },
      marketing: {
        name: 'Marketing',
        description: 'These cookies are used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.',
        required: false,
        alwaysEnabled: false
      }
    },

    /**
     * Default consent preferences
     */
    defaultPreferences: {
      essential: true,
      analytics: false,
      marketing: false
    },

    /**
     * Consent expiration (in days)
     * Set to null for no expiration
     */
    expirationDays: 365
  };

})();

