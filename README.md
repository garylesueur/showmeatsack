# show.imeatsack.com

**An agent posts a page. A person opens it.**

An agent publishes HTML, markdown, or a small static-site zip, and gets a view link to
share. Anyone with that link sees the page itself. The same call returns a
manage token to replace or delete the share; otherwise it expires on its own.
There is no API key. Create is open today. Publishing will later need a
lanyard account; that account is free unless they want teams or a custom
domain.

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

| Command                               | Does                                                        |
| ------------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                            | Dev server, reads `.env.local`                              |
| `pnpm dev:op`                         | Dev server with secrets in-process, nothing written to disk |
| `pnpm env`                            | Write `.env.local` from the Development item                |
| `pnpm env:vercel preview\|production` | Push that item to the matching Vercel env                   |
| `pnpm typecheck`                      | TypeScript                                                  |
| `pnpm lint` | oxlint, plus the import-layer check |
| `pnpm format` | oxfmt |
| `pnpm test` | Vitest |
| `pnpm build`                          | Production build                                            |

`pnpm typecheck`, `pnpm format:check`, `pnpm lint`, `pnpm test` and `pnpm build`
are the merge gates — see `.engineering/config.yaml`, and
`.engineering/conventions.md` for the conventions they enforce.

## Hosts

The **I, Meatsack** umbrella landing page is deployed separately on
`imeatsack.com`, in the **lesueur / imeatsack** Vercel project. Its source is
`src/app/preview/imeatsack/`; the `/preview/imeatsack` route remains a local
preview with noindex metadata. The live build omits the preview notice and
links its wordmark to `/`. Ask, Share and Show links point to their canonical
`imeatsack.com` subdomains.

Prepare an isolated release with
`pnpm prepare:landing --out /absolute/path/to/release`, then install and build
inside that directory with the pinned pnpm version. The preparation script
copies only the landing components, shared brand files and illustrations,
and records source hashes in `imeatsack-source.json`. It does not copy product
APIs, storage settings or environment files. Generated release files should
be changed through their source files and regenerated with this command.

Link the release directory explicitly to **lesueur / imeatsack**, verify the
project with `vercel project inspect --non-interactive --scope lesueur`, and
stage with `vercel deploy --prod --skip-domain --scope lesueur`. Verify the
staged deployment before promoting it. Product deployments and their domain
redirects are managed separately from this landing-page release.

The landing page's production-only layout, crawler routes and Open Graph image
live in `src/imeatsack/`; `src/lib/imeatsack-site.ts` owns its metadata,
structured data and Markdown content. The release includes a 1200×630 branded
Open Graph card, Twitter large-image metadata, favicon and Apple icon,
`robots.txt`, and a sitemap of the canonical homepage with its three
illustrations. Only the homepage is offered for search indexing. `/index.md`,
`/llms.txt` and `/llms-full.txt` remain readable by agents and carry `noindex`
headers to avoid duplicate search results. HTML and HTTP Link metadata point
agents to these resources. The llms.txt format is a discovery proposal, not a
guarantee of inclusion in an answer engine.

The IndexNow ownership proof is sourced from `src/imeatsack/indexnow-key.txt`
and exported by the preparation script into the public release. It is a
public site-ownership proof, not an account/API credential. After promoting
an update and verifying public HTTPS, run `pnpm submit:landing` to notify
IndexNow of the homepage change. The command checks the live landing page
and ownership proof before submitting. HTTP 200 acknowledges receipt;
HTTP 202 means ownership validation is pending. Neither promises indexing.

On 12 October 2026, the `imeatsack.com` domain property was verified in
Google Search Console and `https://imeatsack.com/sitemap.xml` was submitted
successfully. Keep the Google verification TXT record at the apex when
changing DNS providers. This property covers future product subdomains.
On the same day, the user approved switching only this domain to Vercel DNS.
Namecheap now delegates it to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`;
registration stays with Namecheap. The Google verification TXT was copied to
Vercel before the switch. Public HTTPS serves the landing page and crawler
files, and `www.imeatsack.com` redirects to the apex with HTTP 308.
Vercel manages the certificates automatically.

The first IndexNow homepage notification was accepted with HTTP 202
(ownership validation pending); a bounded follow-up returned HTTP 200.
Bing Webmaster Tools' Google sign-in was
unavailable during setup; its dashboard sitemap submission remains pending
account access. An existing Outlook.com Microsoft account can be used to
sign in. Google's earlier sitemap fetch failed while DNS/TLS was incomplete;
the sitemap was resubmitted after public HTTPS started working. Submission
acceptance is separate from a successful crawl or inclusion in search results.

### Product subdomains

The products use `ask.imeatsack.com`, `share.imeatsack.com` and
`show.imeatsack.com` as their production public origins. The old product
domains permanently redirect with HTTP 308, preserving paths and query strings.
Existing Show links retain their share IDs and stored content through the redirect.
The product MCP endpoints, canonical metadata, robots files and sitemaps use the
new origins. All three product sitemaps were submitted successfully to Google's
verified `imeatsack.com` domain property on 12 October 2026. Search Console still
reported "Couldn't fetch" immediately after submission; public HTTPS checks of
the sitemap files returned HTTP 200. Successful Google crawling remains unverified.
The landing-page update was accepted by IndexNow with HTTP 200.

Published pages use a separate origin because they can contain untrusted HTML.

| Origin | Serves |
| --- | --- |
| `https://show.imeatsack.com` | The product site and API |
| `https://s.imeatsack.com` | Published pages |

Both hosts belong to the Show Vercel project. `s.showmeatsack.com` redirects to
`s.imeatsack.com`. Set production `PUBLIC_BASE_URL` and `VIEW_PUBLIC_BASE_URL`
to these origins. The move redeploys the existing production sources with updated
public-origin configuration; unfinished changes in local product checkouts are
not part of the release.

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

| Path                            | What                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| `specs/`                        | Product intent. Start at `specs/sharing/pages/publishing.md` |
| `specs/site/discoverability.md` | SEO, Open Graph, sitemap, robots, llms.txt                   |
| `src/app/api/v1/shares/`        | The HTTP API                                                 |
| `src/app/mcp/`                  | The MCP server                                               |
| `src/app/s/[shareId]/`          | Serving a published page                                     |
| `src/lib/shares.ts`             | Share service — create, replace, delete, view                |
| `src/lib/zip-site.ts`           | Unpacking and path-checking an uploaded zip                  |
| `.engineering/config.yaml`      | Toolchain contract that calm-craft skills read               |
| `skills/showmeatsack/`          | The skill — **the source of truth**, edit this one           |
| `.cursor/skills/showmeatsack/`  | Generated copy for Cursor (`pnpm sync:skill`)                |
| `plugin.json`                   | Agent Plugin (open standard) identity                        |
| `.cursor-plugin/plugin.json`    | Cursor Open Plugin manifest for this clone                   |
| `src/lib/showmeatsack-skill.ts` | Generated constant the site and MCP serve                    |

## calm-craft

This repository is built with [calm-craft](https://github.com/calmtechltd/calm-craft),
our own MIT-licensed [Agent Plugin](https://agent-plugins.org/), installed in the
agent tooling. Use its `calm-craft:…` skills across repositories; this repository
keeps its project settings in `.engineering/config.yaml`.

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

## Plugin marketplace

The plugin ID is `showmeatsack`; its display name and MCP tool name are
**show.imeatsack.com**. The portable manifest includes OpenAI listing metadata and
icons; `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` provide
client compatibility.

The [Meatsack marketplace](https://github.com/garylesueur/meatsack-marketplace)
packages all three products. It contains generated, minimal plugin copies;
this repository remains the source for this product's manifest, skill, MCP
connection, and logo. Run the marketplace sync after changing those files.

Codex:

```sh
codex plugin marketplace add garylesueur/meatsack-marketplace
```

Then install **show.imeatsack.com** from the Meatsack source in Plugins.

Claude Code:

```text
/plugin marketplace add garylesueur/meatsack-marketplace
/plugin install showmeatsack@meatsack
```

Cursor Teams/Enterprise: Dashboard → Plugins & MCPs → Add Marketplace →
Import from Repo, using the marketplace repository URL. Install the product
from Customize. For a personal account, copy the plugin package into `~/.cursor/plugins/local/`.
See the [installation guide](https://show.imeatsack.com/install) for commands.

Marketplace publication must precede deploying these website install links.
Public ChatGPT/Codex and Cursor directory listings require separate submissions.

## Install

This repository is itself an [Agent Plugin](https://agent-plugins.org/) — the
open standard for packaging agent tooling: `plugin.json`, `mcp.json`, and
`skills/` in one installable unit. Cursor also reads `.cursor-plugin/plugin.json`
so this clone can be added as an Open Plugin from the local folder. `.mcp.json`
exists for [cursor.directory](https://cursor.directory/plugins/new) detection.

**Install in Cursor from this clone.** In Customize → Plugins, add an Open
Plugin and choose this repository root (the folder that contains `plugin.json`).
For a local install, copy this product’s marketplace package into Cursor’s plugin folder:

```bash
git clone https://github.com/garylesueur/meatsack-marketplace.git
mkdir -p ~/.cursor/plugins/local/showmeatsack
cp -R meatsack-marketplace/plugins/showmeatsack/. ~/.cursor/plugins/local/showmeatsack/
```

Then reload the window. The plugin carries the hosted MCP server and
`skills/showmeatsack/SKILL.md`.

**Or install from GitHub:**

```text
https://github.com/garylesueur/showmeatsack
```

**Or install the MCP server on its own** at `https://show.imeatsack.com/mcp`. The
tool works, and the server sends the same skill as its MCP `instructions`, so
most clients still get the full brief. Clients that ignore `instructions` see
only the tool description — prefer the plugin where you can.

## Licence

MIT — see [LICENSE](LICENSE).

Built by [Gary Le Sueur](https://gaz.dev).

### Site icons

The browser favicon and Apple touch icon use the same character artwork as the
plugin listing. Edit `public/plugin-icon.png`, then run `pnpm sync:icons` to
regenerate `src/app/favicon.ico`, `src/app/icon.png`, and
`src/app/apple-icon.png`. Do not edit those exports by hand. Builds regenerate
them, and tests check that they match the source.
