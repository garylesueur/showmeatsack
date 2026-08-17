import { getDefaultShareService, jsonError, jsonFromError } from "@/lib/app-shares";
import { isShareServiceError } from "@/lib/shares";

function manageTokenFrom(request: Request): string | undefined {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("token");
  if (fromQuery) {
    return fromQuery;
  }
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return undefined;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ shareId: string }> },
): Promise<Response> {
  const { shareId } = await context.params;
  const result = await getDefaultShareService().status(
    shareId,
    manageTokenFrom(request),
  );
  if (isShareServiceError(result)) {
    return jsonFromError(result);
  }
  return Response.json(result);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ shareId: string }> },
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body must be JSON");
  }
  const { shareId } = await context.params;
  const result = await getDefaultShareService().replace(
    shareId,
    manageTokenFrom(request),
    body,
  );
  if (isShareServiceError(result)) {
    return jsonFromError(result);
  }
  return Response.json(result);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ shareId: string }> },
): Promise<Response> {
  const { shareId } = await context.params;
  const result = await getDefaultShareService().remove(
    shareId,
    manageTokenFrom(request),
  );
  if (isShareServiceError(result)) {
    return jsonFromError(result);
  }
  return Response.json(result);
}
