# Samaj Directory

A small community directory app — search, add, edit, and delete entries (name, address,
phone number).

## Structure

- [server/](server/) — Express API, backed by SQLite via libSQL (`server/data/samaj.db`
  locally, [Turso](https://turso.tech) in production)
- [client/](client/) — React + Vite front end
- [legacy/](legacy/) — the original `Samaj.xlsx` and source PDF, kept as a backup; no
  longer read by the running app

## Setup (first time)

```bash
npm run install:all   # installs deps for both server/ and client/
npm run migrate        # one-time: imports legacy/Samaj.xlsx into SQLite
```

## Run

```bash
npm run dev
```

Starts the API on http://localhost:5000 and the client on http://localhost:3000 (which
proxies `/api/*` requests to the API — see `client/vite.config.js`).

To run them separately instead:

```bash
npm run dev --prefix server   # http://localhost:5000
npm run dev --prefix client   # http://localhost:3000
```

## API

| Method | Path              | Description                          |
|--------|-------------------|---------------------------------------|
| GET    | /api/people?q=&page=&limit= | List / search people (paginated) |
| POST   | /api/people       | Add a person                         |
| PUT    | /api/people/:id   | Update a person                      |
| DELETE | /api/people/:id   | Delete a person                      |

## Deploying (database on Turso, backend on Render, frontend on Vercel)

The database lives on Turso (free, hosted, SQLite-compatible) specifically so the backend
doesn't need a persistent disk — that unlocks a genuinely free host for it instead of a
paid plan.

### 1. Database → Turso

1. Sign up at [turso.tech](https://turso.tech) and create a database from the dashboard.
2. From the database page, copy its **URL** (`libsql://<db-name>-<org>.turso.io`) and
   create/copy an **auth token**.
3. Run the migration against it once, from `server/`:
   ```bash
   TURSO_DATABASE_URL=libsql://your-db-your-org.turso.io TURSO_AUTH_TOKEN=your-token npm run migrate
   ```
   (On Windows PowerShell: `$env:TURSO_DATABASE_URL="..."; $env:TURSO_AUTH_TOKEN="..."; npm run migrate`)

### 2. Backend → Render

1. New Render **Web Service** → connect this GitHub repo.
2. Set **Root Directory** to `server`, build command `npm install`, start command
   `npm start`.
3. Add environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (same values as
   above).
4. Deploy. No disk needed — Render's free tier is enough since all data lives in Turso.
5. Copy the service's public URL (e.g. `https://your-app.onrender.com`) for the frontend.
6. Optional but recommended: once you know your Vercel URL (step below), set
   `CORS_ORIGIN=https://your-app.vercel.app` here so the API only accepts requests from
   your deployed frontend.

### 3. Frontend → Vercel

1. New Vercel project → import this repo.
2. Set **Root Directory** to `client` (Vercel auto-detects the Vite framework preset).
3. Add an environment variable: `VITE_API_BASE_URL=https://your-app.onrender.com` (the
   Render URL from step 2.5, no trailing slash).
4. Deploy.

After both are live, go back to Render and set `CORS_ORIGIN` to the Vercel URL (step 2.6)
if you skipped it earlier, then redeploy the backend.
