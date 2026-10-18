# Branch self-review

**Branch:** `cursor-gaz/share-opengraph-preview`  
**Merge-base:** `98d81a9` (`origin/main`)  
**Diff:** 16 files, +1002 / −13 (committed). Plus uncommitted OG image route tests.

## Scope

Share view-link Open Graph: crawler meta tags and `/s/{id}/opengraph-image` screenshot. Product homepage OG on main is out of this diff.

## Findings

### Major

1. **`src/lib/share-open-graph.ts:44` — fallback title is the product name.**  
   `titleFromHtml` returns `SITE_TITLE` (`showmeatsack.com`) when the page has no `<title>` or `<h1>`. Crawler `og:title` and the Chromium-failure ImageResponse then look like the product homepage, which B17 forbids.  
   **Impact:** Slack unfurl can show the site name instead of the share.  
   **Direction:** Use visible page text, or a generic “Shared page”, never the product title.

### Minor

2. **`src/app/s/[shareId]/opengraph-image/route.tsx` — screenshot failure falls back to a title card.** Spec asks for a picture of the page. Degraded, not a leak.

3. **Zip file named `opengraph-image` is shadowed** by the preview route. Unlikely; reserved path is unspecced.

### Nitpick

4. Crawler UA list is allow-list; unknown unfurlers still see raw HTML (B2), so they may get no preview.

## Counts

Major 1, Minor 2, Nitpick 1. No Critical. No secrets in the diff.

## Permissions / tenancy

View path still keyed by `shareId` only (intentional). Preview route uses the same `view()` as the page, so expired/deleted/unknown cannot screenshot another share. Request interception aborts non-`data:`/`about:` URLs during screenshot.
