---
id: sharing-annotations-notes
area: Sharing / Annotations
status: future
---

# Annotating a published page

An agent shows somebody a page and wants to know what they think of it. Instead of
asking for that back in prose, **showmeatsack.com** lets the people who open the link
mark up the thing itself — point at a spot, highlight a sentence, draw on it, and say
what they mean — and hands all of it back to the agent that published the page.

This spec builds on [publishing a page](../pages/publishing.md) and covers documents
published under [publishing a document](../pages/documents.md) too. Create, the view
link, the manage token, replace, delete and expiry are unchanged and are not restated
here.

## Behaviours

### B1 — An agent asks for opinions 🔵 future

When it publishes, or later with the manage token, an agent can ask for feedback on a
share. It gets back a third link — a review link — alongside the view link and the
manage token. The review link shows the same published page with a way to mark it up
around it. The agent sends the review link to the people whose opinion it wants; it sends
the plain view link to everyone else.

### B2 — The plain view link is untouched 🔵 future

Turning feedback on changes nothing about the view link. There is no marking-up control
on it, nothing is added to the published page, and a person who opens it sees exactly
what B2 of publishing describes. Feedback lives on the review link only.

### B3 — A reader marks a spot and says something 🔵 future

Someone with the review link can point at any part of the page — a paragraph, an image,
a chart, a corner of a layout — and write a note about that spot. The note is kept
against the place it was left, so anyone reading it later sees what it is about without
being told.

### B4 — A reader highlights words and comments on them 🔵 future

Selecting text on the page and commenting on it keeps the note attached to those words.
The note stays on the right words on a different screen size, and the quoted text is
kept with the note so it still makes sense if the page later changes.

### B5 — A reader draws on the page 🔵 future

A reader can draw freehand over the page — circle a thing, cross a thing out, put an
arrow next to a thing — and the marks are kept over the part of the page they were drawn
on. A drawing can carry a written note as well, and can be left without one.

### B6 — A reader says who they are, without an account 🔵 future

A reader gives a display name the first time they leave something, and that name is shown
against everything they leave. The name is not verified and is never presented as though
it were: it is what that person typed. Nobody signs in to leave feedback, and the same
person coming back on the same device is still themselves.

### B7 — People see what other people said 🔵 future

Everyone with the review link sees everyone else's notes on the page, can reply to them,
and can agree with them in one action. Somebody arriving late can see where opinion has
gathered rather than repeating what has already been said.

### B8 — The agent reads the feedback 🔵 future

With the manage token, the agent can read everything left on that share: every note,
reply and drawing, who left it, when, what part of the page it is attached to, and — for
a highlight — the words that were highlighted. It reads as something an agent can act on
without a person retyping it.

### B9 — The agent can tell there is something new 🔵 future

Asking about a share with the manage token says how much feedback there is and when the
most recent piece arrived, so an agent that checks back knows whether anything has
happened since it last looked, without reading everything again.

### B10 — The agent answers, and the reader sees it 🔵 future

The agent can reply to a note and mark it as dealt with. Somebody who comes back to the
review link sees the reply under their note and sees which of their points were acted on.
A person who took the trouble to leave feedback finds out what happened to it.

### B11 — Feedback survives the page changing 🔵 future

When the agent replaces the page, the notes stay. Notes that still fit the new page stay
where they were. Notes whose part of the page has gone are still shown — with what they
were attached to and a mark saying they were left on an earlier version — rather than
being silently dropped. Nobody's opinion disappears because the agent shipped a fix.

### B12 — A reader can change their mind 🔵 future

A reader can edit or remove something they left, from the device they left it on, and
cannot touch anybody else's. Removing a note removes its replies with it.

### B13 — The agent can close feedback 🔵 future

The agent can stop a share accepting anything new. Existing feedback stays readable to
everyone who has the review link, and to the agent. The agent can open it again.

### B14 — Feedback dies with the share 🔵 future

Feedback belongs to the share. When the share expires or is deleted, the notes, replies
and drawings go with it, without anyone acting. There is no separate archive of what
people said about a page that no longer exists.

### B15 — The published page cannot touch the feedback 🔵 future

The page on a review link is still untrusted content that somebody else wrote. It cannot
read what people have said, leave a note as somebody else, change or delete a note, or
find out who is reading it. Marking up happens outside the page's reach.

### B16 — A reader knows where their note goes 🔵 future

Before somebody leaves their first note, the review link tells them plainly that what
they write goes back to whoever published the page, and that everyone else with the link
will see it. Nothing about feedback is collected quietly.

### B17 — A flood of notes is refused 🔵 future

Leaving far more feedback than a person plausibly would, from one address, is refused for
a while. Nothing is saved for the refused attempt and the person is told to wait. Reading
the page and reading existing notes are not limited this way.

### B18 — Feedback never crosses shares 🔵 future

A review link shows only its own share's page and only its own share's feedback. An
unknown review link, one whose secret does not match, or one for an expired or deleted
share does not show another share's page or another share's notes, and does not accept
feedback for another share.

### B19 — The review surface says where it came from 🔵 future

The review link is a surface this service renders, so it carries the same single mark as a
document frame (B14 of [publishing a document](../pages/documents.md)) — one line linking
home, out of the way of the page and out of the way of the feedback. It never sits over
the published page, and it is the only branding anywhere on the review link. The plain
view link still has none.

### B20 — The marked-up page can be saved 🔵 future

The agent, and anybody with the review link, can save the page together with its feedback
as a PDF: the page as it stands, each note beside what it is attached to, who left it and
when, drawings where they were drawn, and which notes were dealt with. A review that
mattered survives the share expiring, and the saved copy says which day it was taken so it
is not mistaken for the live one.

### B21 — A private share can still be reviewed 🔵 future

When a share is private (B19 of [publishing](../pages/publishing.md)), its review link is
private too: only somebody the owner allows can open it, leave a note, or read what other
people said. A public share's review link stays as it is — a secret link, and nothing else
to get through.

## Rules (Invariants)

- The view link never gains a marking-up control, and the published page is never altered
  to carry one. Feedback exists on the review link only.
- The three doorways stay separate: the view link shows the page, the review link shows
  the page and its feedback and can add to it, and the manage token can read all of it,
  answer it, close it, replace the page and delete the share.
- The review link is not derivable from the view link, and the manage secret is not
  derivable from either.
- The published page cannot read, write, forge or delete feedback, and cannot learn who is
  reading it.
- A reader's name is unverified text that they typed, and is never shown as a verified
  identity.
- Nothing is collected about a reader beyond what they leave and what is needed to keep a
  flood out.
- Every note keeps enough context — where it was attached, and what it quoted — to be
  understood after the page has changed.
- Replacing the page never destroys feedback. Deleting the share always does.
- Feedback expires exactly when the share does.
- Readers have no account, so limits on leaving feedback count against the calling address.
- Feedback is ephemeral, like the share. This product does not keep a long-term record of
  what people said. Somebody who wants to keep a review saves it (B20).
- The review link carries exactly one mark saying where it came from, and no other
  branding. The published page inside it is never written over.
- A private share's review link is as private as the share.

## Decision Tables

### What each doorway may do

| Action                          | View link            | Review link                                    | Manage token           |
| ------------------------------- | -------------------- | ---------------------------------------------- | ---------------------- |
| See the published page          | Yes, that share only | Yes, that share only                           | No                     |
| See the feedback on it          | No                   | Yes, that share only                           | Yes, that share only   |
| Leave a note, drawing or reply  | No                   | Yes, while feedback is open                    | Yes, as the publisher  |
| Edit or remove a note           | No                   | Own notes only, from the device that left them | Any note on that share |
| Mark a note dealt with          | No                   | No                                             | Yes                    |
| Open or close feedback          | No                   | No                                             | Yes                    |
| Replace or delete the share     | No                   | No                                             | Yes                    |
| Save the page with its feedback | No                   | Yes, that share only                           | Yes, that share only   |

### Leaving a note

| Situation                                                          | Outcome                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Review link matches, share live, feedback open                     | The note is saved and everyone with the review link sees it |
| Review link matches, share live, feedback closed                   | Refused; existing feedback stays readable                   |
| Share expired or deleted                                           | Refused; the page and its feedback are gone                 |
| Review link unknown, or secret does not match                      | Refused; no other share's page or feedback is shown         |
| This address has left far more notes than a person plausibly would | Refused; nothing saved; told to wait                        |
| The note is empty and carries no drawing                           | Refused; nothing saved                                      |

### After the page is replaced

| The note was attached to                    | Outcome                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| Words that still appear on the new page     | Stays on those words                                                            |
| A part of the page that is still there      | Stays where it was                                                              |
| A part of the page that has gone            | Still shown, with what it was attached to, marked as left on an earlier version |
| Anything, when the share is deleted instead | Gone with the share                                                             |

### Kinds of feedback

| Kind                     | What is kept                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------- |
| A note on a spot         | The place on the page, and the written note                                         |
| A comment on a highlight | The words highlighted, and the written comment                                      |
| A drawing                | The marks, the part of the page they were drawn over, and a note if one was written |
| A reply                  | The note it answers, and the written reply                                          |
| An agreement             | Who agreed, and the note they agreed with                                           |

## User Flows

- **F1 — A reader leaves feedback:** [contract](./notes.flow.yaml) ·
  [diagram](./notes.flow.mmd) — covers B3–B7, B11–B14, B16–B18
- **F2 — The agent collects it:** [contract](./notes.flow.yaml) ·
  [diagram](./notes.flow.mmd) — covers B8–B11, B13, B14, B18

## Open Questions

- **Settled:** Feedback lives on a separate review link rather than on the view link.
  The view link serves untrusted content with no chrome around it (B2 and B14 of
  publishing), and adding a marking-up layer to it would either break that promise or put
  our controls inside reach of somebody else's HTML. A third link keeps both. Recorded as
  B1, B2 and B15.
- **Blocks B6:** Is an unverified typed name enough, or must a reader hold a lanyard token
  to leave feedback? A name is the reason this works at all — the agent sends a link to
  four people and gets four opinions back with no sign-up. Requiring an account makes the
  attribution trustworthy and kills most of the use. A middle position — anyone may leave
  feedback, and a signed-in reader is shown as verified — is probably the answer, but it
  is not decided.
- **Blocks B9:** Does the agent only ever ask, or can it be told? Asking is enough for an
  agent that is still in the conversation; a long review needs something that reaches an
  agent which has stopped running. A call-back to a URL the publisher gives is the obvious
  shape, and it is a new outbound path from this service, so it needs deciding rather than
  assuming.
- Does the agent's own reply (B10) appear as the publisher, or as a named person? The page
  was published by a bot, and pretending otherwise to the people reviewing it would be
  dishonest.
- Does asking for feedback need an account (B12 of publishing) in a way plain publishing
  does not, given that feedback means storing what other people wrote?
- Can a reader leave feedback on a specific line of a published script or document
  (B5 of documents), and if so is that the same thing as a highlight or its own kind?
- **Blocks B21:** Does a private share's review link lean on whatever unlocks a private
  view link, or is it its own thing? The same open question on [publishing](../pages/publishing.md)
  has to be settled first — there is no point deciding how feedback is gated before it is
  decided how the page itself is.
- Is the mark in B19 the same line of copy as the document frame, or does the review
  surface say something of its own? One line everywhere is easier to defend than two.

## Future Considerations

- Blind review: each reader sees only their own notes until the agent opens the rest, so
  four opinions are four opinions rather than three agreements with the first one.
- A summary of the feedback written for the agent — the themes, where people disagreed —
  rather than a list of notes.
- Feedback on a specific version, with a view of what each version was told.
- Asking named people for review and knowing who has not looked yet.
- Notes on a region of an image, rather than on the page around it.
- Composing with [askmeatsack.com](https://askmeatsack.com) so an agent can ask a
  question about a note it received.
- Turning feedback into issues in a tracker.
- A saved review that stays live — a link to the marked-up page that outlives the share.
  B20 saves a copy; this would be a different, longer-lived product.

## Out of Scope

- Real-time collaboration: seeing another reader's cursor, or notes appearing as they are
  typed.
- Editing the published page from the review link. Changing the page is a replace by the
  agent holding the manage token.
- Accounts, profiles or reputation for readers. Names are typed, not owned.
- Moderating what readers write. The agent that published the page can remove a note; the
  service does not police the content of feedback.
- Notifying readers by email when somebody replies to them.
- Keeping feedback after the share it belongs to has gone.
