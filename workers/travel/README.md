# Travel status Worker

Private flight-status API for the Access-gated `/travel` page. The aviationstack key lives **only** as a Cloudflare Worker secret. It must never be committed, pasted into chat, or bundled with GitHub Pages.

## What it serves

`GET /api/travel` returns sanitized trips in two lists:

- `trips` — **live** window only (departure −6h through arrival +2h). These are the only rows that call aviationstack.
- `upcoming` — saved trips before that window. Stored fields only; no provider lookup.

Each card may include:

- `id`, `airline`, `flight_number`, optional `label`, `date`
- `status`, `delay_min`
- `origin` / `dest` (IATA, if known)
- `dep_scheduled`, `dep_estimated`, `arr_scheduled`, `arr_estimated`
- optional `lat` / `lon` on live trips

It does **not** return the API key, PNR, passenger data, or the raw aviationstack payload.

Add a trip from the Access-gated page:

```
POST /api/travel/trips
{ "flight": "DL241", "date": "2026-10-03", "origin": "ATL", "dest": "BOS", "label": "Home" }
```

`origin`, `dest`, and `label` are optional. The Worker stores what you typed and waits until the live window to query aviationstack.

```
DELETE /api/travel/trips/:id
```

With **no KV binding**, GET still returns mock/sample data so the UI can be developed. POST/DELETE require the `TRIPS` KV namespace.

Responses for GET are cached ~3 minutes (`private, max-age=180` plus KV cache of provider lookups). Mutations are `no-store`.

## Deploy

From `workers/travel/`:

```bash
npx wrangler login
npx wrangler kv namespace create TRIPS
# paste the id into wrangler.toml under [[kv_namespaces]]
npx wrangler deploy
```

Add a route on the `samuellamb.dev` zone:

- `samuellamb.dev/api/travel*`

GitHub Pages continues to serve the static site. Cloudflare in front of the zone should send `/api/travel*` to this Worker and leave the rest of the site (including `/travel`) on Pages.

### Secret (Samuel only, after merge)

```bash
npx wrangler secret put AVIATIONSTACK_ACCESS_KEY
```

Paste the key at the prompt. Do not put it in this repo, `.env` committed files, Pages HTML/JS, or pull request text.

Local mock (no key):

```bash
npx wrangler dev
# GET http://127.0.0.1:8787/api/travel
```

Optional local secret file (gitignored by Wrangler convention; do not commit): `.dev.vars`

```
AVIATIONSTACK_ACCESS_KEY=
```

Leave it empty for mock mode.

## Manual trip store (KV)

Trips are **not** public YAML on the Pages site. Put JSON in KV key `trips`:

```bash
npx wrangler kv key put --binding=TRIPS trips --path=trips.example.json
```

Fields per trip:

| Field | Required | Notes |
| --- | --- | --- |
| `airline` / `flight_number` or `flight` | yes | `DL` + `241`, or `DL241` |
| `date` | yes | `YYYY-MM-DD` (aviationstack `flight_date` once live) |
| `origin` | no | IATA; helps disambiguate the same flight number |
| `dest` | no | IATA |
| `label` | no | Display-only |
| `dep_scheduled` | optional | ISO-8601 UTC; tightens the live window if you have it |
| `arr_scheduled` | optional | ISO-8601 UTC |

Prefer the `/travel` form over hand-editing KV. The form writes the same `trips` key.

## Cloudflare Access (partner-gated)

Protect the page **and** the API so itineraries are not public. In Zero Trust → Access → Applications, add a **self-hosted** app (or two) for this hostname:

**Paths to include**

- `/travel`
- `/travel*`
- `/api/travel`
- `/api/travel*`

**Policy**

- Action: Allow
- Include: emails for Samuel and the travel partner only
- Do not put those addresses in this repository if you do not want them public; configure them in the Access dashboard
- Identity: whatever you already use (OTP, Google, GitHub, etc.). This repo does not invent or store Access credentials.

The Services hub may link here. Access still blocks anyone who is not on the allow-list; they see the Cloudflare login, not itineraries. After Access is on, `https://samuellamb.dev/travel/` is the bookmark.

## Local UI without the Worker

`travel/app.js` falls back to in-page sample live + upcoming cards if `/api/travel` is missing (plain `jekyll serve`). Adding or removing trips needs `wrangler dev` (or the deployed Worker) with KV.
