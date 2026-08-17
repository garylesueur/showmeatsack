import { NextResponse, type NextRequest } from "next/server";
import { publicOrigin, viewPublicOrigin } from "@/lib/public-origin";
import { shareHostDecision } from "@/lib/share-host";

export function middleware(request: NextRequest): NextResponse {
  const decision = shareHostDecision({
    host: request.headers.get("host") ?? "",
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    productOrigin: publicOrigin(),
    viewOrigin: viewPublicOrigin(),
  });

  if (decision.kind === "redirect") {
    return NextResponse.redirect(decision.location, 308);
  }
  if (decision.kind === "not_found") {
    return new NextResponse("Not found.", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
