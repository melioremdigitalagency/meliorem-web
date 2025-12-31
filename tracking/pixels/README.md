# Pixel Tracking

This directory contains pixel tracking implementations for conversion events and analytics.

## Overview

Pixel tracking is used for:
- **Conversion Tracking**: Track form submissions, lead captures, and conversions
- **Analytics**: Track user behavior and engagement
- **Retargeting**: Enable retargeting campaigns based on user actions

This is separate from Supabase analytics, which stores data in your database. Pixels send data to third-party services (Facebook, Google, etc.).

## Structure

```
tracking/pixels/
├── facebook-pixel.js    # Facebook Pixel integration
└── README.md            # This file
```

## Facebook Pixel

### Setup

1. **Get Facebook Pixel ID:**
   - Go to Facebook Events Manager
   - Create or select a pixel
   - Copy the Pixel ID (e.g., `1234567890123456`)

2. **Initialize in your HTML:**
   ```html
   <script src="tracking/pixels/facebook-pixel.js"></script>
   <script>
     window.FacebookPixel.init('YOUR_PIXEL_ID');
   </script>
   ```

### Usage

#### Standard Events

```javascript
// Track page view (automatically tracked on init)
window.FacebookPixel.trackPageView();

// Track lead
window.FacebookPixel.track('Lead', {
  content_name: 'Waitlist Form',
  content_category: 'form_submission'
});

// Track conversion
window.FacebookPixel.trackConversion('waitlist', {
  value: 0,
  currency: 'ZAR'
});

// Track complete registration
window.FacebookPixel.trackCompleteRegistration({
  status: true
});
```

#### Custom Events

```javascript
// Track custom event
window.FacebookPixel.trackCustom('CalculatorCompleted', {
  calculator_type: 'family-readiness-check',
  score: 85
});

// Track custom event with additional data
window.FacebookPixel.trackCustom('FormViewed', {
  form_type: 'waitlist',
  location: 'hero-section'
});
```

#### Form Submission Tracking

```javascript
// Track form submission conversion
window.FacebookPixel.trackConversion('waitlist', {
  value: 0,
  currency: 'ZAR'
});

// Track contact form submission
window.FacebookPixel.trackConversion('contact-us', {
  value: 0,
  currency: 'ZAR'
});

// Track DC lead submission
window.FacebookPixel.trackConversion('dc-lead', {
  value: 0,
  currency: 'ZAR'
});
```

### Standard Events Reference

Facebook Pixel supports these standard events:

- `PageView` - Page view (tracked automatically)
- `Lead` - Lead capture
- `Contact` - Contact form submission
- `CompleteRegistration` - Registration completion
- `ViewContent` - Content view
- `Search` - Search query
- `AddToCart` - Add to cart
- `InitiateCheckout` - Checkout initiation
- `Purchase` - Purchase completion

### Custom Events

You can track any custom event name:

```javascript
window.FacebookPixel.trackCustom('YourCustomEvent', {
  custom_parameter: 'value'
});
```

### Event Data Parameters

Common parameters you can include:

```javascript
{
  content_name: 'Product or Page Name',
  content_category: 'Category',
  content_ids: ['id1', 'id2'],
  content_type: 'product',
  value: 0.00,
  currency: 'ZAR',
  num_items: 1
}
```

### Integration Pattern

Typical integration in form components:

```javascript
// After successful form submission
async function handleFormSubmission(formData) {
  try {
    // 1. Submit to Make.com webhook
    await window.MakeComClient.submit('waitlist', payload);
    
    // 2. Track in Supabase
    await window.SupabaseLeadTracking.trackFormSubmission({
      formType: 'waitlist',
      payload: payload
    });
    
    // 3. Track conversion in Facebook Pixel
    window.FacebookPixel.trackConversion('waitlist', {
      value: 0,
      currency: 'ZAR'
    });
    
    // Show success message
    showSuccessMessage();
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage();
  }
}
```

### Debug Mode

Enable debug logging by setting in `integrations/config.js`:

```javascript
window.APIConfig = {
  debug: true,
  // ... other config
};
```

This will log all Facebook Pixel events to the console.

### Testing

1. **Facebook Pixel Helper:**
   - Install Facebook Pixel Helper Chrome extension
   - Navigate to your site
   - Check that pixel fires correctly

2. **Events Manager:**
   - Go to Facebook Events Manager
   - Check "Test Events" tab
   - Verify events are being received

3. **Browser Console:**
   - Open browser console
   - Check for `[Facebook Pixel]` log messages (if debug enabled)

### Privacy Considerations

1. **GDPR Compliance:**
   - Only initialize pixel after user consent (if required)
   - Provide opt-out mechanism
   - Update privacy policy

2. **Cookie Consent:**
   - Facebook Pixel uses cookies
   - Ensure cookie consent is obtained before initialization

3. **Data Minimization:**
   - Only send necessary data
   - Don't send PII unless necessary

### Troubleshooting

#### Pixel Not Firing
- Check pixel ID is correct
- Verify `init()` is called before tracking events
- Check browser console for errors
- Use Facebook Pixel Helper extension

#### Events Not Appearing in Events Manager
- Wait 20-30 minutes for events to appear
- Check "Test Events" tab for real-time events
- Verify pixel is active in Events Manager

#### Duplicate Events
- Ensure `init()` is only called once
- Check for multiple script inclusions
- Verify no duplicate pixel IDs

## Adding New Pixel Integrations

To add a new pixel (e.g., Google Analytics, LinkedIn Insight Tag):

1. Create new file: `tracking/pixels/{pixel-name}.js`
2. Follow similar pattern to `facebook-pixel.js`
3. Expose global object: `window.{PixelName}`
4. Document in this README

Example structure:
```javascript
(function() {
  'use strict';
  
  const GoogleAnalytics = {
    init: function(trackingId) { ... },
    track: function(eventName, eventData) { ... },
    trackConversion: function(formType, eventData) { ... }
  };
  
  window.GoogleAnalytics = GoogleAnalytics;
})();
```

