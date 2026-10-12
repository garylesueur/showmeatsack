import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { escapeHtml } from "./agent-docs";
import { COLOR_MODE_BOOT_SCRIPT } from "./color-mode";

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
    code: ["language-*"],
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
:root {
  color-scheme: light;
  --background: oklch(0.975 0.01 90);
  --foreground: oklch(0.22 0.02 55);
  --muted: oklch(0.94 0.015 90);
  --muted-foreground: oklch(0.48 0.02 55);
  --border: oklch(0.88 0.02 80);
  --card: oklch(0.995 0.006 90);
  --primary: oklch(0.44 0.09 175);
  --code-bg: oklch(0.93 0.02 90);
  --code-fg: oklch(0.22 0.02 55);
  --danger: oklch(0.48 0.14 25);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --background: oklch(0.2 0.012 80);
    --foreground: oklch(0.96 0.01 90);
    --muted: oklch(0.28 0.012 80);
    --muted-foreground: oklch(0.74 0.02 80);
    --border: oklch(1 0 0 / 12%);
    --card: oklch(0.24 0.012 80);
    --primary: oklch(0.78 0.11 172);
    --code-bg: oklch(0.16 0.012 80);
    --code-fg: oklch(0.94 0.01 90);
    --danger: oklch(0.78 0.12 22);
  }
}
html[data-theme="dark"] {
  color-scheme: dark;
  --background: oklch(0.2 0.012 80);
  --foreground: oklch(0.96 0.01 90);
  --muted: oklch(0.28 0.012 80);
  --muted-foreground: oklch(0.74 0.02 80);
  --border: oklch(1 0 0 / 12%);
  --card: oklch(0.24 0.012 80);
  --primary: oklch(0.78 0.11 172);
  --code-bg: oklch(0.16 0.012 80);
  --code-fg: oklch(0.94 0.01 90);
  --danger: oklch(0.78 0.12 22);
}
html[data-theme="light"] {
  color-scheme: light;
  --background: oklch(0.975 0.01 90);
  --foreground: oklch(0.22 0.02 55);
  --muted: oklch(0.94 0.015 90);
  --muted-foreground: oklch(0.48 0.02 55);
  --border: oklch(0.88 0.02 80);
  --card: oklch(0.995 0.006 90);
  --primary: oklch(0.44 0.09 175);
  --code-bg: oklch(0.93 0.02 90);
  --code-fg: oklch(0.22 0.02 55);
  --danger: oklch(0.48 0.14 25);
}
* { box-sizing: border-box; }
html, body { min-height: 100%; }
body {
  margin: 0;
  font: 16px/1.55 ui-sans-serif, system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
}
::selection {
  background: color-mix(in oklch, var(--primary) 32%, transparent);
  color: var(--foreground);
}
main { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
h1 { font-size: 1.85rem; line-height: 1.2; color: var(--foreground); }
h2 { margin-top: 2.2rem; color: var(--foreground); }
h3 { margin-top: 1.5rem; color: var(--foreground); }
p, li, td, th { color: var(--foreground); }
a { color: var(--primary); }
hr { border: 0; border-top: 1px solid var(--border); margin: 2rem 0; }
blockquote {
  margin: 1.2rem 0;
  padding: 0.15rem 0 0.15rem 1rem;
  border-left: 3px solid var(--border);
  color: var(--muted-foreground);
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  overflow: auto;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  background: var(--code-bg);
  color: var(--code-fg);
  border: 1px solid var(--border);
}
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  color: var(--code-fg);
}
pre code { background: transparent; color: inherit; }
:not(pre) > code {
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
th, td { border: 1px solid var(--border); padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
th { background: var(--muted); color: var(--foreground); font-weight: 600; }
td { background: var(--card); }
li { margin: 0.25rem 0; }
input[type="checkbox"] { pointer-events: none; accent-color: var(--primary); }
.diagram {
  margin: 1.5rem 0;
  overflow: auto;
  padding: 1rem;
  border-radius: 8px;
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
}
.diagram svg { max-width: 100%; height: auto; }
.diagram-error { color: var(--danger); font-size: 0.9rem; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.mode-picker {
  display: none;
  max-width: 52rem;
  margin: 0 auto;
  justify-content: flex-end;
  padding: 1rem 1.25rem 0;
}
html[data-theme] .mode-picker { display: flex; }
.mode-picker button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
}
.mode-picker svg { width: 20px; height: 20px; }
.mode-picker button:hover { background: var(--muted); color: var(--foreground); }
.mode-picker button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.mode-picker [hidden] { display: none; }
`.trim();

const COLOR_MODE_PICKER_SCRIPT = `
(function(){
  var KEY="meatsack:color-mode";
  var button=document.querySelector("[data-color-mode-toggle]");
  if(!button) return;
  function persist(mode){
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    var secure = location.protocol === "https:" ? "; Secure" : "";
    var domain = "";
    var host = location.hostname;
    if (host === "imeatsack.com" || host.endsWith(".imeatsack.com")) domain = "; Domain=.imeatsack.com";
    try { document.cookie = "meatsack_color_mode=" + mode + "; Path=/; Max-Age=31536000; SameSite=Lax" + secure + domain; } catch (e) {}
  }
  function apply(mode){
    var dark = mode === "dark" || (mode !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.setAttribute("data-color-mode", mode);
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
    root.style.colorScheme = dark ? "dark" : "light";
    updateIcon(dark);
  }
  function updateIcon(dark){
    var label = dark ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.querySelector("[data-sun]").toggleAttribute("hidden", !dark);
    button.querySelector("[data-moon]").toggleAttribute("hidden", dark);
  }
  updateIcon(document.documentElement.getAttribute("data-theme") === "dark");
  button.addEventListener("click", function(){
    var mode = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(mode);
    persist(mode);
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(){
    if ((document.documentElement.getAttribute("data-color-mode") || "auto") === "auto") apply("auto");
  });
})();
`.trim();

const MERMAID_BOOTSTRAP = `
import mermaid from "${MERMAID_ESM_URL}";

function pageIsDark() {
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function mermaidConfig() {
  const dark = pageIsDark();
  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    darkMode: dark,
    themeVariables: dark
      ? {
          darkMode: true,
          background: "#2a261f",
          primaryColor: "#3b342b",
          primaryTextColor: "#f4efe4",
          primaryBorderColor: "#6b6358",
          secondaryColor: "#241f19",
          secondaryTextColor: "#f4efe4",
          tertiaryColor: "#1c1915",
          tertiaryTextColor: "#f4efe4",
          lineColor: "#bdb4a7",
          textColor: "#f4efe4",
          mainBkg: "#3b342b",
          nodeBorder: "#6b6358",
          clusterBkg: "#241f19",
          titleColor: "#f4efe4",
          edgeLabelBackground: "#2a261f",
        }
      : {
          darkMode: false,
          background: "#f7f4ee",
          primaryColor: "#ece6da",
          primaryTextColor: "#2c271e",
          primaryBorderColor: "#c8bfb0",
          secondaryColor: "#f4efe4",
          secondaryTextColor: "#2c271e",
          tertiaryColor: "#fffdf8",
          tertiaryTextColor: "#2c271e",
          lineColor: "#6b6358",
          textColor: "#2c271e",
          mainBkg: "#ece6da",
          nodeBorder: "#c8bfb0",
          clusterBkg: "#f4efe4",
          titleColor: "#2c271e",
          edgeLabelBackground: "#f7f4ee",
        },
  };
}

function sourceFrom(node) {
  return node.getAttribute("data-mermaid") ?? node.textContent ?? "";
}

async function drawDiagrams() {
  mermaid.initialize(mermaidConfig());
  const nodes = [...document.querySelectorAll("pre.mermaid, figure.diagram[data-mermaid]")];
  let index = 0;
  for (const node of nodes) {
    const source = sourceFrom(node);
    try {
      const id = "mermaid-" + String(index++);
      const drawn = await mermaid.render(id, source);
      const figure = document.createElement("figure");
      figure.className = "diagram";
      figure.setAttribute("data-mermaid", source);
      figure.innerHTML = drawn.svg;
      node.replaceWith(figure);
    } catch {
      if (node.matches("pre.mermaid") && !node.previousElementSibling?.classList.contains("diagram-error")) {
        const note = document.createElement("p");
        note.className = "diagram-error";
        note.textContent = "This diagram could not be drawn.";
        node.before(note);
      }
    }
  }
}

await drawDiagrams();
const observer = new MutationObserver(() => {
  void drawDiagrams();
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
`.trim();

export function wrapMarkdownDocument(bodyHtml: string, title: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <script>${COLOR_MODE_BOOT_SCRIPT}</script>
  <style>${DOCUMENT_STYLES}</style>
</head>
<body>
  <header class="mode-picker">
    <button type="button" data-color-mode-toggle aria-label="Switch to dark mode" title="Switch to dark mode">
      <svg data-moon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z" /></svg>
      <svg data-sun hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
    </button>
  </header>
  <main>${bodyHtml}</main>
  <script>${COLOR_MODE_PICKER_SCRIPT}</script>
  <script type="module">${MERMAID_BOOTSTRAP}</script>
</body>
</html>
`;
}

export function renderMarkdownDocument(markdown: string): string {
  const body = renderMarkdownBody(markdown);
  return wrapMarkdownDocument(body, titleFromMarkdownHtml(body));
}
