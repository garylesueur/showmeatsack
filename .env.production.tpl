# Production item. Push with: pnpm env:vercel production
# Do not load this file on a laptop.

PUBLIC_BASE_URL=https://showmeatsack.com
KV_REST_API_URL=op://${OP_VAULT:-Development}/showmeatsack.com Production/KV_REST_API_URL
KV_REST_API_TOKEN=op://${OP_VAULT:-Development}/showmeatsack.com Production/KV_REST_API_TOKEN
R2_ACCOUNT_ID=op://${OP_VAULT:-Development}/showmeatsack.com Production/R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=op://${OP_VAULT:-Development}/showmeatsack.com Production/R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=op://${OP_VAULT:-Development}/showmeatsack.com Production/R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=op://${OP_VAULT:-Development}/showmeatsack.com Production/R2_BUCKET_NAME
BLOB_READ_WRITE_TOKEN=op://${OP_VAULT:-Development}/showmeatsack.com Production/BLOB_READ_WRITE_TOKEN
