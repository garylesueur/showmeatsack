# Sharing

**showmeatsack.com** — an agent posts HTML or a small static-site zip and gets a view link to share. The tool is named showmeatsack.com. Create also returns a manage link to replace or delete that share.

| Spec | Covers | Status |
| --- | --- | --- |
| [Publishing a page](./pages/publishing.md) | Create, view URL, manage URL, HTML, zip site, replace, delete, expiry, private shares, extending a share's life, open create, path stay-inside, view origin, rate limit, bearer token, link preview | implemented |
| [Publishing a document](./pages/documents.md) | Markdown and source published as raw text, GitHub-style formatting, diagrams, highlighted code, read/source views, a zip of markdown, a document cannot act | future |
| [Publishing a canvas](./pages/canvases.md) | An agent's canvas component file given a link, the closed toolkit as the safety boundary, never run on our machines, interactivity per reader, actions as feedback | future |
| [Noticing that a page has changed](./pages/freshness.md) | A reader told when a share is replaced, never moved mid-read, opt-in automatic updates, expired and deleted noticed, nothing ever injected into published HTML, checking never identifies a reader | future |
| [Annotating a published page](./annotations/notes.md) | Review link, notes on a spot, comments on highlighted words, drawings, replies and agreement, unverified reader names, the agent reading and answering feedback, closing it, surviving replace | future |
| [Serving shares from your own domain](./domains/custom-domains.md) | Proving a domain, why a share host cannot sit beside a sign-in, certificates, their mark instead of ours, removing ours on a paid plan, always reachable on the default host, no takeover on release | future |
| [Keeping something you were sent](./collections/meat-locker.md) | The meat locker, keeping a page you were sent, references not copies, a publisher can still take it back, private to the keeper, the freezer for keeping one past its expiry | future |
| [What was changed, and by whom](./history/versions.md) | Versions kept on replace, restoring one, never reachable from a view link, an account record that outlives what it describes, holds actions not content, nobody recorded for reading | future |

Read [publishing](./pages/publishing.md) before changing how shares are created, viewed, replaced, deleted, or expired. The four newer specs extend it and do not restate it; custom domains changes the frame the document, canvas and annotation specs describe.
