export function normalizeSharePath(raw: string): string | null {
  const trimmed = raw.replaceAll("\\", "/").replace(/^\/+/, "");
  if (trimmed === "" || trimmed === ".") {
    return "index.html";
  }
  const parts: string[] = [];
  for (const part of trimmed.split("/")) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      return null;
    }
    parts.push(part);
  }
  if (parts.length === 0) {
    return "index.html";
  }
  return parts.join("/");
}
