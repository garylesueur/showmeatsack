/*
Regression — legacy markdown shells remain readable after their browser parser changes.

Bug (2026-08-22): a share containing markdown in a text/plain script rendered as a blank page.
Root cause: the uploaded shell used the old positional marked renderer API with a newer CDN build.
These tests lock the fix: recognised shells are rendered server-side while ordinary HTML is unchanged.
Spec context: sharing/pages/documents B2 and B3.
*/
import { describe, expect, it } from "vitest";
import { EXPIRED_SHARE_HTML, NOT_FOUND_SHARE_HTML, responseForView } from "./share-view-response";

async function readText(response: Response): Promise<string> {
  return await response.text();
}

describe("responseForView", () => {
  it("B2 B3 — markdown is shown as a GFM document with diagrams drawn", async () => {
    const response = responseForView({
      kind: "file",
      path: "index.md",
      bytes: new TextEncoder().encode(`# Isolation

| GUC | Meaning |
| --- | --- |
| org | Bound |

\`\`\`mermaid
graph TD
  A-->B
\`\`\`
`),
      contentType: "text/markdown; charset=utf-8",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    const body = await readText(response);
    expect(body).toContain("<title>Isolation</title>");
    expect(body).toContain("<table>");
    expect(body).toContain('<pre class="mermaid">');
    expect(body).toContain("mermaid.esm.min.mjs");
    expect(body).not.toContain("<script>alert");
  });

  it("repairs a recognised legacy marked shell from its embedded markdown", async () => {
    const legacy = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <title>Organisation isolation — Postgres RLS</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script type="module">
    const src = document.getElementById("src").textContent;
    const renderer = new marked.Renderer();
    renderer.code = function (code, infostring, escaped) {
      if ((infostring || "").trim() === "mermaid") return '<pre class="mermaid">' + code + "</pre>";
    };
    document.getElementById("out").innerHTML = marked.parse(src, { renderer, gfm: true });
  </script>
</head>
<body>
  <div id="out"></div>
  <script type="text/plain" id="src"># Organisation isolation

| GUC | Meaning |
| --- | --- |
| org | Bound |

\`\`\`mermaid
graph TD
  A-->B
\`\`\`
</script>
</body>
</html>`;
    const response = responseForView({
      kind: "file",
      path: "index.html",
      bytes: new TextEncoder().encode(legacy),
      contentType: "text/html; charset=utf-8",
    });

    const body = await readText(response);
    expect(body).toContain("<title>Organisation isolation</title>");
    expect(body).toContain("<table>");
    expect(body).toContain('<pre class="mermaid">');
    expect(body).not.toContain("new marked.Renderer");
  });

  it("serves a live file as itself, with nosniff and no cache", async () => {
    const html = `<script>alert(1)</script><p>Hello</p>`;
    const response = responseForView({
      kind: "file",
      path: "index.html",
      bytes: new TextEncoder().encode(html),
      contentType: "text/html; charset=utf-8",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
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
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    const body = await readText(response);
    expect(body).toBe(EXPIRED_SHARE_HTML);
    expect(body).toContain('name="robots" content="noindex, nofollow"');
    expect(body).toContain("This share has expired.");
    expect(body).not.toContain("Not found.");
  });

  it("returns the same generic 404 for unknown, deleted, missing, and bad paths", async () => {
    for (const kind of ["not_found", "bad_path"] as const) {
      const response = responseForView({ kind });
      expect(response.status).toBe(404);
      const body = await readText(response);
      expect(body).toBe(NOT_FOUND_SHARE_HTML);
      expect(body).toContain('name="robots" content="noindex, nofollow"');
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

  it("B17 — a person receives the uploaded HTML unchanged", async () => {
    const html = "<h1>Hello</h1>";
    const response = responseForView(
      {
        kind: "file",
        path: "index.html",
        bytes: new TextEncoder().encode(html),
        contentType: "text/html; charset=utf-8",
      },
      {
        request: new Request("https://s.showmeatsack.com/s/shareid1/", {
          headers: { "user-agent": "Mozilla/5.0 Safari/605.1.15" },
        }),
        shareId: "shareid1",
      },
    );
    expect(await readText(response)).toBe(html);
  });

  it("B17 — a link-preview crawler gets an image of this share", async () => {
    const response = responseForView(
      {
        kind: "file",
        path: "index.html",
        bytes: new TextEncoder().encode("<h1>Hello</h1>"),
        contentType: "text/html; charset=utf-8",
      },
      {
        request: new Request("https://s.showmeatsack.com/s/shareid1/", {
          headers: { "user-agent": "Slackbot-LinkExpanding 1.0" },
        }),
        shareId: "shareid1",
      },
    );
    const body = await readText(response);
    expect(body).toContain("<h1>Hello</h1>");
    expect(body).toContain("/s/shareid1/opengraph-image");
    expect(body).toContain('property="og:image"');
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("B17 — CSS is not rewritten for crawlers", async () => {
    const css = "p{color:red}";
    const response = responseForView(
      {
        kind: "file",
        path: "style.css",
        bytes: new TextEncoder().encode(css),
        contentType: "text/css; charset=utf-8",
      },
      {
        request: new Request("https://s.showmeatsack.com/s/shareid1/style.css", {
          headers: { "user-agent": "Slackbot-LinkExpanding 1.0" },
        }),
        shareId: "shareid1",
      },
    );
    expect(await readText(response)).toBe(css);
  });

  it("B10 B17 — expired and unknown shares do not preview another page", async () => {
    const expired = responseForView(
      { kind: "expired" },
      {
        request: new Request("https://s.showmeatsack.com/s/shareid1/", {
          headers: { "user-agent": "Slackbot-LinkExpanding 1.0" },
        }),
        shareId: "shareid1",
      },
    );
    const expiredBody = await readText(expired);
    expect(expired.status).toBe(410);
    expect(expiredBody).toBe(EXPIRED_SHARE_HTML);
    expect(expiredBody).not.toContain("opengraph-image");

    const missing = responseForView(
      { kind: "not_found" },
      {
        request: new Request("https://s.showmeatsack.com/s/shareid1/", {
          headers: { "user-agent": "Slackbot-LinkExpanding 1.0" },
        }),
        shareId: "shareid1",
      },
    );
    expect(missing.status).toBe(404);
    const missingBody = await readText(missing);
    expect(missingBody).toBe(NOT_FOUND_SHARE_HTML);
    expect(missingBody).not.toContain("opengraph-image");
    expect(missingBody).not.toContain("Hello");
  });
});
