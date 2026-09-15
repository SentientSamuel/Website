(function () {
  'use strict';

  const POLL_MS = 4 * 60 * 1000;
  const API_PATH = '/api/travel';

  const root = document.getElementById('travelRoot');
  const meta = document.getElementById('travelMeta');
  let pollTimer = null;

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function parseTime(value) {
    if (!value) return null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function formatClock(value) {
    const ms = parseTime(value);
    if (!ms) return '—';
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(ms));
  }

  function formatEta(trip, now) {
    const arr = parseTime(trip.arr_estimated) || parseTime(trip.arr_scheduled);
    if (!arr) return 'ETA unknown';
    if (trip.status === 'landed') return 'Arrived';
    const delta = arr - now;
    if (delta <= 0) return 'Arriving now';
    const mins = Math.round(delta / 60000);
    if (mins < 60) return 'ETA ' + mins + ' min';
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return 'ETA ' + hours + 'h ' + rem + 'm';
  }

  function progressFor(trip, now) {
    if (trip.status === 'landed') return 1;
    if (trip.status === 'cancelled') return 0;
    const dep = parseTime(trip.dep_estimated) || parseTime(trip.dep_scheduled);
    const arr = parseTime(trip.arr_estimated) || parseTime(trip.arr_scheduled);
    if (!dep || !arr || arr <= dep) return 0;
    return clamp((now - dep) / (arr - dep), 0, 1);
  }

  function samplePayload() {
    const now = Date.now();
    return {
      source: 'mock',
      fetched_at: new Date(now).toISOString(),
      trips: [
        {
          airline: 'DL',
          flight_number: '241',
          label: 'Sample (local mock)',
          status: 'active',
          delay_min: 14,
          origin: 'ATL',
          dest: 'BOS',
          dep_scheduled: new Date(now - 90 * 60 * 1000).toISOString(),
          dep_estimated: new Date(now - 76 * 60 * 1000).toISOString(),
          arr_scheduled: new Date(now + 75 * 60 * 1000).toISOString(),
          arr_estimated: new Date(now + 89 * 60 * 1000).toISOString(),
          lat: 38.0,
          lon: -77.7,
        },
      ],
    };
  }

  function delayChip(trip) {
    if (trip.delay_min == null || trip.delay_min === '') return '';
    const mins = Number(trip.delay_min);
    if (!Number.isFinite(mins) || mins <= 0) {
      return '<span class="travel-chip chip-delay">On time</span>';
    }
    return '<span class="travel-chip chip-delay">+' + escapeHtml(String(mins)) + ' min</span>';
  }

  function cardHtml(trip, now) {
    const t = progressFor(trip, now);
    const flight = escapeHtml((trip.airline || '') + ' ' + (trip.flight_number || ''));
    const origin = escapeHtml(trip.origin || '—');
    const dest = escapeHtml(trip.dest || '—');
    const status = escapeHtml(trip.status || 'scheduled');
    const label = trip.label ? '<span class="travel-label">' + escapeHtml(trip.label) + '</span>' : '';
    const pathId = 'route-' + flight.replace(/\s+/g, '').toLowerCase() + '-' + origin + dest;

    return (
      '<article class="travel-card">' +
        '<div class="travel-card-head">' +
          '<div class="travel-flight">' + flight + '</div>' +
          label +
        '</div>' +
        '<div class="travel-chips">' +
          '<span class="travel-chip chip-status-' + escapeHtml(trip.status || 'scheduled') + '">' + status + '</span>' +
          delayChip(trip) +
          '<span class="travel-chip chip-eta">' + escapeHtml(formatEta(trip, now)) + '</span>' +
          '<span class="travel-chip chip-route">' + origin + ' → ' + dest + '</span>' +
        '</div>' +
        '<div class="travel-arc-wrap">' +
          '<svg class="travel-arc" viewBox="0 0 640 260" role="img" aria-label="' + origin + ' to ' + dest + '">' +
            '<path id="' + pathId + '" class="travel-arc-bg" d="M 72 188 Q 320 36 568 188" />' +
            '<path class="travel-arc-progress" d="M 72 188 Q 320 36 568 188" pathLength="100" stroke-dasharray="' + (t * 100) + ' 100" />' +
            '<circle class="travel-airport-dot" cx="72" cy="188" r="7" />' +
            '<circle class="travel-airport-dot" cx="568" cy="188" r="7" />' +
            '<text class="travel-airport-label" x="72" y="224" text-anchor="middle">' + origin + '</text>' +
            '<text class="travel-airport-label" x="568" y="224" text-anchor="middle">' + dest + '</text>' +
            '<g class="js-plane" data-progress="' + t + '" data-path="' + pathId + '">' +
              '<path class="travel-plane" d="M-14 0 L12 -6 L8 0 L12 6 Z M-2 -7 L4 -16 L6 -7 M-2 7 L4 16 L6 7" />' +
            '</g>' +
          '</svg>' +
        '</div>' +
        '<div class="travel-times">' +
          '<div>Departed / scheduled<strong>' + escapeHtml(formatClock(trip.dep_estimated || trip.dep_scheduled)) + '</strong></div>' +
          '<div>Arrive / estimated<strong>' + escapeHtml(formatClock(trip.arr_estimated || trip.arr_scheduled)) + '</strong></div>' +
        '</div>' +
      '</article>'
    );
  }

  function placePlanes(container) {
    container.querySelectorAll('.js-plane').forEach(function (g) {
      const svg = g.closest('svg');
      const path = svg && svg.querySelector('#' + CSS.escape(g.getAttribute('data-path')));
      if (!path || !path.getTotalLength) return;
      const t = clamp(Number(g.getAttribute('data-progress')) || 0, 0, 1);
      const len = path.getTotalLength();
      const p = path.getPointAtLength(len * t);
      const q = path.getPointAtLength(Math.min(len, len * t + 2));
      const angle = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + angle + ')');
    });
  }

  function render(payload, note) {
    const now = Date.now();
    const trips = payload && Array.isArray(payload.trips) ? payload.trips : [];
    if (meta) {
      const source = payload && payload.source ? payload.source : 'unknown';
      const fetched = payload && payload.fetched_at ? formatClock(payload.fetched_at) : '';
      meta.textContent = (note || ('Source: ' + source)) + (fetched ? ' · ' + fetched : '');
    }

    if (!root) return;

    if (!trips.length) {
      root.innerHTML =
        '<div class="travel-empty">' +
          '<i class="fas fa-plane-slash"></i>' +
          '<div>No active trips in the T−6h to T+2h window.</div>' +
        '</div>';
      stopPolling();
      return;
    }

    root.innerHTML = trips.map(function (trip) {
      return cardHtml(trip, now);
    }).join('');
    placePlanes(root);
    startPolling();
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = window.setInterval(loadStatus, POLL_MS);
  }

  function stopPolling() {
    if (!pollTimer) return;
    window.clearInterval(pollTimer);
    pollTimer = null;
  }

  function loadStatus() {
    return fetch(API_PATH, { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('api ' + res.status);
        return res.json();
      })
      .then(function (data) {
        render(data);
      })
      .catch(function () {
        const sample = samplePayload();
        render(sample, 'Sample data (Worker unreachable — mock mode)');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStatus);
  } else {
    loadStatus();
  }
})();
