/**
 * API Configuration
 * Central configuration for all API integrations
 * 
 * This file contains configuration for:
 * - Make.com webhook endpoints
 * - Supabase client settings
 * - API timeouts and retry settings
 */

(function() {
  'use strict';

  window.APIConfig = {
    /**
     * Make.com Webhook Configuration
     */
    makeCom: {
      enabled: true,
      webhooks: {
        'dc-lead': '', // TODO: Add Make.com webhook URL for DC Lead form
        'contact-us': '', // TODO: Add Make.com webhook URL for Contact-Us form
        'waitlist': '' // TODO: Add Make.com webhook URL for Waitlist form (same as contact-us)
      },
      timeout: 10000, // 10 seconds
      retryAttempts: 1
    },

    /**
     * Supabase Configuration
     */
    supabase: {
      enabled: true,
      url: '', // TODO: Add Supabase project URL
      anonKey: '', // TODO: Add Supabase anonymous key
      // Note: Service role key should NEVER be in client-side code
      // Only use anon key with Row Level Security (RLS) enabled
    }
  };

})();

