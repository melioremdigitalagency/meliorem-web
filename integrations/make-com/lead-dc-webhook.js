/**
 * Make.com DC Lead Webhook Client
 * 
 * Handles DC Lead form submissions to Make.com webhook.
 * This is specifically for the DC Lead form from the Family Readiness Check calculator.
 * 
 * Usage:
 *   const result = await window.LeadDcWebhook.submit(payload);
 */

(function() {
  'use strict';

  const LeadDcWebhook = {
    /**
     * Webhook configuration key
     */
    webhookKey: 'dc-lead',

    /**
     * Submit DC Lead form data to Make.com webhook
     * 
     * @param {Object} payload - Form submission payload (includes form data and metadata)
     * @returns {Promise<Object>} Response from webhook
     * @throws {Error} If submission fails
     */
    submit: async function(payload) {
      // Get configuration
      const apiConfig = window.APIConfig?.makeCom;
      const makeComConfig = window.MakeComConfig;

      // Validate configuration
      if (!apiConfig?.enabled) {
        throw new Error('Make.com integration is not enabled');
      }

      // Get webhook URL
      const webhookUrl = apiConfig.webhooks[this.webhookKey];

      if (!webhookUrl) {
        throw new Error(`No webhook URL configured for DC Lead form. Please configure 'dc-lead' in integrations/config.js`);
      }

      if (!webhookUrl.trim()) {
        throw new Error(`Webhook URL is empty for DC Lead form. Please configure in integrations/config.js`);
      }

      // Prepare request
      const timeout = makeComConfig?.timeout || apiConfig.timeout || 10000;
      const retryAttempts = makeComConfig?.retryAttempts || apiConfig.retryAttempts || 1;
      const headers = makeComConfig?.defaultHeaders || { 'Content-Type': 'application/json' };

      // Ensure payload has correct form type
      const submissionPayload = {
        ...payload,
        formType: 'dc-lead'
      };

      // Attempt submission with retries
      let lastError;
      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          // Make request
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(submissionPayload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          // Check response status
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`DC Lead webhook request failed: ${response.status} ${response.statusText}. ${errorText}`);
          }

          // Parse response
          let result;
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            result = { success: true, status: response.status };
          }

          // Log success (only in development)
          if (window.APIConfig?.debug) {
            console.log('[Make.com DC Lead] Successfully submitted DC Lead form', result);
          }

          return result;

        } catch (error) {
          lastError = error;

          // Don't retry on abort (timeout) or if it's the last attempt
          if (error.name === 'AbortError') {
            throw new Error('Request timeout: DC Lead webhook did not respond within ' + timeout + 'ms');
          }

          // If not the last attempt, wait before retrying
          if (attempt < retryAttempts) {
            const retryDelay = makeComConfig?.retryDelay || 1000;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        }
      }

      // All retries failed
      console.error('[Make.com DC Lead] Failed to submit DC Lead form after ' + (retryAttempts + 1) + ' attempts:', lastError);
      throw lastError || new Error('DC Lead webhook submission failed');
    },

    /**
     * Validate that DC Lead webhook configuration is complete
     * 
     * @returns {boolean} True if configuration is valid
     */
    isConfigured: function() {
      const apiConfig = window.APIConfig?.makeCom;
      if (!apiConfig?.enabled) {
        return false;
      }

      const webhookUrl = apiConfig.webhooks[this.webhookKey];
      return !!(webhookUrl && webhookUrl.trim());
    }
  };

  // Expose globally
  window.LeadDcWebhook = LeadDcWebhook;

})();

