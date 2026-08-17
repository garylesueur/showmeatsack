# 1Password secret references. Nothing secret lives in git.
# Create an item named "showmeatsack.com" in the Development vault
# (or set OP_VAULT) with a field per key below, then:
#   pnpm env      # write .env.local
#   pnpm dev:op   # run Next with secrets in-process, nothing on disk

PUBLIC_BASE_URL=http://localhost:3000
KV_REST_API_URL=op://${OP_VAULT:-Development}/showmeatsack.com/KV_REST_API_URL
KV_REST_API_TOKEN=op://${OP_VAULT:-Development}/showmeatsack.com/KV_REST_API_TOKEN
R2_ACCOUNT_ID=op://${OP_VAULT:-Development}/showmeatsack.com/R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=op://${OP_VAULT:-Development}/showmeatsack.com/R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=op://${OP_VAULT:-Development}/showmeatsack.com/R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=op://${OP_VAULT:-Development}/showmeatsack.com/R2_BUCKET_NAME
BLOB_READ_WRITE_TOKEN=op://${OP_VAULT:-Development}/showmeatsack.com/BLOB_READ_WRITE_TOKEN
