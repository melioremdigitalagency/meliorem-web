/**
 * Honeypot Validation Module
 * Standalone, reusable honeypot validation function
 * 
 * Usage:
 *   const isValid = validateHoneypot(formData, 'waitlist');
 *   if (!isValid) { /* block submission *\/ }
 */

(function() {
  'use strict';

  /**
   * Validate honeypot field for a form
   * @param {FormData|Object} formData - Form data (FormData object or plain object)
   * @param {string} formType - Form type identifier ('waitlist', 'contact-us', 'dc-lead')
   * @returns {boolean} true if honeypot is empty (valid), false if filled (bot detected)
   */
  function validateHoneypot(formData, formType) {
    // Get form configuration
    const config = window.AntiBotConfig?.getFormConfig(formType);
    if (!config) {
      console.warn('[Honeypot] No configuration found for form type:', formType);
      return true; // Fail open - don't block if config missing
    }

    // Extract honeypot value
    let honeypotValue;
    if (formData instanceof FormData) {
      honeypotValue = formData.get(config.honeypotField);
    } else if (typeof formData === 'object' && formData !== null) {
      honeypotValue = formData[config.honeypotField];
    } else {
      console.warn('[Honeypot] Invalid formData type');
      return true; // Fail open
    }

    // Honeypot should be empty or whitespace-only
    if (honeypotValue && honeypotValue.trim() !== '') {
      console.warn('[Bot Detection] Honeypot field filled:', config.honeypotField);
      return false; // Bot detected
    }

    return true; // Valid - honeypot empty
  }

  // Expose globally
  if (typeof window !== 'undefined') {
    window.validateHoneypot = validateHoneypot;
    window.HoneypotValidator = {
      validate: validateHoneypot
    };
  }

})();

