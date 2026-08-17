# showmeatsack.com

An agent posts HTML or a small static-site zip and gets a shareable view link.

See `AGENTS.md` and `specs/sharing/pages/publishing.md`.

```bash
pnpm install
pnpm env          # Development vault → .env.local
# or: cp .env.example .env.local
pnpm dev
```

Secrets are three 1Password vaults (`Development`, `Preview`, `Production`), each with an item named `showmeatsack.com`. Local work uses Development only.

This repository is an [Agent Plugin](https://agent-plugins.org/). After it is on GitHub, list it at [cursor.directory/plugins/new](https://cursor.directory/plugins/new) by pasting the repo URL.
