/*
Regression — fenced code languages must render without taking a share offline.

Bug (2026-08-23): opening a markdown share containing a labelled code fence returned HTTP 500.
Root cause: the sanitiser received a boolean code-class allowlist and called indexOf on it.
These tests lock the fix: language classes survive sanitisation and the document renders normally.
Spec context: sharing/pages/documents B2.
*/
import { describe, expect, it } from "vitest";
import { MERMAID_ESM_URL, renderMarkdownBody, renderMarkdownDocument } from "./markdown-document";

describe("renderMarkdownBody", () => {
  it("B2 — GitHub-flavoured markdown: tables, task lists, strikethrough", () => {
    const html = renderMarkdownBody(`
# Title

| GUC | Meaning |
| --- | --- |
| \`app.organization_id\` | Bound organisation |

- [x] shipped
- [ ] still open

This is ~~not~~ current.
`);
    expect(html).toContain("<table>");
    expect(html).toContain("<th>");
    expect(html).toContain("app.organization_id");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
    expect(html).toContain("<del>");
    expect(html).toContain('id="title"');
  });

  it("B3 — a mermaid fence stays a diagram block, not a code listing", () => {
    const html = renderMarkdownBody(`
\`\`\`mermaid
graph TD
  A-->B
\`\`\`
`);
    expect(html).toContain('<pre class="mermaid">');
    expect(html).toContain("A--&gt;B");
    expect(html).not.toContain("<code");
  });

  it("B2 — a labelled code fence keeps its language class", () => {
    const html = renderMarkdownBody(`
\`\`\`typescript
const answer = 42;
\`\`\`
`);
    expect(html).toContain('<code class="language-typescript">');
    expect(html).toContain("const answer = 42;");
  });

  it("B7 — markup and scripts in the document are text, not run", () => {
    const html = renderMarkdownBody(
      `Hello <script>alert(1)</script> <img src="https://evil.example/x.gif">`,
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("alert(1)");
  });
});

describe("renderMarkdownDocument", () => {
  it("wraps the document so mermaid can be drawn in the browser", () => {
    const page = renderMarkdownDocument("# Isolation\n\n```mermaid\ngraph TD\n  A-->B\n```\n");
    expect(page).toContain("<title>Isolation</title>");
    expect(page).toContain('<pre class="mermaid">');
    expect(page).toContain(MERMAID_ESM_URL);
    expect(page).toContain('securityLevel: "strict"');
  });

  it("B10 — code and tables follow the document colours, not a leftover light highlight", () => {
    const page = renderMarkdownDocument("# Isolation\n\n`token`\n");
    expect(page).toContain('html[data-theme="dark"]');
    expect(page).toContain("--code-bg:");
    expect(page).toContain("--code-fg:");
    expect(page).toContain("background: var(--code-bg)");
    expect(page).toContain("color: var(--code-fg)");
    expect(page).toContain("background: var(--card)");
    expect(page).not.toContain("color-scheme: light dark");
  });

  it("B10 — a Light, Auto, and Dark control is on the page and remembered", () => {
    const page = renderMarkdownDocument("# Isolation\n");
    expect(page).toContain("data-color-mode-picker");
    expect(page).toContain('value="light"');
    expect(page).toContain('value="auto"');
    expect(page).toContain('value="dark"');
    expect(page).toContain("meatsack:color-mode");
    expect(page).toContain("meatsack_color_mode");
  });
});
