import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryFileStore } from "@/lib/file-store";
import { createMemoryShareStore } from "@/lib/share-store";
import {
  EXPIRED_SHARE_HTML,
  NOT_FOUND_SHARE_HTML,
} from "@/lib/share-view-response";
import { installTestShareService } from "@/lib/share-test-helpers";
import { createShareService } from "@/lib/shares";
import { sharePreviewCaptures } from "@/lib/share-preview-limit";
import { screenshotHtmlPreview } from "@/lib/share-preview-image";
import { GET } from "./route";

vi.mock("@/lib/share-preview-image", () => ({
  screenshotHtmlPreview: vi.fn(),
}));

const capture = vi.mocked(screenshotHtmlPreview);

function clearInstalledService() {
  const globalForShares = globalThis as typeof globalThis & {
    showmeatsackShares?: unknown;
  };
  delete globalForShares.showmeatsackShares;
}

async function preview(shareId: string): Promise<Response> {
  return GET(new Request(`https://s.showmeatsack.com/s/${shareId}/opengraph-image`), {
    params: Promise.resolve({ shareId }),
  });
}

describe("GET /s/[shareId]/opengraph-image", () => {
  afterEach(() => {
    clearInstalledService();
    capture.mockReset();
  });

  it("B17 — expired and unknown shares do not preview another page", async () => {
    const missing = await preview("no-such-share");
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe(NOT_FOUND_SHARE_HTML);

    let nowMs = Date.parse("2026-08-17T10:00:00.000Z");
    const shares = createShareService({
      store: createMemoryShareStore(),
      files: createMemoryFileStore(),
      now: () => new Date(nowMs),
      createId: () => "shareid1",
      createToken: () => "managetoken1",
      publicBaseUrl: "https://showmeatsack.com",
    });
    const globalForShares = globalThis as typeof globalThis & {
      showmeatsackShares?: typeof shares;
    };
    globalForShares.showmeatsackShares = shares;
    await shares.create({ html: "<p>Secret page</p>", expiresInSeconds: 60 });
    nowMs += 61_000;

    const expired = await preview("shareid1");
    expect(expired.status).toBe(410);
    const body = await expired.text();
    expect(body).toBe(EXPIRED_SHARE_HTML);
    expect(body).not.toContain("Secret page");
  });

  it("B17 — a deleted share's preview is gone", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Bye</p>" });
    await shares.remove("shareid1", "managetoken1");
    const response = await preview("shareid1");
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("Bye");
  });

  it("a page that cannot be captured still gets a card, not an error", async () => {
    const shares = installTestShareService();
    await shares.create({
      html: "<html><head><title>Quarterly numbers</title></head><body>hi</body></html>",
    });
    capture.mockRejectedValue(new Error("Chromium said no"));

    const response = await preview("shareid1");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
  });

  it("a busy capture queue serves a card rather than a 503 a crawler would drop", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<html><title>Busy</title><body>hi</body></html>" });

    const held: boolean[] = [];
    while (sharePreviewCaptures.tryEnter()) {
      held.push(true);
    }
    try {
      const response = await preview("shareid1");
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
      expect(capture).not.toHaveBeenCalled();
    } finally {
      for (let i = 0; i < held.length; i += 1) {
        sharePreviewCaptures.leave();
      }
    }
  });
});
