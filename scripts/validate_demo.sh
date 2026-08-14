#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ Running FastAPI tests"
(
  cd "$ROOT/apps/api"
  pytest -q
)

echo "→ Building React frontend"
(
  cd "$ROOT/apps/web"
  npm run build
)

echo "✓ CircularMatch demo validation passed"
