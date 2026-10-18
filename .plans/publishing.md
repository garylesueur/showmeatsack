# Publishing a page — implementation plan

**Goal:** An agent can post HTML or a small static-site zip to showmeatsack.com and get a view link that *is* the page, plus a manage link to replace or delete it. Shares expire after 30 days.

**Strategy:** Foundation then vertical slices.

**Spec:** `specs/sharing/pages/publishing.md` (B1–B13, F1, F2)

## Restatement

- Open create, no accounts. One MCP tool (`showmeatsack.com`) with HTTP parity.
- View URL is the raw page (and zip assets). Manage secret is separate; relative assets must work without a query token.
- Zip is a static site (`index.html`, including a single wrapping folder). 5 MB cap.
- Replace in place; expiry unchanged. Delete and expiry make the page gone.
- Expired: short expired page. Unknown/deleted: not-found.
- Out of scope: accounts, email, FileSnare, askmeatsack integration, dashboards.

## Phases

- **A — Scaffold:** Next.js app runs locally with the same toolchain as askmeatsack.
- **B — Publish HTML:** Create returns links; the view URL shows the HTML.
- **C — Zip site:** A zip is served as a site; paths cannot leave the share.
- **D — Manage:** Replace, delete, and expiry work.
- **E — Doorways:** MCP tool matches HTTP.

## Open decisions

| Topic | Status |
| --- | --- |
| Domain showmeatsack.com | Settled |
| Replace does not change expiry | Settled |
| Next open after replace is the new page | Settled |
| Expired page vs not-found | Settled |
| Single wrapping folder in zip | Settled |

## Chunks

### A1 — Next.js scaffold
- **Depends on:** none
- **Spec(s):** none (foundation)
- **Work:** create-next-app (pnpm, TypeScript, Tailwind, `src/`, App Router); Vitest; update `.engineering/config.yaml` commands; keep existing `AGENTS.md` and add commands; `.env.example` with `PUBLIC_BASE_URL` only.
- **Done when:** `pnpm typecheck`, `pnpm lint`, and `pnpm test` run. Home page says showmeatsack.com.
- **Out of scope:** product behaviour, Vercel link, Redis, Blob.

### B1 — Publish and view HTML
- **Depends on:** A1
- **Spec(s):** B1, B2, B4, B5, B12; F1.T1; F2.T1
- **Work:** `createShareService` (object factory), memory store, create HTML, view URL `/s/{id}/` is the page, manage token separate, HTTP `POST /api/v1/shares`.
- **Done when:** Creating HTML returns view + manage + expiry. Opening the view URL shows that HTML with no chrome. Create needs no key.
- **Out of scope:** zip, replace, delete, MCP, Redis.

### B2 — Refuse and unknown
- **Depends on:** B1
- **Spec(s):** B9, B10; F1.T2; F2.T3
- **Work:** Empty / oversize / not-HTML refused. Unknown id is not-found and does not leak another share. Tests for the payload and lifecycle tables.
- **Done when:** Bad create publishes nothing. A junk view URL does not show another page.
- **Out of scope:** zip-specific refuse (C1), expiry page (D2).

### C1 — Zip as a static site
- **Depends on:** B2
- **Spec(s):** B3, B9, B13; F2.T4, F2.T5
- **Work:** Accept zip with `index.html` (root or one wrapping folder). Serve relative assets. Refuse zip without index, path escape, oversize.
- **Done when:** A zip with `index.html` + `style.css` loads both. `../` does not leave the share.
- **Out of scope:** replace/delete of zips beyond create+view.

### D1 — Replace
- **Depends on:** C1
- **Spec(s):** B6, B5; F1.T3–T5
- **Work:** Manage can PUT new HTML or zip. View URL unchanged. Next open is the new page. View token cannot replace. Bad replace leaves the old page.
- **Done when:** Replace with manage secret updates the page; view-only cannot.
- **Out of scope:** changing expiry on replace.

### D2 — Delete and expiry
- **Depends on:** D1
- **Spec(s):** B7, B8, B10; F1.T6–T10; F2.T2, F2.T6–T9
- **Work:** Manage delete; default 30-day expiry; optional shorter; expired page; deleted/unknown not-found; status via manage.
- **Done when:** After delete or expiry the uploaded page is gone. Delete without manage secret is refused.
- **Out of scope:** extending life past 30 days.

### E1 — MCP and HTTP parity
- **Depends on:** D2
- **Spec(s):** B11; F1.T1, F1.T3, F1.T6, F1.T8
- **Work:** `/mcp` one tool `showmeatsack.com` with actions create/status/replace/delete. Same service as HTTP. Thin home + MCP mention.
- **Done when:** Tool create/status/replace/delete match HTTP for the same share.
- **Out of scope:** email, wait, Cursor skill package, Vercel production wiring.

## Order

A1 → B1 → B2 → C1 → D1 → D2 → E1

**Next up:** _Done._ A1–E1 completed 2026-08-17.

## Checklist (each chunk)

- [ ] Tests for cited behaviours / flow guards
- [ ] Spec badges updated when the behaviour is built and tested
- [ ] Chunk marked complete with a dated status line
