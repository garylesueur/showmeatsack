---
id: sharing-pages-freshness
area: Sharing / Pages
status: future
---

# Noticing that a page has changed

An agent replaces a share while somebody has it open. Today that person carries on reading
last week's version, and nothing tells them. They find out when they act on something that
is no longer true.

This extends [publishing a page](./publishing.md), where replacing a share already keeps the
same view link (B6). What is missing is the person who is looking at it at the time.

## Behaviours

### B1 — A page that has been replaced says so 🔵 future

A reader with a share open is told, without doing anything, that a newer version exists.
They see it as a quiet notice, not as an interruption, and they can take the new version
when they are ready.

### B2 — Nothing is ever pulled away mid-read 🔵 future

Being told is the default; being moved is not. A person who is halfway down a document, part
way through typing a note, or using a canvas keeps what they were doing until they choose to
take the newer version. A refresh that loses a half-written sentence is worse than stale
content.

### B3 — A reader can let it update itself 🔵 future

A reader can say they want the newest version as it arrives, and from then on it updates
without asking — useful when a page is being watched while an agent works on it. That choice
is the reader's, remembered for them, and never made for them.

### B4 — A share that has gone says so 🔵 future

The same check notices a share that has expired or been deleted while somebody had it open,
and tells them plainly instead of leaving them looking at a page that no longer exists.

### B5 — Only surfaces this service draws do any of this 🔵 future

A published HTML page or static site is served exactly as it was uploaded, and nothing is
ever added to it — no script, no notice, no chrome (B2 of [publishing](./publishing.md)).
Noticing a change belongs to the frame this service draws around a document, a canvas or a
review link. A publisher who wants their own page to refresh writes that themselves.

### B6 — Checking costs almost nothing 🔵 future

The check asks only which version is live, never for the content, and it happens
infrequently — of the order of every half a minute. It stops while the tab is in the
background, slows down when nothing has changed for a long time, and stops entirely once a
page has been sitting untouched long enough that nobody is reading it.

### B7 — Nobody is identified by checking 🔵 future

Asking whether a page has changed is not recorded against the person asking, does not
identify them to the publisher, and does not appear in the account's record as somebody
having read the page. Readers are never identified (B10 of
[what was changed, and by whom](../history/versions.md)), and this must not become the
exception.

### B8 — New feedback arrives the same way 🔵 future

On a review link, the same check notices that somebody else has left a note, and the notes
appear on the page. This is periodic, not live: it is not somebody's cursor, and it is not a
note appearing as it is typed, both of which stay out of scope for
[annotating a published page](../annotations/notes.md).

### B9 — A canvas is never refreshed out from under somebody 🔵 future

A canvas holds what the reader has been doing with it (B8 of
[publishing a canvas](./canvases.md)). A reader who has touched a canvas is told a newer
version exists and is never moved to it automatically, even if they asked for automatic
updates elsewhere. What they were doing is theirs.

## Rules (Invariants)

- Nothing is added to a published HTML page or static site, ever, including for this.
- Being told is the default. Being moved to a new version happens only when the reader asks
  for it, or has said they always want it.
- A reader who has interacted with what is in front of them is never moved automatically.
- The check asks for a version, not for content.
- Checking pauses in a background tab and stops when a page has plainly been abandoned.
- Checking is never recorded against a reader and never reveals a reader to a publisher.
- Expired and deleted shares are noticed by the same check and said plainly.
- Periodic refresh is not live collaboration, and does not become it by shortening the
  interval.

## Decision Tables

### Which surfaces check

| Surface | Checks | Why |
| --- | --- | --- |
| A document | Yes | The frame is ours to draw |
| A canvas | Yes, notice only (B9) | The frame is ours; the state is the reader's |
| A review link | Yes, including new feedback | The frame is ours |
| A published HTML page | Never | The page is served exactly as uploaded |
| A static site from a zip | Never | Same |

### What happens when the version changes

| What the reader is doing | Outcome |
| --- | --- |
| Reading, has not interacted | Notice shown; updates itself if they asked for that |
| Part way through typing a note | Notice shown; nothing moves until they say so |
| Using a canvas | Notice shown; never moved automatically (B9) |
| Tab in the background | No checking until they come back |
| Page abandoned for a long time | Checking has stopped; they get the current version on return |
| Share expired or deleted | Told plainly that it has gone |

## Open Questions

- **Blocks B6:** Is half a minute right, and is it the same everywhere? A document somebody
  is watching while an agent rewrites it wants seconds; a plan sent to a client last Tuesday
  wants never. The interval could follow how recently the share was replaced, which is more
  work and closer to what people actually want.
- Should a publisher be able to make a replace reach open readers immediately, rather than
  waiting for the next check? That is a genuinely different mechanism — the service telling
  the browser rather than the browser asking — and it is the right answer for a page being
  watched while it is written. It is also a connection held open per reader, which is a real
  cost for a feature whose whole premise is that changes are rare.
- Does a document that has changed say *what* changed, using the versions already kept
  ([what was changed, and by whom](../history/versions.md))? A reader coming back to a
  replaced plan would rather see the difference than re-read it.
- What should happen to a reader's place in a long document when they do take the new
  version — the same scroll position, the same heading, or the top?

## Future Considerations

- The service telling open readers immediately, for shares being actively worked on.
- Showing what changed between the version a reader has and the one that is now live.
- A reader choosing to stay on the version they were sent, deliberately, and being told it is
  no longer current.

## Out of Scope

- Adding anything at all to a published HTML page or static site.
- Live collaboration: cursors, presence, or notes appearing as they are typed.
- Telling a publisher who is reading, or how many people have a page open.
- Refreshing a canvas somebody is using.
- Keeping a reader on a version after the share it belongs to has expired or been deleted.
