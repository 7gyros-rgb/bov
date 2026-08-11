# Twitch Scoreboard

Keeps your exact hand-drawn Excalidraw look (same wobbly card shapes, same
W/D/L badges, same colours, Lilita One font) but makes it fully editable
from one admin panel — with an overlay that updates on its own for OBS.

- **`/admin`** — edit team names, colours, players (up to 6), and add
  W/D/L results. Autosaves as you type.
- **`/overlay`** — all teams, transparent background, one OBS Browser Source.
- **`/overlay/<team-id>`** — a single team's card (e.g. `/overlay/beano`),
  transparent, if you'd rather add each team as its own Browser Source.
  Team ids are whatever you see in the URL bar when you open a team in
  `/admin` — by default: `beano`, `chazza`, `ginge`, `jakey`, `tays`.

The overlay checks for changes once a second, so anything you do in
`/admin` shows up on stream within about a second — no refresh needed.

## 1. Run it locally (optional, no setup needed)

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin`. Since no database is connected yet,
it'll use an in-memory password of `changeme` — set your own by creating
a `.env.local` file (copy `.env.example`) with:

```
ADMIN_PASSWORD=yourpassword
```

Local dev works without any database — it just stores things in memory
while the server is running, which resets if you restart it. That's fine
for testing, but for the real stream you want step 3 below.

## 2. Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import that repo.
3. Before the first deploy (or right after, in Settings → Environment
   Variables), add:
   - `ADMIN_PASSWORD` = whatever password you want to type into `/admin`.
4. Deploy.

## 3. Connect storage (so admin edits actually stick)

Without this step, the site *works*, but each serverless request can land
on a different instance, so edits you make in `/admin` might not
reliably show up in the overlay. This takes about a minute:

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database** → choose **Upstash** → **Redis** (it's on the
   free tier — plenty for this).
3. Connect it to your project. Vercel automatically adds the right
   environment variables for you — you don't need to copy/paste anything.
4. Redeploy (Vercel usually prompts you to, or just push a small commit).

Once connected, the "no database connected" banner in `/admin` will
disappear, and everything syncs properly.

## 4. Add it to OBS

- **Add Source → Browser**
- URL: `https://your-project.vercel.app/overlay` (all teams) or
  `https://your-project.vercel.app/overlay/beano` (one team)
- Width/height: whatever fits your layout — the card scales cleanly.
- Leave "Shutdown source when not visible" **unchecked** if you want it
  to keep polling in the background.

## Editing the art itself

All the hand-drawn path data lives in `lib/shapes.js` — it was extracted
directly from your Excalidraw SVG exports, so the "not perfectly
straight" wobble is the real thing, not a redraw. If you want to change
the card shape or badge shape later, re-export from Excalidraw and swap
the `d` values in there.

Team colours are in `lib/defaultState.js` under `COLOR_SWATCHES` — add
more hex codes there if you want extra options to show up in `/admin`.
