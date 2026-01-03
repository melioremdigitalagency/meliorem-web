/**
 * Honeypot Validation Module
 * Standalone, reusable honeypot validation function
 * Supports multiple honeypot fields per form
 * 
 * Usage:
 *   const isValid = validateHoneypot(formData, 'b2b');
 *   if (!isValid) { /* block submission *\/ }
 */

(function() {
  'use strict';

  /**
   * Validate honeypot fields for a form
   * @param {FormData|Object} formData - Form data (FormData object or plain object)
   * @param {string} formType - Form type identifier ('b2b', 'waitlist')
   * @returns {boolean} true if all honeypots are empty (valid), false if any filled (bot detected)
   */
  function validateHoneypot(formData, formType) {
    // Get form configuration
    const config = window.AntiBotConfig?.getFormConfig(formType);
    if (!config) {
      if (window.Environment?.shouldLog()) {
        console.warn('[Honeypot] No configuration found for form type:', formType);
      }
      return true; // Fail open - don't block if config missing
    }

    // Get honeypot fields (support both old single field and new array format)
    const honeypotFields = config.honeypotFields || [];
    
    // Backward compatibility: check for old single honeypotField
    if (!honeypotFields.length && config.honeypotField) {
      honeypotFields.push({
        name: config.honeypotField,
        type: config.honeypotType || 'text'
      });
    }

    if (!honeypotFields.length) {
      if (window.Environment?.shouldLog()) {
        console.warn('[Honeypot] No honeypot fields configured for form type:', formType);
      }
      return true; // Fail open
    }

    // Validate each honeypot field
    for (let i = 0; i < honeypotFields.length; i++) {
      const field = honeypotFields[i];
      let fieldValue;

      // Extract field value
      if (formData instanceof FormData) {
        // For checkboxes, check if they exist in FormData
        if (field.type === 'checkbox') {
          fieldValue = formData.has(field.name) ? formData.get(field.name) : null;
        } else {
          fieldValue = formData.get(field.name);
        }
      } else if (typeof formData === 'object' && formData !== null) {
        fieldValue = formData[field.name];
      } else {
        if (window.Environment?.shouldLog()) {
          console.warn('[Honeypot] Invalid formData type');
        }
        return true; // Fail open
      }

      // Validate based on field type
      if (field.type === 'checkbox') {
        // Checkbox should be unchecked (not present or false)
        if (fieldValue !== null && fieldValue !== false && fieldValue !== '') {
          if (window.Environment?.shouldLog()) {
            console.warn('[Bot Detection] Honeypot checkbox checked:', field.name);
          }
          return false; // Bot detected
        }
      } else {
        // Text/email/textarea should be empty or whitespace-only
        if (fieldValue && fieldValue.trim() !== '') {
          if (window.Environment?.shouldLog()) {
            console.warn('[Bot Detection] Honeypot field filled:', field.name);
          }
          return false; // Bot detected
        }
      }
    }

    return true; // Valid - all honeypots empty
  }

  // Expose globally
  if (typeof window !== 'undefined') {
    window.validateHoneypot = validateHoneypot;
    window.HoneypotValidator = {
      validate: validateHoneypot
    };
  }

})();

