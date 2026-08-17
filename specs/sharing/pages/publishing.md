---
id: sharing-pages-publishing
area: Sharing / Pages
status: implemented
---

# Publishing a page

**showmeatsack.com** is how an agent shares an HTML page, or a small static site, with a person. Create returns a view link that *is* the page, and a manage link that can replace or delete it. The page stays up until it expires or is deleted.

## Behaviours

### B1 — Agent publishes a page 🟢 implemented

An agent calls the **showmeatsack.com** tool, or sends the same payload over HTTP. It sends either an HTML page or a zip of a small static site, and may set an expiry sooner than the default. It always receives a showmeatsack.com view link (to put in the conversation, or anywhere else the agent already can post), a manage link, and when the share will expire. The showmeatsack.com tool and HTTP produce the same share.

### B2 — The view link is the page itself 🟢 implemented

Anyone who opens the view link in a browser sees the uploaded page. There is no showmeatsack.com chrome around it, and scripts and styles in the page are not stripped. The page looks as the agent published it.

### B3 — A zip is a small static site 🟢 implemented

A zip is served as a site. It must include `index.html` at the zip root, or inside a single wrapping folder. Files next to that page (styles, scripts, images, fonts, and so on) are available at paths under the same view link, using the relative names they had in the zip. Opening the view link shows `index.html`.

### B4 — A single HTML body is the page 🟢 implemented

When the agent sends HTML rather than a zip, that HTML is the page. The view link shows it. There are no other files on that share.

### B5 — The two links have different powers 🟢 implemented

The view link can only show that share’s page and its own files. It cannot replace the share, delete it, or read the manage secret. The manage link can replace that share, delete it, and see that it is still live and when it will expire. The viewed page never shows the manage secret. Someone with only the view link cannot act as the manager.

### B6 — Manage can replace the page 🟢 implemented

Using the manage link, the agent can replace the whole share with new HTML or a new zip. The view link stays the same. After a successful replace, someone who opens the view link sees the new page, not the old one. A refused replace leaves the live page as it was.

### B7 — Manage can delete the page 🟢 implemented

Using the manage link, the agent can delete the share. After that, the view link no longer shows the page. Delete when already deleted still succeeds as gone.

### B8 — The share expires 🟢 implemented

If the agent does not set an expiry, the share lasts 30 days from create. The agent may choose a sooner expiry, never later than 30 days. After the expiry time, the view link no longer shows the uploaded page, without anyone acting. A new share is a new link.

### B9 — A bad payload is refused 🟢 implemented

Create or replace is refused, and nothing is published or changed, when the payload is empty, larger than 5 MB, not HTML and not a zip, or a zip that does not contain `index.html`. The agent is told it was refused.

### B10 — A broken or unknown link does not leak another share 🟢 implemented

An unknown share, a link whose secret does not match, an expired share, or a deleted share does not show another share’s page and does not accept replace or delete for another share.

### B11 — Tool and HTTP produce the same share 🟢 implemented

The showmeatsack.com tool and HTTP take the same kind of payload and return the same view link, manage link, expiry, and later the same replace, delete, and status result for that share.

### B12 — Create is open 🟢 implemented

Publishing a page does not need an account or a shared API key. Anyone who can call the tool or the HTTP create endpoint can publish and receives that share’s manage link.

### B13 — A path cannot leave the share 🟢 implemented

A visitor cannot use the view link to see files from another share, or files that were not in this share. A path that tries to leave the share is refused. Only that share’s files are shown.

### B14 — A link preview shows the page 🟢 implemented

When the view link is pasted into Slack or another app that fetches a link preview, the preview image is a picture of that share’s uploaded page — not the showmeatsack.com homepage, and not another share. A person who opens the same link in a browser still sees the uploaded page, with no extra chrome around it.

## Rules (Invariants)

- The view link never grants replace or delete.
- The manage secret never appears in the viewed page or in anything the browser is given to run.
- One share is at most 5 MB, whether it is HTML or a zip.
- Default life is 30 days from create. The creator may ask for shorter, never more than 30 days.
- Expired and deleted shares stay gone without anyone acting.
- The viewing origin has no account cookies, so a raw page is not sitting next to a sign-in.
- Tool and HTTP are equivalent: same payload in, same share, same view and manage links out.
- The agent tool is named **showmeatsack.com**. View links are on `https://showmeatsack.com`.
- User-facing copy calls the product **showmeatsack.com**.
- A zip’s homepage is `index.html` at the zip root, or inside a single wrapping folder (the usual “zip a folder” case). Relative files in that zip are part of the same share.
- A person opening the view link receives the uploaded page as published. Extra Open Graph tags are only for link-preview crawlers, and they do not change how the page looks.
- A link preview for one view link never shows another share’s page.
- Replace changes the files only. Expiry stays as it was at create.
- After a successful replace, the next open of the view link shows the new page.
- An expired view link shows a short “this share has expired” page. An unknown or deleted link shows a generic not-found. Neither reveals another share.
- Create is open. There is no shared bearer to hand out. Manage still needs that share’s manage secret.
- Shares are ephemeral. This product does not keep a long-term archive of pages.

## Decision Tables

### Payload

| What the agent sends | Outcome |
| --- | --- |
| HTML, not empty, at most 5 MB | Published (or replaced); view link shows that HTML |
| Zip containing `index.html`, at most 5 MB | Published (or replaced); view link is that site |
| Zip with no `index.html` | Refused; nothing published or changed |
| Empty HTML or empty zip | Refused; nothing published or changed |
| Larger than 5 MB | Refused; nothing published or changed |
| Neither HTML nor a zip | Refused; nothing published or changed |

### Link preview

| Who fetches the view link | Outcome |
| --- | --- |
| A person in a browser | The uploaded page, unchanged |
| A link-preview crawler, share still live | Preview image is a picture of that share’s page |
| A link-preview crawler, expired, deleted, or unknown | No preview of another share |

### What each doorway may do

| Action | View link | Manage link (showmeatsack.com tool or HTTP) |
| --- | --- | --- |
| Publish a new page | No | Yes (create is open; no existing manage secret needed) |
| See this share’s page and its files | Yes, that share only | No |
| Replace this share | No | Yes, that share only |
| Delete this share | No | Yes, that share only |
| See that it is live and when it expires | No | Yes, that share only |
| See the manage secret | No | It *is* the secret |

### Lifecycle

| State | View link | Manage replace or delete | Manage status |
| --- | --- | --- | --- |
| Just created, still within expiry | Shows the page | Allowed | Live, with expiry |
| Replaced, still within expiry | Shows the new page | Allowed | Live, with expiry |
| Expiry time has passed | Does not show the uploaded page | Refused | Gone |
| Deleted | Does not show the uploaded page | Delete still succeeds as gone; replace refused | Gone |
| Unknown, or secret does not match | Does not show another share | Refused | Does not reveal another share |

### Replace

| Situation | Outcome |
| --- | --- |
| Manage secret matches; payload would be accepted on create | Share replaced; view link unchanged; visitors see the new page |
| Manage secret matches; payload would be refused on create | Refused; live page unchanged |
| View link only, or secret does not match | Refused; live page unchanged |
| Share already expired or deleted | Refused |

## User Flows

- **F1 — Publish and manage:** [contract](./publishing.flow.yaml) · [diagram](./publishing.flow.mmd) — covers B1, B5–B12
- **F2 — Visitor opens the view link:** [contract](./publishing.flow.yaml) · [diagram](./publishing.flow.mmd) — covers B2–B5, B8, B10, B13–B14

## Open Questions

- **Settled:** After a successful replace, the next open of the view link shows the new page. Recorded as B6 and the invariants.
- **Settled:** An expired view link shows a short “this share has expired” page. Unknown or deleted shows a generic not-found. Recorded as B8, B10, and the invariants.
- **Settled:** Replace does not change expiry. Life stays as it was at create. Recorded as B6 and the invariants.
- **Settled:** The product is **showmeatsack.com**. The domain is live. The agent tool is named **showmeatsack.com**. View links are on `https://showmeatsack.com`. Recorded as B1 and the invariants.
- **Settled:** A zip with `index.html` inside a single wrapping folder is accepted as that site. Recorded as B3 and the invariants.
- **Settled:** Pasting the view link into Slack or similar should unfurl a picture of that uploaded page, not the product homepage. Recorded as B14.

## Future Considerations

- Large binary files, or a FileSnare-style transfer product.
- An agent composing with askmeatsack.com to send the view link (no product hook required; the agent already has the URL).
- Accounts, listing every share, quotas, custom slugs, or a password on the view link.
- A separate origin or subdomain so untrusted HTML is isolated from the product site.

## Out of Scope

- Sign-in, accounts, dashboards, or listing all shares.
- Email or Slack posting. The calling agent does that with the URL this service already returns.
- Server-side code, build pipelines, or deploying from git.
- Big-file transfer.
- A built-in askmeatsack.com or FileSnare integration.
