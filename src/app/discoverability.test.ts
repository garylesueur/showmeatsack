import { describe, expect, it } from "vitest";
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

  it("allows the public site and disallows API, shares, and agent rewrites", () => {
    const file = robots();
    expect(file.host).toBe("https://showmeatsack.com");
    expect(file.sitemap).toBe("https://showmeatsack.com/sitemap.xml");
    expect(file.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/s/", "/agent/"],
    });
  });
});
