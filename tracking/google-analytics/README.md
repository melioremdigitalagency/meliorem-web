# Google Analytics

This directory contains the Google Analytics 4 (GA4) tracking implementation for the One Page Budget website.

## Overview

Google Analytics is used for:
- **Page View Tracking**: Automatic tracking of page views across the site
- **User Behavior**: Understanding how users navigate and interact with the site
- **Analytics**: Comprehensive website analytics and reporting

This is separate from Supabase analytics, which stores data in your database. Google Analytics sends data to Google's analytics platform.

## Structure

```
tracking/google-analytics/
├── google-analytics.js    # GA4 integration module
├── config.md              # Configuration documentation
└── README.md              # This file
```

## Setup

### Measurement ID
- **ID**: `G-5M7RJPFF5V`
- **Type**: Google Analytics 4 (GA4)
- **Location**: Configured in `google-analytics.js`

### Implementation
The Google Analytics script is included in the `<head>` section of all HTML pages:

```html
<!-- Google Analytics -->
<script src="tracking/google-analytics/google-analytics.js"></script>
```

For subpages, use appropriate relative paths:
- Root: `tracking/google-analytics/google-analytics.js`
- Pages subfolder: `../../tracking/google-analytics/google-analytics.js`
- Calculators subfolder: `../../../tracking/google-analytics/google-analytics.js`

## Usage

### Automatic Tracking
Google Analytics automatically tracks:
- Page views on all pages
- User sessions
- Basic user demographics (if enabled in GA4)

### Manual Event Tracking
You can track custom events using the `window.GoogleAnalytics` object:

```javascript
// Track a custom event
window.GoogleAnalytics.track('button_click', {
  button_name: 'Download',
  location: 'hero-section'
});

// Track a page view manually (usually not needed - auto-tracked)
window.GoogleAnalytics.trackPageView();
```

### Standard Events
GA4 supports standard events that can be tracked:

```javascript
// Track a conversion
window.GoogleAnalytics.track('conversion', {
  value: 0,
  currency: 'ZAR'
});

// Track a form submission
window.GoogleAnalytics.track('form_submit', {
  form_type: 'waitlist'
});
```

## Integration Pattern

The Google Analytics module follows the same pattern as other tracking services:
- Auto-initializes on page load
- Exposes `window.GoogleAnalytics` object for manual tracking
- Supports debug mode via `window.APIConfig?.debug`

## Debug Mode

Enable debug logging by setting in `integrations/config.js`:

```javascript
window.APIConfig = {
  debug: true,
  // ... other config
};
```

This will log all Google Analytics events to the console.

## Testing

1. **Google Analytics Real-Time Reports:**
   - Go to Google Analytics dashboard
   - Navigate to Reports > Real-time
   - Visit your site
   - Verify pageviews appear in real-time

2. **Browser Console:**
   - Open browser console
   - Check for `[Google Analytics]` log messages (if debug enabled)
   - Verify no errors related to gtag.js

3. **Google Tag Assistant:**
   - Install Google Tag Assistant Chrome extension
   - Navigate to your site
   - Check that GA4 tag fires correctly

4. **Network Tab:**
   - Open browser DevTools > Network tab
   - Filter by "gtag" or "google-analytics"
   - Verify requests are being sent to Google Analytics

## Privacy Considerations

1. **GDPR/POPIA Compliance:**
   - Google Analytics uses cookies for tracking
   - Consider implementing cookie consent before initialization
   - Update privacy policy to mention Google Analytics
   - Consider IP anonymization (can be configured in GA4)

2. **Cookie Consent:**
   - Google Analytics uses cookies for session tracking
   - Ensure cookie consent is obtained before initialization (if required)
   - Can modify `google-analytics.js` to check for consent before initializing

3. **Data Minimization:**
   - Only necessary data is sent to Google Analytics
   - No personally identifiable information (PII) should be sent
   - Review GA4 data collection settings

## Troubleshooting

### Tracking Not Working
- Check Measurement ID is correct in `google-analytics.js`
- Verify script is included in `<head>` section
- Check browser console for errors
- Verify script path is correct (check relative paths for subpages)
- Check ad blockers (may block Google Analytics)

### Events Not Appearing in GA4
- Wait 24-48 hours for events to appear in standard reports
- Check Real-Time reports for immediate verification
- Verify Measurement ID matches your GA4 property
- Check that gtag.js script loads successfully (Network tab)

### Duplicate Page Views
- Ensure `init()` is only called once per page
- Check for multiple script inclusions
- Verify no duplicate Measurement IDs

## Configuration

### Measurement ID
The Measurement ID is configured in `google-analytics.js`:

```javascript
const MEASUREMENT_ID = 'G-5M7RJPFF5V';
```

To change the Measurement ID, update this constant in the file.

### IP Anonymization
To enable IP anonymization (for GDPR compliance), modify the `init()` function:

```javascript
gtag('config', id, {
  anonymize_ip: true
});
```

## Future Enhancements

Potential future additions:
- Event tracking helpers for form submissions
- Conversion tracking integration
- Enhanced e-commerce tracking
- Custom dimensions and metrics
- User property tracking

## References

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [gtag.js Reference](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)

