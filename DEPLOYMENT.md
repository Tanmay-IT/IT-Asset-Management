# Deploying to the internet (free tier)

This deploys the backend + database on Render and the frontend on Vercel, so
the app is reachable at a real URL — not just on this machine. Both steps
need your own free accounts; I can't sign up on your behalf.

## 1. Backend — Render

1. Go to [render.com](https://render.com) and sign up/log in with GitHub.
2. **New +** → **Web Service** → connect the `IT-Asset-Management` repo.
   Render should detect `render.yaml` at the repo root and offer a
   Blueprint deploy. If it doesn't, configure manually:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
3. Add environment variables (Render's dashboard, not committed to git):
   - `MONGODB_URI` — your MongoDB Atlas connection string (the
     `mongodb+srv://...` form; Render's network isn't firewalled the way
     this dev machine's is, so the standard string should work fine here).
   - `CLIENT_ORIGIN` — leave blank for now, you'll set this in step 3 below.
   - `JWT_SECRET` — if using the Blueprint (`render.yaml`), this is
     auto-generated for you (`generateValue: true`); no action needed.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the login for the one admin account.
     Choose real values — this becomes your actual sign-in for the live app.
4. Deploy. Once live, copy the backend's URL
   (something like `https://itam-air-engine-backend.onrender.com`).

The backend seeds the HDD Archive and Toner historical data into Atlas, and
creates the admin account from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, automatically
the first time it boots against an empty database — no manual step needed
for either. To change the admin login later, run
`node scripts/resetAdmin.mjs` against that same `MONGODB_URI` (locally, with
`.env` pointed at Atlas), update `ADMIN_EMAIL`/`ADMIN_PASSWORD` in Render's
dashboard, then redeploy — the next boot re-creates the account with the new
values.

## 2. Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in with GitHub.
2. **Add New** → **Project** → import the same repo.
3. Set **Root Directory** to `frontend` (Vercel should auto-detect the Vite
   framework once you do).
4. Add environment variable:
   - `VITE_API_URL` — the Render backend URL from step 1.4.
5. Deploy. Copy the resulting frontend URL
   (something like `https://it-asset-management.vercel.app`).

## 3. Connect them

Go back to Render → your backend service → Environment → set `CLIENT_ORIGIN`
to the Vercel URL from step 2.5 → save (this redeploys the backend).

## 4. Verify

Open the Vercel URL. You should see the app with the HDD Archive and Toner
data already populated. Adding/editing anything writes to Atlas, so it
persists and is visible to anyone else who opens the same URL — including
your manager.

## Ongoing updates

Both Render and Vercel auto-deploy on every push to `main`. Once this
repo is pushed to, both redeploy automatically within a minute or two —
no manual redeploy step needed for day-to-day changes.
