/**
 * Facebook Pixel Integration
 * 
 * Handles Facebook Pixel tracking for conversion events and custom events.
 * Auto-initializes with pixel ID: 765770172992113
 * 
 * Usage:
 *   window.FacebookPixel.track('PageView');
 *   window.FacebookPixel.trackCustom('Lead', { content_name: 'Waitlist Form' });
 */

(function() {
  'use strict';

  // Meta Pixel ID
  const PIXEL_ID = '765770172992113';

  const FacebookPixel = {
    /**
     * Pixel ID
     */
    pixelId: PIXEL_ID,

    /**
     * Whether pixel is initialized
     */
    initialized: false,

    /**
     * Initialize Facebook Pixel (auto-initializes on load)
     * 
     * @param {string} pixelId - Facebook Pixel ID (optional, defaults to PIXEL_ID)
     */
    init: function(pixelId) {
      const id = pixelId || PIXEL_ID;
      
      if (!id) {
        console.warn('[Facebook Pixel] Pixel ID not provided');
        return;
      }

      this.pixelId = id;
      this.initialized = true;

      // Load Facebook Pixel script (Facebook's base code)
      if (!window.fbq) {
        (function(f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      }

      // Initialize pixel (fbq queues calls if script hasn't loaded yet)
      // Use the resolved id variable, not the parameter
      window.fbq('init', id);
      window.fbq('track', 'PageView');

      if (window.APIConfig?.debug) {
        console.log('[Facebook Pixel] Initialized with ID:', id);
      }
    },

    /**
     * Track a standard Facebook Pixel event
     * 
     * @param {string} eventName - Standard event name (e.g., 'PageView', 'Lead', 'CompleteRegistration')
     * @param {Object} [eventData] - Optional event data
     */
    track: function(eventName, eventData) {
      if (!this.initialized || !window.fbq) {
        if (window.APIConfig?.debug) {
          console.warn('[Facebook Pixel] Pixel not initialized. Call init() first.');
        }
        return;
      }

      try {
        if (eventData) {
          window.fbq('track', eventName, eventData);
        } else {
          window.fbq('track', eventName);
        }

        if (window.APIConfig?.debug) {
          console.log('[Facebook Pixel] Tracked event:', eventName, eventData || '');
        }
      } catch (error) {
        console.error('[Facebook Pixel] Error tracking event:', error);
      }
    },

    /**
     * Track a custom Facebook Pixel event
     * 
     * @param {string} eventName - Custom event name
     * @param {Object} [eventData] - Optional event data
     */
    trackCustom: function(eventName, eventData) {
      if (!this.initialized || !window.fbq) {
        if (window.APIConfig?.debug) {
          console.warn('[Facebook Pixel] Pixel not initialized. Call init() first.');
        }
        return;
      }

      try {
        if (eventData) {
          window.fbq('trackCustom', eventName, eventData);
        } else {
          window.fbq('trackCustom', eventName);
        }

        if (window.APIConfig?.debug) {
          console.log('[Facebook Pixel] Tracked custom event:', eventName, eventData || '');
        }
      } catch (error) {
        console.error('[Facebook Pixel] Error tracking custom event:', error);
      }
    },

    /**
     * Track a conversion event (form submission, lead capture, etc.)
     * 
     * @param {string} formType - Form type: 'waitlist', 'contact-us', 'dc-lead'
     * @param {Object} [eventData] - Optional event data
     */
    trackConversion: function(formType, eventData) {
      // Map form types to Facebook Pixel events
      const eventMap = {
        'waitlist': 'Lead',
        'contact-us': 'Contact',
        'dc-lead': 'Lead'
      };

      const eventName = eventMap[formType] || 'Lead';
      const conversionData = {
        content_name: formType,
        content_category: 'form_submission',
        ...(eventData || {})
      };

      this.track(eventName, conversionData);
    },

    /**
     * Track a page view
     */
    trackPageView: function() {
      this.track('PageView');
    },

    /**
     * Track a view content event
     * 
     * @param {Object} contentData - Content data
     */
    trackViewContent: function(contentData) {
      this.track('ViewContent', contentData);
    },

    /**
     * Track a search event
     * 
     * @param {string} searchString - Search query
     */
    trackSearch: function(searchString) {
      this.track('Search', {
        search_string: searchString
      });
    },

    /**
     * Track an add to cart event (for future e-commerce features)
     * 
     * @param {Object} cartData - Cart data
     */
    trackAddToCart: function(cartData) {
      this.track('AddToCart', cartData);
    },

    /**
     * Track an initiate checkout event
     * 
     * @param {Object} checkoutData - Checkout data
     */
    trackInitiateCheckout: function(checkoutData) {
      this.track('InitiateCheckout', checkoutData);
    },

    /**
     * Track a purchase event
     * 
     * @param {Object} purchaseData - Purchase data
     */
    trackPurchase: function(purchaseData) {
      this.track('Purchase', purchaseData);
    },

    /**
     * Track a complete registration event
     * 
     * @param {Object} registrationData - Registration data
     */
    trackCompleteRegistration: function(registrationData) {
      this.track('CompleteRegistration', registrationData);
    }
  };

  // Expose globally
  window.FacebookPixel = FacebookPixel;

  /**
   * Check consent and initialize if allowed
   */
  function checkConsentAndInit() {
    // Check if consent manager is available
    if (window.CookieConsent && window.CookieConsent.hasConsent('marketing')) {
      FacebookPixel.init();
    } else if (!window.CookieConsent) {
      // Consent manager not loaded yet, wait a bit
      setTimeout(checkConsentAndInit, 100);
    } else {
      // Consent not given - don't initialize
      if (window.APIConfig?.debug) {
        console.log('[Facebook Pixel] Consent not given for marketing cookies. Pixel not initialized.');
      }
    }
  }

  // Listen for consent updates
  window.addEventListener('cookieConsentUpdated', function(event) {
    const preferences = event.detail;
    if (preferences && preferences.marketing && !FacebookPixel.initialized) {
      FacebookPixel.init();
    }
  });

  // Auto-initialize when DOM is ready (if consent given)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkConsentAndInit);
  } else {
    // DOM already loaded
    checkConsentAndInit();
  }

})();

