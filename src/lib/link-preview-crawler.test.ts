import { describe, expect, it } from "vitest";
import { isLinkPreviewCrawler } from "./link-preview-crawler";

describe("link-preview crawlers", () => {
  it("B17 — recognises Slack, Facebot, and Discord fetchers", () => {
    expect(isLinkPreviewCrawler("Slackbot-LinkExpanding 1.0")).toBe(true);
    expect(isLinkPreviewCrawler("facebookexternalhit/1.1 Facebot Twitterbot/1.0")).toBe(true);
    expect(isLinkPreviewCrawler("Mozilla/5.0 (compatible; Discordbot/2.0)")).toBe(true);
  });

  it("B17 — a person in a browser is not a crawler", () => {
    expect(
      isLinkPreviewCrawler(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      ),
    ).toBe(false);
    expect(isLinkPreviewCrawler(null)).toBe(false);
  });
});
