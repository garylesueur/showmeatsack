/*
Regression — a broken share renderer must return a useful, safe error page.

Bug (2026-08-23): a markdown rendering exception produced an empty HTTP 500 response.
Root cause: the share route allowed rendering exceptions to escape to the platform.
These tests lock the fix: unexpected failures show the branded recovery screen without leaking details.
Spec context: sharing/pages/publishing error handling.
*/
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryFileStore } from "@/lib/file-store";
import { SHARE_MAX_BYTES } from "@/lib/schema";
import { createMemoryShareStore } from "@/lib/share-store";
import { EXPIRED_SHARE_HTML, NOT_FOUND_SHARE_HTML } from "@/lib/share-view-response";
import { installTestShareService, zipBase64 } from "@/lib/share-test-helpers";
import { createShareService, isShareServiceError } from "@/lib/shares";
import { GET, HEAD } from "./route";

function clearInstalledService() {
  const globalForShares = globalThis as typeof globalThis & {
    showmeatsackShares?: unknown;
  };
  delete globalForShares.showmeatsackShares;
}

async function view(shareId: string, path?: string[]): Promise<Response> {
  return GET(new Request(`https://showmeatsack.com/s/${shareId}/`), {
    params: Promise.resolve({ shareId, path }),
  });
}

const checkRevision = () =>
  HEAD(new Request("https://showmeatsack.com/s/shareid1/", { method: "HEAD" }), {
    params: Promise.resolve({ shareId: "shareid1" }),
  });

describe("GET /s/[shareId]", () => {
  afterEach(() => {
    clearInstalledService();
  });

  it("returns a formatted markdown document", async () => {
    const shares = installTestShareService();
    await shares.create({ markdown: "# Isolation\n\nA safety net." });
    const response = await view("shareid1");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const body = await response.text();
    expect(body).toContain("<title>Isolation</title>");
    expect(body).toContain("<h1");
    expect(body).toContain("A safety net.");
  });

  it("returns the uploaded HTML as the page", async () => {
    const html = `<script>alert(1)</script><h1>Hello</h1>`;
    const shares = installTestShareService();
    await shares.create({ html });

    const response = await view("shareid1");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    const body = await response.text();
    expect(body).toContain(html);
    expect(body).toContain("data-showmeatsack-viewer");
    expect(body).not.toContain("managetoken1");
  });

  it("B23 — public version checks detect replacement without exposing manage details", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>First</p>" });
    const first = await checkRevision();
    const revision = first.headers.get("X-Showmeatsack-Revision");
    expect(first.status).toBe(200);
    expect(revision).toBeTruthy();
    expect(await first.text()).toBe("");
    expect(JSON.stringify([...first.headers])).not.toContain("managetoken1");
    const firstPage = await (await view("shareid1")).text();
    expect(firstPage).toContain(revision);

    await shares.replace("shareid1", "managetoken1", { html: "<p>Second</p>" });
    const second = await checkRevision();
    expect(second.headers.get("X-Showmeatsack-Revision")).not.toBe(revision);
    expect(second.headers.get("Cache-Control")).toContain("no-cache");
    await shares.replace("shareid1", "managetoken1", { html: "" });
    expect((await checkRevision()).headers.get("X-Showmeatsack-Revision")).toBe(
      second.headers.get("X-Showmeatsack-Revision"),
    );
    await shares.remove("shareid1", "managetoken1");
    const gone = await checkRevision();
    expect(gone.status).toBe(404);
    expect(gone.headers.has("X-Showmeatsack-Revision")).toBe(false);
  });

  it("B23 — older shares have a stable public version without reading their files", async () => {
    const store = createMemoryShareStore();
    await store.save({
      id: "shareid1",
      createdAt: "2026-08-17T10:00:00.000Z",
      expiresAt: "2026-08-18T10:00:00.000Z",
      manageToken: "managetoken1",
    });
    const files = createMemoryFileStore();
    files.get = async () => {
      throw new Error("Version checks must not read files");
    };
    const shares = installTestShareService({ store, files });
    const first = await checkRevision();
    expect(first.status).toBe(200);
    expect(first.headers.get("X-Showmeatsack-Revision")).toBe("2026-08-17T10:00:00.000Z");
    expect((await checkRevision()).headers.get("X-Showmeatsack-Revision")).toBe(
      first.headers.get("X-Showmeatsack-Revision"),
    );
    await shares.replace("shareid1", "managetoken1", { html: "<p>Updated</p>" });
    expect((await checkRevision()).headers.get("X-Showmeatsack-Revision")).not.toBe(
      first.headers.get("X-Showmeatsack-Revision"),
    );
  });

  it("returns a useful error screen when rendering fails", async () => {
    const shares = installTestShareService();
    shares.view = async () => {
      throw new Error("private infrastructure detail");
    };

    const response = await view("shareid1");
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(body).toContain("The silicon has let us down");
    expect(body).toContain("/silicon-failure.png");
    expect(body).not.toContain("private infrastructure detail");
  });

  it("returns 404 for an unknown share and a missing file", async () => {
    const shares = installTestShareService();
    await shares.create({
      zipBase64: zipBase64({
        "index.html": "<p>Home</p>",
        "style.css": "p{}",
      }),
    });

    const unknown = await view("no-such-share");
    expect(unknown.status).toBe(404);
    expect(await unknown.text()).toBe(NOT_FOUND_SHARE_HTML);

    const missing = await view("shareid1", ["nope.js"]);
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe(NOT_FOUND_SHARE_HTML);
  });

  it("returns 404 for a path that tries to leave the share", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Stay</p>" });
    const response = await view("shareid1", ["..", "other", "index.html"]);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe(NOT_FOUND_SHARE_HTML);
  });

  it("returns 410 when the share has expired", async () => {
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
    await shares.create({ html: "<p>Temp</p>", expiresInSeconds: 60 });
    nowMs += 61_000;

    const revision = await HEAD(
      new Request("https://showmeatsack.com/s/shareid1/", { method: "HEAD" }),
      { params: Promise.resolve({ shareId: "shareid1" }) },
    );
    expect(revision.status).toBe(410);
    expect(revision.headers.has("X-Showmeatsack-Revision")).toBe(false);
    const response = await view("shareid1");
    expect(response.status).toBe(410);
    expect(await response.text()).toBe(EXPIRED_SHARE_HTML);
  });

  it("returns 404 after delete, not the old page", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Bye</p>" });
    await shares.remove("shareid1", "managetoken1");
    const response = await view("shareid1");
    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toBe(NOT_FOUND_SHARE_HTML);
    expect(body).not.toContain("Bye");
  });

  it("serves a zip asset with its own type and nosniff", async () => {
    const shares = installTestShareService();
    await shares.create({
      zipBase64: zipBase64({
        "index.html": "<link rel='stylesheet' href='style.css'>",
        "style.css": "p{color:red}",
      }),
    });
    const css = await view("shareid1", ["style.css"]);
    expect(css.status).toBe(200);
    expect(css.headers.get("Content-Type")).toBe("text/css; charset=utf-8");
    expect(css.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await css.text()).toBe("p{color:red}");
    const head = await HEAD(
      new Request("https://showmeatsack.com/s/shareid1/style.css", { method: "HEAD" }),
      { params: Promise.resolve({ shareId: "shareid1", path: ["style.css"] }) },
    );
    expect(head.status).toBe(200);
    expect(head.headers.get("Content-Type")).toBe(css.headers.get("Content-Type"));
    const missing = await HEAD(
      new Request("https://showmeatsack.com/s/shareid1/missing.css", { method: "HEAD" }),
      { params: Promise.resolve({ shareId: "shareid1", path: ["missing.css"] }) },
    );
    expect(missing.status).toBe(404);
  });

  it("does not treat a huge create as a published page", async () => {
    const shares = installTestShareService();
    const created = await shares.create({
      html: "x".repeat(SHARE_MAX_BYTES + 1),
    });
    expect(isShareServiceError(created)).toBe(true);
    const response = await view("shareid1");
    expect(response.status).toBe(404);
  });
});
