import { getDefaultShareService } from "@/lib/app-shares";
import { shareFallbackCard } from "@/lib/share-fallback-card";
import {
  descriptionFromHtml,
  inlineLocalShareAssets,
  titleFromHtml,
} from "@/lib/share-open-graph";
import { screenshotHtmlPreview } from "@/lib/share-preview-image";
import { sharePreviewCaptures } from "@/lib/share-preview-limit";
import { responseForView } from "@/lib/share-view-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// A crawler fetches this once and caches it for a long time, so the shared
// concurrency limiter is only ever hit by a burst on a brand new link.
const PREVIEW_IMAGE_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
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

  const html = new TextDecoder().decode(index.bytes);
  const card = () =>
    shareFallbackCard({
      title: titleFromHtml(html),
      description: descriptionFromHtml(html),
    });

  // A crawler that gets a 503 shows no preview at all, and most never come
  // back. The card is a worse preview than the screenshot but a far better one
  // than nothing.
  if (!sharePreviewCaptures.tryEnter()) {
    return card();
  }

  try {
    const inlined = await inlineLocalShareAssets(html, async (path) => {
      const file = await shares.view(shareId, path);
      if (file.kind !== "file") {
        return null;
      }
      return { bytes: file.bytes, contentType: file.contentType };
    });

    const png = await screenshotHtmlPreview(inlined);
    return new Response(Buffer.from(png), {
      status: 200,
      headers: PREVIEW_IMAGE_HEADERS,
    });
  } catch (error) {
    console.error("share preview capture failed", { shareId, error });
    return card();
  } finally {
    sharePreviewCaptures.leave();
  }
}
