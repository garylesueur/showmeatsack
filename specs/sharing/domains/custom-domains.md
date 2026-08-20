---
id: sharing-domains-custom-domains
area: Sharing / Domains
status: future
---

# Serving shares from your own domain

Not everybody wants to send a client a link with our name in it. An account can point a
domain it owns at **showmeatsack.com** and have its shares served from there, with its own
mark on the frame instead of ours.

This spec extends [publishing a page](../pages/publishing.md) and changes the frame
described in [publishing a document](../pages/documents.md) and
[annotating a published page](../annotations/notes.md). Everything else about a share —
create, the two links, replace, delete, expiry, size, rate limits — is unchanged.

## Behaviours

### B1 — An account serves shares from a domain it owns 🔵 future

An account can add a domain it controls. Once it is working, that account's new shares get
view links on that domain instead of the default view host, and open exactly as they do
today. The page is the page; only the host in the link changes.

### B2 — A domain is proved before anything is served from it 🔵 future

Adding a domain does not serve anything. The account is given something to put in that
domain's DNS, and until we can see it, no share is served there. Nobody can attach a
domain they do not control, and an account cannot claim a domain another account has
already proved.

### B3 — A domain that shares a name with something that matters is refused 🔵 future

Published pages are somebody else's HTML, and a browser treats a subdomain as part of the
family it belongs to. A share host under a domain that also carries a sign-in, an
application, or session cookies puts untrusted pages inside reach of them. That is the
reason our own view host is a separate origin. So a domain is checked before it is
accepted, an account is warned in plain words about what it is about to do, and a host
that sits under a domain we can see carries a live application is refused rather than
merely warned. A dedicated domain, or a subdomain of one used for nothing else, is the
shape that is accepted.

### B4 — The certificate is our problem, not theirs 🔵 future

Once a domain is proved, the account does not manage certificates, renewals or expiry.
Links keep working. If a renewal cannot be completed, the account is told before anything
stops working, and shares stay reachable on the default host in the meantime (B7).

### B5 — The frame carries their mark, not ours 🔵 future

On a share served from an account's own domain, the mark in the frame (B14 of
[publishing a document](../pages/documents.md), B19 of
[annotating a published page](../annotations/notes.md)) is theirs: their name, and a link
they choose. A plain HTML page or static site still has no frame at all, so this only
changes documents, canvases and review links.

### B6 — Our mark can be removed, by an account that pays 🔵 future

An account on a paying plan can have the mark say nothing about showmeatsack.com. A free
account keeps our mark. This is the visible half of what paying buys, and it is also a
control on abuse (B12) rather than only a preference.

### B7 — Losing the domain does not lose the shares 🔵 future

Every share always keeps working on the default view host as well as on the account's
domain. If the domain stops resolving, the certificate lapses, the account removes it, or
the account stops paying, the pages do not go dark — links on the default host still open
them. An account's content is never held hostage to its billing.

### B8 — Giving a domain up does not leave a door open 🔵 future

When a domain is removed, or an account is closed, we stop serving that host at once, and
no other account can take it over without proving control of it themselves. A domain that
still points at us but is no longer claimed serves nothing, rather than serving whatever
the next account to ask for it uploads.

### B9 — One account's shares share an origin with each other 🔵 future

Shares on one account's domain sit on the same origin as each other, so one page that
account published can reach another that account published. It cannot reach a share
belonging to anybody else, and nothing on the default host changes. An account should
know this before it puts two unrelated clients' pages on one domain.

### B10 — Custom domains are for accounts that pay 🔵 future

Adding a domain needs an account and a plan that includes it. Publishing without a domain
stays as it is, including for free accounts. Losing the plan follows B7: the domain stops
being served, the shares do not stop existing.

### B11 — A link preview from their domain names them 🔵 future

A share opened from a custom domain previews as it does today (B17 of
[publishing](../pages/publishing.md)) — a picture of that page, on that host, with their
mark rather than ours. The preview never names showmeatsack.com on an account that has
paid for it not to.

### B12 — A domain is not a costume 🔵 future

A custom domain plus a chosen mark is exactly what somebody impersonating a business would
want, so what an account may put in that mark is checked, and a domain or a mark that
passes itself off as somebody else is refused. Feedback about a domain being used to
deceive reaches a person, and a domain can be stopped without the account having to be
deleted.

### B13 — A private share stays private on their domain 🔵 future

A private share (B19 of [publishing](../pages/publishing.md)) served from an account's own
domain is still private, and is unlocked the same way. A custom domain never becomes a way
round the rules on who may open a share.

## Rules (Invariants)

- No host is served before control of it is proved, and no two accounts hold the same host.
- A share is always reachable on the default view host. A custom domain is an addition, not
  a replacement.
- Nothing an account does with domains or branding changes what a share *is*: the payload,
  the manage token, expiry, size and rate limits are the same on any host.
- Published content is untrusted on every host it is served from, including theirs. A
  custom domain does not make a page trusted.
- A share host is never placed where a browser would treat it as part of a domain carrying
  a sign-in, an application or session cookies.
- Certificates, renewal and the default-host fallback are ours to run. An account is told
  before a link stops working, never after.
- Removing a domain stops it being served immediately, and releases it to nobody.
- Only the frame changes with branding. A published HTML page or static site is served
  exactly as it was uploaded, unbranded, on any host.
- Custom domains and mark removal need a paying plan; content never stops working because
  a plan does.
- What an account may claim in its mark is checked. A domain does not buy the right to be
  somebody else.

## Decision Tables

### Adding a domain

| Situation | Outcome |
| --- | --- |
| Domain proved, used for nothing else | Accepted and served |
| Proof not yet visible in DNS | Nothing served; the account is told what is missing |
| Domain already proved by another account | Refused |
| Host sits under a domain we can see carries a live application | Refused, with the reason |
| Account has no plan that includes domains | Refused |
| Certificate cannot be issued or renewed | Told before it matters; shares stay on the default host |

### Which host serves a share

| State | Custom host | Default view host |
| --- | --- | --- |
| Domain proved, plan live | Serves the share | Also serves the share |
| Domain removed, or plan ended | Serves nothing | Serves the share |
| Domain never proved | Serves nothing | Serves the share |
| Share expired or deleted | Nothing, on either | Nothing, on either |

### What the frame says

| Account | Frame on a document, canvas or review link | Plain HTML page or zip site |
| --- | --- | --- |
| Free, default host | Our mark, linking home | No frame |
| Paying, custom domain | Their mark, linking where they choose | No frame |
| Paying, mark removed | Nothing about showmeatsack.com | No frame |

## Open Questions

- **Blocks B6, B10:** Where does a plan live? lanyard records two fixed decisions that this
  idea contradicts — *one free plan, and no plan concept*, and *verification returns an
  account reference and nothing else*. Either each product carries its own plans keyed by
  that account reference and lanyard stays as small as it is, or lanyard grows a concept it
  deliberately refused. The first preserves a contract three services build against, at the
  cost of an account paying twice for two products. This is not a showmeatsack decision to
  take alone.
- **Blocks B3:** How hard is the check on a domain that carries something else? We can see
  whether a host answers and what it looks like, and we cannot see cookies scoped to a
  parent domain. A refusal we cannot always enforce is a warning wearing a refusal's
  clothes, and it needs to be written down as whichever it really is.
- **Blocks B12:** Who reviews a mark, and how fast? An automatic check on the words plus a
  person on report is the usual answer, and it needs somebody to actually be that person.
- Does an account get one domain or several — one per client, say — and does a share choose
  between them at publish time?
- Do shares published before a domain was added move onto it, or does the host a share was
  born on stay with it for life? Keeping the host stable is kinder to links already sent.
- Does a custom domain get its own per-share isolation (the per-share subdomain in
  publishing's future list), or does B9 stand as the accepted answer?

## Future Considerations

- A per-share subdomain under the account's domain, so one of their pages cannot reach
  another (B9).
- More of the frame under their control than a name and a link — a logo, a colour, a
  typeface.
- A landing page on their domain listing what they have published, for accounts that want
  one.
- Bringing a certificate they already hold, rather than us issuing one.
- The same domain serving both showmeatsack.com and askmeatsack.com surfaces, so a client
  sees one name across a page they were shown and a form they were asked to fill in.

## Out of Scope

- Selling or registering domains. An account brings one it already owns.
- Running DNS for an account, or editing their records for them.
- Branding a plain HTML page or a static site. The publisher already controls that content
  entirely; there is no frame to brand.
- Making published content trusted because it is on a familiar host. It never is.
- Per-share branding chosen by the calling agent. Branding belongs to the account.
