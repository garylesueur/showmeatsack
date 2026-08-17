# showmeatsack.com — repository instructions

**Domain:** showmeatsack.com

Greenfield Next.js App Router project. TypeScript, Tailwind, pnpm. Merge gates live in `.engineering/config.yaml`.

## Commands

```bash
pnpm env         # Write .env.local from 1Password (.env.tpl)
pnpm dev         # Dev server (reads .env.local)
pnpm dev:op      # Dev server with secrets injected in-process, nothing on disk
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm test        # Vitest
pnpm build       # Production build
```

Secrets live in a 1Password item named `showmeatsack.com` (vault `Development`, or set `OP_VAULT`). `.env.tpl` holds `op://` references only. Prefer `pnpm dev:op` so values never land on disk; `pnpm env` writes `.env.local` when a file is needed. `.env.example` is the empty placeholder for people without 1Password. Never print `.env` contents, never commit secrets.

Locally, shares live in memory if Redis and object storage are unset. On Vercel, set `KV_REST_API_*` (or Upstash Redis) for share metadata, and R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`) for the uploaded files, so shares survive across instances. `BLOB_READ_WRITE_TOKEN` remains a fallback if R2 is unset.

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
