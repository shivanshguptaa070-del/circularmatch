#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT/apps/api"
WEB_DIR="$ROOT/apps/web"

cleanup() {
  echo
  echo "Stopping CircularMatch..."
  kill "${API_PID:-}" "${WEB_PID:-}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "Installing API dependencies..."
python3 -m pip install -r "$API_DIR/requirements.txt"

echo "Installing web dependencies..."
(
  cd "$WEB_DIR"
  npm install
)

echo "Starting CircularMatch API on http://localhost:8000"
(
  cd "$API_DIR"
  python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
) &
API_PID=$!

echo "Starting CircularMatch Website on http://localhost:5173"
(
  cd "$WEB_DIR"
  npm run dev
) &
WEB_PID=$!

echo
printf 'Open CircularMatch in your browser: http://localhost:5173\n\n'
echo "Press Ctrl+C in this terminal to stop the app."
wait "$API_PID" "$WEB_PID"
