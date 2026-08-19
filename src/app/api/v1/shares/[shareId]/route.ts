import { getDefaultShareService, jsonError, jsonFromError } from "@/lib/app-shares";
import { manageTokenFrom } from "@/lib/manage-token";
import { isShareServiceError } from "@/lib/shares";

export async function GET(
  request: Request,
  context: { params: Promise<{ shareId: string }> },
): Promise<Response> {
  const { shareId } = await context.params;
  const result = await getDefaultShareService().status(shareId, manageTokenFrom(request));
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
  const result = await getDefaultShareService().replace(shareId, manageTokenFrom(request), body);
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
  const result = await getDefaultShareService().remove(shareId, manageTokenFrom(request));
  if (isShareServiceError(result)) {
    return jsonFromError(result);
  }
  return Response.json(result);
}
