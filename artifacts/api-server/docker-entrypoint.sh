#!/bin/sh
set -e

echo "==> LaunchFlow API — startup"
echo "    NODE_ENV: ${NODE_ENV}"
echo "    PORT:     ${PORT:-8080}"

# ---------------------------------------------------------------------------
# Database migrations
# Delegates to scripts/migrate.sh — idempotent, safe on every startup.
# ---------------------------------------------------------------------------
/app/scripts/migrate.sh

# ---------------------------------------------------------------------------
# Start the API server
# ---------------------------------------------------------------------------
echo "==> Starting API server on port ${PORT:-8080}..."
exec node --enable-source-maps /app/dist/index.mjs
