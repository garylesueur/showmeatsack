const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/giu;

function attribute(attributes: string, name: string): string | null {
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, "iu");
  return attributes.match(pattern)?.[2] ?? null;
}

/**
 * Recovers markdown from the old client-rendered shell agents commonly
 * published before showmeatsack.com accepted markdown directly.
 *
 * This deliberately recognises the broken positional marked renderer API,
 * rather than treating every page containing a text/plain script as markdown.
 */
export function markdownFromLegacyShell(html: string): string | null {
  if (
    !/\bnew\s+marked\.Renderer\s*\(\s*\)/u.test(html) ||
    !/\brenderer\.code\s*=\s*function\s*\(\s*code\s*,\s*infostring\b/u.test(html) ||
    !/\bmarked\.parse\s*\(\s*src\b/u.test(html) ||
    !/getElementById\s*\(\s*["']out["']\s*\)/u.test(html)
  ) {
    return null;
  }

  for (const match of html.matchAll(SCRIPT)) {
    const attributes = match[1] ?? "";
    if (
      attribute(attributes, "type")?.toLowerCase() === "text/plain" &&
      attribute(attributes, "id") === "src"
    ) {
      const markdown = match[2] ?? "";
      return markdown.trim() ? markdown : null;
    }
  }

  return null;
}
