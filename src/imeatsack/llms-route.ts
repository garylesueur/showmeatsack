import { landingLlmsTxt, landingTextResponse } from "@/lib/imeatsack-site";

export const dynamic = "force-static";

export function GET(): Response {
  return landingTextResponse(landingLlmsTxt, "text/plain");
}
