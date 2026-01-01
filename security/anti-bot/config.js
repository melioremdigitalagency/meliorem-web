/**
 * Anti-Bot Configuration
 * Centralized configuration for all forms with honeypot field specifications
 */

(function() {
  'use strict';

  const AntiBotConfig = {
    /**
     * Form configurations
     * Maps form type identifiers to their honeypot field specifications
     */
    forms: {
      'b2b': {
        honeypotFields: [
          { name: 'sa-id-number', label: 'SA ID Number', type: 'text' },
          { name: 'tnc-consent', label: 'Terms & Conditions', type: 'checkbox' },
          { name: 'company-size', label: 'Company Size', type: 'text' },
          { name: 'confirm-email', label: 'Confirm Email', type: 'email' },
          { name: 'zip-code', label: 'Zip Code', type: 'text' },
          { name: 'create-account', label: 'Create Account', type: 'checkbox' },
          { name: 'username', label: 'Username', type: 'text' }
        ],
        formSelector: '.contact-form',
        timing: {
          minDuration: 3
        }
      },
      'waitlist': {
        honeypotField: 'reason_for_contact',
        honeypotLabel: 'Reason for contact',
        honeypotType: 'text',
        formSelector: '.opb-waitlist-form',
        timing: {
          minDuration: 3  // seconds (uniform for all forms)
        }
      },
      'contact-us': {
        honeypotField: 'website_url',
        honeypotLabel: 'Website',
        honeypotType: 'url',
        formSelector: '.opb-contact-us-form',
        timing: {
          minDuration: 3
        }
      },
      'dc-lead': {
        honeypotField: 'preferred_contact',
        honeypotLabel: 'Preferred Contact Method',
        honeypotType: 'text',
        formSelector: '#dcLeadForm',
        timing: {
          minDuration: 3
        }
      }
    },

    /**
     * Get configuration for a form type
     * @param {string} formType - Form identifier ('b2b', 'waitlist', 'contact-us', 'dc-lead')
     * @returns {Object|null} Form configuration or null if not found
     */
    getFormConfig: function(formType) {
      return this.forms[formType] || null;
    }
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.AntiBotConfig = AntiBotConfig;
  }

})();

