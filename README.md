# Samuel Lamb's Portfolio Website

My portfolio website showcasing projects, skills, and blog posts. Built with Jekyll and Tailwind CSS.

## Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Toggle between light and dark themes
- **Interactive Skills Section** - Click skills to see related projects
- **Dev Blog** - Jekyll-powered blog for development updates
- **Services hub** - Public HTTPS apps (Cloudflare) listed as cards from `_data/services.yml`
- **Electronics Inventory** - Public read-only inventory view (management stays on a private host)
- **Travel (private)** - Access-gated `/travel` flight status page (not in public nav; mock data until the Worker secret is set)

## Tech Stack

- **Jekyll** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies
- **Static JSON / public HTTPS API** - Read-only inventory data (no private network endpoints in source)

## Quick Start

### Development (Using Tailwind CDN)

1. Clone the repository
2. Install Jekyll: `bundle install`
3. Serve locally: `bundle exec jekyll serve`
4. Open `http://localhost:4000`


## Adding Projects

Projects are easily editable in `js/projects-data.json`:

1. Open `js/projects-data.json`
2. Find or add a skill category
3. Add a project:
   ```json
   {
     "name": "Project Name",
     "description": "Project description"
   }
   ```
4. Save and push - changes appear automatically!

## Adding Services

Public service cards are listed in `_data/services.yml`:

```yaml
- name: App Name
  description: Short description
  url: https://app.samuellamb.dev
  icon: fa-link
```

Only public `https://` hostnames belong here. Do not add Tailscale, LAN, CGNAT (`100.x`), localhost, or `http` URLs. Hub templates skip those.

## Project Structure

- `index.html` - Main landing page
- `_layouts/` - Jekyll layouts
- `_posts/` - Blog posts (Markdown)
- `inventory/` - Electronics inventory system
- `js/` - JavaScript files
- `css/` - Stylesheets
- `js/projects-data.json` - Project data (easily editable)
- `_data/services.yml` - Public service hub cards
- `services.html` - `/services/` hub page
- `travel/` - Private `/travel` UI (`noindex`, not in public nav)
- `workers/travel/` - Cloudflare Worker for `GET /api/travel` (secrets + KV; not published by Jekyll)

## Notes

- The inventory page (`inventory/index.html`) is a public read-only viewer. Do not commit Tailscale, LAN, or other private API URLs; publish a snapshot in `inventory/items.json` or point `API_BASE_URL` at a public HTTPS origin.
- Dark mode preference is saved in localStorage
- All Tailwind customizations are in `css/tailwind.css`
- **Travel ops** (Worker secret, KV trips, Cloudflare Access on `/travel*` and `/api/travel*`): see [`workers/travel/README.md`](workers/travel/README.md). Never commit an aviationstack key.

## Private travel page

`/travel` is partner-gated and must not appear on the homepage or in public navigation. Locally, `jekyll serve` plus opening `/travel/` renders the arc and status chips against in-page sample data when `/api/travel` is absent.
