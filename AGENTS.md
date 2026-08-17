# showmeatsack.com — repository instructions

**Domain:** showmeatsack.com

Greenfield Next.js App Router project. TypeScript, Tailwind, pnpm. Merge gates live in `.engineering/config.yaml`.

## Commands

```bash
pnpm env         # Write .env.local from the Development item
pnpm dev         # Dev server (reads .env.local)
pnpm dev:op      # Dev server with Development secrets in-process, nothing on disk
pnpm env:vercel preview|production  # Push that item to the matching Vercel env
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm test        # Vitest
pnpm build       # Production build
```

1Password holds three items in the **Agents** vault (`mep374l3cpdtzwibf5fswsimbi`, override with `OP_VAULT`): `showmeatsack.com Development`, `showmeatsack.com Preview`, and `showmeatsack.com Production`. Same field names, different values. Local commands use the Development item only. Preview and Production are pushed to Vercel; they are not for a laptop. Marketplace KV on Vercel can still inject `KV_REST_API_*` for that environment; put the matching values on that item if you want 1Password to be the source of truth. Leave Development Redis and R2 empty to stay on in-memory stores. `.env.development.tpl`, `.env.preview.tpl`, and `.env.production.tpl` hold `op://` references only. `.env.example` is the empty placeholder. Never print `.env` contents, never commit secrets.

On Vercel, each environment needs its own Redis (`KV_REST_API_*` or Upstash) and its own R2 bucket (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`) so shares survive across instances. `BLOB_READ_WRITE_TOKEN` remains a fallback if R2 is unset.

## What this is

An agent posts HTML, or a small static-site zip, and gets a showmeatsack.com view link to share. The same create call also returns a manage link to replace or delete that share. Anyone with the view link sees the page itself. Shares expire. Posting the view link to Slack or anywhere else is the calling agent’s job.

Always call the product **showmeatsack.com** in user-facing copy. The agent tool is named `showmeatsack.com`. View links are `https://showmeatsack.com/…`.

## Where things live

- `.engineering/config.yaml` is the contract calm-craft skills read — paths, gates, tickets. Re-run `engineering-setup` after the toolchain lands.
- Specs live in `specs/`. Format: `specs/README.md`. Start with `specs/sharing/pages/publishing.md` for the product.
- Conventions will live in `.engineering/conventions.yaml` once `conventions-decide` has been run. Do not invent a parallel rule list here.
- calm-craft is vendored as a submodule at `.agents/plugins/calm-craft`.
- The showmeatsack skill is `.cursor/skills/showmeatsack/SKILL.md` (create → paste view link). The same instructions ship as the Agent Plugin skill at `skills/showmeatsack/SKILL.md`.
- The repository root is an [Agent Plugin](https://agent-plugins.org/): `plugin.json`, `mcp.json`, and `skills/`. `.mcp.json` is for [cursor.directory](https://cursor.directory/plugins/new) detection.
- Implementation plans and review reports go in `.plans/` and `.reports/` (gitignored).

## Secrets

If a `.env.example` exists, copy it to `.env.local`. Never print `.env` contents, never commit secrets, never paste secrets into a ticket or a spec.

## Repository operations

- Do not commit, push, create a branch, or open a pull request unless explicitly asked.
- Preserve unrelated user changes in a dirty worktree.
- Prefer non-destructive and non-interactive commands.
