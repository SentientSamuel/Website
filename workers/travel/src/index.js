import {
  CACHE_TTL_SECONDS,
  MAX_STORED_TRIPS,
  buildPublicPayload,
  buildStoredTrip,
  flightIata,
  isTripActive,
  isTripUpcoming,
  normalizeStoredTrips,
  removeTrip,
  sampleTrips,
  sanitizeTrip,
  selectProviderFlight,
  upsertTrip,
} from './lib.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, max-age=' + CACHE_TTL_SECONDS,
  'x-content-type-options': 'nosniff',
};

const MUTATE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
};

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: headers || JSON_HEADERS,
  });
}

function matchRoute(pathname) {
  const path = String(pathname || '').replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/api/travel') return { name: 'status' };
  if (path === '/api/travel/trips') return { name: 'trips' };
  const trip = path.match(/^\/api\/travel\/trips\/([^/]+)$/);
  if (trip) {
    try {
      return { name: 'trip', id: decodeURIComponent(trip[1]) };
    } catch (err) {
      return { name: 'trip', id: trip[1] };
    }
  }
  return null;
}

function isAllowedMutatingOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  let host;
  try {
    host = new URL(origin).hostname;
  } catch (err) {
    return false;
  }
  return (
    host === 'samuellamb.dev' ||
    host === 'www.samuellamb.dev' ||
    host === 'localhost' ||
    host === '127.0.0.1'
  );
}

async function loadStore(env) {
  if (!env.TRIPS) return { bound: false, trips: [] };
  try {
    const raw = await env.TRIPS.get('trips', 'json');
    return { bound: true, trips: normalizeStoredTrips(raw) };
  } catch (err) {
    return { bound: true, trips: [] };
  }
}

async function saveTrips(env, trips) {
  await env.TRIPS.put('trips', JSON.stringify({ trips: trips }));
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

async function enrichLiveTrips(env, trips, now) {
  const sanitized = [];
  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    let providerRow = null;
    if (env.AVIATIONSTACK_ACCESS_KEY) {
      try {
        const payload = await fetchAviationstack(env, trip);
        providerRow = selectProviderFlight(payload, trip);
      } catch (err) {
        providerRow = null;
      }
    }
    sanitized.push(sanitizeTrip(trip, providerRow, now));
  }
  return sanitized;
}

async function handleStatus(env) {
  const now = Date.now();
  const store = await loadStore(env);
  const catalog = store.bound ? store.trips : sampleTrips(now);
  const source = env.AVIATIONSTACK_ACCESS_KEY && store.bound && store.trips.length ? 'live' : 'mock';

  const live = catalog.filter(function (trip) {
    return isTripActive(trip, now);
  });
  const upcoming = catalog.filter(function (trip) {
    return isTripUpcoming(trip, now);
  });

  const liveCards = await enrichLiveTrips(env, live, now);
  const upcomingCards = upcoming.map(function (trip) {
    return sanitizeTrip(trip, null, now);
  });

  return json(buildPublicPayload(liveCards, upcomingCards, source, now));
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (err) {
    return null;
  }
}

async function handleCreate(request, env) {
  if (!env.TRIPS) {
    return json({ error: 'trip_store_unavailable', message: 'KV is not bound yet.' }, 503, MUTATE_HEADERS);
  }
  const body = await readJson(request);
  if (!body || typeof body !== 'object') {
    return json({ error: 'invalid_json' }, 400, MUTATE_HEADERS);
  }
  const built = buildStoredTrip(body, Date.now());
  if (built.error) {
    return json({ error: 'invalid_trip', message: built.error }, 400, MUTATE_HEADERS);
  }
  const store = await loadStore(env);
  const exists = store.trips.some(function (trip) {
    return (trip.id || '') === built.trip.id;
  });
  if (!exists && store.trips.length >= MAX_STORED_TRIPS) {
    return json({ error: 'too_many_trips', message: 'Remove a trip before adding another.' }, 400, MUTATE_HEADERS);
  }
  const next = upsertTrip(store.trips, built.trip);
  await saveTrips(env, next);
  return json({ ok: true, trip: sanitizeTrip(built.trip, null, Date.now()) }, exists ? 200 : 201, MUTATE_HEADERS);
}

async function handleDelete(id, env) {
  if (!env.TRIPS) {
    return json({ error: 'trip_store_unavailable' }, 503, MUTATE_HEADERS);
  }
  if (!id) {
    return json({ error: 'missing_id' }, 400, MUTATE_HEADERS);
  }
  const store = await loadStore(env);
  const next = removeTrip(store.trips, id);
  if (next.length === store.trips.length) {
    return json({ error: 'not_found' }, 404, MUTATE_HEADERS);
  }
  await saveTrips(env, next);
  return json({ ok: true, id: id }, 200, MUTATE_HEADERS);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: Object.assign({}, JSON_HEADERS, {
          'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
          'access-control-allow-headers': 'content-type',
        }),
      });
    }

    const url = new URL(request.url);
    const route = matchRoute(url.pathname);
    if (!route) {
      return json({ error: 'not_found' }, 404);
    }

    if (request.method === 'GET' && route.name === 'status') {
      return handleStatus(env);
    }

    if (request.method === 'POST' && route.name === 'trips') {
      if (!isAllowedMutatingOrigin(request)) {
        return json({ error: 'forbidden' }, 403, MUTATE_HEADERS);
      }
      return handleCreate(request, env);
    }

    if (request.method === 'DELETE' && route.name === 'trip') {
      if (!isAllowedMutatingOrigin(request)) {
        return json({ error: 'forbidden' }, 403, MUTATE_HEADERS);
      }
      return handleDelete(route.id, env);
    }

    return json({ error: 'method_not_allowed' }, 405, MUTATE_HEADERS);
  },
};
