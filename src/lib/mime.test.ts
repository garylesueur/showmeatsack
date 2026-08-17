import { describe, expect, it } from "vitest";
import { contentTypeForPath } from "./mime";

describe("contentTypeForPath", () => {
  it("labels HTML so the view link can be the page", () => {
    expect(contentTypeForPath("index.html")).toBe("text/html; charset=utf-8");
    expect(contentTypeForPath("About.HTM")).toBe("text/html; charset=utf-8");
  });

  it("labels common static-site assets", () => {
    expect(contentTypeForPath("app.js")).toBe("text/javascript; charset=utf-8");
    expect(contentTypeForPath("app.mjs")).toBe("text/javascript; charset=utf-8");
    expect(contentTypeForPath("style.css")).toBe("text/css; charset=utf-8");
    expect(contentTypeForPath("data.json")).toBe(
      "application/json; charset=utf-8",
    );
    expect(contentTypeForPath("pic.png")).toBe("image/png");
    expect(contentTypeForPath("mark.svg")).toBe("image/svg+xml");
  });

  it("does not guess a script type for an unknown or extensionless name", () => {
    expect(contentTypeForPath("README")).toBe("application/octet-stream");
    expect(contentTypeForPath("payload.exe")).toBe("application/octet-stream");
    expect(contentTypeForPath("notes.md")).toBe("application/octet-stream");
  });

  it("uses the last extension only", () => {
    expect(contentTypeForPath("archive.html.js")).toBe(
      "text/javascript; charset=utf-8",
    );
    expect(contentTypeForPath("photo.jpg.html")).toBe(
      "text/html; charset=utf-8",
    );
  });
});
