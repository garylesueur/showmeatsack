import QRCode from "qrcode";
import { afterEach, describe, expect, it, vi } from "vitest";
import { responseForView } from "./share-view-response";
import { testShareService, zipBase64 } from "./share-test-helpers";
import { createShowmeatsackTool } from "./showmeatsack-tool";
import { decodeQrImage } from "./qr-test-helpers";

describe("QR share lifecycle", () => {
  afterEach(() => vi.restoreAllMocks());

  it("B1 B4 B5 — the tool creates and replaces a QR with matching public metadata", async () => {
    const shares = testShareService();
    const tool = createShowmeatsackTool(shares);
    const first = await tool.invoke({
      action: "create",
      qr: { url: "https://example.com/first", title: "First & foremost" },
    });
    expect(first).toMatchObject({
      viewUrl: "https://showmeatsack.com/s/shareid1/",
      status: "live",
    });
    const page = await shares.view("shareid1", "");
    const html = await responseForView(page, {
      shareId: "shareid1",
      request: new Request("https://showmeatsack.com/s/shareid1/"),
    }).text();
    expect(html).toContain('property="og:title" content="First &amp; foremost"');
    expect(html).toContain('property="og:image:width" content="1024"');
    expect(html).toContain('property="og:image:height" content="1024"');
    expect(html).not.toContain("managetoken1");
    const second = await tool.invoke({
      action: "replace",
      shareId: "shareid1",
      manageToken: "managetoken1",
      qr: { url: "https://example.com/second", style: "brand" },
    });
    expect(second).toMatchObject({
      viewUrl: "https://showmeatsack.com/s/shareid1/",
      status: "live",
    });
    expect(second).toHaveProperty("expiresAt", (first as { expiresAt: string }).expiresAt);
    const image = await shares.view("shareid1", "qr.png");
    expect(image.kind).toBe("file");
    if (image.kind === "file")
      expect(await decodeQrImage(image.bytes)).toBe("https://example.com/second");
    const updatedPage = await shares.view("shareid1", "");
    expect(updatedPage).toMatchObject({
      preview: { path: "preview.png", width: 1200, height: 630 },
    });
    const svg = await shares.view("shareid1", "qr.svg");
    expect(svg).toMatchObject({ contentType: "image/svg+xml" });
    if (svg.kind === "file")
      expect(await decodeQrImage(svg.bytes)).toBe("https://example.com/second");
    const preview = await shares.view("shareid1", "preview.png");
    if (preview.kind === "file")
      expect(await decodeQrImage(preview.bytes, 600)).toBe("https://example.com/second");
    expect(
      await shares.replace("shareid1", "managetoken1", {
        qr: { url: "https://example.com/third", style: "unknown" },
      }),
    ).toMatchObject({ status: 400 });
    expect(await shares.view("shareid1", "preview.png")).toEqual(preview);
    await shares.replace("shareid1", "managetoken1", {
      qr: { url: "https://example.com/third", style: "classic" },
    });
    expect(await shares.view("shareid1", "preview.png")).toEqual({ kind: "not_found" });
    expect(await shares.view("shareid1", "")).toMatchObject({
      preview: { path: "qr.png", width: 1024, height: 1024 },
    });
  });

  it("B5 B6 — failed validation, permission and generation preserve the live QR", async () => {
    const shares = testShareService();
    await shares.create({ qr: { url: "https://example.com/original" } });
    const original = await shares.view("shareid1", "qr.png");
    expect(
      await shares.replace("shareid1", "wrong", { qr: { url: "https://example.com/other" } }),
    ).toMatchObject({ status: 404 });
    expect(
      await shares.replace("shareid1", "managetoken1", { qr: { url: "javascript:alert(1)" } }),
    ).toMatchObject({ status: 400 });
    vi.spyOn(QRCode, "toBuffer").mockRejectedValue(new Error("Encoder unavailable"));
    expect(
      await shares.replace("shareid1", "managetoken1", {
        qr: { url: "https://example.com/other" },
      }),
    ).toMatchObject({ status: 400 });
    expect(await shares.view("shareid1", "qr.png")).toEqual(original);
    const empty = testShareService();
    expect(await empty.create({ qr: { url: "https://example.com/" } })).toMatchObject({
      status: 400,
    });
    expect(await empty.view("shareid1", "")).toEqual({ kind: "not_found" });
    vi.restoreAllMocks();
    vi.spyOn(QRCode, "toString").mockRejectedValue(new Error("SVG encoder unavailable"));
    expect(
      await shares.replace("shareid1", "managetoken1", {
        qr: { url: "https://example.com/other" },
      }),
    ).toMatchObject({ status: 400 });
    expect(await shares.view("shareid1", "qr.png")).toEqual(original);
  });

  it.each([
    { html: "<p>Ordinary page</p>" },
    { markdown: "# Ordinary document" },
    {
      zipBase64: zipBase64({ "index.html": "<p>Ordinary site</p>", "qr.png": "untrusted image" }),
    },
  ])("B5 — switching content kinds clears QR files and preview mode: %j", async (payload) => {
    const shares = testShareService();
    await shares.create({ qr: { url: "https://example.com/", style: "action" } });
    await shares.replace("shareid1", "managetoken1", payload);
    const ordinary = await shares.view("shareid1", "");
    expect(ordinary).not.toHaveProperty("preview");
    if (!("zipBase64" in payload))
      expect(await shares.view("shareid1", "qr.png")).toEqual({ kind: "not_found" });
    expect(await shares.view("shareid1", "qr.svg")).toEqual({ kind: "not_found" });
    expect(await shares.view("shareid1", "preview.png")).toEqual({ kind: "not_found" });
    await shares.replace("shareid1", "managetoken1", { qr: { url: "https://example.com/new" } });
    expect(await shares.view("shareid1", "")).toMatchObject({ preview: { path: "qr.png" } });
  });

  it("B7 — page and image stop serving at expiry and deletion", async () => {
    let now = Date.parse("2026-10-09T12:00:00Z");
    const shares = testShareService({ now: () => new Date(now) });
    await shares.create({
      qr: { url: "https://example.com/", style: "action" },
      expiresInSeconds: 60,
    });
    now += 60_000;
    expect(
      await Promise.all(
        ["", "qr.png", "qr.svg", "preview.png"].map((path) => shares.view("shareid1", path)),
      ),
    ).toEqual([{ kind: "expired" }, { kind: "expired" }, { kind: "expired" }, { kind: "expired" }]);
    await shares.create({ qr: { url: "https://example.com/", style: "action" } });
    await shares.remove("shareid1", "managetoken1");
    expect(
      await Promise.all(
        ["", "qr.png", "qr.svg", "preview.png"].map((path) => shares.view("shareid1", path)),
      ),
    ).toEqual([
      { kind: "not_found" },
      { kind: "not_found" },
      { kind: "not_found" },
      { kind: "not_found" },
    ]);
  });
});
