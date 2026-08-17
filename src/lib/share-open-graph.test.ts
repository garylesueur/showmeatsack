import { describe, expect, it } from "vitest";
import { SITE_TITLE } from "./agent-docs";
import {
  descriptionFromHtml,
  inlineLocalShareAssets,
  shareOpenGraphUrls,
  titleFromHtml,
  withOpenGraphMeta,
} from "./share-open-graph";

const png = {
  bytes: new Uint8Array([1, 2, 3]),
  contentType: "image/png",
};

describe("share Open Graph", () => {
  it("B14 — preview image URL is on that share, not the homepage", () => {
    expect(shareOpenGraphUrls("https://showmeatsack.com", "shareid1")).toEqual({
      pageUrl: "https://showmeatsack.com/s/shareid1/",
      imageUrl: "https://showmeatsack.com/s/shareid1/opengraph-image",
    });
  });

  it("B14 — prefers the page title, then an h1", () => {
    expect(titleFromHtml("<title>Report</title><h1>Other</h1>")).toBe("Report");
    expect(titleFromHtml("<h1>Chart</h1>")).toBe("Chart");
    expect(titleFromHtml("<p>No title</p>")).toBe(SITE_TITLE);
  });

  it("B14 — wraps a fragment so crawlers can read the tags", () => {
    const html = withOpenGraphMeta("<h1>Hello</h1>", {
      title: "Hello",
      description: "A page",
      imageUrl: "https://showmeatsack.com/s/shareid1/opengraph-image",
      pageUrl: "https://showmeatsack.com/s/shareid1/",
    });
    expect(html).toContain('property="og:image"');
    expect(html).toContain(
      "https://showmeatsack.com/s/shareid1/opengraph-image",
    );
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain('name="twitter:card"');
  });

  it("B14 — inlines local CSS and images before a screenshot", async () => {
    const html = await inlineLocalShareAssets(
      `<link rel="stylesheet" href="style.css"><p>Hi</p><img src="pic.png">`,
      async (path) => {
        if (path === "style.css") {
          return {
            bytes: new TextEncoder().encode("p{color:red}"),
            contentType: "text/css; charset=utf-8",
          };
        }
        if (path === "pic.png") {
          return png;
        }
        return null;
      },
    );
    expect(html).toContain("p{color:red}");
    expect(html).not.toContain('href="style.css"');
    expect(html).toContain("data:image/png;base64,");
    expect(html).not.toContain('src="pic.png"');
  });

  it("does not fetch remote assets", async () => {
    const html = await inlineLocalShareAssets(
      `<img src="https://evil.example/x.png">`,
      async () => png,
    );
    expect(html).toContain("https://evil.example/x.png");
    expect(html).not.toContain("data:image/png");
  });

  it("reads a meta description when the page has one", () => {
    expect(
      descriptionFromHtml(
        `<meta name="description" content="Quarterly chart">`,
      ),
    ).toBe("Quarterly chart");
  });
});
