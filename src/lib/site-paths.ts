const MAX_SHARE_PATH_LENGTH = 1024;
const CONTROL_OR_NUL = /[\u0000-\u001f\u007f]/;

export function normalizeSharePath(raw: string): string | null {
  if (CONTROL_OR_NUL.test(raw)) {
    return null;
  }
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
  const joined = parts.join("/");
  if (joined.length > MAX_SHARE_PATH_LENGTH) {
    return null;
  }
  return joined;
}
