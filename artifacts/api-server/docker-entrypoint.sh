#!/bin/sh
# Intentionally no set -e — we handle errors explicitly for better crash diagnostics

echo "==> LaunchFlow API — startup diagnostics"
echo "    NODE_ENV:           ${NODE_ENV:-NOT SET}"
echo "    PORT:               ${PORT:-8080}"
echo "    DATABASE_URL set:   $([ -n "$DATABASE_URL" ] && echo YES || echo NO - MISSING)"
echo "    node version:       $(node --version)"

# ---------------------------------------------------------------------------
# Database migrations
# Uses drizzle-orm migrator with pre-generated SQL files (no drizzle-kit needed
# at runtime). Migration files were generated during the Docker build step.
# ---------------------------------------------------------------------------
echo "==> Running database migrations..."
if node /app/scripts/run-migrations.mjs; then
  echo "==> Migrations completed"
else
  MIGRATE_EXIT=$?
  echo "==> WARN: Migration exited with code $MIGRATE_EXIT — see output above"
  echo "==> Continuing startup (server will fail if schema is missing)"
fi

# ---------------------------------------------------------------------------
# Start the API server
# ---------------------------------------------------------------------------
echo "==> Starting API server on port ${PORT:-8080}..."
exec node --enable-source-maps /app/dist/index.mjs
