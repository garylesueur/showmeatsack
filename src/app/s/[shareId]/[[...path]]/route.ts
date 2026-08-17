import { getDefaultShareService } from "@/lib/app-shares";

const cacheHeaders = {
  "Cache-Control": "private, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

function expiredPage(): Response {
  return new Response(
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>This share has expired</title></head><body><p>This share has expired.</p></body></html>`,
    {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...cacheHeaders,
      },
    },
  );
}

function notFoundPage(): Response {
  return new Response(
    `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Not found</title></head><body><p>Not found.</p></body></html>`,
    {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...cacheHeaders,
      },
    },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ shareId: string; path?: string[] }> },
): Promise<Response> {
  const { shareId, path } = await context.params;
  const rawPath = path?.join("/") ?? "";
  const result = await getDefaultShareService().view(shareId, rawPath);

  if (result.kind === "expired") {
    return expiredPage();
  }
  if (result.kind === "file") {
    return new Response(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        ...cacheHeaders,
      },
    });
  }
  return notFoundPage();
}
