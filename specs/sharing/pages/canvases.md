---
id: sharing-pages-canvases
area: Sharing / Pages
status: future
---

# Publishing a canvas

A coding agent can already write a canvas — a single component file describing a small
interactive app, built only from a fixed toolkit of cards, tables, charts and controls.
Today that app can only be opened in the editor that made it. **showmeatsack.com** takes
the same file and gives it a link, so the person who needs to see it does not need that
editor, or any editor.

This spec extends [publishing a page](./publishing.md) and shares the frame and the source
view described in [publishing a document](./documents.md). Creating, the two links,
replace, delete, expiry, size, origins and rate limits are unchanged and are not restated
here.

## Behaviours

### B1 — An agent publishes the component file it already writes 🔵 future

An agent publishes a canvas file the same way it publishes anything else: the same call,
the same view link, the same manage token, the same expiry. It does not have to convert
it, build it, bundle it, or wrap it in a page first. The file it would have written for
its own editor is the payload.

### B2 — The view link is the running canvas 🔵 future

Opening the view link shows the canvas running — laid out, drawn, and responding to being
clicked — not its source and not a picture of it. A person who was sent the link needs
nothing installed and does not sign in.

### B3 — Only the canvas toolkit is available 🔵 future

A canvas may use the canvas toolkit and nothing else. A file that reaches for anything
outside it — a package, a file next to it, something built into the machine it runs on —
is refused when it is published, naming the import that was refused, rather than being
accepted and then failing in front of a reader.

### B4 — A published canvas cannot reach the network 🔵 future

A canvas carries its own data. It cannot fetch anything when a reader opens it, so what
the reader sees is what the agent published, and opening a canvas cannot report back to
anyone that it was opened.

### B5 — A canvas never runs on our machines 🔵 future

Turning a canvas into something a browser can run reads it and rewrites it; it never runs
it. The canvas runs in the reader's browser, on the view origin, where a published page's
scripts already run. Publishing a canvas does not create a way to run somebody's code on
our side.

### B6 — A reader can see exactly what was published 🔵 future

Every canvas has the running view and a source view, switchable in one action, exactly as
a document does (B6 of [publishing a document](./documents.md)). The source is
character-for-character what the agent published, has its own address, and is shown as
readable, coloured code.

### B7 — A canvas is interactive for the person reading it 🔵 future

Buttons, inputs, toggles, filters, sorting and anything else the toolkit offers work for
the reader. Two people opening the same link each get their own copy to poke at, and
neither can see what the other did.

### B8 — What a reader does stays with that reader 🔵 future

State a canvas keeps while somebody uses it lives in that person's browser and goes no
further. It is not sent to us, not shared with other readers, and not written back into
the share. Everyone who opens the link starts from what the agent published.

### B9 — Actions meant for an editor do not silently fail 🔵 future

Some things a canvas can ask for only make sense inside the editor that made it — open
this file, open this conversation. Published, there is no editor to ask. A canvas using
one of those is refused at publish time, naming it, rather than being published with a
button that does nothing when a reader presses it.

### B10 — Asking the agent something is feedback 🔵 future

The one editor action worth keeping is *ask about this*. On a published canvas, pressing
it leaves feedback against that canvas for the agent that published it — the same feedback
an annotation leaves (see [annotating a published page](../annotations/notes.md)) — and
the reader is told that is what it does before it happens. A canvas that asks for it, on a
share with feedback turned off, is refused at publish time.

### B11 — A canvas that breaks says so 🔵 future

If a canvas fails while a reader is using it, the reader sees a short, plain message
saying this canvas could not be shown, and can still reach the source. They do not get a
blank page, and they do not get an error meant for whoever wrote it.

### B12 — A published canvas keeps working 🔵 future

A canvas is published against the toolkit as it is on that day, and keeps being shown that
way for the life of the share. Improving the toolkit does not change, or break, a canvas
somebody published last week and is still handing round.

### B13 — The canvas follows the reader's theme 🔵 future

A canvas asks its surroundings for colours rather than fixing its own. Published, the
surroundings are the reader's device, so a canvas is light or dark to match, and stays
legible either way.

### B14 — A canvas carries the same frame as a document 🔵 future

The running canvas sits in the frame described in B14 of
[publishing a document](./documents.md): the switch to source, and one small mark linking
home. Nothing else, and nothing over the canvas itself.

### B15 — A file that is not a canvas is refused 🔵 future

A component file with nothing to show, a file that is not a component at all, or one too
large for a share is refused, and nothing is published. An agent that sends ordinary
source code gets the document behaviour instead (B5 of
[publishing a document](./documents.md)) — shown as code, not run.

## Rules (Invariants)

- A canvas is read and rewritten on our side, never run there. The only machine that runs
  a published canvas is the reader's own.
- A canvas may use the canvas toolkit and nothing else. The list of what it may use is
  decided by us, not by the file.
- Anything that would fail for a reader is refused when it is published, not discovered by
  the reader. Refusals name what was wrong.
- A published canvas makes no network requests of its own.
- A reader's use of a canvas never leaves that reader's browser unless they deliberately
  leave feedback.
- A canvas is pinned to the toolkit it was published against.
- Publishing a canvas is one file. No build step, no bundle, no second file, and nothing
  for the agent to install.
- The source view is byte-for-byte what was published, exactly as it is for a document.
- Everything in [publishing](./publishing.md) still holds: 5 MB, 30 days by default, the
  view origin, the manage token, the rate limit.
- The canvas toolkit is somebody else's design surface. We track it; we do not claim it,
  and we do not imply that its authors endorse this.

## Decision Tables

### What a canvas may reach for

| The file asks for | Outcome |
| --- | --- |
| The canvas toolkit | Available |
| A package from the internet | Refused at publish, naming the import |
| Another file in the share | Refused at publish, naming the import |
| Something built into the machine | Refused at publish, naming the import |
| The network, while a reader is using it | Not possible; the canvas carries its own data |

### What the editor-only parts do once published

| The canvas uses | Outcome |
| --- | --- |
| Colours from its surroundings | The reader's light or dark setting |
| State kept while somebody uses it | Kept in that reader's browser only |
| Ask about this | Leaves feedback for the publishing agent (B10) |
| Open a file, open a conversation | Refused at publish, naming it |

### How a payload is shown

| What the agent publishes | What the view link shows |
| --- | --- |
| A canvas component file | The running canvas, with a switch to source |
| Ordinary source code | A coloured listing (documents B5); never run |
| Markdown | A formatted document (documents B1) |
| HTML, or a zip site | The page or site, as today |
| A canvas that reaches outside the toolkit | Refused; nothing published |
| A canvas larger than 5 MB | Refused; nothing published |

## User Flows

_None._ Publishing a canvas follows the flows in [publishing](./publishing.flow.yaml).
Feedback raised from inside a canvas (B10) follows the reader flow in
[annotating a published page](../annotations/notes.flow.yaml).

## Open Questions

- **Blocks B3, B12:** The canvas toolkit belongs to somebody else, is versioned by them,
  and can change without notice. Matching it means tracking a surface we do not control,
  and a canvas written against a newer one than we have will be refused for reasons the
  agent did not cause. How much of it do we implement, how do we say which parts are
  supported, and what does the refusal say when a canvas is simply newer than we are?
- **Blocks B5:** Taking a picture of a share for a link preview already runs the published
  page's scripts in a browser we operate (B17 of [publishing](./publishing.md)). A canvas
  is no different in kind, but it makes that boundary load-bearing rather than incidental —
  is the preview browser isolated enough to be the one place we knowingly run somebody
  else's code?
- **Blocks B10:** B10 needs annotations to exist. Until then, does a canvas that asks for
  it get refused, or published with that action doing nothing?
- Is a canvas published as its own kind of payload, or is it a document that happens to be
  runnable? The frame, the source view and the refusals are shared either way; the question
  is whether an agent has to say which it is.
- Do we accept an ordinary React component that is not a canvas? It is the obvious next
  ask, and the answer is probably no: the closed toolkit is the whole reason this is
  safe to run, and a general component brings back packages, network and everything else
  the toolkit leaves out.
- Does the link preview (B17 of publishing) show the canvas as it first draws, or is a
  running app a poor thing to photograph?

## Future Considerations

- Saving a canvas as a picture or a PDF of what is on screen, the way a document can be
  saved (B15 of [publishing a document](./documents.md)).
- Letting a reader's changes be shared rather than kept to themselves — a canvas everyone
  looking at the link sees the same state of.
- Data supplied beside the canvas, so the same canvas can be republished against fresh
  numbers without rewriting the file.
- Canvases published by agents in other editors, if the same idea appears there.
- A gallery of what a canvas can look like, for agents that have never written one.

## Out of Scope

- Building, bundling, installing or type-checking on the publisher's behalf beyond what is
  needed to show the canvas.
- Running server-side code, on our machines or anybody else's. Nothing about a canvas
  changes this.
- Editing a canvas in the browser. Changing it is a replace by the agent holding the
  manage token.
- Reproducing the editor around a canvas: file trees, conversations, or anything that
  assumes the reader has the project.
- Claiming to be, or to be endorsed by, the makers of the toolkit.
