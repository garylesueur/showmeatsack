import { describe, expect, it } from "vitest";
import { qrAsSite } from "./qr-share";
import { decodeQrImage } from "./qr-test-helpers";
import { createShareSchema } from "./schema";

describe("sharing-pages-qr-codes", () => {
  it.each(
    [
      "https://example.com/register?event=autumn&name=Sam#ticket",
      "https://example.com/参加?name=Zoë&emoji=🍂#入口",
      `https://example.com/?q=${"abcdefghijklmnopqrstuvwxyz".repeat(18)}abcdefghijklmnopqrstu`,
    ].flatMap((url) => (["classic", "brand", "action"] as const).map((style) => ({ url, style }))),
  )(
    "B2–B4 B8 B9 — every format and preset encodes the exact URL: $style $url",
    async ({ url, style }) => {
      expect(new TextEncoder().encode(url).length).toBeLessThanOrEqual(512);
      const site = await qrAsSite({ url, style });
      const png = site.files.find((file) => file.path === "qr.png")!;
      expect(await decodeQrImage(png.bytes)).toBe(url);
      expect(await decodeQrImage(png.bytes, 256)).toBe(url);
      const svg = site.files.find((file) => file.path === "qr.svg")!;
      expect(await decodeQrImage(svg.bytes, 1024)).toBe(url);
      expect(await decodeQrImage(svg.bytes, 256)).toBe(url);
      const preview = site.files.find((file) => file.path === site.preview.path)!;
      expect(await decodeQrImage(preview.bytes, style === "classic" ? 256 : 600)).toBe(url);
      expect(site.preview).toMatchObject(
        style === "classic" ? { width: 1024, height: 1024 } : { width: 1200, height: 630 },
      );
    },
  );

  it("B2 — the static page escapes supplied content and has a direct destination/download", async () => {
    const url = "https://example.com/?a=1&b=2";
    const site = await qrAsSite({ url, title: '<img src=x onerror="alert(1)">' });
    const html = new TextDecoder().decode(site.files[0].bytes);
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(html).toContain('download="qr-code.png"');
    expect(html).toContain('href="qr.svg" download="qr-code.svg"');
    expect(html).toContain('src="qr.png"');
  });

  it.each(["brand", "action"] as const)(
    "B9 — %s cards handle maximum titles and markup safely",
    async (style) => {
      const title = `${"W".repeat(87)}<img src=x> & Zoë`;
      const site = await qrAsSite({ url: "https://example.com/register", title, style });
      const card = site.files.find((file) => file.path === "preview.png")!;
      expect(await decodeQrImage(card.bytes, 600)).toBe("https://example.com/register");
      const html = new TextDecoder().decode(site.files[0].bytes);
      expect(html).toContain("&lt;img src=x&gt; &amp; Zoë");
      expect(html).not.toContain("<img src=x>");
    },
  );

  it("B1 B6 — accepts one supported URL and rejects unsafe or mixed payloads", () => {
    expect(createShareSchema.safeParse({ qr: { url: "https://example.com/" } }).success).toBe(true);
    const invalid = [
      { qr: { url: "" } },
      { qr: { url: "javascript:alert(1)" } },
      { qr: { url: "https:example.com" } },
      { qr: { url: "/relative" } },
      { qr: { url: "https://user:password@example.com/" } },
      { qr: { url: "https://example.com/\n" } },
      { qr: { url: `https://example.com/${"é".repeat(250)}` } },
      { qr: { url: "https://example.com/", title: "a".repeat(121) } },
      { qr: { url: "https://example.com/", style: "unknown" } },
      { qr: { url: "https://example.com/" }, html: "<p>Other content</p>" },
      { qr: { url: "https://example.com/" }, markdown: "# Other content" },
      { qr: { url: "https://example.com/" }, zipBase64: "aA==" },
    ];
    for (const value of invalid) expect(createShareSchema.safeParse(value).success).toBe(false);
  });
});
