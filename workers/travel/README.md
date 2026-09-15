# Travel status Worker

Private flight-status API for the Access-gated `/travel` page. The aviationstack key lives **only** as a Cloudflare Worker secret. It must never be committed, pasted into chat, or bundled with GitHub Pages.

## What it serves

`GET /api/travel` returns sanitized **active** trips only:

- `airline`, `flight_number`, optional `label`
- `status`, `delay_min`
- `origin` / `dest` (IATA)
- `dep_scheduled`, `dep_estimated`, `arr_scheduled`, `arr_estimated`
- optional `lat` / `lon` (live position, or time-interpolated airport arc)

It does **not** return the API key, PNR, passenger data, or the raw aviationstack payload.

Active window: scheduled departure **−6 hours** through scheduled arrival **+2 hours**. Store `dep_scheduled` / `arr_scheduled` on each trip so the Worker can skip aviationstack outside that window (free tier is ~100 requests/month). Responses are cached ~3 minutes (`private, max-age=180` plus KV cache of provider lookups).

With **no secret** (or empty KV), the Worker returns **mock/sample** trip data so the UI can be developed.

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
| `airline` | yes | `DL` or `AA` (IATA) |
| `flight_number` | yes | e.g. `241` |
| `date` | yes | `YYYY-MM-DD` (aviationstack `flight_date`) |
| `origin` | yes | IATA |
| `dest` | yes | IATA |
| `label` | no | Display-only |
| `dep_scheduled` | strongly recommended | ISO-8601 UTC, used for the T−6h / T+2h window |
| `arr_scheduled` | strongly recommended | ISO-8601 UTC |

No airline OAuth. Edit KV when plans change.

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

Public nav and the homepage must **not** link here. After Access is on, you can bookmark `https://samuellamb.dev/travel/` privately.

## Local UI without the Worker

`travel/app.js` falls back to in-page sample data if `/api/travel` is missing (plain `jekyll serve`). That is enough to develop the arc + chips. Point the page at a real Worker by serving through Cloudflare or `wrangler dev` plus a local reverse proxy if you need the live path.
