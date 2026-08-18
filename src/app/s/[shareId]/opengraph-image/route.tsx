import { ImageResponse } from "next/og";
import { getDefaultShareService } from "@/lib/app-shares";
import {
  OPENGRAPH_SIZE,
  inlineLocalShareAssets,
  titleFromHtml,
} from "@/lib/share-open-graph";
import { screenshotHtmlPreview } from "@/lib/share-preview-image";
import { sharePreviewCaptures } from "@/lib/share-preview-limit";
import { responseForView } from "@/lib/share-view-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PREVIEW_IMAGE_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=300, s-maxage=300",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ shareId: string }> },
): Promise<Response> {
  const { shareId } = await context.params;
  const shares = getDefaultShareService();
  const index = await shares.view(shareId, "index.html");
  if (index.kind !== "file") {
    return responseForView(index);
  }

  if (!sharePreviewCaptures.tryEnter()) {
    return new Response("Preview busy.", {
      status: 503,
      headers: { "Retry-After": "2" },
    });
  }

  try {
    const html = new TextDecoder().decode(index.bytes);
    const inlined = await inlineLocalShareAssets(html, async (path) => {
      const file = await shares.view(shareId, path);
      if (file.kind !== "file") {
        return null;
      }
      return { bytes: file.bytes, contentType: file.contentType };
    });

    try {
      const png = await screenshotHtmlPreview(inlined);
      return new Response(Buffer.from(png), {
        status: 200,
        headers: PREVIEW_IMAGE_HEADERS,
      });
    } catch (error) {
      console.error("share preview capture failed", { shareId, error });
      const title = titleFromHtml(html);
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              background: "#ffffff",
              padding: 64,
              fontSize: 48,
              color: "#111111",
            }}
          >
            {title}
          </div>
        ),
        { width: OPENGRAPH_SIZE.width, height: OPENGRAPH_SIZE.height },
      );
    }
  } finally {
    sharePreviewCaptures.leave();
  }
}
