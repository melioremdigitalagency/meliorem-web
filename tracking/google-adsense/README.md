# Google AdSense / Google Ads

This directory is reserved for future Google AdSense and Google Ads implementation.

## Status

**Not yet implemented** - This folder is prepared for future Google Ads integration.

## Future Implementation

When Google Ads is implemented:

1. **Consent Integration**: Google Ads will use the marketing cookie consent category
2. **Consent Mode**: Ad-related consent parameters are already set up in Google Analytics:
   - `ad_storage`: Controls Google Ads cookie storage
   - `ad_user_data`: Controls sending user data to Google Ads
   - `ad_personalization`: Controls ad personalization

3. **Consent Check**: Google Ads scripts should check:
   ```javascript
   if (window.CookieConsent && window.CookieConsent.hasConsent('marketing')) {
     // Initialize Google Ads
   }
   ```

## Related Files

- Consent Mode API: `tracking/google-analytics/google-analytics.js`
- Consent Manager: `tracking/cookies/consent-manager.js`
- Cookie Config: `tracking/cookies/config.js`

## Notes

- Marketing cookie category controls all ad-related consent
- Consent state is automatically updated via Google Consent Mode API
- No additional consent management needed for Google Ads

