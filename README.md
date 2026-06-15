# BizFlow — LaunchFlow SaaS Platform

A multi-tenant SaaS platform giving home improvement businesses (rendering, roofing, landscaping, etc.) a public website, CRM dashboard, customer portal, and AI-powered tools — white-labelled under their own brand.

## Repository layout

```
artifacts/
  api-server/          # Express 5 API server — the backend
  web/                 # React + Vite frontend — the main web app
lib/
  db/                  # Drizzle ORM schema, migrations, seed data
  api-spec/            # OpenAPI spec (source of truth for all API contracts)
  api-client-react/    # Generated React Query hooks from the OpenAPI spec
scripts/               # Utility scripts (migrations, etc.)
```

> `artifacts/mockup-sandbox` is a Replit-internal UI prototyping tool and is **not part of the product**.

## Tech stack

- **Runtime**: Node.js 24, TypeScript 5.9, pnpm workspaces
- **API**: Express 5 on port 8080 (`/api` prefix)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod v4 + drizzle-zod
- **Frontend**: React + Vite + Tailwind CSS + Clerk (auth) + wouter (routing)
- **API codegen**: Orval (OpenAPI → React Query hooks + Zod schemas)

## Key product areas

| URL | What it is |
|-----|------------|
| `/` | LaunchFlow marketing landing page |
| `/site/:tenantSlug` | Tenant public website (white-labelled) |
| `/dashboard` | Tenant admin CRM (leads, quotes, projects) |
| `/portal` | Customer self-service portal |
| `/admin` | LaunchFlow super-admin |

## Running locally

```bash
# Install dependencies
pnpm install

# Push DB schema (dev only — needs DATABASE_URL)
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start web frontend (port from $PORT)
pnpm --filter @workspace/web run dev
```

## Docker deployment

```bash
cp .env.example .env   # fill in required secrets
docker compose up --build
```

Required environment variables: `POSTGRES_PASSWORD`, `CLERK_SECRET_KEY`, `SESSION_SECRET`, `VITE_CLERK_PUBLISHABLE_KEY`.
Optional: `VITE_CLERK_PROXY_URL`, `WEB_PORT` (defaults to 80).

## Seed data

Demo tenant slug: `amo-rendering` (rendering industry, pro plan).  
Demo site: `/site/amo-rendering`
