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
});
