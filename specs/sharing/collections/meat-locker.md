---
id: sharing-collections-meat-locker
area: Sharing / Collections
status: future
---

# Keeping something you were sent

Somebody sends you a link, you open it, it is useful, and a week later you cannot find it.
The **meat locker** is where a person keeps the pages they were sent, so they stay
findable after the conversation that produced them has scrolled away — and the **freezer**
is the part of it that keeps something after the publisher meant it to be gone.

This extends [publishing a page](../pages/publishing.md). Nothing about publishing,
viewing, replacing, deleting or expiry changes — what changes is that the person who
*opened* a link now has somewhere to put it.

## Behaviours

### B1 — A person keeps a page they were sent 🔵 future

Someone looking at a view link can put it in their meat locker in one action. It stays
there across devices and across months, and they can get back to it without the original
message, email or chat thread. Anything they can open, they can keep.

### B2 — Keeping is the first reason a reader ever signs in 🔵 future

Opening a link still needs nothing, and always will. Keeping something is the one thing
that asks a reader for an account, because there is nowhere to put it otherwise. Somebody
who does not want an account loses nothing they have today.

### B3 — The meat locker holds references, not copies 🔵 future

What is kept is a pointer to that share, plus enough to recognise it later: what it was
called, a picture of it, and when it was kept. The page itself stays the publisher's. This
is what keeps the product's promise that a publisher can always delete or replace what
they published.

### B4 — A publisher can still take it back 🔵 future

When a share is deleted, replaced or expires, the meat locker follows: a replaced page
shows the new one, a deleted or expired one shows in the meat locker as gone, with what it
was called and when it was kept, so the person knows what they lost rather than finding an
empty row. Keeping something never overrides the publisher.

### B5 — Nobody learns what you kept 🔵 future

A meat locker is private to the person it belongs to. The publisher is not told that
somebody kept their page, or how many people did, and no other reader can see anybody's
meat locker. A kept page is not a public signal of any kind.

### B6 — Things can be found again 🔵 future

A meat locker can be searched by what a page was called and looked through by when it was
kept, and things can be labelled by the person keeping them. It is a place to find one
thing again, not a feed.

### B7 — A person can throw something out 🔵 future

Anything can be taken out of a meat locker, and emptying it is possible in one action.
Taking something out never affects the share itself, or anybody else.

### B8 — Your own shares are in there too 🔵 future

An account that publishes sees what it published in the same place as what it kept, told
apart clearly. There is one list of things that matter to a person, not two.

### B9 — Freezing keeps a page past its expiry 🔵 future

Keeping something does not stop it expiring. Freezing does: a person can ask for a page to
outlive the expiry the publisher set, and it survives in their meat locker afterwards.
Because that overrides what the publisher chose, it takes a copy at the moment of
freezing, is plainly marked as a copy taken on that date, and is available only to
accounts that pay for the room it takes up. A publisher can say at publish time that a
share may not be frozen.

### B10 — A private share stays private in the meat locker 🔵 future

A private share (B19 of [publishing](../pages/publishing.md)) can be kept, and stops
opening from the meat locker the moment that person is no longer allowed to see it. The
meat locker never becomes a way to hold on to access somebody has taken away.

### B11 — Keeping works on any host 🔵 future

A page served from an account's own domain ([custom domains](../domains/custom-
domains.md)) is kept the same way, and remembers the host it was kept from, so it opens
where the reader first saw it.

### B12 — What you publish is already in your locker 🔵 future

An account that publishes while signed in does not have to remember to keep anything. What
it publishes is in its own meat locker from the moment it exists, findable later without
having gone back to the conversation that produced it. Keeping is for other people's
pages; your own are simply there.

### B13 — Your own things are extended, not frozen 🔵 future

Freezing (B9) exists because keeping somebody else's page past its expiry overrides their
choice. Your own page is your choice: an owner extends its life instead (B20 of
[publishing](../pages/publishing.md)), which changes the live share rather than taking a
copy of it. Nobody freezes their own work.

### B14 — Expiry ends the link, not your own copy 🔵 future

When an account's own share expires, the view link stops working for everybody, as it
always has. The content stays in that account's meat locker, because they wrote it.
Realising a fortnight later that something was worth keeping is the normal case, not the
exception, and it should not depend on having known at the time.

### B15 — Unpublishing and deleting are different 🔵 future

An owner can take a share down — the link dies, the content stays in their locker — or
delete it, which removes both and cannot be undone. The difference is said plainly at the
moment of choosing, because one of them is recoverable and the other is the end.

### B16 — Your own things can be named 🔵 future

An owner can rename anything in their locker. A page published by an agent mid-task is
often titled something nobody would search for, and an account that publishes to itself
several times a day accumulates them quickly.

## Rules (Invariants)

- Opening a view link never requires an account. Keeping one does. Publishing while signed
  in needs nothing extra: it is already kept.
- An owner's own content surviving its expiry is not the same as the share surviving it.
  The view link dies on time, for everybody, always.
- Taking a share down and deleting it are different acts with different consequences, and
  the difference is stated before either happens.
- Losing a plan never deletes an owner's own kept content. It stops new retention, as
  everywhere else.
- A meat locker holds references. The publisher keeps control of the content, always.
- Expiry, replace and delete reach the meat locker. Nothing kept survives a publisher's
  delete, unless it was frozen (B9), which is a copy and says so.
- A meat locker is private. Publishers learn nothing about who kept what, including
  totals.
- Nothing in a meat locker is public, shared, ranked, recommended, or shown to anybody
  else.
- A frozen copy is marked with the date it was taken and is never presented as the live
  page.
- A publisher may forbid freezing on a share.
- Losing a plan never deletes what somebody kept; it stops new freezing, not the meat
  locker.

## Decision Tables

### What the meat locker shows

| The share | In the meat locker |
| --- | --- |
| Live | Opens as normal |
| Replaced | Opens, showing the new page |
| Expired | Shown as gone, with its name and when it was kept |
| Deleted | Shown as gone, with its name and when it was kept |
| Private, still allowed | Opens as normal |
| Private, no longer allowed | Shown as no longer available |
| Frozen before it expired | Opens as the copy, marked with the date it was taken |
| Your own, expired | The link is dead; the content is still yours to read (B14) |
| Your own, taken down | The link is dead; the content is still yours to read (B15) |
| Your own, deleted | Gone, and not recoverable (B15) |

### Who can do what

| Action | A reader with no account | A signed-in reader | The publisher |
| --- | --- | --- | --- |
| Open a view link | Yes | Yes | Yes |
| Keep it | No | Yes | Yes |
| Freeze it | No | On a paying plan, unless forbidden | Sets whether freezing is allowed |
| See somebody's meat locker | No | Their own only | No |
| Learn that it was kept | No | No | No |

## Open Questions

- **Blocks B9:** Freezing takes a copy of somebody else's work and outlives their delete.
  The publisher's opt-out (B9) makes it defensible, but the default matters: frozen-
  unless- forbidden is useful and rude, forbidden-unless-allowed is polite and probably
  unused. Whichever is chosen, it belongs in the publishing spec's invariants as well as
  here.
- **Blocks B9:** Freezing is the first time this service stores a page beyond its expiry,
  which contradicts *shares are ephemeral; this product does not keep a long-term archive*
  in [publishing](../pages/publishing.md). That invariant has to be amended honestly or
  freezing has to go.
- Does the meat locker span the estate — pages you were shown and questionnaires you
  answered in one place? One locker is a better product and a bigger commitment than two
  lists.
- **Settled:** The place is the **meat locker** and the mechanic is the **freezer** —
  *freeze it* to keep a page past its expiry. The metaphor and the function genuinely
  agree, since freezing is what stops something going off, and a meat locker really is a
  cold room with a freezer in it. It is American usage against a British-English house
  style, and it is funnier, which decided it. Alternatives considered: larder, cold store,
  chiller, pantry.
- **Blocks B14:** An owner's content outliving the share's expiry needs squaring with
  *shares are ephemeral; this product does not keep a long-term archive of pages* in
  [publishing](../pages/publishing.md). The reconciliation is that the promise is about
  the link, and about other people's access, not about an author's own copy of their own
  work — and that sentence should be amended to say which it means.
- **Blocks B14:** How much can an account keep, and for how long? Somebody publishing to
  themselves several times a day is a storage bill with a person attached. A cap by size
  or age, per plan, is the obvious answer and it should be stated before anybody relies on
  it.
- Does an agent publishing on an account's behalf get to say *this one matters*, so a
  locker full of working pages does not bury the three worth finding?
- Does an agent get to put things in a person's meat locker, or is keeping always
  something a person does?

## Future Considerations

- Sharing a meat locker, or part of one, with somebody else.
- Folders, or a locker per client, for people keeping work for more than one customer.
- Being told when something kept is about to expire, so it can be frozen in time.
- Keeping a page from askmeatsack.com — a questionnaire you answered — in the same place.
- An agent asking what is in its own account's meat locker, so it can find what it
  published last month.

## Out of Scope

- Anything public: no discovery, no popular pages, no recommendations, no counts.
- Reading somebody else's meat locker, ever, including the publisher reading who kept
  their page.
- Keeping a page the person could not open in the first place.
- Editing or annotating from the meat locker. Feedback is the review link's job.
- Becoming a long-term archive of the web. A meat locker holds what a person was actually
  sent.
