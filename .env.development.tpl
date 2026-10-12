# 1Password secret references. Nothing secret lives in git.
# One vault: Agents (mep374l3cpdtzwibf5fswsimbi). Override with OP_VAULT.
# Three items:
#   kurrh2l5nm5jd2ajqchctrls4q  — this file; laptop only
#   iwuprml52wmzuvgq4eg37pzrly      — .env.preview.tpl → Vercel Preview
#   gzow46cckd6yenaplpsv3mre6y   — .env.production.tpl → Vercel Production
# Leave Redis/R2 empty on the Development item to use in-memory stores.

PUBLIC_BASE_URL=http://localhost:3000
VIEW_PUBLIC_BASE_URL=http://localhost:3000
KV_REST_API_URL=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/KV_REST_API_URL
KV_REST_API_TOKEN=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/KV_REST_API_TOKEN
R2_ACCOUNT_ID=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/R2_BUCKET_NAME
BLOB_READ_WRITE_TOKEN=op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/BLOB_READ_WRITE_TOKEN
