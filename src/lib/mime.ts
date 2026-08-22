const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".markdown": "text/markdown; charset=utf-8",
  ".map": "application/json",
};

export function contentTypeForPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot === -1) {
    return "application/octet-stream";
  }
  return types[lower.slice(dot)] ?? "application/octet-stream";
}

const TEXT_SUFFIXES = ["+json", "+xml"];
const TEXT_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/javascript",
  "image/svg+xml",
]);

export function isMarkdownContentType(contentType: string): boolean {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return base === "text/markdown" || base === "text/x-markdown";
}

export function isTextContentType(contentType: string): boolean {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (base.startsWith("text/")) {
    return true;
  }
  if (TEXT_TYPES.has(base)) {
    return true;
  }
  return TEXT_SUFFIXES.some((suffix) => base.endsWith(suffix));
}
