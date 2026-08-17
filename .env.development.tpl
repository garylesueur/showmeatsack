# 1Password secret references. Nothing secret lives in git.
# One vault: Agents (mep374l3cpdtzwibf5fswsimbi). Override with OP_VAULT.
# Three items:
#   showmeatsack.com Development  — this file; laptop only
#   showmeatsack.com Preview      — .env.preview.tpl → Vercel Preview
#   showmeatsack.com Production   — .env.production.tpl → Vercel Production
# Leave Redis/R2 empty on the Development item to use in-memory stores.

PUBLIC_BASE_URL=http://localhost:3000
KV_REST_API_URL=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/KV_REST_API_URL
KV_REST_API_TOKEN=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/KV_REST_API_TOKEN
R2_ACCOUNT_ID=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/R2_BUCKET_NAME
BLOB_READ_WRITE_TOKEN=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/BLOB_READ_WRITE_TOKEN
