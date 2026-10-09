import { getDefaultShareService } from "@/lib/app-shares";
import {
  internalErrorShareResponse,
  responseForView,
  VIEW_CACHE_HEADERS,
} from "@/lib/share-view-response";

// Public version checks read only share metadata, never files or manage secrets.
export async function HEAD(
  _request: Request,
  context: { params: Promise<{ shareId: string; path?: string[] }> },
): Promise<Response> {
  const { shareId, path } = await context.params;
  try {
    // Keep ordinary HEAD behavior for site assets and explicit file paths.
    if (path?.length) {
      const result = await getDefaultShareService().view(shareId, path.join("/"));
      const response = responseForView(result);
      return new Response(null, { status: response.status, headers: response.headers });
    }
    const result = await getDefaultShareService().publicRevision(shareId);
    return new Response(null, {
      status: result.kind === "live" ? 200 : result.kind === "expired" ? 410 : 404,
      headers: {
        ...VIEW_CACHE_HEADERS,
        ...(result.kind === "live" ? { "X-Showmeatsack-Revision": result.revision } : {}),
      },
    });
  } catch {
    return new Response(null, { status: 503, headers: VIEW_CACHE_HEADERS });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ shareId: string; path?: string[] }> },
): Promise<Response> {
  const { shareId, path } = await context.params;
  const rawPath = path?.join("/") ?? "";
  try {
    const result = await getDefaultShareService().view(shareId, rawPath);
    return responseForView(result, { request, shareId });
  } catch (error) {
    console.error("Share view failed", { shareId, path: rawPath, error });
    return internalErrorShareResponse();
  }
}
