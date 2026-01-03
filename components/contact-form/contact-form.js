/**
 * Contact Form Component (B2B Form)
 * Handles form validation and webhook submission
 */

(function() {
  'use strict';

  const ContactForm = {
    form: null,
    submitButton: null,
    successMessage: null,
    errorMessage: null,
    isSubmitting: false,

    /**
     * Initialize the contact form
     */
    init: function() {
      this.form = document.querySelector('.contact-form');
      this.submitButton = this.form ? this.form.querySelector('.form-submit') : null;
      this.successMessage = document.getElementById('form-success');
      this.errorMessage = document.getElementById('form-error');

      if (!this.form) {
        return;
      }

      // Clear honeypot fields to prevent browser autofill
      this.clearHoneypotFields();

      // Initialize form timing for anti-bot protection
      if (window.initializeFormTiming) {
        window.initializeFormTiming(this.form, 'b2b');
      }

      this.attachEvents();
    },

    /**
     * Attach event listeners
     */
    attachEvents: function() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      // Real-time validation on blur
      const inputs = this.form.querySelectorAll('.form-input, .form-textarea, .form-checkbox');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
        input.addEventListener('change', () => this.clearFieldError(input));
      });
    },

    /**
     * Handle form submission
     */
    handleSubmit: function(e) {
      e.preventDefault();

      if (this.isSubmitting) {
        return;
      }

      // Anti-bot validation
      // Clear honeypot fields as final safeguard before validation
      this.clearHoneypotFields();
      
      const formData = new FormData(this.form);
      if (window.validateHoneypot && !window.validateHoneypot(formData, 'b2b')) {
        console.warn('[Contact Form] Bot detected via honeypot validation');
        this.showMessage(this.errorMessage);
        return;
      }
      if (window.validateFormTiming && !window.validateFormTiming(this.form, 'b2b')) {
        console.warn('[Contact Form] Bot detected via timing validation');
        this.showMessage(this.errorMessage);
        return;
      }

      // Validate all fields
      const isValid = this.validateForm();

      if (!isValid) {
        this.showMessage(this.errorMessage);
        return;
      }

      // Simulate form submission
      this.submitForm();
    },

    /**
     * Validate the entire form
     */
    validateForm: function() {
      const fields = this.form.querySelectorAll('[required]');
      let isValid = true;

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      // Validate email format
      const emailField = this.form.querySelector('#email');
      if (emailField && emailField.value.trim() !== '') {
        if (!this.validateEmail(emailField.value)) {
          this.showFieldError(emailField, 'Please enter a valid email address');
          isValid = false;
        }
      }

      // Validate POPI consent (must be checked)
      const popiConsent = this.form.querySelector('#popi-consent');
      if (popiConsent && !popiConsent.checked) {
        this.showFieldError(popiConsent, 'You must consent to sharing your personal information');
        isValid = false;
      }

      return isValid;
    },

    /**
     * Validate a single field
     */
    validateField: function(field) {
      const fieldId = field.id;
      const errorElement = document.getElementById(fieldId + '-error');

      // Clear previous error
      this.clearFieldError(field);

      // Handle checkboxes
      if (field.type === 'checkbox') {
        if (field.hasAttribute('required') && !field.checked) {
          this.showFieldError(field, 'This field is required');
          return false;
        }
        return true;
      }

      // Handle text fields
      const value = field.value.trim();

      // Check required fields
      if (field.hasAttribute('required') && value === '') {
        this.showFieldError(field, 'This field is required');
        return false;
      }

      // Validate email format if email field
      if (field.type === 'email' && value !== '') {
        if (!this.validateEmail(value)) {
          this.showFieldError(field, 'Please enter a valid email address');
          return false;
        }
      }

      return true;
    },

    /**
     * Validate email format
     */
    validateEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    /**
     * Show field error
     */
    showFieldError: function(field, message) {
      field.classList.add('error');
      const errorElement = document.getElementById(field.id + '-error');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
      }
    },

    /**
     * Clear field error
     */
    clearFieldError: function(field) {
      field.classList.remove('error');
      const errorElement = document.getElementById(field.id + '-error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
      }
    },

    /**
     * Show message (success or error)
     */
    showMessage: function(messageElement) {
      // Hide all messages first
      if (this.successMessage) {
        this.successMessage.classList.remove('show');
      }
      if (this.errorMessage) {
        this.errorMessage.classList.remove('show');
      }

      // Show the requested message
      if (messageElement) {
        messageElement.classList.add('show');
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },

    /**
     * Clear all honeypot fields to prevent browser autofill
     */
    clearHoneypotFields: function() {
      if (!this.form) return;
      
      const honeypotFields = this.form.querySelectorAll('.opb-honeypot-field input');
      honeypotFields.forEach(field => {
        // Clear the value
        if (field.type === 'checkbox') {
          field.checked = false;
        } else {
          field.value = '';
        }
        
        // Add event listeners to clear if autofilled
        // Use named function to allow removal of existing listeners
        const clearField = () => {
          if (field.type === 'checkbox') {
            field.checked = false;
          } else {
            field.value = '';
          }
        };
        
        // Remove existing listeners if any, then add new ones
        field.removeEventListener('input', clearField);
        field.removeEventListener('focus', clearField);
        field.addEventListener('input', clearField);
        field.addEventListener('focus', clearField);
      });
    },

    /**
     * Submit form to webhook
     */
    submitForm: async function() {
      this.isSubmitting = true;
      this.submitButton.disabled = true;
      this.submitButton.querySelector('.submit-text').textContent = 'Submitting...';

      // Hide any previous messages
      this.showMessage(null);

      try {
        // Build payload (exclude honeypot fields)
        const formData = new FormData(this.form);
        const payload = {
          formType: 'b2b',
          source: 'meliorem-web',
          submittedAt: new Date().toISOString(),
          fields: {
            firstName: formData.get('first-name') || '',
            lastName: formData.get('last-name') || '',
            companyName: formData.get('company-name') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || null,
            message: formData.get('message') || '',
            popiConsent: formData.get('popi-consent') === 'on' || formData.has('popi-consent')
          },
          metadata: {
            // Anti-bot metadata can be added here if needed
            timestamp: Date.now()
          }
        };

        // Log form results to console for inspection
        console.log('[Contact Form] Form submission payload:', JSON.stringify(payload, null, 2));
        
        // Log all form data including honeypot fields
        const allFormData = Object.fromEntries(formData.entries());
        console.log('[Contact Form] Raw form data (all fields):', allFormData);
        
        // Log honeypot fields separately for inspection
        const honeypotFields = {
          'sa-id-number': formData.get('sa-id-number') || '',
          'tnc-consent': formData.has('tnc-consent') ? formData.get('tnc-consent') : '',
          'company-size': formData.get('company-size') || '',
          'confirm-email': formData.get('confirm-email') || '',
          'zip-code': formData.get('zip-code') || '',
          'create-account': formData.has('create-account') ? formData.get('create-account') : '',
          'username': formData.get('username') || ''
        };
        console.log('[Contact Form] Honeypot fields:', honeypotFields);

        // Check if webhook is configured
        if (!window.ContactRequestWebhook || !window.ContactRequestWebhook.isConfigured()) {
          console.warn('[Contact Form] Webhook not configured, simulating submission');
          // Simulate success for development
          setTimeout(() => {
            this.showMessage(this.successMessage);
            this.resetForm();
            this.isSubmitting = false;
          }, 1000);
          return;
        }

        // Submit to webhook
        const result = await window.ContactRequestWebhook.submit('b2b', payload);
        
        // Log webhook response
        console.log('[Contact Form] Webhook response:', result);

        // Show success message
        this.showMessage(this.successMessage);
        this.resetForm();

      } catch (error) {
        console.error('[Contact Form] Submission error:', error);
        this.showMessage(this.errorMessage);
      } finally {
        // Reset button
        this.submitButton.disabled = false;
        this.submitButton.querySelector('.submit-text').textContent = 'Submit';
        this.isSubmitting = false;
      }
    },

    /**
     * Reset form after successful submission
     */
    resetForm: function() {
      // Reset form
      this.form.reset();

      // Reset form timing for anti-bot protection
      if (window.resetFormTiming) {
        window.resetFormTiming(this.form);
      }
      // Re-initialize timing for next submission
      if (window.initializeFormTiming) {
        window.initializeFormTiming(this.form, 'b2b');
      }

      // Clear all field errors
      const fields = this.form.querySelectorAll('.form-input, .form-textarea, .form-checkbox');
      fields.forEach(field => {
        this.clearFieldError(field);
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ContactForm.init();
    });
  } else {
    ContactForm.init();
  }

  // Export for potential external use
  window.ContactForm = ContactForm;

})();

