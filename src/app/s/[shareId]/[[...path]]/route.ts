import { getDefaultShareService } from "@/lib/app-shares";
import { responseForShareView } from "@/lib/share-view-http";

export async function GET(
  request: Request,
  context: { params: Promise<{ shareId: string; path?: string[] }> },
): Promise<Response> {
  const { shareId, path } = await context.params;
  const rawPath = path?.join("/") ?? "";
  const result = await getDefaultShareService().view(shareId, rawPath);
  return responseForShareView(request, shareId, result);
}
