/**
 * Supabase Lead Tracking
 * 
 * Handles lead-related data operations in Supabase.
 * Leads track form submissions, lead captures, and lead metadata.
 */

(function() {
  'use strict';

  const LeadTracking = {
    /**
     * Initialize Supabase client
     * @returns {Object|null} Supabase client or null if not configured
     */
    _getClient: function() {
      const config = window.SupabaseConfig;
      
      if (!config?.enabled || !config.url || !config.anonKey) {
        if (window.APIConfig?.debug) {
          console.warn('[Supabase Lead] Client not configured');
        }
        return null;
      }

      // Check if Supabase JS library is loaded
      if (typeof supabase === 'undefined') {
        console.error('[Supabase Lead] Supabase JS library not loaded. Include @supabase/supabase-js');
        return null;
      }

      try {
        return supabase.createClient(config.url, config.anonKey);
      } catch (error) {
        console.error('[Supabase Lead] Failed to create client:', error);
        return null;
      }
    },

    /**
     * Track a lead capture
     * 
     * @param {Object} leadData - Lead data
     * @param {string} leadData.formType - Form type: 'waitlist', 'contact-us', 'dc-lead'
     * @param {string} leadData.name - Lead name
     * @param {string} leadData.email - Lead email
     * @param {string} [leadData.phone] - Lead phone number (optional)
     * @param {string} [leadData.sessionId] - Session identifier (optional)
     * @param {string} [leadData.source] - Lead source (e.g., 'homepage', 'calculator')
     * @param {Object} [leadData.metadata] - Additional lead metadata
     * @returns {Promise<Object>} Insert result
     */
    trackLead: async function(leadData) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.leads || 'leads';

      try {
        const { data, error } = await client
          .from(tableName)
          .insert({
            form_type: leadData.formType,
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || null,
            session_id: leadData.sessionId || null,
            source: leadData.source || null,
            page_url: window.location.href,
            page_title: document.title,
            metadata: leadData.metadata || {},
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('[Supabase Lead] Error tracking lead:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Lead] Lead tracked:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Lead] Exception tracking lead:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Track a form submission (includes full payload)
     * 
     * @param {Object} submissionData - Form submission data
     * @param {string} submissionData.formType - Form type
     * @param {Object} submissionData.payload - Full form submission payload (includes fields and metadata)
     * @returns {Promise<Object>} Insert result
     */
    trackFormSubmission: async function(submissionData) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.leads || 'leads';

      const payload = submissionData.payload || {};
      const fields = payload.fields || {};
      const metadata = payload.metadata || {};

      try {
        const { data, error } = await client
          .from(tableName)
          .insert({
            form_type: submissionData.formType,
            name: fields.name || null,
            email: fields.email || null,
            phone: fields.phone || null,
            message: fields.message || null,
            id_number: fields.idNumber || null,
            consent_newsletter: fields.consentNewsletter || false,
            consent_sharing: fields.consentSharing || false,
            session_id: metadata.sessionId || null,
            page_url: window.location.href,
            page_title: document.title,
            metadata: {
              honeypot: metadata.honeypot || {},
              timing: metadata.timing || {},
              interaction: metadata.interaction || {},
              browser: metadata.browser || {},
              full_payload: payload // Store full payload for reference
            },
            created_at: payload.submittedAt || new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('[Supabase Lead] Error tracking form submission:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Lead] Form submission tracked:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Lead] Exception tracking form submission:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Update lead status
     * 
     * @param {string} leadId - Lead identifier (database ID)
     * @param {string} status - New status (e.g., 'contacted', 'qualified', 'converted')
     * @param {Object} [notes] - Additional notes or metadata
     * @returns {Promise<Object>} Update result
     */
    updateLeadStatus: async function(leadId, status, notes) {
      const client = this._getClient();
      if (!client) {
        return { success: false, error: 'Supabase client not available' };
      }

      const config = window.SupabaseConfig;
      const tableName = config.tables?.leads || 'leads';

      try {
        const updateData = {
          status: status,
          updated_at: new Date().toISOString()
        };

        if (notes) {
          updateData.notes = notes;
        }

        const { data, error } = await client
          .from(tableName)
          .update(updateData)
          .eq('id', leadId)
          .select()
          .single();

        if (error) {
          console.error('[Supabase Lead] Error updating lead status:', error);
          return { success: false, error: error.message };
        }

        if (window.APIConfig?.debug) {
          console.log('[Supabase Lead] Lead status updated:', data);
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('[Supabase Lead] Exception updating lead status:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Expose globally
  window.SupabaseLeadTracking = LeadTracking;

})();

