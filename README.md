# showmeatsack.com

An agent posts HTML or a small static-site zip and gets a shareable view link.

See `AGENTS.md`, `specs/sharing/pages/publishing.md`, and `specs/site/discoverability.md`.

```bash
pnpm install
pnpm env          # Development item → .env.local
# or: cp .env.example .env.local
pnpm dev
```

Secrets are three 1Password items in the Agents vault: `showmeatsack.com Development`, `showmeatsack.com Preview`, and `showmeatsack.com Production`. Local work uses Development only.

This repository is an [Agent Plugin](https://agent-plugins.org/). After it is on GitHub, list it at [cursor.directory/plugins/new](https://cursor.directory/plugins/new) by pasting the repo URL.
