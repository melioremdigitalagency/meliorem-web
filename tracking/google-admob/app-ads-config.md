# Google AdMob app-ads.txt Configuration

## Publisher ID
`pub-2960411021927431`

## File Location
- **File**: `app-ads.txt` (project root)
- **URL**: https://onepagebudget.co.za/app-ads.txt
- **Specification**: IAB Tech Lab app-ads.txt v1.0

## File Content
```
google.com, pub-2960411021927431, DIRECT, f08c47fec0942fa0
```

## Format Explanation
- `google.com` - Ad network domain (Google AdMob)
- `pub-2960411021927431` - AdMob publisher ID
- `DIRECT` - Direct relationship (no reseller/intermediary)
- `f08c47fec0942fa0` - Google's certification authority ID

## Implementation Date
2025-01-24

## Verification Instructions

### Initial Verification
1. Deploy the file to production
2. Verify file is accessible at: https://onepagebudget.co.za/app-ads.txt
3. Check that content matches exactly (no extra whitespace, correct encoding)
4. Wait at least 24 hours for AdMob to crawl and verify
5. Check AdMob dashboard for app-ads.txt status

### Domain Requirements
- Domain must match exactly as listed in Google Play Console
- Current domain: `onepagebudget.co.za` (no www, no subdomain)
- File must be accessible at root level: `/app-ads.txt`

## Maintenance

### When to Update
- Only update if AdMob publisher ID changes
- If adding additional ad networks, add new lines following the same format
- Document all changes in this file

### Testing After Changes
1. Verify file is accessible via browser
2. Check file encoding (should be UTF-8)
3. Verify content-type is `text/plain`
4. Wait 24+ hours and check AdMob dashboard status

## Notes
- File follows IAB Tech Lab app-ads.txt specification
- Vercel automatically serves static files at root with correct content-type
- No special server configuration required
- File is plain text, no HTML or special formatting

