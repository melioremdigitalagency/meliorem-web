# meliorem-web

## Coarse geo API

Public **GET** endpoint that returns **IP-derived** location fields from **Vercel** request headers (no GPS, no browser location permission). Intended for shared use across Meliorem properties and apps.

**Warning:** The JSON can include **client IP**, **city**, **postal code**, **coordinates**, and related fields. Treat the response as **sensitive personal data** for privacy, retention, and compliance. Refine policy and which fields you store or forward (e.g. in Make.com) before production use.

**Canonical URL (production):** `https://meliorem.co.za/api/geo/`  
This project uses `trailingSlash: true` on Vercel; prefer the trailing slash. Requests to `/api/geo` may redirect to `/api/geo/`.

**Response (JSON):** Every call returns the same keys. String fields are `null` when the source does not supply a value.

**Vercel (request IP / edge headers):**

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
| `source` | `vercel_header` if any **Vercel** field in this block is non-null; otherwise `unknown` (currency does not affect `source`) |

**Currency (bundled lookup by `country`):**

| Field | Source |
|--------|--------|
| `currencyCode` | [`data/country-currency.json`](data/country-currency.json) — ISO 4217, `null` if `country` is missing or not in map |
| `currencyName` | Same |
| `currencyCountryName` | Display name for that map row (e.g. for labels); `null` if no map entry |

Currency is **indicative** (usual currency for that ISO country). Wrong IP country implies wrong currency. The map is built from [`temp/country_to_currency_map.csv`](temp/country_to_currency_map.csv); regenerate with `node scripts/build-country-currency.mjs` (duplicate `CountryCode` in CSV: last row wins). Keys such as `USAF` exist only for non-standard codes; normal `US` traffic uses the `US` row.

**CORS:** Browser calls must send an `Origin` the server allows: production domains in [`api/geo.js`](api/geo.js), any **`https://*.vercel.app`** preview host (HTTPS only), plus optional env **`GEO_CORS_ORIGINS`** (comma-separated extras). Mobile apps and `curl` do not send `Origin`; they still receive JSON. Call **`https://www.meliorem.co.za/api/geo/`** (not apex) to avoid a 307 redirect that can break browser CORS.

### Testing with curl

```bash
curl -sS "https://meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://www.debt-and-credit.co.za" -i "https://www.meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://onepagebudget-d1gjix787-meliorem-agencys-projects.vercel.app" -i "https://www.meliorem.co.za/api/geo/"
curl -sS -H "Origin: https://evil.example" -i "https://www.meliorem.co.za/api/geo/"
```

The second command should show `Access-Control-Allow-Origin` echoing the whitelisted origin. The third should omit that header (browsers block cross-origin reads; `curl` still prints the body).

### Local vs production

Run **`vercel dev`** from this repo. Vercel often does **not** populate geo headers the same way as production, so many fields may be `null` and `source` may be `unknown` locally. Treat **production** as the real check.

### Limitations

VPNs, corporate proxies, and some networks can report the wrong location or omit fields. IP geolocation is approximate. Clients should tolerate `null` values on every field, including currency when the country is unknown or absent from the bundled map.
