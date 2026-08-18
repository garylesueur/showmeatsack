# showmeatsack.com

**An agent posts a page. A person opens it.**

An agent publishes HTML, or a small static-site zip, and gets a view link to
share. Anyone with that link sees the page itself. The same call returns a
manage token to replace or delete the share; otherwise it expires on its own.

Posting the view link to Slack, email, or anywhere else is the calling agent's
job.

Sibling project: [askmeatsack.com](https://github.com/garylesueur/askmeatsack) —
an agent asks, a human answers.

## Quick start

```bash
pnpm install
pnpm env      # writes .env.local from the 1Password Development item
pnpm dev
```

No 1Password access? `cp .env.example .env.local` gets you a working local
server. Leave Redis and R2 empty to stay on in-memory stores.

## Commands

| Command | Does |
| --- | --- |
| `pnpm dev` | Dev server, reads `.env.local` |
| `pnpm dev:op` | Dev server with secrets in-process, nothing written to disk |
| `pnpm env` | Write `.env.local` from the Development item |
| `pnpm env:vercel preview\|production` | Push that item to the matching Vercel env |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm build` | Production build |

`pnpm typecheck`, `pnpm lint`, and `pnpm test` are the merge gates — see
`.engineering/config.yaml`.

## Hosts

Two origins, on purpose. Published pages are untrusted HTML, so they are served
from a separate host and never share an origin with the product site.

| Origin | Serves |
| --- | --- |
| `https://showmeatsack.com` | The product site and the API |
| `https://s.showmeatsack.com` | View links — the published pages themselves |

Add `s.showmeatsack.com` to the Vercel project so that host reaches this app.

## Secrets

Three 1Password items live in the **Agents** vault: `showmeatsack.com
Development`, `showmeatsack.com Preview`, and `showmeatsack.com Production`.
Same field names, different values. Local work uses Development only; Preview
and Production are pushed to Vercel and are not for a laptop.

Each deployed environment needs its own Redis (`KV_REST_API_*` or Upstash) and
its own R2 bucket (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`) so shares survive across instances. `BLOB_READ_WRITE_TOKEN`
remains a fallback if R2 is unset.

`.env.development.tpl`, `.env.preview.tpl`, and `.env.production.tpl` hold
`op://` references only. `.env.example` is the empty placeholder. Never print
`.env` contents and never commit secrets.

## Where things live

| Path | What |
| --- | --- |
| `specs/` | Product intent. Start at `specs/sharing/pages/publishing.md` |
| `specs/site/discoverability.md` | SEO, Open Graph, sitemap, robots, llms.txt |
| `src/app/api/v1/shares/` | The HTTP API |
| `src/app/mcp/` | The MCP server |
| `src/app/s/[shareId]/` | Serving a published page |
| `src/lib/shares.ts` | Share service — create, replace, delete, view |
| `src/lib/zip-site.ts` | Unpacking and path-checking an uploaded zip |
| `.engineering/config.yaml` | Toolchain contract that calm-craft skills read |
| `skills/showmeatsack/` | The Agent Plugin skill |
| `.cursor/skills/showmeatsack/` | The same instructions for Cursor |

## calm-craft

This repository is built with [calm-craft](https://github.com/calmtechltd/calm-craft),
our own MIT-licensed [Agent Plugin](https://agent-plugins.org/). It is vendored
as a submodule at `.agents/plugins/calm-craft`:

```bash
git submodule update --init --recursive
```

**What it is.** Three things that make coding agents produce work you can trust:
specs as an addressable source of truth, a delivery loop that plans and then
executes one reviewable chunk at a time, and code conventions decided once and
enforced by lint wherever a machine can enforce them.

**Why we use it.** Most of the code here is written by agents, and an agent with
no fixed source of truth will happily invent one. Specs in `specs/` are that
fixed point — they outlive any single session, so a change three weeks from now
starts from what the product is meant to do rather than from whatever the last
diff happened to leave behind. That matters more than usual here: this service
takes arbitrary HTML from the internet and serves it back, so the rules about
path handling, expiry, and origin isolation need somewhere durable to live. The
separation calm-craft defends matters just as much — auditors report and never
edit, planning is not allowed to double as execution, and one chunk is finished
and verified before the next one starts.

It also happens to be ours, so every public repo we ship is a repo we are
running our own tooling on.

`.engineering/config.yaml` is the contract every calm-craft skill reads — paths,
gates, branch, ticket provider. Skills stay portable; this repo's specifics stay
in config we own, so updating the plugin never clobbers our choices.

> Not yet run here: `conventions-decide`, which writes
> `.engineering/conventions.yaml`. Until then this repo has no recorded
> convention decisions, and `paths.conventions` points at a file that does not
> exist.

## Agent Plugin

This repository is itself an [Agent Plugin](https://agent-plugins.org/):
`plugin.json`, `mcp.json`, and `skills/`. `.mcp.json` exists for
[cursor.directory](https://cursor.directory/plugins/new) detection.

Install the MCP server directly at `https://showmeatsack.com/mcp`.

## Licence

MIT — see [LICENSE](LICENSE).

Built by [Gary Le Sueur](https://gaz.dev).
