import { describe, expect, it } from "vitest";
import { createMemoryFileStore } from "./file-store";
import { SHARE_MAX_BYTES } from "./schema";
import { createMemoryShareStore } from "./share-store";
import { testShareService, zipBase64 } from "./share-test-helpers";
import { createShareService, isShareServiceError } from "./shares";

function service(
  overrides: Parameters<typeof testShareService>[0] = {},
) {
  return testShareService(overrides);
}

describe("publishing a page", () => {
  it("B1 B4 B12 — create HTML returns view and manage links", async () => {
    const shares = service();
    const created = await shares.create({ html: "<h1>Hello</h1>" });
    expect(isShareServiceError(created)).toBe(false);
    if (isShareServiceError(created)) {
      return;
    }
    expect(created.viewUrl).toBe("https://showmeatsack.com/s/shareid1/");
    expect(created.manageUrl).toContain("token=managetoken1");
    expect(created.manageToken).toBe("managetoken1");
    expect(created.expiresAt).toBe("2026-09-16T10:00:00.000Z");
    expect(created.status).toBe("live");
  });

  it("B2 B4 — view link is the HTML itself", async () => {
    const shares = service();
    await shares.create({ html: "<h1>Hello</h1>" });
    const viewed = await shares.view("shareid1", "");
    expect(viewed.kind).toBe("file");
    if (viewed.kind !== "file") {
      return;
    }
    expect(new TextDecoder().decode(viewed.bytes)).toBe("<h1>Hello</h1>");
    expect(viewed.contentType).toContain("text/html");
  });

  it("B3 — zip is a static site with relative assets", async () => {
    const shares = service();
    const created = await shares.create({
      zipBase64: zipBase64({
        "index.html": "<link rel='stylesheet' href='style.css'><p>Site</p>",
        "style.css": "p{color:red}",
      }),
    });
    expect(isShareServiceError(created)).toBe(false);
    const page = await shares.view("shareid1", "index.html");
    const css = await shares.view("shareid1", "style.css");
    expect(page.kind).toBe("file");
    expect(css.kind).toBe("file");
    if (css.kind === "file") {
      expect(new TextDecoder().decode(css.bytes)).toBe("p{color:red}");
    }
  });

  it("B3 — accepts index.html inside a single wrapping folder", async () => {
    const shares = service();
    const created = await shares.create({
      zipBase64: zipBase64({
        "site/index.html": "<p>Wrapped</p>",
        "site/app.js": "console.log(1)",
      }),
    });
    expect(isShareServiceError(created)).toBe(false);
    const page = await shares.view("shareid1", "");
    expect(page.kind).toBe("file");
    if (page.kind === "file") {
      expect(new TextDecoder().decode(page.bytes)).toContain("Wrapped");
    }
  });

  it("B5 B10 — view cannot replace or delete; wrong secret does not leak", async () => {
    const shares = service();
    await shares.create({ html: "<p>One</p>" });
    const replaced = await shares.replace("shareid1", "wrong", {
      html: "<p>Two</p>",
    });
    expect(isShareServiceError(replaced)).toBe(true);
    if (isShareServiceError(replaced)) {
      expect(replaced.status).toBe(404);
    }
    const removed = await shares.remove("shareid1", "wrong");
    expect(isShareServiceError(removed)).toBe(true);
    const still = await shares.view("shareid1", "");
    expect(still.kind).toBe("file");
  });

  it("B6 — manage replace keeps the view URL and shows the new page", async () => {
    const shares = service();
    const created = await shares.create({ html: "<p>Old</p>" });
    if (isShareServiceError(created)) {
      throw new Error("create failed");
    }
    const replaced = await shares.replace("shareid1", created.manageToken, {
      html: "<p>New</p>",
    });
    expect(isShareServiceError(replaced)).toBe(false);
    if (isShareServiceError(replaced)) {
      return;
    }
    expect(replaced.viewUrl).toBe(created.viewUrl);
    expect(replaced.expiresAt).toBe(created.expiresAt);
    const viewed = await shares.view("shareid1", "");
    if (viewed.kind !== "file") {
      throw new Error("expected file");
    }
    expect(new TextDecoder().decode(viewed.bytes)).toBe("<p>New</p>");
  });

  it("B6 B9 — refused replace leaves the live page", async () => {
    const shares = service();
    await shares.create({ html: "<p>Keep</p>" });
    const replaced = await shares.replace("shareid1", "managetoken1", {
      html: "",
    });
    expect(isShareServiceError(replaced)).toBe(true);
    const viewed = await shares.view("shareid1", "");
    if (viewed.kind !== "file") {
      throw new Error("expected file");
    }
    expect(new TextDecoder().decode(viewed.bytes)).toBe("<p>Keep</p>");
  });

  it("B7 — manage delete then the view is gone; delete again is gone", async () => {
    const shares = service();
    await shares.create({ html: "<p>Bye</p>" });
    const first = await shares.remove("shareid1", "managetoken1");
    expect(first).toEqual({ status: "gone" });
    expect(await shares.view("shareid1", "")).toEqual({ kind: "not_found" });
    const second = await shares.remove("shareid1", "managetoken1");
    expect(second).toEqual({ status: "gone" });
  });

  it("B8 — default 30 days; shorter expiry is allowed; then the page is gone", async () => {
    let nowMs = Date.parse("2026-08-17T10:00:00.000Z");
    const shares = createShareService({
      store: createMemoryShareStore(),
      files: createMemoryFileStore(),
      now: () => new Date(nowMs),
      createId: () => "shareid1",
      createToken: () => "managetoken1",
      publicBaseUrl: "https://showmeatsack.com",
    });
    const created = await shares.create({
      html: "<p>Temp</p>",
      expiresInSeconds: 60,
    });
    if (isShareServiceError(created)) {
      throw new Error("create failed");
    }
    expect(created.expiresAt).toBe("2026-08-17T10:01:00.000Z");
    nowMs += 61_000;
    expect(await shares.view("shareid1", "")).toEqual({ kind: "expired" });
    const replaced = await shares.replace("shareid1", "managetoken1", {
      html: "<p>No</p>",
    });
    expect(isShareServiceError(replaced)).toBe(true);
  });

  it("B8 — expiry longer than 30 days is refused", async () => {
    const shares = service();
    const created = await shares.create({
      html: "<p>No</p>",
      expiresInSeconds: 31 * 24 * 60 * 60,
    });
    expect(isShareServiceError(created)).toBe(true);
  });

  it("B9 — empty, neither, both, and zip without index are refused", async () => {
    const shares = service();
    expect(isShareServiceError(await shares.create({ html: "" }))).toBe(true);
    expect(isShareServiceError(await shares.create({}))).toBe(true);
    expect(
      isShareServiceError(
        await shares.create({ html: "<p>A</p>", zipBase64: zipBase64({ "index.html": "x" }) }),
      ),
    ).toBe(true);
    expect(
      isShareServiceError(
        await shares.create({ zipBase64: zipBase64({ "readme.txt": "hi" }) }),
      ),
    ).toBe(true);
  });

  it("B10 — unknown id does not show another share", async () => {
    const shares = service();
    await shares.create({ html: "<p>Secret</p>" });
    expect(await shares.view("other", "")).toEqual({ kind: "not_found" });
  });

  it("B13 — a path cannot leave the share", async () => {
    const shares = service();
    await shares.create({ html: "<p>Stay</p>" });
    expect(await shares.view("shareid1", "../other/index.html")).toEqual({
      kind: "bad_path",
    });
    const inside = await shares.view("shareid1", "index.html");
    expect(inside.kind).toBe("file");
  });

  it("B5 — manage status is live until gone", async () => {
    const shares = service();
    const status = await shares.status("shareid1", "managetoken1");
    expect(isShareServiceError(status)).toBe(true);
    await shares.create({ html: "<p>Live</p>" });
    const live = await shares.status("shareid1", "managetoken1");
    expect(live).toMatchObject({ status: "live", shareId: "shareid1" });
  });

  it("B2 — scripts and event handlers in uploaded HTML are kept", async () => {
    const html =
      `<!doctype html><script>window.stolen = document.cookie</script><img src=x onerror="alert(1)"><p>Live page</p>`;
    const shares = service();
    const created = await shares.create({ html });
    expect(isShareServiceError(created)).toBe(false);
    const viewed = await shares.view("shareid1", "");
    expect(viewed.kind).toBe("file");
    if (viewed.kind !== "file") {
      return;
    }
    const body = new TextDecoder().decode(viewed.bytes);
    expect(body).toBe(html);
    expect(body).toContain("<script>");
    expect(body).toContain("onerror=");
    expect(viewed.contentType).toBe("text/html; charset=utf-8");
  });

  it("B5 — the viewed page does not contain the manage secret", async () => {
    const shares = service();
    await shares.create({ html: "<p>Public</p>" });
    const viewed = await shares.view("shareid1", "");
    if (viewed.kind !== "file") {
      throw new Error("expected file");
    }
    const body = new TextDecoder().decode(viewed.bytes);
    expect(body).not.toContain("managetoken1");
    expect(body).not.toContain("manageUrl");
    expect(body).not.toContain("token=");
  });

  it("B8 B10 — expired, deleted, and unknown views stay distinct", async () => {
    let nowMs = Date.parse("2026-08-17T10:00:00.000Z");
    const shares = createShareService({
      store: createMemoryShareStore(),
      files: createMemoryFileStore(),
      now: () => new Date(nowMs),
      createId: () => "shareid1",
      createToken: () => "managetoken1",
      publicBaseUrl: "https://showmeatsack.com",
    });
    await shares.create({ html: "<p>Temp</p>", expiresInSeconds: 60 });
    expect(await shares.view("missing", "")).toEqual({ kind: "not_found" });
    nowMs += 61_000;
    expect(await shares.view("shareid1", "")).toEqual({ kind: "expired" });

    const other = service({ createId: () => "shareid2" });
    await other.create({ html: "<p>Other</p>" });
    await other.remove("shareid2", "managetoken1");
    expect(await other.view("shareid2", "")).toEqual({ kind: "not_found" });
  });

  it("B9 — HTML or zip larger than 5 MB is refused", async () => {
    const shares = service();
    const hugeHtml = "x".repeat(SHARE_MAX_BYTES + 1);
    const htmlResult = await shares.create({ html: hugeHtml });
    expect(isShareServiceError(htmlResult)).toBe(true);
    if (isShareServiceError(htmlResult)) {
      expect(htmlResult.code).toBe("too_large");
    }

    const zipResult = await shares.create({
      zipBase64: zipBase64({
        "index.html": "<p>ok</p>",
        "blob.bin": new Uint8Array(SHARE_MAX_BYTES + 1),
      }),
    });
    expect(isShareServiceError(zipResult)).toBe(true);
    if (isShareServiceError(zipResult)) {
      expect(zipResult.code).toBe("too_large");
    }
  });

  it("B10 — a missing file on a live share is not found, not another file", async () => {
    const shares = service();
    await shares.create({
      zipBase64: zipBase64({
        "index.html": "<p>Home</p>",
        "style.css": "p{color:red}",
      }),
    });
    expect(await shares.view("shareid1", "missing.js")).toEqual({
      kind: "not_found",
    });
    const css = await shares.view("shareid1", "style.css");
    expect(css.kind).toBe("file");
  });

  it("B4 — an HTML share has no extra files", async () => {
    const shares = service();
    await shares.create({ html: "<p>Only this</p>" });
    expect(await shares.view("shareid1", "style.css")).toEqual({
      kind: "not_found",
    });
    expect(await shares.view("shareid1", "index.htm")).toEqual({
      kind: "not_found",
    });
  });
});
