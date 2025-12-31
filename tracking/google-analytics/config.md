# Google Analytics Configuration

## Measurement ID
`G-5M7RJPFF5V`

## Implementation
The Google Analytics script has been added to the `<head>` section of all HTML pages:

```html
<!-- Google Analytics -->
<script src="tracking/google-analytics/google-analytics.js"></script>
```

## Initialization Date
2025-01-24

## Notes
- GA4 (Google Analytics 4) is implemented using gtag.js
- Script auto-initializes on page load
- Measurement ID is configured in `google-analytics.js`
- If tracking fails, ensure the script is in the `<head>` section and the Measurement ID is correct
- Verify tracking in Google Analytics Real-Time reports

