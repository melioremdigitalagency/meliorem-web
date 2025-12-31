# Tracking & Analytics

This directory contains tracking and analytics configurations for the One Page Budget website.

## Structure

```
tracking/
├── google-admob/
│   └── app-ads-config.md        # Google AdMob app-ads.txt configuration
├── google-analytics/
│   ├── google-analytics.js      # GA4 integration module
│   ├── config.md                # Google Analytics configuration
│   └── README.md                # Google Analytics documentation
├── google-search-console/
│   └── verification-config.md  # Google Search Console verification details
└── README.md                    # This file
```

## Google Search Console

### Verification
- **Status**: ✅ Configured
- **Method**: HTML meta tag
- **Location**: `index.html` (root)
- **Config**: See `google-search-console/verification-config.md`

### Sitemap
- **File**: `sitemap.xml` (project root)
- **URL**: https://onepagebudget.co.za/sitemap.xml
- **Note**: Update `sitemap.xml` when adding new pages to the site

### Robots.txt
- **File**: `robots.txt` (project root)
- **URL**: https://onepagebudget.co.za/robots.txt
- **Status**: Allows all crawlers, references sitemap

## Google AdMob

### app-ads.txt
- **File**: `app-ads.txt` (project root)
- **URL**: https://onepagebudget.co.za/app-ads.txt
- **Status**: ✅ Configured
- **Publisher ID**: `pub-2960411021927431`
- **Config**: See `google-admob/app-ads-config.md`
- **Note**: File must be accessible at root domain for AdMob verification

## Google Analytics

### GA4 Tracking
- **Status**: ✅ Configured
- **Measurement ID**: `G-XPTVNNMJK2`
- **Implementation**: gtag.js script in `<head>` section of all HTML pages
- **Config**: See `google-analytics/config.md`
- **Documentation**: See `google-analytics/README.md`
- **Note**: Auto-initializes on page load, tracks page views automatically

## Maintenance

When adding new pages:
1. Add the new URL to `sitemap.xml` with appropriate priority and changefreq
2. Update the `lastmod` date for the new entry
3. Consider updating `lastmod` dates for parent pages if structure changes

## Next Steps

After deployment:
1. Verify site ownership in Google Search Console
2. Submit `sitemap.xml` in Google Search Console
3. Monitor indexing status and crawl errors

