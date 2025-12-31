/**
 * Supabase Event Tracking
 * 
 * Handles event-related data operations in Supabase.
 * Events track user interactions, conversions, and custom events.
 */

(function() {
  'use strict';

  const EventTracking = {
    /**
     * Initialize Supabase client
     * @returns {Object|null} Supabase client or null if not configured
     */
    _getClient: function() {
      const config = window.SupabaseConfig;
      
      if (!config?.enabled || !config.url || !config.anonKey) {
        if (window.APIConfig?.debug) {
          console.warn('[Supabase Event] Client not configured');
        }
        return null;
      }

      // Check if Supabase JS library is loaded
      if (typeof supabase === 'undefined') {
        console.error('[Supabase Event] Supabase JS library not loaded. Include @supabase/supabase-js');
        return null;
      }

      try {
        return supabase.createClient(config.url, config.anonKey);
      } catch (error) {
        console.error('[Supabase Event] Failed to create client:', error);
        return null;
      }
    },

    /**
     * Track a custom event
     * 
     * @param {Object} eventData - Event data
     * @param {string} eventData.eventType - Event type (e.g., 'button_click', 'form_view', 'download')
     * @param {string} eventData.eventName - Event name/identifier
     * @param {string} [eventData.sessionId] - Session identifier (optional)
     * @param {string} [eventData.pageUrl] - Page URL where event occurred
     * @param {string} [eventData.pageTitle] - Page title
     * @param {Object} [eventData.properties] - Additional event properties
     * @returns {Promise<Object>} Insert result
     */
    trackEvent: async function(eventData) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.events || 'events';

      try {
        const { data, error } = await client
          .from(tableName)
          .insert({
            event_type: eventData.eventType,
            event_name: eventData.eventName,
            session_id: eventData.sessionId || null,
            page_url: eventData.pageUrl || window.location.href,
            page_title: eventData.pageTitle || document.title,
            properties: eventData.properties || {},
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('[Supabase Event] Error tracking event:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Event] Event tracked:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Event] Exception tracking event:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Track a conversion event
     * 
     * @param {Object} conversionData - Conversion data
     * @param {string} conversionData.conversionType - Conversion type (e.g., 'form_submission', 'lead_capture')
     * @param {string} conversionData.formType - Form type (e.g., 'waitlist', 'contact-us', 'dc-lead')
     * @param {string} [conversionData.sessionId] - Session identifier
     * @param {string} [conversionData.value] - Conversion value (optional)
     * @param {Object} [conversionData.metadata] - Additional conversion metadata
     * @returns {Promise<Object>} Insert result
     */
    trackConversion: async function(conversionData) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.events || 'events';

      try {
        const { data, error } = await client
          .from(tableName)
          .insert({
            event_type: 'conversion',
            event_name: conversionData.conversionType,
            session_id: conversionData.sessionId || null,
            page_url: window.location.href,
            page_title: document.title,
            properties: {
              form_type: conversionData.formType,
              value: conversionData.value || null,
              ...(conversionData.metadata || {})
            },
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('[Supabase Event] Error tracking conversion:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Event] Conversion tracked:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Event] Exception tracking conversion:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Track a calculator completion event
     * 
     * @param {Object} calculatorData - Calculator data
     * @param {string} calculatorData.calculatorType - Calculator type (e.g., 'family-readiness-check')
     * @param {string} [calculatorData.sessionId] - Session identifier
     * @param {Object} [calculatorData.results] - Calculator results (optional)
     * @param {Object} [calculatorData.metadata] - Additional metadata
     * @returns {Promise<Object>} Insert result
     */
    trackCalculatorCompletion: async function(calculatorData) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.events || 'events';

      try {
        const { data, error } = await client
          .from(tableName)
          .insert({
            event_type: 'calculator_completion',
            event_name: calculatorData.calculatorType,
            session_id: calculatorData.sessionId || null,
            page_url: window.location.href,
            page_title: document.title,
            properties: {
              calculator_type: calculatorData.calculatorType,
              results: calculatorData.results || null,
              ...(calculatorData.metadata || {})
            },
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('[Supabase Event] Error tracking calculator completion:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Event] Calculator completion tracked:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Event] Exception tracking calculator completion:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Expose globally
  window.SupabaseEventTracking = EventTracking;

})();

