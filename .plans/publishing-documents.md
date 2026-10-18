# Publishing a document

Native markdown (and source files) on showmeatsack.com: same create call as HTML, a service-rendered read view, a byte-for-byte source view, and nothing in the document ever runs.

Branch from **current `main`**. Specs already exist as 🔵 future (`specs/sharing/pages/documents.md`, plus the sharing README). This plan does not re-author them except to close blocking open questions in A1.

## Restatement

- An agent should send raw markdown or a source file and get a view link a person can read. They must not have to invent HTML first.
- A document is still a share: same view origin, manage token, 5 MB cap, 30-day default, rate limits, replace/delete.
- The `html` field stays a live page. Scripts and styles on a page are not stripped. A document is a different kind of share, rendered by us.
- Every document has two addresses: read (formatted) and source (exact bytes). Switching never edits the source.
- Markdown looks like GitHub: headings, lists, tables, quotes, task lists (display only), footnotes, strikethrough, autolinks. Remote images are not fetched. Markup, scripts and forms inside the document are text.
- Diagrams in the document are drawn; a bad diagram falls back to its source. A reader can open a diagram larger.
- A source file is a numbered, coloured listing with line and range links.
- A zip with `index.html` is still a static site. A zip of markdown without `index.html` is a small set of linked documents.
- The document frame is only the read/source switch and one small mark linking home. HTML pages and static sites have no frame.
- Custom-domain marks, paying “no mark”, canvases, version diffs, notebooks/CSV, and in-browser editing stay out of this plan.

## Strategy

**Vertical slices.** The documents spec is already written. A1 only records the blocking product questions so later chunks do not invent API shape.

## Phase map

| Phase | Focus | Done when |
| --- | --- | --- |
| A | Kind, payload, storage | Create/replace accepts `text` (optional kind, filename, title). HTML and zip-with-index.html still behave as today. Binary is refused. |
| B | First readable document | Opening the view link shows formatted markdown in the frame, with a source URL that is exact bytes. Agents are told to send `text`, not invent HTML. |
| C | Code, scripts, diagrams | Fenced code is coloured and copyable. A named source file is a listing. Mermaid draws, or degrades, and can be opened larger. |
| D | Finding your way, and previews | Long docs have a contents list and heading links. Slack-style link previews show the document. |
| E | A folder of markdown | A zip of `.md` without `index.html` is a small linked site. |
| F | Keep a copy | The reader can save a PDF that looks like the read view and names the page and the day. |

## Spec inventory

| Spec | Behaviours this plan covers |
| --- | --- |
| `specs/sharing/pages/documents.md` | B1–B16 |
| `specs/sharing/pages/publishing.md` | B9 (refusal table) must be amended when A2 and E1 change what is accepted. B2/B4 of publishing stay: HTML still runs. B17 is the preview contract E/D reuse. |

Flows: documents follow `specs/sharing/pages/publishing.flow.yaml`. No new states. Do not invent a flow for read/source; the spec says that is one step and constrains nothing.

## Open decisions

A1 writes these into the spec. Until A1 merges, do not code a different answer.

| Topic | Status | Resolution to record in A1 |
| --- | --- | --- |
| Create `kind` vs inspect (blocks B11) | Proposed | Both. Optional `kind`: `markdown` \| `source`. Optional `filename`. If omitted, inspect `text`. If `kind` and content disagree, **honour `kind`** (a script that looks like markdown stays a script). Binary / empty / over 5 MB still refused. |
| Field name | Proposed | New exclusive payload field `text`. Keep `html` as a live page. Never sniff `html` as markdown. One of `html`, `zipBase64`, `text` — not two. |
| Zip with no front page (blocks B8) | Proposed | If the agent names a file, that is the front page. Else `README.md` at the zip root (or wrapping folder). Else the only top-level markdown. Else **show a list of the documents** — do not refuse. |
| Math in B2 | Proposed | Not in this plan. Stays under Future Considerations. |
| Agent `title` for B13 | Proposed | Optional `title`. Preview uses title, else first heading, else filename, else a generic “Document”. |
| Frame mark copy (blocks B14) | Proposed | Default mark: “Shown to you by showmeatsack.com”, linking the product home. Pun copy is not this plan. Custom-domain / paid-silent marks wait on `custom-domains.md`. |
| Source URL | Proposed | Document shares only: read is `/s/{id}/` (and `/s/{id}/path` for a zip). Source is `/s/{id}/.source` and `/s/{id}/.source/path`. `.source` is reserved and is not a published file path. HTML/site shares are unchanged and have no `.source` doorway. |
| Diagram dialect | Proposed | Fenced `mermaid` only for B3. Other diagram fences show as code. |

---

## Chunks

### A1 — Close the blocking questions in the spec

- **Depends on:** none
- **Spec(s):** `documents.md` Open Questions (B8, B11, B14); B2 math; B13 title
- **Work:** Edit `specs/sharing/pages/documents.md` so the table above is decided, not open. Amend the B11/B8/B14 behaviour prose to match. Add `title` to B13 if that is the decision. Move math to Future Considerations if that is the decision. Do not change code.
- **Done when:** Those questions are gone from Open Questions, or no longer marked as blocking. `status` of the spec is still `future` until a later chunk ships behaviour.
- **Out of scope:** Implementation, canvases, custom domains, publishing.html running as a page.

### A2 — Accept text, leave pages alone

- **Depends on:** A1
- **Spec(s):** documents B1 (create path only), B11, B12; publishing B9
- **Work:** `src/lib/schema.ts`, `src/lib/showmeatsack-tool.ts`, `src/lib/shares.ts`, `src/lib/share-store.ts`, `src/lib/zip-site.ts` (do **not** yet accept a markdown zip), `src/lib/mime.ts` as needed. Store a share `kind` (`page` \| `document`) on `ShareRecord`. Persist `text` as a source file (filename from the agent or a derived name). Tests in `schema` / `shares` / API routes: `text` publishes; `html` is still wrapped as `index.html` and served as `text/html`; both `text` and `html` refused; empty and >5 MB refused; non-text bytes refused; zip without `index.html` still refused (E1 changes that).
- **Done when:** `POST /api/v1/shares` with `{ "text": "# Hello" }` returns the usual view/manage URLs. `GET` of that view URL is not yet a formatted document (may 404 or raw until B1 — if raw, `Content-Type` is text, never executed HTML). Creating with `html` still returns a page whose body is exactly what was sent.
- **Out of scope:** Rendering, frame, zip-of-markdown, skill copy, link previews.

### B1 — Read view, source view, and a document that cannot act

- **Depends on:** A2
- **Spec(s):** documents B1, B2 (without mermaid/math), B6, B7, B10, B14; publishing B2/B4 unchanged for HTML
- **Work:** Document renderer (GitHub-flavoured markdown, sanitised: no scripts, no forms, no remote image fetch, raw HTML shown as text). Frame: reading width, system light/dark, read/source switch, one mark with the A1 copy. Distinct `.source` URL returns the published bytes (`text/plain` or the source media type) character-for-byte. View router in `src/app/s/[shareId]/[[...path]]/route.ts` and `share-view-response.ts` branch on share kind so **pages still stream uploaded HTML**. CSP/headers on the document frame so content cannot run. Tests for sanitisation (script, `onerror`, remote `img`, inline HTML). Colocated unit tests for heading ids, task-list disabled checkboxes.
- **Done when (manual):** Publish `{ "text": "# Title\\n\\n- [x] done\\n\\n<script>alert(1)</script>\\n\\n![x](https://example.com/t.png)" }`. Open `viewUrl`: formatted heading and ticked, disabled checkbox; the script appears as text; the remote image does not load. Open `.source`: exact markdown. Click the mark: product home. Create an HTML share with a script tag: that page still runs as today, with no frame.
- **Out of scope:** Syntax colouring beyond default markdown code, mermaid, TOC, PDF, zip of markdown, OG screenshot of the formatted doc.

### B2 — Tell agents to send text

- **Depends on:** B1
- **Spec(s):** documents B1 (agent path); skill / MCP / `agent-docs` as the published contract
- **Work:** `src/lib/showmeatsack-skill.ts`, `src/lib/showmeatsack-tool.ts` input schema and description, `src/lib/agent-docs.ts`, plugin skill copy if it is generated from the same source, tests that the skill and MCP guide mention `text` / markdown and still mention `html` / zip. One exclusive payload in examples.
- **Done when:** The published `/skill.md` and `/mcp.md` say: markdown goes as `text`; HTML remains `html`; do not convert markdown to HTML to publish. Tool schema accepts `text`, `filename`, `kind`, `title`.
- **Out of scope:** Teaching diagrams, zip-of-markdown, or PDF until those chunks exist — one sentence “source files and markdown zips follow” is enough if the fields already exist.

### C1 — Code in a document is readable

- **Depends on:** B1
- **Spec(s):** documents B4; decision table “fenced code”
- **Work:** Highlight named languages; unnamed fences stay plain; copy control; horizontal scroll, no wrap, exact text. Tests that highlighting does not rewrite source bytes and that `.source` is unchanged.
- **Done when (manual):** A document with ` ```ts ` and a long line: colour, copy pastes exact text, long line scrolls. `.source` matches what was published.
- **Out of scope:** Agent-chosen highlight themes (Future Considerations).

### C2 — A script is shown as a script

- **Depends on:** B1, A1 (`kind` / `filename`)
- **Spec(s):** documents B5, B11, B12
- **Work:** When `kind` is `source` or inspection says this is not markdown, the read view is a named, numbered listing. Line and line-range fragment links. Unrecognised text still lists (B12). Tests for `kind: source` even when the body looks like markdown.
- **Done when (manual):** Publish a `.ts` file with `filename`. Read view shows the name, colours, line numbers. Copy a link to lines 3–5 and open it: those lines are the landing. Publish `kind: source` with a body starting `# Hello`: still a listing, not formatted markdown. `.source` is the file.
- **Out of scope:** Running, testing, or linting the script.

### C3 — Diagrams are drawn, or they degrade; they can be opened larger

- **Depends on:** B1, C1
- **Spec(s):** documents B3, B16; invariants on fail-soft and lightbox (canvas half of the invariant is out of scope)
- **Work:** Render `mermaid` fences. On failure, show that block’s source plus a short note; the rest of the document remains. Click/tap opens a larger view and closes again, including on a narrow viewport. Tests for a broken mermaid fence not failing the page.
- **Done when (manual):** A flowchart fence draws. A broken fence shows source + note; headings after it still render. Open/close the diagram on a phone-width window.
- **Out of scope:** Non-mermaid diagram languages, canvases, PDF (F1).

### D1 — A long document is navigable

- **Depends on:** B1
- **Spec(s):** documents B2 (heading links), B9
- **Work:** Heading ids; contents list when there are enough headings; arriving on a heading hash lands there.
- **Done when (manual):** A long doc shows a contents list. Open a heading link in a new tab: that heading is in view. Contents stays out of the way on a phone.
- **Out of scope:** Site-wide nav trees, search.

### D2 — A link preview shows the document

- **Depends on:** B1
- **Spec(s):** documents B13; publishing B17
- **Work:** `share-open-graph.ts`, `opengraph-image` route, crawler injection in `share-view-response.ts`. Title from A1 order. Image is of the **formatted** document, not the product home, not another share. HTML shares keep today’s screenshot path.
- **Done when (manual):** Paste a document `viewUrl` into a crawler UA or the OG image route: title matches the document; image is that document. An HTML share preview is still that page.
- **Out of scope:** PDF, custom-domain branding in the card.

### E1 — A zip of markdown is a small site

- **Depends on:** B1, C3 (so relative images and mermaid in a folder behave)
- **Spec(s):** documents B8, B12 zip rows; publishing B9 (amend: zip with neither index.html nor a document set is refused)
- **Work:** `zip-site.ts` unpack: `index.html` → existing site kind `page`. Else markdown/text + sibling images → `document` set. Front page per A1. Relative links and same-zip images work. Remote images still not fetched. Zip with neither index.html nor documents refused. Tests for wrapping folder, README default, named entry, list fallback, path stay-inside.
- **Done when (manual):** Zip `README.md` + `guide.md` + `pic.png` with a relative image and a relative link: front page is README, link and image work, `.source` for a file is exact. Zip with only `index.html` is still a raw site. Zip of empty binaries is refused.
- **Out of scope:** Search across the set, version nav, theme system.

### F1 — Save the document as a PDF

- **Depends on:** B1, C1, C3, D1
- **Spec(s):** documents B15
- **Work:** A control in the document frame (still only switch, mark, and this save — keep the frame sparse). PDF matches the read view: formatting, drawn diagrams, coloured code, plus a line with where it came from and the date taken. Tests that the control is absent on HTML shares.
- **Done when (manual):** Save PDF from a markdown share with a diagram and a code block. Open the PDF: it looks like the page, and states the view URL and the date. HTML shares have no save control.
- **Out of scope:** Saving HTML pages as PDF, keeping the PDF on the server, freezer/expiry exceptions.

---

## Order

```
A1 → A2 → B1 → B2
               ├→ C1 → C3
               ├→ C2
               ├→ D1
               └→ D2
C3 + B1 → E1
B1 + C1 + C3 + D1 → F1
```

**Critical path to the original pain (agents converting markdown to HTML):** A1 → A2 → B1 → B2.

**After B2**, a handbook `.md` can be published as `text` and read in the browser.

C1, C2, D1, D2 can proceed in parallel after B1. E1 needs the renderer and diagrams. F1 is last among document surfaces.

## Checklist (every chunk)

- [ ] Spec badges: 🟢 only with tests (and manual steps for UI). Spec `status` becomes `partial` after B1, `implemented` only when B1–B16 are all 🟢.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` for touched files.
- [ ] HTML/site shares still have no frame and still run as uploaded.
- [ ] `.source` is byte-for-byte; formatting never writes back.
- [ ] No manage token on the viewed document.
- [ ] Manual steps above, where the chunk has a UI.

## Out of this plan

- Custom domains and a paid silent mark (`specs/sharing/domains/custom-domains.md`)
- Annotations, canvases, freshness, meat locker, versions
- Editing in the browser
- Import from git or a URL
- Math, notebooks, CSV, search, agent-chosen code themes
- Running published scripts
