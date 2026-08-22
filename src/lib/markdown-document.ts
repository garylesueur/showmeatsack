import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { escapeHtml } from "./agent-docs";

export const MERMAID_ESM_URL =
  "https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.esm.min.mjs";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function slugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "section";
}

function languageName(lang: string | undefined): string {
  const token = (lang ?? "").trim().split(/\s+/)[0] ?? "";
  if (!/^[A-Za-z0-9_+#-]+$/.test(token)) {
    return "";
  }
  return token;
}

function markdownToHtml(markdown: string): string {
  const slugs = new Map<string, number>();
  const marked = new Marked({
    gfm: true,
    renderer: {
      code({ text, lang }) {
        const language = languageName(lang);
        if (language.toLowerCase() === "mermaid") {
          return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`;
        }
        const classAttr = language ? ` class="language-${language}"` : "";
        return `<pre><code${classAttr}>${escapeHtml(text)}</code></pre>\n`;
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const plain = inner.replace(/<[^>]+>/g, "");
        const base = slugify(plain);
        const seen = slugs.get(base) ?? 0;
        slugs.set(base, seen + 1);
        const id = seen === 0 ? base : `${base}-${seen}`;
        return `<h${depth} id="${escapeHtml(id)}">${inner}</h${depth}>\n`;
      },
      image({ text }) {
        return escapeHtml(text);
      },
    },
  });
  return marked.parse(markdown, { async: false });
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...HEADING_TAGS,
    "a",
    "blockquote",
    "br",
    "code",
    "del",
    "em",
    "figure",
    "hr",
    "input",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    code: ["class"],
    input: ["type", "checked", "disabled"],
    pre: ["class"],
    td: ["align"],
    th: ["align"],
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
  },
  allowedClasses: {
    code: true,
    pre: ["mermaid"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      if (/^https?:/i.test(href)) {
        return {
          tagName,
          attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
        };
      }
      return { tagName, attribs };
    },
    input: (tagName, attribs) => {
      if (attribs.type !== "checkbox") {
        return { tagName: "span", attribs: {} };
      }
      return {
        tagName,
        attribs: {
          type: "checkbox",
          disabled: "disabled",
          ...(attribs.checked !== undefined ? { checked: "checked" } : {}),
        },
      };
    },
  },
};

export function renderMarkdownBody(markdown: string): string {
  return sanitizeHtml(markdownToHtml(markdown), SANITIZE_OPTIONS);
}

export function titleFromMarkdownHtml(html: string): string {
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!heading) {
    return "Document";
  }
  const title = heading[1].replace(/<[^>]+>/g, "").trim();
  return title || "Document";
}

const DOCUMENT_STYLES = `
:root { color-scheme: light dark; }
body {
  margin: 0;
  font: 16px/1.55 ui-sans-serif, system-ui, sans-serif;
  background: #f6f4ef;
  color: #1c1915;
}
@media (prefers-color-scheme: dark) {
  body { background: #161411; color: #efe8dc; }
  a { color: #9ec5ff; }
  pre, code { background: #2a241c; }
  table { border-color: #3a3329; }
  th { background: #241f19; }
}
main { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
h1 { font-size: 1.85rem; line-height: 1.2; }
h2 { margin-top: 2.2rem; }
h3 { margin-top: 1.5rem; }
a { color: #1546b0; }
pre { overflow: auto; padding: 0.9rem 1rem; border-radius: 8px; background: #ece6da; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
:not(pre) > code { background: #ece6da; padding: 0.1em 0.35em; border-radius: 4px; }
table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
th, td { border: 1px solid #d7cfc0; padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
th { background: #efe8dc; }
li { margin: 0.25rem 0; }
input[type="checkbox"] { pointer-events: none; }
.diagram { margin: 1.5rem 0; overflow: auto; }
.diagram svg { max-width: 100%; height: auto; }
.diagram-error { color: #8a2f2f; font-size: 0.9rem; }
@media (prefers-color-scheme: dark) {
  .diagram-error { color: #f0a3a3; }
}
`.trim();

const MERMAID_BOOTSTRAP = `
import mermaid from "${MERMAID_ESM_URL}";
const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: dark ? "dark" : "neutral",
});
const blocks = document.querySelectorAll("pre.mermaid");
let index = 0;
for (const block of blocks) {
  const source = block.textContent ?? "";
  try {
    const id = "mermaid-" + String(index++);
    const drawn = await mermaid.render(id, source);
    const figure = document.createElement("figure");
    figure.className = "diagram";
    figure.innerHTML = drawn.svg;
    block.replaceWith(figure);
  } catch {
    const note = document.createElement("p");
    note.className = "diagram-error";
    note.textContent = "This diagram could not be drawn.";
    block.before(note);
  }
}
`.trim();

export function wrapMarkdownDocument(bodyHtml: string, title: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>${DOCUMENT_STYLES}</style>
</head>
<body>
  <main>${bodyHtml}</main>
  <script type="module">${MERMAID_BOOTSTRAP}</script>
</body>
</html>
`;
}

export function renderMarkdownDocument(markdown: string): string {
  const body = renderMarkdownBody(markdown);
  return wrapMarkdownDocument(body, titleFromMarkdownHtml(body));
}
