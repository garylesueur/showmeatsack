---
id: sharing-pages-qr-codes
area: Sharing / Pages
status: partial
---

# Publishing a QR code

An agent gives showmeatsack.com a destination URL and gets a share whose page, download and link preview show a QR code for that destination. This extends [publishing a page](./publishing.md): the existing view link, manage token, origins, size limit, rate limit, replace, delete and expiry rules still apply.

## Behaviours

### B1 — An agent publishes a URL as a QR code 🟢 implemented

An agent supplies an absolute HTTP or HTTPS URL and may supply a title. The same create call works through the tool and HTTP and returns the usual view link, manage URL, manage token and expiry. The agent supplies exactly one kind of content. If no title is supplied, the share is named for the destination host.

### B2 — Opening the share shows the QR and its destination 🟡 partial
> Desktop and mobile-width browser checks pass; a real phone scan remains unverified.

A reader sees a large QR on a white background (black for Classic/Action, deep kelp for Brand), its title, and the destination URL. The page fits a phone screen. The code can be scanned from another device. An Open link button takes a reader to the destination directly, so someone already on their phone does not have to scan their own screen. Showing the page never opens the destination automatically.

### B3 — The reader can download the QR as a PNG 🟢 implemented

The reader can save a PNG of the QR, without the surrounding page. It encodes the same destination as the QR on the page and retains its clear border. A saved copy can keep working after the share expires or is deleted if the destination remains available.

### B4 — A link preview contains the QR itself 🟡 partial
> The image endpoint and independent decoding pass; a real chat unfurl remains unverified.

When the view link is pasted into an app that displays its preview image, the image contains this share's QR and the preview title identifies it. The code remains readable at supported preview sizes. Producing a QR preview does not depend on taking a picture of the page or running a script. A busy or unavailable page-capture service cannot substitute a title-only card for the QR.

### B5 — Manage replaces the QR at the same view link 🟢 implemented

The existing manage token can replace the QR's destination and title. After a successful replace, a fresh page, download or preview fetch receives the new QR. Replacing a QR with another supported content kind changes the page and preview to that content; replacing ordinary content with a QR changes them to the QR. The view link and expiry stay the same. An invalid payload or failure to generate the QR leaves the live share unchanged. Other apps may retain a previously fetched preview temporarily.

### B6 — A bad QR request is refused before publication 🟢 implemented

A missing or invalid destination, a URL with a scheme other than HTTP or HTTPS, embedded URL credentials, control characters, a URL over 512 UTF-8 bytes, a title over 120 characters, or more than one content kind is refused with a useful explanation. If the QR cannot be generated within the supported limits, nothing is published. The service does not visit a destination to validate it.

### B7 — QR files and previews follow the share's lifecycle 🟢 implemented

After expiry or deletion, a fresh request cannot read the QR page, its PNG or its preview from showmeatsack.com. An unknown share cannot return another share's code. The manage secret never appears in the QR, page, downloadable file or preview. A QR already downloaded or retained by another app is outside the service's ability to recall.

### B8 — A reader can download an SVG 🟢 implemented

The same share also offers a scalable SVG of the QR, encoding the same destination and preserving its clear border. The SVG is offered alongside PNG; Open Graph remains a PNG image.

### B9 — An agent can choose a curated card style 🟡 partial
> Generation and local scan checks are implemented; real chat/phone verification remains at final verification.

An agent can select a Classic, Brand or Action card style. The share page and its preview reflect that choice, and every style preserves a readable QR. Unsupported options are refused without changing a live share. The optional `qr.style` accepts `classic`, `brand` or `action`; omission selects Classic. Classic keeps the square 1024-pixel QR preview. Brand uses deep kelp (`#0b2923`) modules on white, a five-module clear border, and a cream card. Action uses black modules on white and a dark green card with the title and Scan to open. Brand and Action generate a 1200 × 630 PNG preview with the code prominent, the title, and destination host outside its clear border. Preview labels may be shortened; the page, metadata and encoded destination remain exact. PNG and SVG downloads contain the code alone in the preset’s colour.

## Rules (Invariants)

- The QR encodes the accepted destination exactly, including its query string and fragment. The service does not shorten it or replace it with the view link or an intermediate redirect.
- The page, Open link button, downloads and preview agree on the destination for a freshly fetched live share.
- Every code retains a clear border at least four modules wide on every side. Every preset uses square modules and an opaque white background.
- The first release accepts URL payloads only. Wi-Fi credentials, contact cards and arbitrary text are separate future decisions.
- The QR and page work without browser scripts or remote image services.
- The existing 5 MB share limit includes all generated assets.
- HTTP and the showmeatsack.com tool have equivalent behaviour.
- Preview fetching grants only the ability to view this share, never manage it.
- Existing HTML, markdown and zip shares retain their own preview behaviour. Only a service-generated QR share gets the QR-specific preview.
- Replace does not extend expiry. The hosting lifetime and the destination's lifetime are distinct.
- A fresh request after a share is gone does not return its content; copies already held elsewhere cannot be recalled.

## Decision Tables

### Publishing

| Input | Outcome |
| --- | --- |
| One supported URL, with an optional title inside the limits | Published as a QR share |
| No title | Title identifies the destination host |
| No style | Classic code and square preview |
| Brand or Action style | Matching page/downloads and landscape QR preview |
| Unsupported style | Refused before publication or replacement |
| QR and HTML, markdown or zip together | Refused; nothing published or replaced |
| Unsupported scheme, missing URL, credentials, control characters or an exceeded limit | Refused with an explanation |
| Generation fails before files are written | Nothing published; an existing share remains unchanged |
| Destination is unavailable | Not fetched or checked; the QR still encodes the supplied URL |

### Viewing and managing

| Situation | Outcome |
| --- | --- |
| A reader opens a live QR share | QR page with destination, Open link and PNG/SVG downloads |
| A crawler requests a live QR preview | Stored QR image and matching metadata; no page capture |
| An ordinary share contains a file named like a QR asset | Remains an ordinary share; no automatic change of preview mode |
| Manage replaces QR with QR | Same view link and expiry; newly fetched page, PNG, SVG and preview agree on the new destination |
| Manage replaces QR with another supported content kind | Page and preview follow that kind; the previous QR assets are no longer served |
| Manage replaces ordinary content with QR | Page and preview show the new QR |
| Expired, deleted or unknown share | No QR content served on a fresh fetch; ordinary gone/not-found rules apply |

## User Flows

_None._ QR publishing and management use the existing [publishing flows](./publishing.flow.yaml). Opening the destination and downloading an image are single actions. The publishing contract refers to this extension for the QR-specific input and preview outcome defined here.

## Open Questions

- **Settled for the first-release plan:** The QR encodes the destination directly. PNG and SVG exports plus Classic, Brand and Action presets are included in the current assignment.
- **Settled:** The URL bound is 512 UTF-8 bytes and the title bound is 120 characters. The URL bound passed independent decoding at a 256-pixel preview size, including an exact 512-byte payload; real-client presentation is still part of B4's verification.
- **Settled for B9:** Classic, Brand and Action use the fixed palettes and preview layouts described above. The user authorised completing the proposed presets after the plain page refinement, with external checks last. Brand’s code colour was darkened and its clear border expanded to five modules after independent decoding exposed dense-code failures at 256 pixels. Standalone PNG/SVG pass that size; landscape previews pass at 600 × 315. Logos and altered module shapes remain out of scope.

## Future Considerations

- Uploading an existing QR image instead of generating one; decide supported types, decode requirements and destination disclosure first.
- PDF posters, print sizes and export packs.
- Wi-Fi, contact cards and arbitrary text, including what their public previews reveal.
- Editable redirect destinations and QR codes hosted for longer than the current share lifetime.

## Out of Scope

- A browser QR editor or homepage creation form.
- Redirecting scans through showmeatsack.com, scan tracking or analytics.
- Visiting or verifying the destination URL.
- AI-generated QR artwork.
- New authentication, private shares or changes to share lifetime.
- General-purpose image publishing or arbitrary preview-image overrides.
- Instant removal or replacement of previews cached by another application.
