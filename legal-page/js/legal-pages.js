/**
 * Legal Pages - Markdown Rendering
 * Dynamically loads and renders markdown content from legal/assets/
 */

(function() {
  'use strict';

  // Markdown file mapping based on page
  // Note: Files are physically at pages/legal-page/assets/, but URLs use /legal-page/
  const markdownFiles = {
    'terms-and-conditions': 'legal-page/assets/meliorem_terms_and_conditions.md',
    'privacy-policy': 'legal-page/assets/meliorem_privacy_policy.md',
    'data-community-policy': 'legal-page/assets/meliorem_data_community_optin.md'
  };

  // Determine which markdown file to load based on page
  function getMarkdownFile() {
    const path = window.location.pathname;
    // Handle trailing slashes by filtering out empty path segments
    const pathParts = path.split('/').filter(part => part.length > 0);
    // Get the last non-empty segment as the filename
    let filename = pathParts[pathParts.length - 1] || '';
    // Remove .html extension if present
    filename = filename.replace('.html', '');
    
    // Handle both /legal/ and /legal-page/ URLs
    // Note: Vercel rewrites /legal/ to /legal-page/ internally, but window.location.pathname shows the original URL
    if (path.includes('legal/') || path.includes('legal-page/')) {
      return markdownFiles[filename] || null;
    }
    
    return null;
  }

  // Get relative path to markdown file based on current page location
  function getRelativePath(markdownPath) {
    const currentPath = window.location.pathname;
    
    // If we're in legal/ or legal-page/ directory, extract just the assets/filename.md portion
    // Since HTML files are now at legal-page/*/index.html (in subdirectories) and markdown files are at
    // legal-page/assets/*.md, the relative path should be ../assets/filename.md
    if (currentPath.includes('legal/') || currentPath.includes('legal-page/')) {
      const pathParts = markdownPath.split('/');
      const assetsIndex = pathParts.indexOf('assets');
      if (assetsIndex !== -1) {
        // Return path from 'assets' onwards with ../ prefix since we're in a subdirectory
        return '../' + pathParts.slice(assetsIndex).join('/');
      }
      // Fallback: return relative path
      return '../assets/' + pathParts[pathParts.length - 1];
    }
    
    // Otherwise, use root path
    return markdownPath;
  }

  // Load and render markdown
  async function loadMarkdown() {
    const container = document.getElementById('legal-content');
    const loadingEl = document.getElementById('legal-loading');
    const errorEl = document.getElementById('legal-error');
    
    if (!container) {
      console.error('Legal content container not found');
      return;
    }

    const markdownFile = getMarkdownFile();
    
    if (!markdownFile) {
      if (errorEl) {
        errorEl.textContent = 'Unable to determine which document to load.';
        errorEl.style.display = 'block';
      }
      if (loadingEl) loadingEl.style.display = 'none';
      return;
    }

    const markdownPath = getRelativePath(markdownFile);

    try {
      // Show loading state
      if (loadingEl) loadingEl.style.display = 'block';
      if (errorEl) errorEl.style.display = 'none';
      container.innerHTML = '';

      // Fetch markdown file
      const response = await fetch(markdownPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
      }

      const markdown = await response.text();

      // Check if marked.js is loaded
      if (typeof marked === 'undefined') {
        throw new Error('Marked.js library not loaded');
      }

      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });

      // Parse markdown to HTML
      const html = marked.parse(markdown);

      // Inject HTML into container
      container.innerHTML = html;
      container.classList.add('legal-content-loaded');

      // Hide loading state
      if (loadingEl) loadingEl.style.display = 'none';

    } catch (error) {
      console.error('Error loading markdown:', error);
      
      if (errorEl) {
        errorEl.innerHTML = `
          <p><strong>Error loading document</strong></p>
          <p>${error.message}</p>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        `;
        errorEl.style.display = 'block';
      }
      
      if (loadingEl) loadingEl.style.display = 'none';
      container.innerHTML = '<p>Unable to load document content.</p>';
    }
  }

  // Initialize when DOM is ready
  function init() {
    // Check if we're on a legal page
    const container = document.getElementById('legal-content');
    if (!container) {
      return; // Not a legal page, exit
    }

    // Load marked.js from CDN if not already loaded
    if (typeof marked === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = loadMarkdown;
      script.onerror = function() {
        const errorEl = document.getElementById('legal-error');
        const loadingEl = document.getElementById('legal-loading');
        if (errorEl) {
          errorEl.innerHTML = '<p><strong>Error loading markdown parser</strong></p><p>Please check your internet connection and try again.</p>';
          errorEl.style.display = 'block';
        }
        if (loadingEl) loadingEl.style.display = 'none';
      };
      document.head.appendChild(script);
    } else {
      // marked.js already loaded, load markdown immediately
      loadMarkdown();
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

