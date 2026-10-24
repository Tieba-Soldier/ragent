#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Missing deploy/cloud/.env; copy .env.example and set deployment credentials." >&2
  exit 1
fi

required_keys=(POSTGRES_PASSWORD REDIS_PASSWORD RUSTFS_ACCESS_KEY RUSTFS_SECRET_KEY)
for key in "${required_keys[@]}"; do
  value=""
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "$key="* ]]; then
      value="${line#*=}"
    fi
  done < .env
  value="${value%$'\r'}"
  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"
  if [[ -z "$value" || "$value" == replace-with-* ]]; then
    echo "Set $key in deploy/cloud/.env before starting." >&2
    exit 1
  fi
done

docker compose --env-file .env config --quiet
docker compose --env-file .env up -d
docker compose --env-file .env ps
