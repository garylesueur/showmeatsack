import { describe, expect, it } from "vitest";
import { VIEW_CACHE_HEADERS } from "@/lib/share-view-response";
import robots from "./robots";
import sitemap from "./sitemap";

describe("public crawler files", () => {
  it("lists the public documents and keeps shares off the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      "https://showmeatsack.com",
      "https://showmeatsack.com/mcp",
      "https://showmeatsack.com/mcp.md",
      "https://showmeatsack.com/skill.md",
      "https://showmeatsack.com/llms.txt",
    ]);
    expect(urls.join(" ")).not.toContain("/s/");
    expect(urls.join(" ")).not.toContain("/api/");
  });

  it("allows the public site and disallows API and agent rewrites", () => {
    const file = robots();
    expect(file.host).toBe("https://showmeatsack.com");
    expect(file.sitemap).toBe("https://showmeatsack.com/sitemap.xml");
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
});
