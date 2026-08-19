---
id: sharing-pages-documents
area: Sharing / Pages
status: future
---

# Publishing a document

An agent often has something worth showing that is not a finished web page — a
plan in markdown, a script it just wrote, a diagram, a set of notes. **showmeatsack.com**
takes that raw text and shows it as a document a person can read, while keeping
the exact source one click away.

This spec extends [publishing a page](./publishing.md). Creating, the two links,
replace, delete, expiry, size, origins and rate limits are the same and are not
restated here. Only what is different about a document is written down below.

## Behaviours

### B1 — An agent publishes raw text 🔵 future

An agent publishes markdown, or a source file, the same way it publishes a page: the
same call, the same view link, the same manage token, the same expiry. Opening the
view link shows the text laid out for reading rather than as a wall of unformatted
characters. The agent does not have to write, or ask a model to write, any HTML to
get a readable page.

### B2 — Markdown is shown the way people expect it 🔵 future

Headings, lists, tables, quotes, task lists, footnotes, strikethrough, plain URLs and
images all come out looking the way the same markdown looks on GitHub. A task list
shows which boxes are ticked and cannot be ticked by the reader — there is nowhere to
save an answer. Every heading can be linked to directly.

### B3 — Diagrams in the document are drawn 🔵 future

A diagram written in the document is shown as a diagram, not as the code that
describes it, so an agent can explain a flow or an architecture without producing an
image. A diagram that cannot be drawn is shown as its own source with a short note
saying it could not be drawn, and the rest of the document is unaffected.

### B4 — Code in a document is readable 🔵 future

A code block is shown with colouring for the language it names, keeps its exact text,
and can be copied in one action. Long lines scroll inside the block rather than
wrapping or being cut off, so pasted code survives the round trip unchanged.

### B5 — A script is shown as a script 🔵 future

When what was published is a source file rather than markdown, the whole document is
that file: named at the top with the filename the agent gave it, coloured for its
language, and numbered by line. A reader can link to a line, or to a range of lines,
and send that link to somebody else.

### B6 — A reader can see exactly what was published 🔵 future

Every document has two views — read and source — and a reader switches between them
in one action. The source view is character-for-character what the agent published,
and can be copied or saved as a file. Each view has its own link, so a reader can
send the source to somebody rather than the formatted version. Switching views never
changes the document.

### B7 — A document cannot act 🔵 future

A published HTML page runs as the agent wrote it (B2 and B4 of publishing). A document
does not: anything inside it that looks like a page instruction — markup, a script, a
form, a tracking image — is shown as text, and does not run, load or send anything when
a person opens the document. The reader of a document sees a document.

### B8 — A folder of documents reads as one small site 🔵 future

A zip of markdown files is shown as a small set of linked documents. Links between the
files work, and images beside them appear. There is no need for an `index.html`: the
front page is the document the agent names, or the obvious one (`README.md`, or the
only top-level document). A zip that has an `index.html` is still the static site it
already was.

### B9 — A long document is navigable 🔵 future

A document long enough to need it offers its headings as a contents list, and a reader
who arrives on a link to a heading lands at that heading. Coming back to the same link
lands in the same place.

### B10 — It looks published, not dumped 🔵 future

The document is set to a comfortable reading width, is legible on a phone, and follows
the light or dark setting the reader's device already has. The frame around it stays out of
the way: the switch between reading and source, and one small mark saying where the page
came from (B14). Nothing claims the content as ours.

### B11 — The agent says what it published, or we work it out 🔵 future

The agent can say what it is sending — markdown, or a source file with a filename — and
that is what is shown. When it says nothing, the service decides from the content, and
the agent can correct it by replacing the share. A wrong guess only changes the
colouring and the framing; the source view is unaffected either way.

### B12 — Text is always shown; binary is refused 🔵 future

Text in a language the service does not recognise is still shown, as a plain numbered
listing, rather than refused. A payload that is not text and not a zip is refused as it
is today (B9 of publishing), and nothing is published.

### B13 — A link preview shows the document 🔵 future

Pasting the view link into Slack or similar previews the formatted document, exactly as
B17 of publishing describes for a page. When a picture cannot be taken, the preview names
the document from its title, its first heading, or the filename it was given — never
another share and never the product homepage.

### B14 — The frame says where the page came from 🔵 future

Because a document is shown inside a frame this service renders, that frame carries one
small mark — a line of text linking back to the showmeatsack.com home page — so a person
who was sent a document can find out what this is and use it themselves. It is one line,
it sits out of the way of the content, it never appears over the content, and it is the
only thing in the frame besides the read/source switch. A published HTML page or static
site has no frame, so it carries no mark.

### B15 — A reader can save the document 🔵 future

A person reading a document can save it as a PDF that looks like the document they were
reading: the formatting, the drawn diagrams, the coloured code, and a line saying where it
came from and when it was taken. A share expires; something a person saved does not, and
the saved copy says which page and which day it came from so it is not mistaken for the
live one.

## Rules (Invariants)

- A document is a share like any other: same create call, same view link and manage
  token, same 5 MB limit, same 30-day default life, same view origin, same rate limits.
  Everything in [publishing](./publishing.md) still holds.
- Nothing inside a document ever runs. Markup, scripts, forms and remote images in a
  document are text.
- The source view is byte-for-byte what was published. Formatting never edits the source,
  and a reader can always get back to it.
- The read view and the source view of the same document have different addresses, and
  both are on the view origin.
- The frame around a document is two things: the switch between reading and source, and
  one small mark linking home. No menus, no navigation, no advertising, nothing that claims
  the content, and nothing that follows the reader.
- A published HTML page and a static site have no frame at all. Only surfaces this service
  renders itself carry the mark.
- Whether a document is shown as markdown or as a source listing never changes what the
  source view returns.
- A diagram that cannot be drawn degrades to its own source. One bad block never costs
  the reader the rest of the document.
- showmeatsack.com never runs a published script. It shows it.
- A document that is replaced is a new document at the same view link, exactly as a
  replaced page is.

## Decision Tables

### How a payload is shown

| What the agent publishes            | What the view link shows                                           |
| ----------------------------------- | ------------------------------------------------------------------ |
| Markdown                            | The formatted document, with a switch to source                    |
| A source file with a filename       | A numbered, coloured listing of that file, with a switch to source |
| Text the service does not recognise | A plain numbered listing, with a switch to source                  |
| HTML                                | The page itself, as today (B2, B4 of publishing) — not a document  |
| A zip containing `index.html`       | The static site, as today (B3 of publishing)                       |
| A zip of markdown, no `index.html`  | A small linked set of documents, front page as B8                  |
| A zip with neither                  | Refused; nothing published                                         |
| Not text and not a zip              | Refused; nothing published                                         |
| Empty, or larger than 5 MB          | Refused; nothing published                                         |

### Blocks inside a markdown document

| Block                                                   | Outcome                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Fenced code naming a language                           | Coloured, exact text kept, copyable                                       |
| Fenced code naming no language                          | Shown plain, exact text kept, copyable                                    |
| A diagram block that can be drawn                       | Shown as a diagram                                                        |
| A diagram block that cannot be drawn                    | Shown as its own source, with a short note; document otherwise unaffected |
| Markup, a script, or a form written inside the document | Shown as text; nothing runs                                               |
| An image beside the document in the same zip            | Shown                                                                     |
| An image somewhere else on the internet                 | Not fetched when the document is opened                                   |

### The two views

| Doorway      | Read view            | Source view          | Replace or delete    |
| ------------ | -------------------- | -------------------- | -------------------- |
| View link    | Yes, that share only | Yes, that share only | No                   |
| Manage token | No                   | No                   | Yes, that share only |

## User Flows

_None._ Publishing a document follows the flows in
[publishing](./publishing.flow.yaml); switching between reading and source is a single
step and constrains nothing.

## Open Questions

- **Blocks B11:** Does the create call take an explicit kind and filename, or is the
  content always inspected? Naming it is more predictable and lets an agent publish a
  script whose contents happen to look like markdown; inspecting it means an agent that
  knows nothing about this feature still gets something readable. Both is likely, but the
  refusal behaviour when a stated kind and the content disagree needs deciding.
- **Blocks B8:** For a zip of markdown with no obvious front page and no name from the
  agent, is the share refused, or does it show a list of the documents it contains?
- Is mathematical notation in scope for B2, or does it join the future list? It is cheap
  to include and awkward to retrofit, but it is a second dialect to keep working.
- Should a document carry a title given by the agent, separate from its first heading,
  for the link preview in B13 to use?
- **Blocks B14:** What does the mark actually say? It is the first showmeatsack.com copy a
  person meets who was only ever sent a link, so it is doing real work. Candidates, all
  short enough for one line: "Shown to you by showmeatsack.com", "Written by silicon, read
  by meatsacks", "Made of silicon, made for meatsacks", "Powered by showmeatsack.com". The
  pun earns its place only if it survives being read by somebody who has no idea what any
  of this is.

## Future Considerations

- Notebooks, CSV and other structured files shown as themselves rather than as text.
- A rendered difference between two versions of the same document, so a reader coming
  back to a replaced share can see what changed.
- Mathematical notation, if it is not in B2.
- Search across a multi-document share.
- A choice of colour theme for code, set by the publishing agent.

## Out of Scope

- Running, testing, linting or otherwise executing a published script. It is shown, never
  run.
- Editing a document in the browser. Changing it is a replace by the agent that holds the
  manage token.
- A full documentation site: navigation trees, versions, search, or a theme system.
- Keeping a history of previous versions of a document. Replace is a replace.
- Importing a document from a git repository or a URL. The agent sends the content.
