---
name: Coolify Docker Compose Deployment
description: Hard-won lessons deploying a pnpm monorepo to Coolify via Docker Compose from GitHub. Every gotcha that burned hours.
---

# Coolify + Docker Compose + pnpm monorepo — Deployment Rules

**Why:** We lost ~8 hours fighting Coolify's layer cache, Alpine musl, missing tsconfig, port conflicts, and Traefik routing. This file documents exactly what to do next time.

## 1. Base Image — NEVER use Alpine for build stages

**Rule:** Builder stages that run Vite, Rollup, Tailwind, or lightningcss MUST use `node:24-slim` (Debian glibc), never `node:24-alpine` (musl).

**Why:** `pnpm-workspace.yaml` overrides exclude musl native binaries (`@rollup/rollup-linux-x64-musl`, `lightningcss-linux-x64-musl`, `@tailwindcss/oxide-linux-x64-musl`) to keep local installs lean. Alpine needs those musl binaries. Debian slim uses glibc — the binaries already in the lockfile.

```dockerfile
FROM node:24-slim AS builder   # ✓ glibc — works
FROM node:24-alpine AS builder # ✗ musl — build fails
```

Runtime stages: nginx stays Alpine (`nginx:1.27-alpine`). Node.js runtime also uses `node:24-slim`.

## 2. Healthchecks — node, not wget/curl

**Rule:** `node:24-slim` has no `wget` or `curl`. Use Node's built-in `http` module.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/healthz',(r)=>r.statusCode===200?process.exit(0):process.exit(1)).on('error',()=>process.exit(1))"
```

## 3. Copy ALL tsconfig files into the build context

**Rule:** Vite 7 follows the full `extends` chain in tsconfig.json files when transforming TypeScript. Any missing tsconfig causes a fatal `parseExtends` error.

```dockerfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./          # <-- required for Vite
COPY lib/ lib/
COPY artifacts/web/ artifacts/web/
```

**Why it fails:** lib packages have `"extends": "../../tsconfig.base.json"`. Without `tsconfig.base.json` in the Docker build context, Vite silently fails to parse tsconfigs and the build aborts.

## 4. vite.config.ts — never throw for missing PORT/BASE_PATH

**Rule:** Build-time env vars may not be set during Docker builds. Always provide defaults.

```typescript
// ✓ correct
const rawPort = process.env.PORT ?? "3000";
const basePath = process.env.BASE_PATH ?? "/";

// ✗ wrong — throws in Docker build, kills the build
if (!process.env.PORT) throw new Error("PORT is required");
```

## 5. docker-compose.yml — NEVER bind to host port 80/443

**Rule:** Coolify runs Traefik on port 80 and 443. Binding a container to these ports kills the deployment with "port already allocated".

```yaml
# ✗ WRONG
ports:
  - "80:80"

# ✓ CORRECT — expose internal port, use Traefik labels
expose:
  - "80"
networks:
  - internal
  - coolify          # Coolify's Traefik network
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.myapp.rule=Host(`${COOLIFY_FQDN:-localhost}`)"
  - "traefik.http.routers.myapp.entrypoints=https"
  - "traefik.http.routers.myapp.tls=true"
  - "traefik.http.routers.myapp.tls.certresolver=letsencrypt"
  - "traefik.http.services.myapp.loadbalancer.server.port=80"
  - "traefik.docker.network=coolify"
```

```yaml
networks:
  internal:
    driver: bridge
  coolify:
    external: true   # Coolify creates this network on install
```

## 6. pnpm lockfile must match the target platform

**Rule:** Run `pnpm install` locally before pushing when changing `pnpm-workspace.yaml` overrides. The lockfile encodes platform-specific optional package choices.

If overrides change, regenerate: `pnpm install` → commit both `pnpm-workspace.yaml` and `pnpm-lock.yaml`.

## 7. Coolify layer cache — how to bust it

Coolify adds its own ARG declarations and can hit Docker layer cache from previous builds. To force a full rebuild:
- **First try:** Change a cache-busting comment in the Dockerfile (e.g. `# cache-bust: 2026-06-06-v2`)
- **Nuclear:** In Coolify UI → Advanced → tick "No Cache" on next deploy

## 8. Coolify does NOT capture full Docker BuildKit output by default

The Coolify log download shows Coolify-level events but often drops the actual Docker build stdout. If you see a one-line "build failed" with no detail:
- The real error is inside the Docker build output
- Test locally: `NODE_ENV=production pnpm --filter @workspace/web run build`
- Simulate Docker exactly: copy only the files the Dockerfile copies into a temp dir and run the build there

## 9. GitHub push from Replit — git commit is blocked

The main Replit agent cannot run `git commit` (platform restriction). Use the GitHub Contents API via Python:

```python
import base64, json, urllib.request, os

token = os.environ["GITHUB_ACCESS_TOKEN"]
# GET the file's sha, then PUT with new content + sha
```

Or ask the agent to push via curl with `$GITHUB_ACCESS_TOKEN`.

## 10. Required Coolify environment variables for this app

Set these in Coolify → Environment Variables before deploying:

| Variable | Required | Notes |
|---|---|---|
| `POSTGRES_PASSWORD` | ✓ | Any strong password |
| `SESSION_SECRET` | ✓ | Any long random string |
| `CLERK_SECRET_KEY` | ✓ | From Clerk dashboard (sk_live_...) |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✓ | From Clerk dashboard (pk_live_...) |
| `VITE_CLERK_PROXY_URL` | optional | Leave blank unless using Clerk proxy |

## 11. Full pre-deploy checklist

Before deploying ANY pnpm monorepo to Coolify with Docker Compose:

- [ ] Builder stage: `node:24-slim` not alpine
- [ ] Runtime Node stage: `node:24-slim` not alpine  
- [ ] Healthcheck: uses `node -e ...` not `wget`/`curl`
- [ ] Web Dockerfile copies: `tsconfig.base.json tsconfig.json`
- [ ] `vite.config.ts`: PORT and BASE_PATH have `?? "default"` fallbacks
- [ ] `docker-compose.yml`: no `ports: - "80:80"` on web service
- [ ] `docker-compose.yml`: web service has `coolify` network + Traefik labels
- [ ] `docker-compose.yml`: `networks.coolify.external: true`
- [ ] Coolify env vars: all 4 required vars set
- [ ] `pnpm-lock.yaml` is up to date (run `pnpm install` after any workspace.yaml changes)
- [ ] Local build test: `NODE_ENV=production pnpm --filter @workspace/web run build`
