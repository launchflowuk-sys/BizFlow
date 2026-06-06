# =============================================================================
# Stage 1: Builder
# Full monorepo install + Vite production build
# =============================================================================
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy all source packages the web app depends on
COPY lib/ lib/
COPY artifacts/web/ artifacts/web/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build TypeScript libs
RUN pnpm run typecheck:libs

# ---------------------------------------------------------------------------
# Vite build-time environment variables
# VITE_* vars are baked into the JS bundle at build time by Vite.
# Pass them as Docker build args from Coolify / CI.
# PORT and BASE_PATH are required by vite.config.ts at config-parse time.
# ---------------------------------------------------------------------------
ARG PORT=3000
ARG BASE_PATH=/
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_CLERK_PROXY_URL

ENV PORT=$PORT
ENV BASE_PATH=$BASE_PATH
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PROXY_URL=$VITE_CLERK_PROXY_URL
ENV NODE_ENV=production

RUN pnpm --filter @workspace/web run build

# =============================================================================
# Stage 2: Runtime — nginx serving static files
# =============================================================================
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config template (envsubst processes it at container start)
COPY artifacts/web/nginx.conf /etc/nginx/templates/app.conf.template

# Copy the Vite build output
COPY --from=builder /app/artifacts/web/dist/public /usr/share/nginx/html

# API_UPSTREAM: hostname:port of the API service.
# Default matches the docker-compose service name.
# Override when deploying API and web as separate services.
ENV API_UPSTREAM=api:8080

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# envsubst processes only $API_UPSTREAM — nginx's own $variables are preserved.
CMD ["/bin/sh", "-c", "envsubst '$API_UPSTREAM' < /etc/nginx/templates/app.conf.template > /etc/nginx/conf.d/app.conf && nginx -g 'daemon off;'"]
