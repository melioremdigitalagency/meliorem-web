/**
 * Coarse country from Vercel edge (IP-derived). No GPS, no client PII in the body.
 *
 * Local `vercel dev` often omits or fakes `x-vercel-ip-country`; use production to validate.
 * VPNs, corporate egress, and mobile carriers can skew or hide country. Returns null when unknown.
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

    const rawCountry = request.headers.get('x-vercel-ip-country');
    const country = normalizeCountry(rawCountry);
    const payload = {
      country,
      source: country ? 'vercel_header' : 'unknown',
    };

    return jsonResponse(payload, 200, cors);
  } catch {
    return jsonResponse({ error: 'internal_error' }, 500, {});
  }
}
