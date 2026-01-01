/**
 * Make.com Contact Request Webhook Client
 * 
 * Handles B2B and Waitlist form submissions to Make.com webhook.
 * All forms use the same webhook endpoint (Webhook A).
 * 
 * Usage:
 *   const result = await window.ContactRequestWebhook.submit('b2b', payload);
 *   const result = await window.ContactRequestWebhook.submit('waitlist', payload);
 */

(function() {
  'use strict';

  const ContactRequestWebhook = {
    /**
     * Webhook configuration key
     */
    webhookKey: 'b2b',

    /**
     * Valid form types for this webhook
     */
    validFormTypes: ['b2b', 'waitlist'],

    /**
     * Submit B2B or Waitlist form data to Make.com webhook
     * 
     * @param {string} formType - Form type: 'b2b' or 'waitlist'
     * @param {Object} payload - Form submission payload (includes form data and metadata)
     * @returns {Promise<Object>} Response from webhook
     * @throws {Error} If submission fails
     */
    submit: async function(formType, payload) {
      // Validate form type
      if (!this.validFormTypes.includes(formType)) {
        throw new Error(`Invalid form type for Contact Request webhook: ${formType}. Valid types: ${this.validFormTypes.join(', ')}`);
      }

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
        throw new Error(`No webhook URL configured for Contact Request forms. Please configure 'b2b' in integrations/config.js`);
      }

      if (!webhookUrl.trim()) {
        throw new Error(`Webhook URL is empty for Contact Request forms. Please configure in integrations/config.js`);
      }

      // Prepare request
      const timeout = makeComConfig?.timeout || apiConfig.timeout || 10000;
      const retryAttempts = makeComConfig?.retryAttempts || apiConfig.retryAttempts || 1;
      const headers = makeComConfig?.defaultHeaders || { 'Content-Type': 'application/json' };

      // Ensure payload has correct form type
      const submissionPayload = {
        ...payload,
        formType: formType
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
            throw new Error(`Contact Request webhook request failed: ${response.status} ${response.statusText}. ${errorText}`);
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
            console.log(`[Make.com Contact Request] Successfully submitted ${formType} form`, result);
          }

          return result;

        } catch (error) {
          lastError = error;

          // Don't retry on abort (timeout) or if it's the last attempt
          if (error.name === 'AbortError') {
            throw new Error('Request timeout: Contact Request webhook did not respond within ' + timeout + 'ms');
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
      console.error(`[Make.com Contact Request] Failed to submit ${formType} form after ${retryAttempts + 1} attempts:`, lastError);
      throw lastError || new Error('Contact Request webhook submission failed');
    },

    /**
     * Validate that Contact Request webhook configuration is complete
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
  window.ContactRequestWebhook = ContactRequestWebhook;

})();

