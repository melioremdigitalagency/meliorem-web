/**
 * Main JavaScript for Meliorem Website
 * Handles smooth scrolling, skip links, and common interactions
 */

(function() {
  'use strict';

  /**
   * Initialize smooth scroll for anchor links
   */
  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#" or empty
        if (href === '#' || href === '') {
          return;
        }
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const offset = 80; // Offset for fixed headers if needed
          
          window.scrollTo({
            top: targetPosition - offset,
            behavior: 'smooth'
          });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  /**
   * Initialize skip link functionality
   */
  function initSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.querySelector('#main-content');
    
    if (skipLink && mainContent) {
      // Ensure main content has an ID
      if (!mainContent.id) {
        mainContent.id = 'main-content';
      }
      
      skipLink.setAttribute('href', '#' + mainContent.id);
    }
  }

  /**
   * Initialize animations (if needed)
   */
  function initAnimations() {
    // Add animation class to body when DOM is ready
    requestAnimationFrame(function() {
      document.body.classList.add('anim-init');
    });
  }

  /**
   * Initialize all functionality when DOM is ready
   */
  function init() {
    initSmoothScroll();
    initSkipLink();
    initAnimations();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

})();

