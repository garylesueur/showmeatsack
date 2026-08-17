import {
  CURSOR_PLUGIN_HREF,
  cursorInstallPageHref,
} from "@/lib/cursor-install";
import { publicOrigin } from "@/lib/public-origin";
import { SHOWMEATSACK_SKILL_MARKDOWN } from "@/lib/showmeatsack-skill";

export const SITE_TITLE = "showmeatsack.com";
export const SITE_TAGLINE = "An agent posts a page. A person opens it.";
export const SITE_DESCRIPTION =
  "Publish HTML or a small static-site zip, paste the view link. No accounts. No API key.";

export type McpGetKind = "html" | "markdown" | "protocol";

export function mcpGetDocumentKind(request: Request): McpGetKind {
  if (request.headers.get("mcp-protocol-version")) {
    return "protocol";
  }
  const accept = request.headers.get("accept") ?? "";
  if (/\btext\/event-stream\b/i.test(accept)) {
    return "protocol";
  }
  if (/\bapplication\/json\b/i.test(accept) && !/\btext\/html\b/i.test(accept)) {
    return "protocol";
  }
  if (/\btext\/markdown\b/i.test(accept) || /\btext\/plain\b/i.test(accept)) {
    return "markdown";
  }
  if (/\btext\/html\b/i.test(accept)) {
    return "html";
  }
  return "markdown";
}

export function skillMarkdown(): string {
  return SHOWMEATSACK_SKILL_MARKDOWN;
}

export function llmsTxt(origin = publicOrigin()): string {
  return `# showmeatsack.com

> ${SITE_TAGLINE} ${SITE_DESCRIPTION}

showmeatsack.com is how an agent shares an HTML page, or a small static site, with a person. Create returns a view link that is the page, and a manage link to replace or delete it. MCP and HTTP are the same share.

## Docs

- [Skill](${origin}/skill.md): How to use the showmeatsack.com tool
- [MCP and HTTP](${origin}/mcp.md): Connect, actions, curl
- [Cursor plugin](${CURSOR_PLUGIN_HREF}): MCP plus the skill
- [Home](${origin}/): Human landing page

## Optional

- [llms.txt](${origin}/llms.txt)
`;
}

export function mcpGuideMarkdown(origin = publicOrigin()): string {
  const mcpUrl = `${origin}/mcp`;
  const createUrl = `${origin}/api/v1/shares`;
  const cursorHref = cursorInstallPageHref(mcpUrl);
  return `# showmeatsack.com

${SITE_TAGLINE} ${SITE_DESCRIPTION}

This URL is the MCP server. Browsers get a short page. Agents should fetch \`${origin}/mcp.md\` or send \`Accept: text/markdown\`. The Cursor skill is \`${origin}/skill.md\`.

## Connect

- MCP (Streamable HTTP): \`${mcpUrl}\`
- Skill: [${origin}/skill.md](${origin}/skill.md)
- This guide: [${origin}/mcp.md](${origin}/mcp.md)
- HTTP create: \`POST ${createUrl}\`
- Cursor install: ${cursorHref}
- Cursor plugin: [${CURSOR_PLUGIN_HREF}](${CURSOR_PLUGIN_HREF}) — MCP plus the skill
- Grok: [grok.com/connectors](https://grok.com/connectors) — Custom, paste the MCP URL. There is no one-click badge yet.

There is no API key and no account. Create is open.

## Tool

One tool, named \`showmeatsack.com\`. Actions: \`create\`, \`status\`, \`replace\`, \`delete\`.

POST JSON-RPC to \`${mcpUrl}\`. Do not invent extra tools, a Slack bot, or a host of your own.

## Skill

${skillMarkdown().trim()}

## HTTP

Same share as the tool.

\`\`\`
POST ${createUrl}
Content-Type: application/json

{
  "html": "<p>Hello</p>"
}
\`\`\`

Or send \`zipBase64\` instead of \`html\`. Optional \`expiresInSeconds\` (default 30 days, never longer). Cap is 5 MB.

Create returns \`viewUrl\`, \`manageUrl\`, \`manageToken\`, and \`expiresAt\`. Paste \`viewUrl\` where the person will see it. Keep \`manageToken\` for replace, delete, and status.

- Status: \`GET /api/v1/shares/{shareId}?token=\`
- Replace: \`PUT /api/v1/shares/{shareId}?token=\`
- Delete: \`DELETE /api/v1/shares/{shareId}?token=\`

## Do not

- Put the manage secret in a conversation or on the viewed page.
- Treat Slack (or any other chat) posting as a feature of this product.
`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function mcpGuideHtml(origin = publicOrigin()): string {
  const mcpUrl = `${origin}/mcp`;
  const title = escapeHtml(SITE_TITLE);
  const tagline = escapeHtml(SITE_TAGLINE);
  const description = escapeHtml(SITE_DESCRIPTION);
  const mcpEscaped = escapeHtml(mcpUrl);
  const originEscaped = escapeHtml(origin);
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} MCP</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${mcpEscaped}">
  <link rel="alternate" type="text/markdown" href="${originEscaped}/mcp.md">
  <link rel="alternate" type="text/plain" href="${originEscaped}/llms.txt">
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #141820;
      color: #f4f1ea;
      line-height: 1.6;
    }
    main { max-width: 36rem; margin: 0 auto; padding: 4rem 1.5rem; }
    p.brand { color: #9aa3b2; font-size: 0.875rem; }
    h1 { font-size: 1.75rem; font-weight: 500; letter-spacing: -0.02em; }
    a { color: #f4f1ea; }
    code, pre {
      font-family: ui-monospace, monospace;
      font-size: 0.875rem;
    }
    code {
      background: #222836;
      padding: 0.15rem 0.4rem;
      border-radius: 0.4rem;
    }
    ul { padding-left: 1.2rem; }
    .muted { color: #9aa3b2; }
  </style>
</head>
<body>
  <main>
    <p class="brand">${title}</p>
    <h1>${tagline}</h1>
    <p>${description}</p>
    <p>MCP: <code>${mcpEscaped}</code></p>
    <p>POST here for the protocol. For a guide, fetch markdown.</p>
    <ul>
      <li><a href="${originEscaped}/mcp.md">API guide (markdown)</a></li>
      <li><a href="${originEscaped}/skill.md">Skill</a></li>
      <li><a href="${escapeHtml(CURSOR_PLUGIN_HREF)}">Cursor plugin</a></li>
      <li><a href="${originEscaped}/llms.txt">llms.txt</a></li>
      <li><a href="${originEscaped}/">${title}</a></li>
    </ul>
    <p class="muted">One tool, named showmeatsack.com. Create, paste the view link.</p>
  </main>
</body>
</html>
`;
}

export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export function htmlDocumentResponse(body: string, origin = publicOrigin()): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      Link: `<${origin}/mcp.md>; rel="alternate"; type="text/markdown"`,
    },
  });
}

export function plainTextResponse(body: string, contentType: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
