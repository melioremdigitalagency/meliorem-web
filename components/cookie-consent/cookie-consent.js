/**
 * Cookie Consent Component JavaScript
 * 
 * Handles cookie consent banner display, settings modal, and preference management
 */

(function() {
  'use strict';

  // Wait for DOM and consent manager to be ready
  function init() {
    // Check if consent manager is available
    if (!window.CookieConsent) {
      console.error('[Cookie Consent Component] CookieConsent manager not loaded. Ensure tracking/cookies/consent-manager.js is loaded first.');
      return;
    }

    initBanner();
    initModal();
    fixRelativePaths();
    checkConsentStatus();
  }

  /**
   * Initialize banner
   */
  function initBanner() {
    const banner = document.getElementById('opb-cookie-banner');
    if (!banner) return;

    // Accept All button
    const acceptBtn = document.getElementById('opb-cookie-accept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        handleAcceptAll();
      });
    }

    // Reject Non-Essential button
    const rejectBtn = document.getElementById('opb-cookie-reject');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function() {
        handleRejectNonEssential();
      });
    }

    // Customize button
    const customizeBtn = document.getElementById('opb-cookie-customize');
    if (customizeBtn) {
      customizeBtn.addEventListener('click', function() {
        openModal();
      });
    }
  }

  /**
   * Initialize modal
   */
  function initModal() {
    const modal = document.getElementById('opb-cookie-modal');
    if (!modal) return;

    // Close button
    const closeBtn = document.getElementById('opb-cookie-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeModal();
      });
    }

    // Overlay click to close
    const overlay = document.getElementById('opb-cookie-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', function() {
        closeModal();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('opb-cookie-modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        closeModal();
      });
    }

    // Save button
    const saveBtn = document.getElementById('opb-cookie-modal-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        handleSavePreferences();
      });
    }

    // Load current preferences into modal
    loadPreferencesIntoModal();
  }

  /**
   * Fix relative paths in component
   */
  function fixRelativePaths() {
    let path = window.location.pathname;
    path = path.replace(/\/$/, '');
    const depth = path.split('/').filter(segment => segment && !segment.includes('.html')).length;
    
    let relativePath = '';
    for (let i = 0; i < depth; i++) {
      relativePath += '../';
    }

    // Fix privacy policy link
    const privacyLink = document.getElementById('opb-cookie-privacy-link');
    if (privacyLink) {
      const baseHref = privacyLink.getAttribute('data-base-href') || '';
      privacyLink.href = relativePath + baseHref;
    }
  }

  /**
   * Check consent status and show/hide banner
   */
  function checkConsentStatus() {
    if (!window.CookieConsent) return;

    const preferences = window.CookieConsent.getPreferences();
    
    // Clear consent if it's a rejection (both analytics and marketing are false)
    // This ensures banner shows on every visit until user accepts
    if (preferences && !preferences.analytics && !preferences.marketing) {
      window.CookieConsent.clearConsent();
      showBanner();
      return;
    }

    const hasMadeChoice = window.CookieConsent.hasMadeChoice();
    const isExpired = window.CookieConsent.isExpired();

    // Show banner if no choice made or consent expired
    if (!hasMadeChoice || isExpired) {
      showBanner();
    } else {
      hideBanner();
    }
  }

  /**
   * Show banner
   */
  function showBanner() {
    const banner = document.getElementById('opb-cookie-banner');
    if (banner) {
      banner.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Hide banner
   */
  function hideBanner() {
    const banner = document.getElementById('opb-cookie-banner');
    if (banner) {
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Open settings modal
   */
  function openModal() {
    const modal = document.getElementById('opb-cookie-modal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }
  }

  /**
   * Close settings modal
   */
  function closeModal() {
    const modal = document.getElementById('opb-cookie-modal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // Restore body scroll
    }
  }

  /**
   * Load current preferences into modal checkboxes
   */
  function loadPreferencesIntoModal() {
    if (!window.CookieConsent) return;

    const preferences = window.CookieConsent.getPreferences();
    
    const analyticsCheckbox = document.getElementById('opb-cookie-analytics');
    const marketingCheckbox = document.getElementById('opb-cookie-marketing');

    if (analyticsCheckbox) {
      analyticsCheckbox.checked = preferences ? preferences.analytics : false;
    }

    if (marketingCheckbox) {
      marketingCheckbox.checked = preferences ? preferences.marketing : false;
    }
  }

  /**
   * Handle Accept All
   */
  function handleAcceptAll() {
    if (!window.CookieConsent) return;

    window.CookieConsent.setConsent({
      analytics: true,
      marketing: true
    });

    hideBanner();
    initializeTracking();
  }

  /**
   * Handle Reject Non-Essential
   */
  function handleRejectNonEssential() {
    if (!window.CookieConsent) return;

    window.CookieConsent.setConsent({
      analytics: false,
      marketing: false
    });

    // Update Google Analytics consent to denied
    if (window.GoogleAnalytics && window.GoogleAnalytics.updateConsent) {
      window.GoogleAnalytics.updateConsent(false, false);
    }

    hideBanner();
  }

  /**
   * Handle Save Preferences from modal
   */
  function handleSavePreferences() {
    if (!window.CookieConsent) return;

    const analyticsCheckbox = document.getElementById('opb-cookie-analytics');
    const marketingCheckbox = document.getElementById('opb-cookie-marketing');

    const preferences = {
      analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
      marketing: marketingCheckbox ? marketingCheckbox.checked : false
    };

    // Store preferences (will be cleared on next visit if both are false)
    window.CookieConsent.setConsent(preferences);

    // Only initialize tracking if at least one is accepted
    if (preferences.analytics || preferences.marketing) {
      initializeTracking();
    }

    closeModal();
    hideBanner();
  }

  /**
   * Initialize tracking scripts if consent given
   */
  function initializeTracking() {
    if (!window.CookieConsent) return;

    const hasAnalytics = window.CookieConsent.hasConsent('analytics');
    const hasMarketing = window.CookieConsent.hasConsent('marketing');

    // Update Google Analytics consent state FIRST (before initializing)
    if (window.GoogleAnalytics && window.GoogleAnalytics.updateConsent) {
      window.GoogleAnalytics.updateConsent(hasAnalytics, hasMarketing);
    }

    // Initialize Google Analytics if consent given
    if (hasAnalytics && window.GoogleAnalytics) {
      if (!window.GoogleAnalytics.initialized) {
        window.GoogleAnalytics.init();
      }
    }

    // Initialize Facebook Pixel if consent given
    if (hasMarketing && window.FacebookPixel) {
      if (!window.FacebookPixel.initialized) {
        window.FacebookPixel.init();
      }
    }
  }

  // Listen for consent updates (in case user changes preferences elsewhere)
  window.addEventListener('cookieConsentUpdated', function(event) {
    const preferences = event.detail;
    if (preferences) {
      hideBanner();
      initializeTracking();
    } else {
      // Consent cleared - show banner again
      showBanner();
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded, but wait a bit for consent manager to load
    setTimeout(init, 100);
  }

})();

