import { describe, expect, it } from "vitest";
import { VIEW_CACHE_HEADERS } from "@/lib/share-view-response";
import robots from "./robots";
import sitemap from "./sitemap";

import { GET as markdownHome } from "./index.md/route";
import { GET as fullDocumentation } from "./llms-full.txt/route";
import { mcpGuideMarkdown, siteJsonLd } from "@/lib/agent-docs";

describe("public crawler files", () => {
  it("lists the public documents and keeps shares off the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      "https://show.imeatsack.com",
      "https://show.imeatsack.com/install",
      "https://show.imeatsack.com/mcp",
      "https://show.imeatsack.com/mcp.md",
      "https://show.imeatsack.com/skill.md",
      "https://show.imeatsack.com/llms.txt",
    ]);
    expect(urls.join(" ")).not.toContain("/s/");
    expect(urls.join(" ")).not.toContain("/api/");
  });

  it("allows the public site and disallows API and agent rewrites", () => {
    const file = robots();
    expect(file.host).toBe("https://show.imeatsack.com");
    expect(file.sitemap).toBe("https://show.imeatsack.com/sitemap.xml");
    expect(file.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/agent/"],
    });
  });

  it("B6 — does not block fetching a view link, which noindex already covers", () => {
    const file = robots();
    const disallow = (file.rules as { disallow: string[] }).disallow;
    expect(disallow).not.toContain("/s/");
    expect(VIEW_CACHE_HEADERS["X-Robots-Tag"]).toBe("noindex, nofollow");
  });
  it("serves canonical text equivalents with the current guide and family identity", async () => {
    const home = markdownHome();
    const full = fullDocumentation();
    expect(home.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(full.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    for (const response of [home, full]) {
      expect(response.headers.get("X-Robots-Tag")).toBe("noindex, follow");
      expect(response.headers.get("Link")).toContain(
        '<https://show.imeatsack.com/>; rel="canonical"',
      );
    }
    const overview = await home.text();
    expect(overview).toContain("https://imeatsack.com");
    expect(overview).toContain("https://show.imeatsack.com/install");
    expect(await full.text()).toContain(mcpGuideMarkdown());
    const schema = siteJsonLd()["@graph"];
    expect(schema).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "SoftwareApplication",
          applicationSuite: "I, Meatsack",
        }),
        expect.objectContaining({
          "@type": "WebSite",
          isPartOf: expect.objectContaining({ "@id": "https://imeatsack.com/#website" }),
        }),
      ]),
    );
  });
});
