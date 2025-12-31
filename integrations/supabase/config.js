/**
 * Supabase Configuration
 * 
 * This file contains Supabase client configuration.
 * Supabase is used for production data, analytics, and user account purposes.
 */

(function() {
  'use strict';

  window.SupabaseConfig = {
    /**
     * Supabase project URL
     * Format: https://your-project-id.supabase.co
     */
    url: 'https://zdhhzvituthbfnrwpvyp.supabase.co',

    /**
     * Supabase anonymous key (publishable key)
     * This is safe to use in client-side code with Row Level Security (RLS) enabled
     * NEVER use the service role key in client-side code
     */
    anonKey: 'sb_publishable_tKRXAC9fAXS-_uB_1msNpg_KefHRQdg',

    /**
     * Enable/disable Supabase integration
     */
    enabled: true,

    /**
     * Default timeout for Supabase requests (milliseconds)
     */
    timeout: 10000, // 10 seconds

    /**
     * Database schema configuration
     * Define table names for different data categories
     */
    tables: {
      sessions: 'sessions',           // Session tracking data
      events: 'events',               // Event tracking data
      leads: 'leads'                  // Lead tracking data
    }
  };

})();

