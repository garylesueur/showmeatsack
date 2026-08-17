import { getDefaultShareService, jsonError, jsonFromError } from "@/lib/app-shares";
import { isShareServiceError } from "@/lib/shares";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body must be JSON");
  }

  const result = await getDefaultShareService().create(body);
  if (isShareServiceError(result)) {
    return jsonFromError(result);
  }
  return Response.json(result, { status: 201 });
}
