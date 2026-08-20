---
id: sharing-history-versions
area: Sharing / History
status: future
---

# What was changed, and by whom

Two different things people mean by history. *What did this page look like last week, and
can I put it back?* — that is version history, and it is about content. *Who changed what,
and when?* — that is the audit trail, and it is about actions. They answer to different
rules, and the difference matters most when somebody deletes something.

This extends [publishing a page](../pages/publishing.md), and reverses an out-of-scope line
in [publishing a document](../pages/documents.md) that said replace is a replace and no
history is kept.

## Behaviours

### B1 — A replace keeps what it replaced 🔵 future

Replacing a share keeps the version it replaced. The owner can see that a share has been
replaced, when, and what each version was, rather than only ever seeing the newest thing.

### B2 — The owner can see what changed 🔵 future

With the manage token, the owner can look through a share's versions in order and see what
each one contained. For a document or a canvas, where the payload is text, they can see what
changed between two versions rather than reading both and comparing by eye.

### B3 — An earlier version can be put back 🔵 future

The owner can restore an earlier version. The view link does not change, the restored
version becomes the live one, and the restore is itself recorded — history never loses the
fact that somebody went backwards.

### B4 — Old versions are never reachable from the view link 🔵 future

Only the owner sees earlier versions. A person with the view link sees the live page and
nothing else, and no earlier version is addressable from that link. Somebody who replaces a
page *because* the old one said too much has actually fixed it.

### B5 — Versions die with the share 🔵 future

Versions are content, so they follow the share: when it expires or is deleted, they go with
it. Deleting a share deletes what it used to say, not merely what it says now.

### B6 — An account keeps a record of what it did 🔵 future

An account can see what has been done in it: shares published, replaced, restored and
deleted, domains added and removed, feedback opened and closed, a share made private or
public, plans changed. Each entry says what happened, when, and which account it belongs to.

### B7 — The record outlives what it describes 🔵 future

Deleting a share removes the pages and the versions. It does not remove the record that the
share existed, was published on a date, and was deleted on another. An audit trail that
disappears along with the evidence is not an audit trail.

### B8 — The record is about actions, never content 🔵 future

An entry says a share was replaced. It does not keep what the share said. Content lives
under B1 to B5 and dies on delete; the record survives precisely because it holds no
content, and so surviving costs nobody their privacy.

### B9 — Nobody can edit the record 🔵 future

Entries cannot be changed or removed, by the account holder or by anybody acting for them.
A record its subject can quietly correct is worth nothing to the person relying on it.

### B10 — Nobody is recorded for reading 🔵 future

Opening a view link is not recorded against the person who opened it. The audit trail says
what the account did, never who looked. A reader was sent a link; they did not sign anything.

### B11 — The record can be taken away 🔵 future

An account can export its record for a period, in a form somebody auditing it can actually
use. Getting evidence out does not require asking us.

### B12 — How much is kept depends on the plan 🔵 future

A free account gets the live version and a short record. A paying account gets full version
history and a long record with export. What is kept is stated plainly rather than discovered
when somebody needs it, and shortening never deletes what a longer plan already kept.

### B13 — Feedback and frozen copies point at a version 🔵 future

A note left on a page (B11 of [annotating a published page](../annotations/notes.md)) names
the version it was left on, so *this was fine when I looked* stays meaningful after two
replaces. A frozen copy (B9 of
[keeping something you were sent](../collections/meat-locker.md)) is a version too, and says
which one it took.

## Rules (Invariants)

- Versions are content: owner-only, never addressable from a view link, and gone when the
  share is.
- Audit entries are records of actions: they hold no content, they outlive what they
  describe, and they cannot be edited or deleted by their subject.
- Deleting a share, or an account, removes pages and versions. It does not remove the fact
  that they existed.
- No reader is ever identified in either record. Viewing is not an audited event.
- Restoring is a change like any other, and appears in both records.
- Expiry is unchanged by anything here: a restored version expires when the share was always
  going to.
- What is retained, at each plan, is published in advance. Downgrading stops new retention;
  it never destroys what was already kept.
- Every entry names the account, and whether the actor was a person on the manage link or an
  agent holding a token.

## Decision Tables

### Who sees what

| | Live page | Earlier versions | Audit record |
| --- | --- | --- | --- |
| Anyone with the view link | Yes | Never | No |
| Anyone with the review link | Yes | Never | No |
| The manage token | No — it manages, it does not read | Yes | That share's entries |
| The owning account, signed in | Yes | Yes | Yes, its own |

### What survives what

| Event | Live page | Earlier versions | Audit record |
| --- | --- | --- | --- |
| Replace | Becomes the new one | Kept | Entry added |
| Restore | Becomes the restored one | Kept | Entry added |
| Expiry | Gone | Gone | Kept |
| Delete | Gone | Gone | Kept |
| Account closed | Gone | Gone | Kept, subject to what the law requires |
| Frozen by a reader | Unchanged | Unchanged | Not an account action; not recorded |

## Open Questions

- **Blocks B7, B12:** How long is the record kept, and what happens to it when an account is
  closed? *Kept, subject to what the law requires* is what the table says today, which is a
  placeholder wearing a decision's clothes. Retention needs a number and a reason.
- **Blocks B1:** How many versions, and how large? Every replace keeping a full copy is
  simple and unbounded; a share replaced by an agent in a loop could hold hundreds. A cap by
  count, by age, or by total size all work, and they behave very differently the day
  somebody hits one.
- **Blocks B5:** Versions dying with the share contradicts nothing, but B7 sits right beside
  the recorded invariant *shares are ephemeral; this product does not keep a long-term
  archive of pages*. The reconciliation is that the archive is of actions, not pages, and
  that sentence should be amended to say so rather than being quietly outgrown.
- Does the audit trail span the estate — one record covering showmeatsack, askmeatsack and
  sign-ins from lanyard — or one per product? A person being audited wants one; three
  services with one shared record is a bigger commitment than three separate ones.
- Is a diff between versions (B2) worth building for HTML and zips, or only for the payloads
  that are text?

## Future Considerations

- Naming a version, so an owner can say which one went to the client.
- Being told when somebody else on the account changes a share.
- A signed record, for anybody who needs to prove it was not tampered with.
- Sending entries to a system the account already runs, rather than only exporting them.

## Out of Scope

- Recording who read a page. Readers are never identified (B10).
- Keeping content after a delete. The record survives; the pages do not.
- Version history on the view link, in any form.
- Editing or annotating an earlier version. History is read-only apart from restore.
- Being a compliance product. This is a record of what happened here, not evidence for
  somebody else's framework.
