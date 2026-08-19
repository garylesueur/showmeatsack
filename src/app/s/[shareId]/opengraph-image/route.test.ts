import { afterEach, describe, expect, it } from "vitest";
import { createMemoryFileStore } from "@/lib/file-store";
import { createMemoryShareStore } from "@/lib/share-store";
import { EXPIRED_SHARE_HTML, NOT_FOUND_SHARE_HTML } from "@/lib/share-view-response";
import { installTestShareService } from "@/lib/share-test-helpers";
import { createShareService } from "@/lib/shares";
import { GET } from "./route";

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
});
