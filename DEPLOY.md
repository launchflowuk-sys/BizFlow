# Deploying LaunchFlow to Coolify

Self-hosted deployment: GitHub → Coolify → your server.  
One `git push` to `main` triggers a full build and zero-downtime redeploy.

---

## Architecture overview

```
Internet → Coolify (Traefik) → web container (nginx :80)
                                  ├── /            → serves Vite static bundle
                                  └── /api/        → proxies to api:8080
                                       └── /api/__clerk → Clerk proxy middleware

                              api container (Express :8080)  [internal only]
                                  └── runs drizzle migrations on startup

                              db container (PostgreSQL :5432) [internal only]
```

All three services run as one **Docker Compose stack** in Coolify.  
They share an internal Docker network so `api` resolves inside `web`'s nginx proxy.

---

## Prerequisites

- A Coolify instance on your server — [coolify.io](https://coolify.io)
- Your domain pointed at the server IP (e.g. `bizflow.yourcompany.com`)
- Clerk production keys from the Replit **Auth pane**

---

## Step 1 — Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Create the Docker Compose resource in Coolify

1. In Coolify → **New Resource → Docker Compose**
2. Connect your GitHub repository
3. Set **Docker Compose location**: `docker-compose.yml`
4. Set the domain for the **web** service: `bizflow.yourcompany.com`  
   *(Coolify adds Traefik labels automatically — SSL via Let's Encrypt is free)*

---

## Step 3 — Set environment variables

In Coolify, open the resource → **Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `POSTGRES_PASSWORD` | *(strong random password)* | `openssl rand -hex 32` |
| `CLERK_SECRET_KEY` | `sk_live_...` | From Replit Auth pane |
| `SESSION_SECRET` | *(64-char hex string)* | `openssl rand -hex 64` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | From Replit Auth pane — **build arg** |
| `VITE_CLERK_PROXY_URL` | `https://bizflow.yourcompany.com/api/__clerk` | **build arg** |

> **Build args vs runtime vars**: `VITE_*` variables are baked into the
> JavaScript bundle at Vite build time, not at runtime. In Coolify, mark them
> as **Build Variables** so they're passed as Docker build arguments.
> All other vars are runtime environment variables.

`DATABASE_URL` is automatically constructed from `POSTGRES_PASSWORD` inside
`docker-compose.yml` — you do not need to set it separately.

---

## Step 4 — Deploy

Click **Deploy**. Coolify will:

1. Clone the repo and run `docker build` for both services
2. Start PostgreSQL, wait for it to be healthy
3. Start the API container — it runs `drizzle-kit push` (migrations) then boots Express
4. Start the web container — nginx serves the static Vite bundle

Watch the build logs. First deploy takes ~3–5 minutes (pnpm install + build).
Subsequent deploys are faster due to Docker layer caching.

---

## Step 5 — Verify

```bash
# API health check
curl https://bizflow.yourcompany.com/api/healthz
# → {"status":"ok"}

# Open the app
open https://bizflow.yourcompany.com
```

The API container logs should show:
```
==> Running database migrations...
==> Migrations complete.
==> Starting API server on port 8080...
```

---

## Step 6 — Promote your account to super admin

Sign up at `https://bizflow.yourcompany.com/sign-up`, then in Coolify open
the **db** service → **Terminal** and run:

```sql
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';
```

Sign out and back in — you'll land on `/admin` automatically.

---

## Auto-deploy on push

In Coolify, enable **Auto Deploy on Push** for the resource.  
Every push to `main` triggers a rebuild and zero-downtime swap.

```
git push origin main  →  Coolify webhook  →  docker build  →  live ✅
```

---

## Running migrations manually

Use `scripts/migrate.sh` for one-off migration runs (e.g. after a schema change
you want to apply without a full redeploy):

```bash
# From inside the running api container
docker compose exec api ./scripts/migrate.sh

# Or as a one-off container
docker compose run --rm \
  -e DATABASE_URL=postgres://launchflow:PASSWORD@db:5432/launchflow \
  api ./scripts/migrate.sh
```

---

## Custom domains for client tenants

When a client wants their site at `www.theircompany.co.uk`:

1. Client adds a CNAME at their registrar:
   ```
   Type:  CNAME
   Name:  www
   Value: bizflow.yourcompany.com
   ```
2. In Coolify on the **web** service, add `www.theircompany.co.uk` as an
   additional domain — Let's Encrypt SSL provisions automatically
3. In the LaunchFlow admin panel (`/admin`), set that domain on the tenant record

---

## Deploying API and web as separate Coolify resources (alternative)

If you prefer to deploy the API server and web frontend as two independent
Coolify app resources rather than a single Compose stack:

1. Deploy `artifacts/api-server/Dockerfile` as its own resource at
   `api.bizflow.yourcompany.com`
2. Deploy `artifacts/web/Dockerfile` as its own resource at
   `bizflow.yourcompany.com`
3. On the **web** resource, set the runtime environment variable:
   ```
   API_UPSTREAM=api.bizflow.yourcompany.com:443
   ```
   This overrides the default `api:8080` used for docker-compose and tells
   nginx which upstream to proxy `/api/` (including `/api/__clerk` for Clerk) to.
4. Update the nginx proxy_pass for HTTPS upstream — you'll need to add
   `proxy_ssl_server_name on;` in `artifacts/web/nginx.conf` for TLS upstream.

> The single Compose stack (above) is simpler and recommended.

---

## ARM64 servers (AWS Graviton, Hetzner ARM)

`pnpm-workspace.yaml` excludes non-linux-x64 esbuild binaries to keep the
Replit environment lean. If your Coolify server is ARM64, remove these two
lines from `pnpm-workspace.yaml` before pushing:

```yaml
# Remove these two lines:
"esbuild>@esbuild/linux-arm": "-"
"esbuild>@esbuild/linux-arm64": "-"
```

---

## Troubleshooting

**Build fails: `PORT environment variable is required`**  
→ `VITE_CLERK_PUBLISHABLE_KEY` and `PORT=3000` must be set as **build args**,
not runtime env vars. In Coolify, mark `VITE_*` variables as Build Variables.

**API returns 502 from the web nginx**  
→ The web container's nginx proxies to `${API_UPSTREAM}` (default `api:8080`).
In a Compose stack, `api` resolves on the internal Docker network. If using
separate resources, set `API_UPSTREAM` to the API service's internal hostname.

**API container crashes on startup**  
→ Check logs for `DATABASE_URL` errors. Verify the db service is healthy
(`pg_isready`) and the connection string uses the internal hostname `db`.

**Clerk sign-in loop / "Missing publishable key"**  
→ `VITE_CLERK_PUBLISHABLE_KEY` was not passed as a build arg at Vite build
time. Re-deploy the web service with the correct build variable and trigger
a fresh build (clear the build cache in Coolify if needed).

**Migrations fail on first boot**  
→ Re-deploy the API service. The migration runs every startup and is
idempotent — a second run will apply any missed changes cleanly.
