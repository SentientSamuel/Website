import {
  CACHE_TTL_SECONDS,
  buildPublicPayload,
  flightIata,
  isTripActive,
  normalizeStoredTrips,
  sampleTrips,
  sanitizeTrip,
  selectProviderFlight,
} from './lib.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, max-age=' + CACHE_TTL_SECONDS,
  'x-content-type-options': 'nosniff',
};

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: JSON_HEADERS,
  });
}

function isTravelApi(pathname) {
  return pathname === '/' || pathname === '/api/travel' || pathname === '/api/travel/';
}

async function loadStoredTrips(env) {
  if (!env.TRIPS) return null;
  try {
    const raw = await env.TRIPS.get('trips', 'json');
    const trips = normalizeStoredTrips(raw);
    return trips.length ? trips : null;
  } catch (err) {
    return null;
  }
}

async function cachedProvider(env, cacheKey, fetcher) {
  if (env.TRIPS) {
    try {
      const hit = await env.TRIPS.get(cacheKey, 'json');
      if (hit) return hit;
    } catch (err) {
      /* continue */
    }
  }
  const fresh = await fetcher();
  if (fresh && env.TRIPS) {
    try {
      await env.TRIPS.put(cacheKey, JSON.stringify(fresh), { expirationTtl: CACHE_TTL_SECONDS });
    } catch (err) {
      /* ignore cache write failures */
    }
  }
  return fresh;
}

async function fetchAviationstack(env, trip) {
  const key = env.AVIATIONSTACK_ACCESS_KEY;
  if (!key) return null;

  const iata = flightIata(trip);
  if (!iata) return null;

  const url = new URL('https://api.aviationstack.com/v1/flights');
  url.searchParams.set('access_key', key);
  url.searchParams.set('flight_iata', iata);
  if (trip.date) url.searchParams.set('flight_date', String(trip.date));
  url.searchParams.set('limit', '3');

  const cacheKey = 'status:' + iata + ':' + String(trip.date || '');
  return cachedProvider(env, cacheKey, async function () {
    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;
    return data;
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }
    if (request.method !== 'GET') {
      return json({ error: 'method_not_allowed' }, 405);
    }

    const url = new URL(request.url);
    if (!isTravelApi(url.pathname)) {
      return json({ error: 'not_found' }, 404);
    }

    const now = Date.now();
    const hasSecret = Boolean(env.AVIATIONSTACK_ACCESS_KEY);
    const stored = await loadStoredTrips(env);
    const catalog = stored || sampleTrips(now);
    const source = hasSecret && stored ? 'live' : 'mock';

    const active = catalog.filter(function (trip) {
      return isTripActive(trip, now);
    });

    const sanitized = [];
    for (let i = 0; i < active.length; i++) {
      const trip = active[i];
      let providerRow = null;
      if (hasSecret) {
        try {
          const payload = await fetchAviationstack(env, trip);
          providerRow = selectProviderFlight(payload, trip);
        } catch (err) {
          providerRow = null;
        }
      }
      sanitized.push(sanitizeTrip(trip, providerRow, now));
    }

    const body = buildPublicPayload(sanitized, source, now);
    return json(body);
  },
};
