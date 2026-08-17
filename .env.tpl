# 1Password secret references. Nothing secret lives in git.
#
# Three vaults, one item name in each, same field names, different values:
#   Development  — laptop only. Leave Redis/R2 empty to use in-memory stores.
#   Preview      — Vercel Preview. Own Redis and R2 bucket, never Production's.
#   Production   — Vercel Production.
#
# Local commands pin Development. Preview and Production are pushed with
#   pnpm env:vercel preview|production
# Do not point a laptop at Preview or Production.

PUBLIC_BASE_URL=http://localhost:3000
KV_REST_API_URL=op://${OP_VAULT:-Development}/showmeatsack.com/KV_REST_API_URL
KV_REST_API_TOKEN=op://${OP_VAULT:-Development}/showmeatsack.com/KV_REST_API_TOKEN
R2_ACCOUNT_ID=op://${OP_VAULT:-Development}/showmeatsack.com/R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=op://${OP_VAULT:-Development}/showmeatsack.com/R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=op://${OP_VAULT:-Development}/showmeatsack.com/R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=op://${OP_VAULT:-Development}/showmeatsack.com/R2_BUCKET_NAME
BLOB_READ_WRITE_TOKEN=op://${OP_VAULT:-Development}/showmeatsack.com/BLOB_READ_WRITE_TOKEN
