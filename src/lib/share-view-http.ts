import { publicOrigin } from "./public-origin";
import { isLinkPreviewCrawler } from "./link-preview-crawler";
import {
  descriptionFromHtml,
  shareOpenGraphUrls,
  titleFromHtml,
  withOpenGraphMeta,
} from "./share-open-graph";
import type { ViewResult } from "./shares";

const cacheHeaders = {
  "Cache-Control": "private, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

export function expiredSharePage(): Response {
  return htmlPage(
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>This share has expired</title></head><body><p>This share has expired.</p></body></html>`,
    410,
  );
}

export function notFoundSharePage(): Response {
  return htmlPage(
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Not found</title></head><body><p>Not found.</p></body></html>`,
    404,
  );
}

export function responseForShareView(
  request: Request,
  shareId: string,
  result: ViewResult,
): Response {
  if (result.kind === "expired") {
    return expiredSharePage();
  }
  if (result.kind !== "file") {
    return notFoundSharePage();
  }

  const isHtml = result.contentType.toLowerCase().includes("text/html");
  if (
    isHtml &&
    isLinkPreviewCrawler(request.headers.get("user-agent"))
  ) {
    const html = new TextDecoder().decode(result.bytes);
    const urls = shareOpenGraphUrls(publicOrigin(), shareId);
    const withMeta = withOpenGraphMeta(html, {
      title: titleFromHtml(html),
      description: descriptionFromHtml(html),
      imageUrl: urls.imageUrl,
      pageUrl: urls.pageUrl,
    });
    return htmlPage(withMeta, 200);
  }

  return new Response(Buffer.from(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      ...cacheHeaders,
    },
  });
}

function htmlPage(html: string, status: number): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...cacheHeaders,
    },
  });
}
