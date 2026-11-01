---
id: site-home
area: Site / Home
status: partial
---

# The home page

What a person sees when they arrive at show.imeatsack.com without knowing what it is. Its job is
to explain the product, prove it, and get an agent connected. `site/discoverability.md` covers
what machines read; this covers what people read.

## Behaviours

### B1 — The page says what this is before anything else 🔵 future

The first thing on the page is a plain sentence explaining what the product does, in words
someone who has never used an MCP tool can follow. Install instructions come after the
explanation, not instead of it.

### B2 — A person can see the handoff, not just read about it 🔵 future

The page shows the two halves of the product side by side — what the agent publishes, and the
page a person opens. Someone who reads nothing else can tell what the product does from the
picture.

### B3 — Connecting an agent takes one click where the client allows it 🔵 future

A person can add the MCP server to their client without copying anything, wherever that client
supports it. Where it does not, the MCP URL is one click to copy, with the plain instruction
that goes with it.

### B4 — The page shows what people actually use it for 🔵 future

Real situations, not a feature list: a long write-up that is unreadable in a chat pane, a
built site to look at before it deploys, an incident report to drop in a channel, a chart worth
seeing rather than describing, three design directions to choose between, a throwaway tool.
Someone should recognise their own problem.

### B5 — Anyone can try it without signing in 🔵 future

The page publishes a real page for a visitor and hands back a working view link they can open
and send. It needs no account — see the demo behaviour in `sharing/pages/publishing.md`.

### B6 — The page connects the I, Meatsack family 🟢 implemented

The header links I, Meatsack to `https://imeatsack.com` and offers Ask, Share and
Show at their canonical subdomains on desktop and mobile. The current product is
underlined and identified with `aria-current`. GitHub, the author and the agent
documents are in the footer.

### B7 — Signing in is reachable, and obviously not required to look 🟢 implemented

A person can get to their account from the page. Nothing about the page suggests they need an
account to read it or to try it.

The shared nav shows **Sign in**, linking to `{LANYARD_URL}/sign-in?product=showmeatsack`, on
show.imeatsack.com pages that use it (home and install). It is hidden when `LANYARD_URL` is
unset, and never appears on a view link — those pages carry no site chrome.

### B8 — The three products look like siblings 🔵 future

Ask, Share and Show share a layout, a type treatment, and a structure. They
are told apart by one accent colour and their words, not by looking like different companies.

### B9 — It works on a phone 🔵 future

Every part of the page is usable on a narrow screen, including the side-by-side picture in B2,
which stacks rather than shrinking to nothing.

### B10 — Movement is decoration and never required 🔵 future

Any animation on the page can be turned off by a person's own accessibility setting, and the
page loses nothing they needed. Nothing important is only visible mid-animation.

## Rules (Invariants)

- Both products' home pages are the same structure. Only the accent colour and the words
  differ; a change to the shape of one is a change to both.
- The page never promises that no account is needed. Publishing a page needs one. That
  account is free unless they want teams or a custom domain. What the page promises is that
  there is nothing to install and nothing to configure, and that the person who opens a view
  link never signs in.
- The account area lives on lanyard. The home page links to it and never reproduces it.
- Trying it uses the product's own demo path and produces a real view link. It is never a
  mock-up or a video.
- Copy calls the product **show.imeatsack.com**.
- Every animation respects a reduced-motion preference.
- The page is readable and usable in both light and dark, following the person's own setting.

## Decision Tables

| Visitor | What the page must let them do |
| --- | --- |
| Has never heard of MCP | Understand what it does, from the words and the picture |
| Wants to see it work | Publish a real page and open its link, without signing in |
| Ready to connect an agent | Get the MCP URL, or one-click install |
| Prefers the raw API | Copy a working `curl` |
| Wants the code | Reach the repository |
| Wants another product | Choose Ask, Share or Show from the header |
| Already has an account | Reach their account area on lanyard |

| Client | Connecting |
| --- | --- |
| Supports one-click install | A button that does it |
| Does not | Copy the MCP URL, with the instruction |
| Cannot do either | Copy the `curl` |

## User Flows

_None._ The home page is read and scanned, not navigated. Trying it is a single action that
hands over to publishing, which has its own contract.

## Open Questions

- Does the demo publish immediately on arrival, or wait for a click? Publishing on arrival is
  the better demonstration and creates a share for every visitor who never asked for one.
- Should the use cases link anywhere, or only describe? Describing is honest while there is
  nothing to link to.

## Future Considerations

- A gallery of pages people have published, if anyone ever wants theirs shown.
- Showing the same page in more than one language.
- A short recording of the handoff, for people who will not click the demo.

## Out of Scope

- Pricing pages. Ordinary publishing is free; teams and custom domains are
  paid and live on lanyard.
- A blog, changelog, or documentation site. Agent-facing documents are covered by
  `site/discoverability.md`.
- Sign-up or sign-in screens. Those belong to lanyard.
- Anything that collects a visitor's details.
