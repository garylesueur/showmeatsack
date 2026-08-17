import { getDefaultShareService } from "@/lib/app-shares";
import { responseForView } from "@/lib/share-view-response";

export async function GET(
  request: Request,
  context: { params: Promise<{ shareId: string; path?: string[] }> },
): Promise<Response> {
  const { shareId, path } = await context.params;
  const rawPath = path?.join("/") ?? "";
  const result = await getDefaultShareService().view(shareId, rawPath);
  return responseForView(result, { request, shareId });
}
