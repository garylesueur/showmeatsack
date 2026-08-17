import { describe, expect, it } from "vitest";
import {
  EXPIRED_SHARE_HTML,
  NOT_FOUND_SHARE_HTML,
  responseForView,
} from "./share-view-response";

async function readText(response: Response): Promise<string> {
  return await response.text();
}

describe("responseForView", () => {
  it("serves a live file as itself, with nosniff and no cache", async () => {
    const html = `<script>alert(1)</script><p>Hello</p>`;
    const response = responseForView({
      kind: "file",
      path: "index.html",
      bytes: new TextEncoder().encode(html),
      contentType: "text/html; charset=utf-8",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Cache-Control")).toContain("no-cache");
    expect(await readText(response)).toBe(html);
  });

  it("does not rewrite a CSS or JS asset into HTML", async () => {
    const css = responseForView({
      kind: "file",
      path: "style.css",
      bytes: new TextEncoder().encode("p{color:red}"),
      contentType: "text/css; charset=utf-8",
    });
    expect(css.status).toBe(200);
    expect(css.headers.get("Content-Type")).toBe("text/css; charset=utf-8");
    expect(css.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await readText(css)).toBe("p{color:red}");
  });

  it("returns 410 for an expired share, not a 404", async () => {
    const response = responseForView({ kind: "expired" });
    expect(response.status).toBe(410);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    const body = await readText(response);
    expect(body).toBe(EXPIRED_SHARE_HTML);
    expect(body).toContain("This share has expired.");
    expect(body).not.toContain("Not found.");
  });

  it("returns the same generic 404 for unknown, deleted, missing, and bad paths", async () => {
    for (const kind of ["not_found", "bad_path"] as const) {
      const response = responseForView({ kind });
      expect(response.status).toBe(404);
      const body = await readText(response);
      expect(body).toBe(NOT_FOUND_SHARE_HTML);
      expect(body).toContain("Not found.");
      expect(body).not.toContain("expired");
      expect(body).not.toContain("shareid");
      expect(body).not.toContain("token");
    }
  });

  it("does not put a manage secret into error pages", async () => {
    const expired = await readText(responseForView({ kind: "expired" }));
    const missing = await readText(responseForView({ kind: "not_found" }));
    expect(expired).not.toContain("managetoken");
    expect(missing).not.toContain("managetoken");
    expect(expired).not.toContain("Authorization");
    expect(missing).not.toContain("Authorization");
  });
});
