# =============================================================================
# Stage 1: Builder
# Full monorepo install + esbuild bundle
# =============================================================================
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# Copy workspace manifests first — maximises layer cache reuse
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy all source packages that the API server depends on
COPY lib/ lib/
COPY artifacts/api-server/ artifacts/api-server/
COPY scripts/ scripts/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build composite TypeScript libs (generates .d.ts declarations)
RUN pnpm run typecheck:libs

# Bundle the API server with esbuild
RUN pnpm --filter @workspace/api-server run build

# =============================================================================
# Stage 2: Runtime
# Slim image — only what the server and migrations need at runtime
# =============================================================================
FROM node:24-alpine AS runtime
WORKDIR /app

# Install pnpm (needed to run drizzle-kit for migrations)
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# ---- Migration tooling ----
# Copy the full hoisted node_modules (includes drizzle-kit, drizzle-orm, pg)
COPY --from=builder /app/node_modules ./node_modules

# Copy lib/db TypeScript source + config (drizzle-kit reads schema at startup)
COPY --from=builder /app/lib/db ./lib/db

# Workspace root manifests (pnpm needs these to resolve workspaces)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# ---- API server bundle ----
COPY --from=builder /app/artifacts/api-server/dist ./dist

# ---- Startup + migration scripts ----
COPY artifacts/api-server/docker-entrypoint.sh ./docker-entrypoint.sh
COPY scripts/migrate.sh ./scripts/migrate.sh
RUN chmod +x ./docker-entrypoint.sh ./scripts/migrate.sh

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
