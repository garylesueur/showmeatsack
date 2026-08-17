import type { ViewResult } from "./shares";

export const VIEW_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

export const EXPIRED_SHARE_HTML =
  `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>This share has expired</title></head><body><p>This share has expired.</p></body></html>`;

export const NOT_FOUND_SHARE_HTML =
  `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Not found</title></head><body><p>Not found.</p></body></html>`;

function htmlPage(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...VIEW_CACHE_HEADERS,
    },
  });
}

export function responseForView(result: ViewResult): Response {
  if (result.kind === "expired") {
    return htmlPage(410, EXPIRED_SHARE_HTML);
  }
  if (result.kind === "file") {
    return new Response(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        ...VIEW_CACHE_HEADERS,
      },
    });
  }
  return htmlPage(404, NOT_FOUND_SHARE_HTML);
}
