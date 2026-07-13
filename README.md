# The Seafood House — Website

Landing page for The Seafood House (751 Azalea Rd, Mobile, AL) — menu, hours, ordering info, and a live "Today's Catch" market board that staff can update from a phone or computer.

## What's in here

- `index.html`, `css/styles.css`, `js/script.js` — the public site.
- `admin.html`, `css/admin.css`, `js/admin.js` — staff-only page to mark market items Available/Unavailable.
- `js/catch-data.js` — shared list of "Today's Catch" items, used by both the public page and the admin page.
- `server.js` — small Node server with no external dependencies. Serves the site *and* a JSON API for the catch board.
- `render.yaml` — deployment config for Render.com.
- `data/catch.json` (created automatically, not in git) — stores current availability + last-updated time.

## Running it locally

Requires [Node.js](https://nodejs.org) 18+, nothing else to install.

```
node server.js
```

Then open `http://localhost:8733` (or whatever port it prints). The admin token will be printed in the terminal on startup.

## Admin panel

Go to `/admin.html`, enter the admin token, and toggle items. Changes save to the server immediately and show up for every visitor.

- Default admin token: `TheSeafoodHouse1`
- To change it, set the `ADMIN_TOKEN` environment variable before starting the server — whatever you set it to overrides the default.
- This page isn't linked from the public site and isn't search-indexed, but it also isn't password-protected beyond the token, so don't share the `/admin.html` URL publicly.

## Deploying (Render.com)

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, connect this repo. Render reads `render.yaml` automatically.
3. When prompted for `ADMIN_TOKEN`, enter the value you want (e.g. `TheSeafoodHouse1`, or something stronger for production).
4. Deploy. Render gives you a live URL like `the-seafood-house.onrender.com` — that works immediately, no custom domain required.
5. `render.yaml` provisions a small persistent disk mounted at `/var/data` so the catch-board data survives restarts and redeploys.

### Custom domain (optional)

Not required — the free Render subdomain works fine. If you buy a domain later (Namecheap, Cloudflare, etc.), Render's dashboard has a "Custom Domain" tab that shows you exactly which DNS record to add at your registrar.

## Editing the menu or catch list

- Menu items/prices live directly in `index.html` inside the `.menu-panel` sections.
- The "Today's Catch" item list (names, not availability) lives in `js/catch-data.js` — add or remove entries there and they'll appear on both the public board and the admin page.
