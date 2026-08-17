#!/usr/bin/env bash
# Push one 1Password item to the matching Vercel environment.
# Development is local-only and is not accepted here.
set -euo pipefail

target="${1:-}"
case "$target" in
  preview) item="showmeatsack.com Preview" ;;
  production) item="showmeatsack.com Production" ;;
  *)
    echo "Usage: pnpm env:vercel preview|production" >&2
    echo "Development stays in 1Password and is loaded with pnpm env / pnpm dev:op." >&2
    exit 1
    ;;
esac

if ! command -v op >/dev/null 2>&1; then
  echo "1Password CLI (op) is not on PATH." >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not on PATH." >&2
  exit 1
fi

vault="${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}"
keys=(
  KV_REST_API_URL
  KV_REST_API_TOKEN
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET_NAME
  BLOB_READ_WRITE_TOKEN
)

echo "Pushing 1Password item ${item} → Vercel ${target}" >&2

for key in "${keys[@]}"; do
  if ! value="$(op read "op://${vault}/${item}/${key}" 2>/dev/null)"; then
    echo "skip ${key} (missing in ${vault}/${item})" >&2
    continue
  fi
  if [[ -z "${value}" ]]; then
    echo "skip ${key} (empty)" >&2
    continue
  fi

  vercel env rm "${key}" "${target}" --yes >/dev/null 2>&1 || true
  if ! printf '%s' "${value}" | vercel env add "${key}" "${target}" --sensitive >/dev/null; then
    echo "failed to set ${key} on Vercel ${target}" >&2
    exit 1
  fi
  echo "set ${key} on Vercel ${target}" >&2
done

if [[ "${target}" == "production" ]]; then
  vercel env rm PUBLIC_BASE_URL production --yes >/dev/null 2>&1 || true
  if ! printf '%s' 'https://showmeatsack.com' | vercel env add PUBLIC_BASE_URL production >/dev/null; then
    echo "failed to set PUBLIC_BASE_URL on Vercel production" >&2
    exit 1
  fi
  echo "set PUBLIC_BASE_URL on Vercel production" >&2
fi
