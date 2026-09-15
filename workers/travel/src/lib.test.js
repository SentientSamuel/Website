import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTripActive,
  normalizeStoredTrips,
  sampleTrips,
  sanitizeTrip,
  selectProviderFlight,
  timeProgress,
} from './lib.js';

describe('active window', () => {
  const now = Date.parse('2026-09-15T18:00:00.000Z');

  it('includes trips from T-6h through T+2h', () => {
    const trip = {
      dep_scheduled: '2026-09-15T20:00:00.000Z',
      arr_scheduled: '2026-09-16T00:00:00.000Z',
    };
    assert.equal(isTripActive(trip, now), true);
    assert.equal(isTripActive(trip, Date.parse('2026-09-15T13:59:00.000Z')), false);
    assert.equal(isTripActive(trip, Date.parse('2026-09-16T02:00:00.000Z')), true);
    assert.equal(isTripActive(trip, Date.parse('2026-09-16T02:01:00.000Z')), false);
  });
});

describe('sanitizeTrip', () => {
  it('drops provider extras, PNR, and key-like fields', () => {
    const trip = {
      airline: 'dl',
      flight_number: '241',
      origin: 'ATL',
      dest: 'BOS',
      label: 'Home',
      pnr: 'SECRET',
      access_key: 'should-not-leak',
    };
    const provider = {
      flight_status: 'active',
      departure: {
        iata: 'ATL',
        delay: 12,
        scheduled: '2026-09-15T16:00:00+00:00',
        estimated: '2026-09-15T16:12:00+00:00',
      },
      arrival: {
        iata: 'BOS',
        scheduled: '2026-09-15T18:30:00+00:00',
        estimated: '2026-09-15T18:42:00+00:00',
      },
      live: { latitude: 38.12, longitude: -79.55, altitude: 35000 },
      passenger: { pnr: 'ABC123' },
      access_key: 'nope',
    };

    const out = sanitizeTrip(trip, provider, Date.parse('2026-09-15T17:00:00.000Z'));
    assert.equal(out.airline, 'DL');
    assert.equal(out.flight_number, '241');
    assert.equal(out.status, 'active');
    assert.equal(out.delay_min, 12);
    assert.equal(out.origin, 'ATL');
    assert.equal(out.dest, 'BOS');
    assert.equal(out.label, 'Home');
    assert.equal(out.lat, 38.12);
    assert.equal(out.lon, -79.55);
    assert.equal('pnr' in out, false);
    assert.equal('access_key' in out, false);
    assert.equal('passenger' in out, false);
    assert.equal('live' in out, false);
    assert.deepEqual(Object.keys(out).sort(), [
      'airline',
      'arr_estimated',
      'arr_scheduled',
      'delay_min',
      'dep_estimated',
      'dep_scheduled',
      'dest',
      'flight_number',
      'label',
      'lat',
      'lon',
      'origin',
      'status',
    ]);
  });
});

describe('sample trips', () => {
  it('keeps the mock Delta trip inside the active window', () => {
    const now = Date.parse('2026-09-15T18:00:00.000Z');
    const trips = sampleTrips(now);
    const live = trips.filter((t) => isTripActive(t, now));
    assert.equal(live.length, 1);
    assert.equal(live[0].airline, 'DL');
  });
});

describe('time progress', () => {
  it('is 0.5 halfway between dep and arr', () => {
    const dep = Date.parse('2026-09-15T16:00:00.000Z');
    const arr = Date.parse('2026-09-15T18:00:00.000Z');
    const mid = Date.parse('2026-09-15T17:00:00.000Z');
    assert.equal(timeProgress(dep, arr, mid, 'active'), 0.5);
    assert.equal(timeProgress(dep, arr, mid, 'landed'), 1);
  });
});

describe('provider pick + store shape', () => {
  it('prefers matching origin/dest rows', () => {
    const picked = selectProviderFlight(
      {
        data: [
          { departure: { iata: 'JFK' }, arrival: { iata: 'LAX' } },
          { departure: { iata: 'ATL' }, arrival: { iata: 'BOS' } },
        ],
      },
      { origin: 'ATL', dest: 'BOS' }
    );
    assert.equal(picked.departure.iata, 'ATL');
  });

  it('accepts a raw array or {trips: []}', () => {
    assert.equal(normalizeStoredTrips([{ airline: 'AA' }]).length, 1);
    assert.equal(normalizeStoredTrips({ trips: [{ airline: 'DL' }] }).length, 1);
    assert.deepEqual(normalizeStoredTrips(null), []);
  });
});
