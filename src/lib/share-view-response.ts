import { isLinkPreviewCrawler } from "./link-preview-crawler";
import { viewPublicOrigin } from "./public-origin";
import {
  descriptionFromHtml,
  shareOpenGraphUrls,
  titleFromHtml,
  withOpenGraphMeta,
} from "./share-open-graph";
import type { ViewResult } from "./shares";

export const VIEW_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export const EXPIRED_SHARE_HTML =
  `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>This share has expired</title></head><body><p>This share has expired.</p></body></html>`;

export const NOT_FOUND_SHARE_HTML =
  `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Not found</title></head><body><p>Not found.</p></body></html>`;

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

export function responseForView(
  result: ViewResult,
  context?: ViewResponseContext,
): Response {
  if (result.kind === "expired") {
    return htmlPage(410, EXPIRED_SHARE_HTML);
  }
  if (result.kind !== "file") {
    return htmlPage(404, NOT_FOUND_SHARE_HTML);
  }

  const isHtml = result.contentType.toLowerCase().includes("text/html");
  if (
    context &&
    isHtml &&
    isLinkPreviewCrawler(context.request.headers.get("user-agent"))
  ) {
    const html = new TextDecoder().decode(result.bytes);
    const urls = shareOpenGraphUrls(viewPublicOrigin(), context.shareId);
    const withMeta = withOpenGraphMeta(html, {
      title: titleFromHtml(html),
      description: descriptionFromHtml(html),
      imageUrl: urls.imageUrl,
      pageUrl: urls.pageUrl,
    });
    return htmlPage(200, withMeta);
  }

  return new Response(Buffer.from(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      ...VIEW_CACHE_HEADERS,
    },
  });
}
