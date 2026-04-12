#!/usr/bin/env bash
set -euo pipefail

if command -v python3.11 >/dev/null 2>&1; then
  PYTHON_BIN=python3.11
else
  echo "python3.11 is required for the backend setup." >&2
  exit 1
fi

$PYTHON_BIN -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -e './backend[dev,retrieval]'

cd frontend
npm install
cd ..

echo "Setup complete."
echo "Backend env template: backend/.env.example"
echo "Frontend env template: frontend/.env.example"
