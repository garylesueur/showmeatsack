import { getDefaultShareService, jsonError, jsonFromError } from "@/lib/app-shares";
import { limitCreateFromRequest } from "@/lib/create-rate-limit";
import { isShareServiceError } from "@/lib/shares";

export async function POST(request: Request): Promise<Response> {
  const limited = await limitCreateFromRequest(request);
  if (!limited.ok) {
    return jsonError(
      429,
      "rate_limited",
      "Too many pages published from this address. Try again later.",
      { "Retry-After": String(limited.retryAfterSeconds) },
    );
  }

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
