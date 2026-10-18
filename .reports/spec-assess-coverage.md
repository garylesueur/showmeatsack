# Spec assess coverage — sharing-pages-publishing (B17)

Tests colocated under `src/**/*.test.ts`. Assertions read, not names only.

## B17

| Item | Verdict | Where |
| --- | --- | --- |
| Person gets unchanged HTML | Covered | `share-view-response.test.ts` |
| Crawler gets `og:image` for this share | Covered | `share-view-response.test.ts` |
| CSS not rewritten for crawlers | Covered | `share-view-response.test.ts` |
| Crawler + expired/unknown: no other share | Covered | `share-view-response.test.ts` |
| Image URL expired/unknown/deleted | Covered | `opengraph-image/route.test.ts` |
| Preview URL is on the share, not home | Covered | `share-open-graph.test.ts` |
| Local CSS/images inlined for screenshot | Covered | `share-open-graph.test.ts` |
| Remote assets not fetched | Covered | `share-open-graph.test.ts` |
| PNG is a pixel screenshot of the page | Uncovered | No Chromium assertion (would be an e2e; `write-tests` would skip unless asked) |
| F2.T10 crawler guard | Covered | crawler tests |
| F2.T1 person guard | Covered | Safari UA test |

## 🟢 without a covering test

None for B17. Pixel-faithful screenshot is the only gap; it is an e2e, not a missing unit.

## Contradictions

None after the title fallback no longer uses `SITE_TITLE` for untitled HTML.
