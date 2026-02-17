/**
 * Legal Pages Component Loader
 * Loads header and footer components for legal pages
 * Uses fixed relative paths since legal pages are in subdirectories
 */

(function() {
  'use strict';
  
  // Component base path (relative to legal-page directory)
  const COMPONENT_BASE = '../components/';
  
  // Load component HTML and CSS
  function loadComponent(componentName, placeholder) {
    if (!placeholder) return;
    
    const htmlPath = COMPONENT_BASE + componentName + '/' + componentName + '.html';
    const cssPath = COMPONENT_BASE + componentName + '/' + componentName + '.css';
    
    // Fetch and inject HTML
    fetch(htmlPath)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load ${componentName}`);
        return response.text();
      })
      .then(html => {
        placeholder.innerHTML = html;
        // Load CSS
        loadCSS(cssPath);
      })
      .catch(error => {
        console.error(`Error loading ${componentName}:`, error);
        // Fail gracefully - don't show error to user
      });
  }
  
  // Load CSS (only if not already in head)
  function loadCSS(cssPath) {
    // Check if CSS already loaded (either by data attribute or by href)
    const existingByAttr = document.querySelector(`link[data-component-css="${cssPath}"]`);
    const existingByHref = document.querySelector(`link[href="${cssPath}"]`);
    if (existingByAttr || existingByHref) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.setAttribute('data-component-css', cssPath);
    document.head.appendChild(link);
  }
  
  // Initialize when DOM ready
  function init() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (headerPlaceholder) loadComponent('header', headerPlaceholder);
    if (footerPlaceholder) loadComponent('footer', footerPlaceholder);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

