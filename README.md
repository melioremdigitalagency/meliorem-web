# meliorem-web

## Coarse geo API

Public **GET** endpoint that returns a coarse **ISO 3166-1 alpha-2** country code derived from the request IP at **Vercel** (no GPS, no location permission). Intended for shared use across Meliorem properties and apps.

**Canonical URL (production):** `https://meliorem.co.za/api/geo/`  
This project uses `trailingSlash: true` on Vercel; prefer the trailing slash. Requests to `/api/geo` may redirect to `/api/geo/`.

**Response (JSON):**

- `country`: two-letter uppercase code (e.g. `ZA`) or `null` if unknown or invalid.
- `source`: `vercel_header` when derived from Vercel’s `x-vercel-ip-country`, otherwise `unknown`.

No IP, city, or other PII is included in the body.

**CORS:** Browser calls must send an `Origin` that is on the server allowlist (see `api/geo.js`). Optional Vercel env **`GEO_CORS_ORIGINS`**: comma-separated extra origins, merged with the built-in list. Mobile apps and `curl` do not send `Origin`; they still receive JSON.

### Testing with curl

```bash
curl -sS "https://meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://www.debt-and-credit.co.za" -i "https://meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://evil.example" -i "https://meliorem.co.za/api/geo/"
```

The second command should show `Access-Control-Allow-Origin` echoing the whitelisted origin. The third should omit that header (browsers block cross-origin reads; `curl` still prints the body).

### Local vs production

Run **`vercel dev`** from this repo. Vercel often does **not** populate `x-vercel-ip-country` the same way as production, so you may see `country: null` and `source: unknown` locally. Treat **production** as the real check.

### Limitations

VPNs, corporate proxies, and some networks can report the wrong country or none. Clients should tolerate `country: null`.
