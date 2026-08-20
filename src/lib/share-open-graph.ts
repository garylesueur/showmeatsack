import { SHARE_MAX_BYTES } from "./schema";
import { SITE_TAGLINE, SITE_TITLE } from "./agent-docs";
import type { StoredFile } from "./file-store";
import { normalizeSharePath } from "./site-paths";

export const SHARE_OPENGRAPH_PATH = "opengraph-image";

export const OPENGRAPH_SIZE = {
  width: 1200,
  height: 630,
} as const;

export type ShareOpenGraph = {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
};

export function shareOpenGraphUrls(
  origin: string,
  shareId: string,
): { pageUrl: string; imageUrl: string } {
  const base = origin.replace(/\/$/, "");
  return {
    // og:url is the canonical address of the page, so it takes the form that
    // serves the page directly rather than the one that redirects to it.
    pageUrl: `${base}/s/${shareId}`,
    imageUrl: `${base}/s/${shareId}/${SHARE_OPENGRAPH_PATH}`,
  };
}

export function titleFromHtml(html: string): string {
  const titled = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const fromTitle = titled?.[1]
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (fromTitle) {
    return fromTitle;
  }
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const fromHeading = heading?.[1]
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (fromHeading) {
    return fromHeading;
  }
  const visible = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (visible) {
    return visible.slice(0, 120);
  }
  return "Shared page";
}

export function descriptionFromHtml(html: string): string {
  const meta = html.match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i);
  const fromName = meta?.[0] ? attributeValue(meta[0], "content") : null;
  if (fromName?.trim()) {
    return fromName.trim();
  }
  return SITE_TAGLINE;
}

export function openGraphMetaTags(og: ShareOpenGraph): string {
  const tags = [
    ["og:site_name", SITE_TITLE],
    ["og:title", og.title],
    ["og:description", og.description],
    ["og:type", "website"],
    ["og:url", og.pageUrl],
    ["og:image", og.imageUrl],
    ["og:image:type", "image/png"],
    ["og:image:width", String(OPENGRAPH_SIZE.width)],
    ["og:image:height", String(OPENGRAPH_SIZE.height)],
  ];
  const properties = tags
    .map(
      ([property, content]) =>
        `<meta property="${escapeAttr(property)}" content="${escapeAttr(content)}">`,
    )
    .join("");
  return `${properties}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${escapeAttr(og.imageUrl)}">`;
}

export function withOpenGraphMeta(html: string, og: ShareOpenGraph): string {
  const tags = openGraphMetaTags(og);
  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${tags}`);
  }
  if (/<html[\s>]/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${tags}</head>`);
  }
  return `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8">${tags}</head><body>${html}</body></html>`;
}

export async function inlineLocalShareAssets(
  html: string,
  load: (path: string) => Promise<StoredFile | null>,
): Promise<string> {
  const cache = new Map<string, Promise<StoredFile | null>>();
  const skipped = new Set<string>();
  const counted = new Set<string>();
  let inlinedBytes = 0;

  async function loadOnce(path: string): Promise<StoredFile | null> {
    if (skipped.has(path)) {
      return null;
    }
    let pending = cache.get(path);
    if (!pending) {
      pending = load(path);
      cache.set(path, pending);
    }
    const file = await pending;
    if (!file) {
      return null;
    }
    if (!counted.has(path)) {
      if (inlinedBytes + file.bytes.byteLength > SHARE_MAX_BYTES) {
        skipped.add(path);
        return null;
      }
      counted.add(path);
      inlinedBytes += file.bytes.byteLength;
    }
    return file;
  }

  const withSheets = await replaceAsync(html, /<link\b[^>]*>/gi, async (tag) => {
    if (!/\brel\s*=\s*["']?stylesheet["']?/i.test(tag)) {
      return tag;
    }
    const href = attributeValue(tag, "href");
    const path = href ? localSharePath(href) : null;
    if (!path) {
      return tag;
    }
    const file = await loadOnce(path);
    if (!file) {
      return tag;
    }
    const css = await inlineCssUrls(new TextDecoder().decode(file.bytes), loadOnce);
    return `<style>${css}</style>`;
  });

  const withImages = await replaceAsync(withSheets, /<img\b[^>]*>/gi, async (tag) => {
    const src = attributeValue(tag, "src");
    const path = src ? localSharePath(src) : null;
    if (!path) {
      return tag;
    }
    const file = await loadOnce(path);
    if (!file) {
      return tag;
    }
    return tag.replace(/\bsrc\s*=\s*["'][^"']*["']/i, `src="${asDataUri(file)}"`);
  });

  return inlineCssUrls(withImages, loadOnce);
}

async function inlineCssUrls(
  css: string,
  load: (path: string) => Promise<StoredFile | null>,
): Promise<string> {
  return replaceAsync(css, /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, async (match) => {
    const raw = match.replace(/^url\(\s*['"]?/i, "").replace(/['"]?\s*\)$/i, "");
    const path = localSharePath(raw);
    if (!path) {
      return match;
    }
    const file = await load(path);
    if (!file) {
      return match;
    }
    return `url("${asDataUri(file)}")`;
  });
}

export function localSharePath(href: string): string | null {
  const trimmed = href.trim();
  if (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("blob:")
  ) {
    return null;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith("//")) {
    return null;
  }
  return normalizeSharePath(trimmed.split("?")[0]?.split("#")[0] ?? trimmed);
}

function asDataUri(file: StoredFile): string {
  const mime = file.contentType.split(";")[0]?.trim() || "application/octet-stream";
  return `data:${mime};base64,${Buffer.from(file.bytes).toString("base64")}`;
}

function attributeValue(tag: string, name: string): string | null {
  const quoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return quoted?.[1] ?? null;
}

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function replaceAsync(
  input: string,
  pattern: RegExp,
  replace: (match: string) => Promise<string>,
): Promise<string> {
  const matches = [...input.matchAll(pattern)];
  if (matches.length === 0) {
    return input;
  }
  let output = "";
  let last = 0;
  for (const match of matches) {
    const at = match.index ?? 0;
    output += input.slice(last, at);
    output += await replace(match[0]);
    last = at + match[0].length;
  }
  output += input.slice(last);
  return output;
}
