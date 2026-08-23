import { isMarkdownContentType } from "./mime";
import { isLinkPreviewCrawler } from "./link-preview-crawler";
import { markdownFromLegacyShell } from "./legacy-markdown-shell";
import { viewPublicOrigin } from "./public-origin";
import {
  descriptionFromHtml,
  shareOpenGraphUrls,
  titleFromHtml,
  withOpenGraphMeta,
} from "./share-open-graph";
import { renderMarkdownDocument } from "./markdown-document";
import type { ViewResult } from "./shares";

export const VIEW_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export const EXPIRED_SHARE_HTML = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>This share has expired</title></head><body><p>This share has expired.</p></body></html>`;

export const NOT_FOUND_SHARE_HTML = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Not found</title></head><body><p>Not found.</p></body></html>`;

export const INTERNAL_ERROR_SHARE_HTML = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>The silicon has let us down · showmeatsack.com</title>
  <style>
    :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 2rem 1.25rem; background: #f8f4e9; color: #28251f; }
    main { width: min(42rem, 100%); text-align: center; }
    img { display: block; width: min(32rem, 100%); height: auto; margin: 0 auto 1.5rem; border-radius: 1rem; }
    .code { margin: 0 0 .5rem; color: #4b786c; font: 700 .75rem/1.2 ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(2rem, 7vw, 3.75rem); line-height: 1; letter-spacing: -.04em; }
    p { max-width: 34rem; margin: 1rem auto 0; color: #686157; font-size: 1.05rem; line-height: 1.6; }
    a { display: inline-block; margin-top: 1.5rem; padding: .75rem 1rem; border: 1px solid #9a9285; border-radius: .65rem; color: inherit; font-weight: 650; text-decoration: none; }
    a:hover { border-color: #4b786c; color: #315c52; }
    @media (prefers-color-scheme: dark) {
      body { background: #1e1b17; color: #f4eee2; }
      p { color: #bdb4a7; }
      img { opacity: .9; }
      a { border-color: #5d574e; }
      a:hover { border-color: #82b6a8; color: #a8d6ca; }
      .code { color: #82b6a8; }
    }
  </style>
</head>
<body>
  <main>
    <img src="/silicon-failure.png" alt="A disappointed meat sack sitting beside a failed silicon chip.">
    <p class="code">Error 500</p>
    <h1>The silicon has let us down.</h1>
    <p>The meat sack is disappointed. This share hit an unexpected snag while we were opening it. Try refreshing in a moment.</p>
    <a href="/">Back to showmeatsack.com</a>
  </main>
</body>
</html>`;

export type ViewResponseContext = {
  request: Request;
  shareId: string;
};

function htmlPage(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...VIEW_CACHE_HEADERS,
    },
  });
}

export function internalErrorShareResponse(): Response {
  return htmlPage(500, INTERNAL_ERROR_SHARE_HTML);
}

export function responseForView(result: ViewResult, context?: ViewResponseContext): Response {
  if (result.kind === "expired") {
    return htmlPage(410, EXPIRED_SHARE_HTML);
  }
  if (result.kind !== "file") {
    return htmlPage(404, NOT_FOUND_SHARE_HTML);
  }

  const isMarkdown = isMarkdownContentType(result.contentType);
  if (isMarkdown) {
    const markdown = new TextDecoder().decode(result.bytes);
    const html = renderMarkdownDocument(markdown);
    if (context && isLinkPreviewCrawler(context.request.headers.get("user-agent"))) {
      const urls = shareOpenGraphUrls(viewPublicOrigin(), context.shareId);
      const withMeta = withOpenGraphMeta(html, {
        title: titleFromHtml(html),
        description: descriptionFromHtml(html),
        imageUrl: urls.imageUrl,
        pageUrl: urls.pageUrl,
      });
      return htmlPage(200, withMeta);
    }
    return htmlPage(200, html);
  }

  const isHtml = result.contentType.toLowerCase().includes("text/html");
  const uploadedHtml = isHtml ? new TextDecoder().decode(result.bytes) : null;
  const legacyMarkdown = uploadedHtml ? markdownFromLegacyShell(uploadedHtml) : null;
  const html = legacyMarkdown ? renderMarkdownDocument(legacyMarkdown) : uploadedHtml;
  if (context && html && isLinkPreviewCrawler(context.request.headers.get("user-agent"))) {
    const urls = shareOpenGraphUrls(viewPublicOrigin(), context.shareId);
    const withMeta = withOpenGraphMeta(html, {
      title: titleFromHtml(html),
      description: descriptionFromHtml(html),
      imageUrl: urls.imageUrl,
      pageUrl: urls.pageUrl,
    });
    return htmlPage(200, withMeta);
  }
  if (legacyMarkdown && html) {
    return htmlPage(200, html);
  }

  return new Response(Buffer.from(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      ...VIEW_CACHE_HEADERS,
    },
  });
}
