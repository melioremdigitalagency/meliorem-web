# meliorem-web

## Coarse geo API

Public **GET** endpoint that returns **IP-derived** location fields from **Vercel** request headers (no GPS, no browser location permission). Intended for shared use across Meliorem properties and apps.

**Warning:** The JSON can include **client IP**, **city**, **postal code**, **coordinates**, and related fields. Treat the response as **sensitive personal data** for privacy, retention, and compliance. Refine policy and which fields you store or forward (e.g. in Make.com) before production use.

**Canonical URL (production):** `https://meliorem.co.za/api/geo/`  
This project uses `trailingSlash: true` on Vercel; prefer the trailing slash. Requests to `/api/geo` may redirect to `/api/geo/`.

**Response (JSON):** Every call returns the same keys; values are strings or `null` when Vercel does not supply them.

| Field | Source (Vercel header) |
|--------|-------------------------|
| `continent` | `x-vercel-ip-continent` |
| `country` | `x-vercel-ip-country` (normalized uppercase ISO 3166-1 alpha-2, or `null` if invalid) |
| `countryRegion` | `x-vercel-ip-country-region` |
| `city` | `x-vercel-ip-city` (percent-decoded; invalid encoding falls back to trimmed raw) |
| `postalCode` | `x-vercel-ip-postal-code` |
| `latitude` | `x-vercel-ip-latitude` |
| `longitude` | `x-vercel-ip-longitude` |
| `timezone` | `x-vercel-ip-timezone` |
| `ip` | `x-forwarded-for` (first address if comma-separated) |
| `source` | `vercel_header` if any of the above is non-null; otherwise `unknown` |

**CORS:** Browser calls must send an `Origin` that is on the server allowlist (see `api/geo.js`). Optional Vercel env **`GEO_CORS_ORIGINS`**: comma-separated extra origins, merged with the built-in list. Mobile apps and `curl` do not send `Origin`; they still receive JSON.

### Testing with curl

```bash
curl -sS "https://meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://www.debt-and-credit.co.za" -i "https://meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://evil.example" -i "https://meliorem.co.za/api/geo/"
```

The second command should show `Access-Control-Allow-Origin` echoing the whitelisted origin. The third should omit that header (browsers block cross-origin reads; `curl` still prints the body).

### Local vs production

Run **`vercel dev`** from this repo. Vercel often does **not** populate geo headers the same way as production, so many fields may be `null` and `source` may be `unknown` locally. Treat **production** as the real check.

### Limitations

VPNs, corporate proxies, and some networks can report the wrong location or omit fields. IP geolocation is approximate. Clients should tolerate `null` values on every field.
