/**
 * IP-derived geo from Vercel edge headers (see Vercel request headers docs).
 * Response can include approximate location and client IP; consumers own privacy and retention.
 *
 * Local `vercel dev` often omits or fakes headers; use production to validate.
 * VPNs, corporate egress, and mobile carriers can skew or hide values. Fields are null when unknown.
 */

export const config = {
  runtime: 'edge',
};

const ISO_ALPHA2 = /^[A-Z]{2}$/;

const STATIC_ALLOWED_ORIGINS = [
  'https://meliorem.co.za',
  'https://www.meliorem.co.za',
  'https://www.debt-and-credit.co.za',
  'https://debt-and-credit.co.za',
  'https://www.onepagebudget.co.za',
  'https://onepagebudget.co.za',
];

function buildAllowedOriginSet() {
  const set = new Set(STATIC_ALLOWED_ORIGINS);
  const raw = process.env.GEO_CORS_ORIGINS;
  if (raw && typeof raw === 'string') {
    for (const part of raw.split(',')) {
      const o = part.trim();
      if (o) set.add(o);
    }
  }
  return set;
}

function normalizeCountry(raw) {
  if (raw == null || typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  if (!ISO_ALPHA2.test(code)) return null;
  return code;
}

function trimmedOrNull(raw) {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  return t === '' ? null : t;
}

function firstForwardedForIp(raw) {
  const t = trimmedOrNull(raw);
  if (!t) return null;
  const first = t.split(',')[0];
  const ip = first.trim();
  return ip === '' ? null : ip;
}

function decodeCity(raw) {
  const t = trimmedOrNull(raw);
  if (!t) return null;
  try {
    return decodeURIComponent(t.replace(/\+/g, ' '));
  } catch {
    return t;
  }
}

function buildGeoPayload(request) {
  const continent = trimmedOrNull(request.headers.get('x-vercel-ip-continent'));
  const country = normalizeCountry(request.headers.get('x-vercel-ip-country'));
  const countryRegion = trimmedOrNull(request.headers.get('x-vercel-ip-country-region'));
  const city = decodeCity(request.headers.get('x-vercel-ip-city'));
  const postalCode = trimmedOrNull(request.headers.get('x-vercel-ip-postal-code'));
  const latitude = trimmedOrNull(request.headers.get('x-vercel-ip-latitude'));
  const longitude = trimmedOrNull(request.headers.get('x-vercel-ip-longitude'));
  const timezone = trimmedOrNull(request.headers.get('x-vercel-ip-timezone'));
  const ip = firstForwardedForIp(request.headers.get('x-forwarded-for'));

  const hasAny = Boolean(
    continent ||
      country ||
      countryRegion ||
      city ||
      postalCode ||
      latitude ||
      longitude ||
      timezone ||
      ip,
  );

  return {
    continent,
    country,
    countryRegion,
    city,
    postalCode,
    latitude,
    longitude,
    timezone,
    ip,
    source: hasAny ? 'vercel_header' : 'unknown',
  };
}

function corsHeadersForRequest(request, allowedOrigins) {
  const origin = request.headers.get('Origin');
  if (!origin || !allowedOrigins.has(origin)) {
    return {};
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

const BASE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store',
};

function jsonResponse(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...extraHeaders },
  });
}

export default function handler(request) {
  try {
    const allowedOrigins = buildAllowedOriginSet();
    const cors = corsHeadersForRequest(request, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Cache-Control': 'private, no-store',
          ...cors,
        },
      });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'method_not_allowed' }, 405, cors);
    }

    return jsonResponse(buildGeoPayload(request), 200, cors);
  } catch {
    return jsonResponse({ error: 'internal_error' }, 500, {});
  }
}
