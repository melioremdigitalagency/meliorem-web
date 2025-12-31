/**
 * Supabase Session Tracking
 * 
 * Handles session-related data operations in Supabase.
 * Sessions track user visits, page views, and session metadata.
 */

(function() {
  'use strict';

  const SessionTracking = {
    /**
     * Initialize Supabase client
     * @returns {Object|null} Supabase client or null if not configured
     */
    _getClient: function() {
      const config = window.SupabaseConfig;
      
      if (!config?.enabled || !config.url || !config.anonKey) {
        if (window.APIConfig?.debug) {
          console.warn('[Supabase Session] Client not configured');
        }
        return null;
      }

      // Check if Supabase JS library is loaded
      if (typeof supabase === 'undefined') {
        console.error('[Supabase Session] Supabase JS library not loaded. Include @supabase/supabase-js');
        return null;
      }

      try {
        return supabase.createClient(config.url, config.anonKey);
      } catch (error) {
        console.error('[Supabase Session] Failed to create client:', error);
        return null;
      }
    },

    /**
     * Track a new session
     * 
     * @param {Object} sessionData - Session data
     * @param {string} sessionData.sessionId - Unique session identifier
     * @param {string} sessionData.userAgent - Browser user agent
     * @param {string} sessionData.referrer - Page referrer
     * @param {string} sessionData.landingPage - Landing page URL
     * @param {string} sessionData.utmSource - UTM source (optional)
     * @param {string} sessionData.utmMedium - UTM medium (optional)
     * @param {string} sessionData.utmCampaign - UTM campaign (optional)
     * @returns {Promise<Object>} Insert result
     */
    createSession: async function(sessionData) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.sessions || 'sessions';

      try {
        const { data, error } = await client
          .from(tableName)
          .insert({
            session_id: sessionData.sessionId,
            user_agent: sessionData.userAgent,
            referrer: sessionData.referrer || null,
            landing_page: sessionData.landingPage,
            utm_source: sessionData.utmSource || null,
            utm_medium: sessionData.utmMedium || null,
            utm_campaign: sessionData.utmCampaign || null,
            started_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('[Supabase Session] Error creating session:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Session] Session created:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Session] Exception creating session:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Update session end time
     * 
     * @param {string} sessionId - Session identifier
     * @param {number} duration - Session duration in seconds
     * @returns {Promise<Object>} Update result
     */
    endSession: async function(sessionId, duration) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.sessions || 'sessions';

      try {
        const { data, error } = await client
          .from(tableName)
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId)
          .select()
          .single();

        if (error) {
          console.error('[Supabase Session] Error ending session:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Session] Session ended:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Session] Exception ending session:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Track page view within a session
     * 
     * @param {string} sessionId - Session identifier
     * @param {string} pageUrl - Page URL
     * @param {string} pageTitle - Page title
     * @returns {Promise<Object>} Insert result
     */
    trackPageView: async function(sessionId, pageUrl, pageTitle) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.sessions || 'sessions';

      try {
        // This assumes you have a page_views array or separate table
        // Adjust based on your database schema
        const { data, error } = await client
          .from(tableName)
          .update({
            page_views: client.rpc('increment_page_views', { session_id: sessionId }),
            last_page_url: pageUrl,
            last_page_title: pageTitle,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId)
          .select()
          .single();

        if (error) {
          // If RPC doesn't exist, use a simpler approach
          // This is a fallback - adjust based on your schema
          console.warn('[Supabase Session] RPC not available, using simple update');
          
          const { data: simpleData, error: simpleError } = await client
            .from(tableName)
            .update({
              last_page_url: pageUrl,
              last_page_title: pageTitle,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)
            .select()
            .single();

          if (simpleError) {
            console.error('[Supabase Session] Error tracking page view:', simpleError);
            return { success: false, error: simpleError.message };
          }

          return { success: true, data: simpleData };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Session] Page view tracked:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Session] Exception tracking page view:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Expose globally
  window.SupabaseSessionTracking = SessionTracking;

})();

