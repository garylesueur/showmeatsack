import { describe, expect, it } from "vitest";
import { responseForShareView } from "./share-view-http";

function htmlRequest(userAgent: string): Request {
  return new Request("https://showmeatsack.com/s/shareid1/", {
    headers: { "user-agent": userAgent },
  });
}

describe("share view HTTP", () => {
  it("B2 B14 — a person receives the uploaded HTML unchanged", async () => {
    const response = responseForShareView(
      htmlRequest("Mozilla/5.0 Safari/605.1.15"),
      "shareid1",
      {
        kind: "file",
        path: "index.html",
        bytes: new TextEncoder().encode("<h1>Hello</h1>"),
        contentType: "text/html; charset=utf-8",
      },
    );
    expect(await response.text()).toBe("<h1>Hello</h1>");
  });

  it("B14 — a link-preview crawler gets an image of this share", async () => {
    const response = responseForShareView(
      htmlRequest("Slackbot-LinkExpanding 1.0"),
      "shareid1",
      {
        kind: "file",
        path: "index.html",
        bytes: new TextEncoder().encode("<h1>Hello</h1>"),
        contentType: "text/html; charset=utf-8",
      },
    );
    const body = await response.text();
    expect(body).toContain("<h1>Hello</h1>");
    expect(body).toContain("/s/shareid1/opengraph-image");
    expect(body).toContain('property="og:image"');
  });

  it("B14 — CSS is not rewritten for crawlers", async () => {
    const css = "p{color:red}";
    const response = responseForShareView(
      htmlRequest("Slackbot-LinkExpanding 1.0"),
      "shareid1",
      {
        kind: "file",
        path: "style.css",
        bytes: new TextEncoder().encode(css),
        contentType: "text/css; charset=utf-8",
      },
    );
    expect(await response.text()).toBe(css);
  });

  it("B10 B14 — expired and unknown shares do not preview another page", async () => {
    const expired = responseForShareView(
      htmlRequest("Slackbot-LinkExpanding 1.0"),
      "shareid1",
      { kind: "expired" },
    );
    const expiredBody = await expired.text();
    expect(expired.status).toBe(410);
    expect(expiredBody).toContain("expired");
    expect(expiredBody).not.toContain("opengraph-image");

    const missing = responseForShareView(
      htmlRequest("Slackbot-LinkExpanding 1.0"),
      "shareid1",
      { kind: "not_found" },
    );
    expect(missing.status).toBe(404);
    const missingBody = await missing.text();
    expect(missingBody).not.toContain("opengraph-image");
    expect(missingBody).not.toContain("Hello");
  });
});
