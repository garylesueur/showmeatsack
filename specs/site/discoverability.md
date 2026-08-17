---
id: site-discoverability
area: Site / Discoverability
status: implemented
---

# Site discoverability

Public pages tell search engines, answer engines, and agents what showmeatsack.com is. View links stay private.

## Behaviours

### B1 — Home carries ordinary share metadata 🟢 implemented

The home page has a title, description, canonical URL, Open Graph tags, a large share image, and structured data naming showmeatsack.com. Sharing the home URL in chat or on social media shows that card.

### B2 — Crawlers get a sitemap and robots file 🟢 implemented

Crawlers can fetch a sitemap of the public documents (home, MCP page, markdown guide, skill, llms.txt). Robots allow those, and do not ask crawlers to index API routes or view links.

### B3 — Answer engines get a plain-text index 🟢 implemented

`/llms.txt` describes the product in short and lists the skill and the MCP/HTTP guide. Agents that look for that file can find the rest from it.

### B4 — Pasting the MCP URL yields a guide 🟢 implemented

Opening `https://showmeatsack.com/mcp` in a browser shows a short HTML page with the MCP URL and links to the markdown guide and skill. Fetching that same URL as markdown (or with no HTML Accept), or fetching `/mcp.md`, returns a markdown API guide: what the product does, how to connect, the tool actions, curl, and the skill.

### B5 — The skill is on the site 🟢 implemented

`/skill.md` is the showmeatsack.com skill: create, put the view link where the person will open it (this conversation, email, Slack, or anywhere else the agent can already send), replace or delete with the manage token. It matches the skill shipped for Cursor. An agent does not wait for the words "showmeatsack"; a bot acting on its own still publishes, then delivers `viewUrl` itself.

### B6 — View links are not for search 🟢 implemented

A view URL tells crawlers not to index it. The sitemap does not list shares. The viewed page is still the uploaded HTML; crawlers are told not to index via robots and response headers, not by wrapping chrome around the page.

### B7 — The repository is an Agent Plugin 🟢 implemented

The repository root is an Agent Plugin: a client that understands [Agent Plugins](https://agent-plugins.org/) can install it and get the hosted showmeatsack.com MCP server plus the skill. The plugin skill instructions match `/skill.md`.

## Rules (Invariants)

- Public copy always calls the product **showmeatsack.com**. The tool is named `showmeatsack.com`.
- View URLs (`/s/…`) are not in the sitemap and are not offered for indexing.
- POST to `/mcp` remains the MCP protocol. A documentation GET must not replace a request that is clearly the protocol (MCP version header, JSON, or event-stream Accept).
- The Agent Plugin skill body matches the published `/skill.md` skill.

## Decision Tables

| GET `/mcp` looks like | Response |
| --- | --- |
| Browser HTML Accept | Short HTML guide |
| `text/markdown`, `text/plain`, missing Accept, or `*/*` only | Markdown API guide |
| `mcp-protocol-version`, `application/json` without HTML, or `text/event-stream` | MCP protocol |

## User Flows

_None._

## Open Questions

_None._

## Future Considerations

- Per-share Open Graph cards if sharing a view link in Slack becomes common. A raw uploaded page is the page; a product card would be a different choice.

## Out of Scope

- Indexing or listing live shares.
- A marketing blog or docs site beyond these public files.
- Changing how create, view, replace, or delete work.
