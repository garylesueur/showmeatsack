# Spec audit drift — sharing-pages-publishing (B17 scope)

Read the spec first, then the view/OG code.

## Behaviours (in-scope B17; others already 🟢 on main)

| ID | Verdict |
| --- | --- |
| B17 | **Matches** — crawlers get `og:image` at `/s/{id}/opengraph-image`; browsers get published HTML; expired/unknown use the same gone pages as view. |
| B1–B16 | Not re-audited as this branch’s work; merge brought them from main unchanged in intent. |

## Invariants

- Extra OG tags only for crawlers — **Matches** (`isLinkPreviewCrawler` in `responseForView`).
- Preview never another share — **Matches** (`view()` then screenshot; gone kinds 404/410).

## Unspecced

- If Chromium fails, the image route returns a title card (`ImageResponse`), not a screenshot.
- A zip file named `opengraph-image` is not served; the preview route wins.

Recommendation: leave unspecced unless we want the title-card fallback as a documented degraded path. Code is the intended degraded behaviour, not a leak.

## Flow

- F2.T10 implemented. F2.T1 still serves unchanged HTML. No undeclared visitor transitions.

## Roll-up

`status: implemented` still right.
