/**
 * Contact Form Component
 * Handles form validation and simulated submission
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

      this.attachEvents();
    },

    /**
     * Attach event listeners
     */
    attachEvents: function() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      // Real-time validation on blur
      const inputs = this.form.querySelectorAll('.form-input, .form-textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
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

      // Validate email if provided
      const emailField = this.form.querySelector('#email');
      if (emailField && emailField.value.trim() !== '') {
        if (!this.validateEmail(emailField.value)) {
          this.showFieldError(emailField, 'Please enter a valid email address');
          isValid = false;
        }
      }

      return isValid;
    },

    /**
     * Validate a single field
     */
    validateField: function(field) {
      const value = field.value.trim();
      const fieldId = field.id;
      const errorElement = document.getElementById(fieldId + '-error');

      // Clear previous error
      this.clearFieldError(field);

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
     * Simulate form submission
     */
    submitForm: function() {
      this.isSubmitting = true;
      this.submitButton.disabled = true;
      this.submitButton.querySelector('.submit-text').textContent = 'Submitting...';

      // Hide any previous messages
      this.showMessage(null);

      // Simulate API call delay
      setTimeout(() => {
        // Show success message
        this.showMessage(this.successMessage);

        // Reset form
        this.form.reset();

        // Clear all field errors
        const fields = this.form.querySelectorAll('.form-input, .form-textarea');
        fields.forEach(field => {
          this.clearFieldError(field);
        });

        // Reset button
        this.submitButton.disabled = false;
        this.submitButton.querySelector('.submit-text').textContent = 'Submit';
        this.isSubmitting = false;

        // Scroll to success message
        if (this.successMessage) {
          this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 1000);
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

