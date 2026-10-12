import { landingMarkdown, landingTextResponse } from "@/lib/imeatsack-site";

export const dynamic = "force-static";

export function GET(): Response {
  return landingTextResponse(landingMarkdown, "text/markdown");
}
