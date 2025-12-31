/**
 * Timestamp Validation Module
 * Standalone, reusable timestamp validation for form submissions
 * 
 * Usage:
 *   initializeFormTiming(formElement, 'waitlist');
 *   // ... user fills form ...
 *   if (!validateFormTiming(formElement, 'waitlist')) { /* block submission *\/ }
 *   resetFormTiming(formElement); // on form reset
 */

(function() {
  'use strict';

  // Store start times per form element using WeakMap (prevents memory leaks)
  const formStartTimes = new WeakMap();

  /**
   * Initialize timing for a form
   * Call this when form becomes available to the user
   * @param {HTMLElement} formElement - Form DOM element
   * @param {string} formType - Form type identifier ('waitlist', 'contact-us', 'dc-lead')
   */
  function initializeFormTiming(formElement, formType) {
    if (!formElement || !formType) {
      console.warn('[Timestamp] Invalid parameters for initializeFormTiming');
      return;
    }

    // Store start time
    formStartTimes.set(formElement, Date.now());
  }

  /**
   * Validate form timing on submission
   * @param {HTMLElement} formElement - Form DOM element
   * @param {string} formType - Form type identifier
   * @returns {boolean} true if timing is valid (≥ minDuration), false if too fast
   */
  function validateFormTiming(formElement, formType) {
    if (!formElement || !formType) {
      console.warn('[Timestamp] Invalid parameters for validateFormTiming');
      return true; // Fail open
    }

    // Get form configuration
    const config = window.AntiBotConfig?.getFormConfig(formType);
    if (!config || !config.timing) {
      console.warn('[Timestamp] No timing configuration found for form type:', formType);
      return true; // Fail open - don't block if config missing
    }

    // Get start time
    const startTime = formStartTimes.get(formElement);
    if (!startTime) {
      console.warn('[Timestamp] Start time not initialized for form');
      return true; // Fail open - don't block if timing wasn't initialized
    }

    // Calculate duration in seconds
    const duration = (Date.now() - startTime) / 1000;
    const minDuration = config.timing.minDuration;

    // Check if submission is too fast
    if (duration < minDuration) {
      console.warn('[Bot Detection] Submission too fast:', duration.toFixed(2) + 's (minimum: ' + minDuration + 's)');
      return false; // Bot detected
    }

    return true; // Valid timing
  }

  /**
   * Reset timing for a form
   * Call this when form is reset or modal is closed
   * @param {HTMLElement} formElement - Form DOM element
   */
  function resetFormTiming(formElement) {
    if (!formElement) {
      console.warn('[Timestamp] Invalid parameter for resetFormTiming');
      return;
    }

    // Remove start time from WeakMap
    formStartTimes.delete(formElement);
  }

  // Expose globally
  if (typeof window !== 'undefined') {
    window.initializeFormTiming = initializeFormTiming;
    window.validateFormTiming = validateFormTiming;
    window.resetFormTiming = resetFormTiming;
    window.TimestampValidator = {
      initialize: initializeFormTiming,
      validate: validateFormTiming,
      reset: resetFormTiming
    };
  }

})();

