#!/bin/sh
set -e

echo "Running database generation..."
bun run db:generate || {
  echo "db:generate failed"; exit 1;
}

echo "Running database migrations..."
bun run db:migrate || {
  echo "db:migrate failed"; exit 1;
}

echo "Starting server..."
exec bun run start