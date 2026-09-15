/**
 * Travel status helpers shared by the Worker and its tests.
 * Never log or return AVIATIONSTACK_ACCESS_KEY, PNR, or raw provider payloads.
 */

export const ACTIVE_BEFORE_MS = 6 * 60 * 60 * 1000;
export const ACTIVE_AFTER_MS = 2 * 60 * 60 * 1000;
export const CACHE_TTL_SECONDS = 180;
export const FALLBACK_BLOCK_MS = 8 * 60 * 60 * 1000;

/** Approximate airport coordinates used only to interpolate a marker when live lat/lon is absent. */
export const AIRPORT_COORDS = {
  ATL: { lat: 33.6407, lon: -84.4277 },
  BOS: { lat: 42.3656, lon: -71.0096 },
  DTW: { lat: 42.2162, lon: -83.3554 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  LGA: { lat: 40.7769, lon: -73.874 },
  EWR: { lat: 40.6895, lon: -74.1745 },
  LAX: { lat: 33.9416, lon: -118.4085 },
  ORD: { lat: 41.9742, lon: -87.9073 },
  MIA: { lat: 25.7959, lon: -80.287 },
  SEA: { lat: 47.4502, lon: -122.3088 },
  DFW: { lat: 32.8998, lon: -97.0403 },
  DEN: { lat: 39.8561, lon: -104.6737 },
  SFO: { lat: 37.6213, lon: -122.379 },
  IAD: { lat: 38.9531, lon: -77.4565 },
  DCA: { lat: 38.8512, lon: -77.0402 },
  PHL: { lat: 39.8744, lon: -75.2424 },
  MSP: { lat: 44.8848, lon: -93.2223 },
  CLT: { lat: 35.214, lon: -80.9431 },
  PHX: { lat: 33.4373, lon: -112.0078 },
  SLC: { lat: 40.7899, lon: -111.9791 },
};

export function parseTime(value) {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

export function iso(ms) {
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function flightIata(trip) {
  const airline = String(trip.airline || '').trim().toUpperCase();
  const number = String(trip.flight_number || '').trim();
  return airline && number ? airline + number : '';
}

export function scheduledWindow(trip) {
  const dep =
    parseTime(trip.dep_scheduled) ||
    parseTime(trip.scheduled_dep) ||
    null;
  const arr =
    parseTime(trip.arr_scheduled) ||
    parseTime(trip.scheduled_arr) ||
    null;

  if (dep) {
    return {
      start: dep - ACTIVE_BEFORE_MS,
      end: (arr || dep + FALLBACK_BLOCK_MS) + ACTIVE_AFTER_MS,
      dep,
      arr: arr || dep + FALLBACK_BLOCK_MS,
    };
  }

  if (!trip.date) return null;
  const day = Date.parse(String(trip.date) + 'T00:00:00Z');
  if (!Number.isFinite(day)) return null;
  return {
    start: day - ACTIVE_BEFORE_MS,
    end: day + 24 * 60 * 60 * 1000 + ACTIVE_AFTER_MS,
    dep: day + 12 * 60 * 60 * 1000,
    arr: day + 16 * 60 * 60 * 1000,
  };
}

export function isTripActive(trip, nowMs) {
  const window = scheduledWindow(trip);
  if (!window) return false;
  return nowMs >= window.start && nowMs <= window.end;
}

export function timeProgress(depMs, arrMs, nowMs, status) {
  if (status === 'landed') return 1;
  if (status === 'cancelled') return 0;
  if (!Number.isFinite(depMs) || !Number.isFinite(arrMs) || arrMs <= depMs) return 0;
  return clamp((nowMs - depMs) / (arrMs - depMs), 0, 1);
}

export function interpolateCoords(origin, dest, t) {
  const a = AIRPORT_COORDS[String(origin || '').toUpperCase()];
  const b = AIRPORT_COORDS[String(dest || '').toUpperCase()];
  if (!a || !b) return { lat: null, lon: null };
  const p = clamp(t, 0, 1);
  return {
    lat: roundCoord(a.lat + (b.lat - a.lat) * p),
    lon: roundCoord(a.lon + (b.lon - a.lon) * p),
  };
}

function roundCoord(n) {
  return Math.round(n * 10000) / 10000;
}

function pickNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function firstFinite() {
  for (let i = 0; i < arguments.length; i++) {
    const n = pickNumber(arguments[i]);
    if (n != null) return n;
  }
  return null;
}

function pickStatus(raw) {
  const status = String(raw || 'scheduled').toLowerCase();
  const allowed = ['scheduled', 'active', 'landed', 'cancelled', 'incident', 'diverted', 'delayed'];
  return allowed.indexOf(status) === -1 ? 'scheduled' : status;
}

/**
 * Map a stored trip + optional aviationstack row into the public payload.
 */
export function sanitizeTrip(trip, providerRow, nowMs) {
  const airline = String(trip.airline || '').trim().toUpperCase();
  const flightNumber = String(trip.flight_number || '').trim();
  const origin = String((providerRow && providerRow.departure && providerRow.departure.iata) || trip.origin || '')
    .trim()
    .toUpperCase();
  const dest = String((providerRow && providerRow.arrival && providerRow.arrival.iata) || trip.dest || '')
    .trim()
    .toUpperCase();

  const depScheduled =
    (providerRow && providerRow.departure && providerRow.departure.scheduled) ||
    trip.dep_scheduled ||
    null;
  const arrScheduled =
    (providerRow && providerRow.arrival && providerRow.arrival.scheduled) ||
    trip.arr_scheduled ||
    null;
  const depEstimated =
    (providerRow && providerRow.departure && (providerRow.departure.estimated || providerRow.departure.actual)) ||
    depScheduled;
  const arrEstimated =
    (providerRow && providerRow.arrival && (providerRow.arrival.estimated || providerRow.arrival.actual)) ||
    arrScheduled;

  const delayMin = firstFinite(
    providerRow && providerRow.departure && providerRow.departure.delay,
    providerRow && providerRow.arrival && providerRow.arrival.delay,
    trip.delay_min
  );

  const status = pickStatus(
    (providerRow && providerRow.flight_status) || trip.status || 'scheduled'
  );

  const liveLat = pickNumber(providerRow && providerRow.live && providerRow.live.latitude);
  const liveLon = pickNumber(providerRow && providerRow.live && providerRow.live.longitude);

  const depMs = parseTime(depEstimated) || parseTime(depScheduled);
  const arrMs = parseTime(arrEstimated) || parseTime(arrScheduled);
  const progress = timeProgress(depMs, arrMs, nowMs, status);
  const interpolated = interpolateCoords(origin, dest, progress);

  const out = {
    airline,
    flight_number: flightNumber,
    origin,
    dest,
    status,
    delay_min: delayMin,
    dep_scheduled: depScheduled ? iso(parseTime(depScheduled)) || String(depScheduled) : null,
    dep_estimated: depEstimated ? iso(parseTime(depEstimated)) || String(depEstimated) : null,
    arr_scheduled: arrScheduled ? iso(parseTime(arrScheduled)) || String(arrScheduled) : null,
    arr_estimated: arrEstimated ? iso(parseTime(arrEstimated)) || String(arrEstimated) : null,
    lat: liveLat != null ? roundCoord(liveLat) : interpolated.lat,
    lon: liveLon != null ? roundCoord(liveLon) : interpolated.lon,
  };

  if (trip.label) out.label = String(trip.label);

  return out;
}

export function sampleTrips(nowMs) {
  const now = Number.isFinite(nowMs) ? nowMs : Date.now();
  return [
    {
      airline: 'DL',
      flight_number: '241',
      date: iso(now).slice(0, 10),
      origin: 'ATL',
      dest: 'BOS',
      label: 'Sample (mock)',
      dep_scheduled: iso(now - 90 * 60 * 1000),
      arr_scheduled: iso(now + 75 * 60 * 1000),
      status: 'active',
      delay_min: 14,
    },
    {
      airline: 'AA',
      flight_number: '100',
      date: '2019-01-01',
      origin: 'JFK',
      dest: 'LAX',
      label: 'Expired sample (filtered)',
      dep_scheduled: '2019-01-01T12:00:00.000Z',
      arr_scheduled: '2019-01-01T18:00:00.000Z',
    },
  ];
}

export function normalizeStoredTrips(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.trips)) return raw.trips;
  return [];
}

export function selectProviderFlight(data, trip) {
  const rows = data && Array.isArray(data.data) ? data.data : [];
  if (!rows.length) return null;
  const origin = String(trip.origin || '').toUpperCase();
  const dest = String(trip.dest || '').toUpperCase();
  const match = rows.find(function (row) {
    const dep = row && row.departure && String(row.departure.iata || '').toUpperCase();
    const arr = row && row.arrival && String(row.arrival.iata || '').toUpperCase();
    if (origin && dep && dep !== origin) return false;
    if (dest && arr && arr !== dest) return false;
    return true;
  });
  return match || rows[0];
}

export function buildPublicPayload(trips, source, nowMs) {
  return {
    trips: trips,
    source: source,
    fetched_at: iso(nowMs),
  };
}
