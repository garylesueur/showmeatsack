import type { Metadata } from "next";

export const LANDING_ORIGIN = "https://imeatsack.com";
export const LANDING_NAME = "I, Meatsack";
export const LANDING_TITLE = "I, Meatsack — Ask. Share. Show.";
export const LANDING_DESCRIPTION =
  "Give your AI agent a way to ask people questions, exchange files, and show its work. Meet Ask, Share and Show.";

export const LANDING_PRODUCTS = [
  {
    name: "Ask",
    domain: "ask.imeatsack.com",
    description:
      "Ask people for context, decisions and missing details through a questionnaire link.",
  },
  {
    name: "Share",
    domain: "share.imeatsack.com",
    description: "Send files to people or request originals through an upload and download link.",
  },
  {
    name: "Show",
    domain: "show.imeatsack.com",
    description:
      "Publish HTML, Markdown, reports, presentations and small sites for people to view.",
  },
] as const;

export const landingMetadata: Metadata = {
  metadataBase: new URL(LANDING_ORIGIN),
  title: LANDING_TITLE,
  description: LANDING_DESCRIPTION,
  applicationName: LANDING_NAME,
  authors: [{ name: "Gary Le Sueur", url: "https://gaz.dev" }],
  creator: "Gary Le Sueur",
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md", "text/plain": "/llms.txt" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: LANDING_ORIGIN,
    siteName: LANDING_NAME,
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: LANDING_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    images: [{ url: "/opengraph-image", alt: LANDING_TITLE }],
  },
};

export const landingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${LANDING_ORIGIN}/#website`,
      name: LANDING_NAME,
      alternateName: "imeatsack.com",
      url: LANDING_ORIGIN,
      description: LANDING_DESCRIPTION,
      inLanguage: "en-GB",
    },
    {
      "@type": "CollectionPage",
      "@id": `${LANDING_ORIGIN}/#webpage`,
      url: LANDING_ORIGIN,
      name: LANDING_TITLE,
      description: LANDING_DESCRIPTION,
      isPartOf: { "@id": `${LANDING_ORIGIN}/#website` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: LANDING_PRODUCTS.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            name: product.domain,
            url: `https://${product.domain}`,
            description: product.description,
            applicationSuite: LANDING_NAME,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
          },
        })),
      },
    },
  ],
};

export const landingMarkdown = `# I, Meatsack

> ${LANDING_DESCRIPTION}

Your agent needs a way to reach people. Ask questions. Exchange files. Show the work.
People bring the context. Agents do the legwork. A link is where they meet.

${LANDING_PRODUCTS.map(
  (product) => `## ${product.name}

${product.description}

- [${product.domain}](https://${product.domain})
- [Install ${product.name}](https://${product.domain}/install)
- [Product overview in Markdown](https://${product.domain}/index.md)
- [Complete product documentation](https://${product.domain}/llms-full.txt)
- [Agent guide](https://${product.domain}/llms.txt)
- [Skill](https://${product.domain}/skill.md)
- [MCP and HTTP documentation](https://${product.domain}/mcp.md)

`,
).join("")}## Installation

Install the tool your agent needs using its existing product installation guide.
The [Meatsack marketplace](https://github.com/garylesueur/meatsack-marketplace)
lists the products as independently installable plugins. Each product has its own
subdomain and MCP connection. Old product URLs redirect to their new addresses,
including existing Show view links. The umbrella site does not provide
a combined MCP endpoint or replace the products' APIs.

Built by [Gary Le Sueur](https://gaz.dev).
Canonical home: ${LANDING_ORIGIN}/
`;

export const landingLlmsTxt = `# I, Meatsack

> ${LANDING_DESCRIPTION}

I, Meatsack is the umbrella site for Ask, Share and Show. Each product has its own
installation instructions and MCP server. Follow the product guides for current
tool schemas; do not infer a combined MCP server from this landing page.

## Overview

- [I, Meatsack](https://imeatsack.com/index.md): Markdown overview and product links.
- [Full overview](https://imeatsack.com/llms-full.txt): Complete landing-page information.

## Products

${LANDING_PRODUCTS.map((product) => `- [${product.name}](https://${product.domain}/llms.txt): ${product.description}`).join("\n")}

## Installation

${LANDING_PRODUCTS.map((product) => `- [Install ${product.name}](https://${product.domain}/install): Plugin and direct MCP setup.`).join("\n")}
- [Marketplace](https://github.com/garylesueur/meatsack-marketplace): Product plugin listings.
`;

export function landingTextResponse(contents: string, contentType: string): Response {
  return new Response(contents, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "X-Robots-Tag": "noindex, follow",
      Link: `<${LANDING_ORIGIN}/>; rel="canonical", </llms.txt>; rel="describedby"; type="text/plain"`,
    },
  });
}
