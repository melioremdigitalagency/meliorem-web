# Cookie Consent Management

This directory contains the cookie consent management system for GDPR/POPIA compliance.

## Overview

The consent management system provides:
- **Consent Storage**: Store and retrieve user consent preferences
- **Category Management**: Manage different cookie categories (essential, analytics, marketing)
- **API for Tracking Scripts**: Allow tracking scripts to check consent before initializing

## Structure

```
tracking/cookies/
├── config.js              # Cookie categories and configuration
├── consent-manager.js      # Core consent management API
└── README.md              # This file
```

## Usage

### Loading the Consent Manager

Load the consent manager scripts in the `<head>` section before tracking scripts:

```html
<!-- Cookie Consent Config -->
<script src="tracking/cookies/config.js"></script>
<script src="tracking/cookies/consent-manager.js"></script>
```

For subpages, use appropriate relative paths:
- Root: `tracking/cookies/config.js`
- Pages subfolder: `../../tracking/cookies/config.js`
- Calculators subfolder: `../../../tracking/cookies/config.js`

### Checking Consent

```javascript
// Check if user has consented to analytics
if (window.CookieConsent.hasConsent('analytics')) {
  // Initialize Google Analytics
}

// Check if user has consented to marketing
if (window.CookieConsent.hasConsent('marketing')) {
  // Initialize Facebook Pixel
}
```

### Setting Consent

```javascript
// Set consent preferences
window.CookieConsent.setConsent({
  analytics: true,
  marketing: false
});
// Note: essential is always true and cannot be changed
```

### Getting Preferences

```javascript
// Get all consent preferences
const preferences = window.CookieConsent.getPreferences();
// Returns: { essential: true, analytics: true, marketing: false, timestamp: "2025-01-24T..." }

// Check if user has made a choice
if (window.CookieConsent.hasMadeChoice()) {
  // User has already made a choice
}
```

### Listening for Consent Updates

```javascript
// Listen for consent changes
window.addEventListener('cookieConsentUpdated', function(event) {
  const preferences = event.detail;
  // Handle consent update (e.g., initialize tracking if consent given)
});
```

## Cookie Categories

### Essential
- **Always enabled**: Cannot be disabled
- **Purpose**: Required for website functionality
- **Examples**: Session management, security features

### Analytics
- **Optional**: User can opt out
- **Purpose**: Website analytics and user behavior tracking
- **Examples**: Google Analytics

### Marketing
- **Optional**: User can opt out
- **Purpose**: Advertising and marketing tracking
- **Examples**: Facebook Pixel, retargeting pixels

## Storage

Consent preferences are stored in `localStorage` with the key `opb_cookie_consent`.

Storage format:
```json
{
  "essential": true,
  "analytics": false,
  "marketing": false,
  "timestamp": "2025-01-24T12:00:00.000Z"
}
```

## Integration with Tracking Scripts

Tracking scripts should check consent before initializing:

```javascript
// Example: Google Analytics
if (window.CookieConsent && window.CookieConsent.hasConsent('analytics')) {
  // Initialize Google Analytics
  initGoogleAnalytics();
} else {
  // Wait for consent or don't initialize
}
```

## Configuration

Edit `config.js` to:
- Add new cookie categories
- Change storage key name
- Modify default preferences
- Set consent expiration period

## Privacy Compliance

This system helps comply with:
- **GDPR** (EU General Data Protection Regulation)
- **POPIA** (South Africa Protection of Personal Information Act)
- **ePrivacy Directive** (EU Cookie Law)

Key compliance features:
- User must explicitly consent to non-essential cookies
- Consent can be withdrawn at any time
- Essential cookies are always enabled (required for functionality)
- Preferences are stored locally (no server-side tracking without consent)

## Notes

- Essential cookies are always `true` and cannot be disabled
- Consent preferences persist across page loads
- Consent expiration is configurable (default: 365 days)
- The consent manager does not handle UI - that's handled by the cookie-consent component

