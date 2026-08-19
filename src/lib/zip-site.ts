import { unzipSync, type UnzipFileInfo } from "fflate";
import { SHARE_MAX_BYTES } from "./schema";
import { normalizeSharePath } from "./site-paths";

export type SiteFile = {
  path: string;
  bytes: Uint8Array;
};

export type UnpackResult = { ok: true; files: SiteFile[] } | { ok: false; message: string };

function shouldSkipEntry(name: string): boolean {
  const normalized = name.replaceAll("\\", "/");
  if (normalized.endsWith("/")) {
    return true;
  }
  const base = normalized.split("/").at(-1) ?? "";
  if (base === ".DS_Store") {
    return true;
  }
  if (normalized.startsWith("__MACOSX/") || normalized.includes("/__MACOSX/")) {
    return true;
  }
  return false;
}

function stripWrappingFolder(paths: string[]): string[] | null {
  const firstSegments = new Set<string>();
  for (const path of paths) {
    const first = path.split("/")[0];
    if (!first) {
      return null;
    }
    firstSegments.add(first);
  }
  if (firstSegments.size !== 1) {
    return null;
  }
  const folder = [...firstSegments][0];
  const stripped: string[] = [];
  for (const path of paths) {
    if (!path.startsWith(`${folder}/`)) {
      return null;
    }
    stripped.push(path.slice(folder.length + 1));
  }
  return stripped;
}

/**
 * Refuses an archive that would expand past the cap, *before* anything is
 * decompressed.
 *
 * fflate calls this against the central directory, so a 5 MB archive claiming
 * to hold gigabytes never has a byte expanded. The check used to run after
 * `unzipSync` had already built the whole thing in memory, which meant the cap
 * produced the right error message and none of the protection.
 *
 * The declared sizes come from the archive, and an attacker writes those, so
 * `unpackZipSite` counts the real expanded bytes as well.
 */
export function createCapFilter(limit: number = SHARE_MAX_BYTES) {
  let declared = 0;
  let exceeded = false;
  return {
    filter(file: UnzipFileInfo): boolean {
      if (exceeded || shouldSkipEntry(file.name)) {
        return false;
      }
      declared += file.originalSize;
      if (declared > limit) {
        exceeded = true;
        return false;
      }
      return true;
    },
    exceeded: () => exceeded,
    declared: () => declared,
  };
}

export function htmlAsSite(html: string): UnpackResult {
  const bytes = new TextEncoder().encode(html);
  if (bytes.byteLength === 0) {
    return { ok: false, message: "HTML is empty." };
  }
  if (bytes.byteLength > SHARE_MAX_BYTES) {
    return { ok: false, message: "Share is larger than 5 MB." };
  }
  return { ok: true, files: [{ path: "index.html", bytes }] };
}

export function unpackZipSite(zipBytes: Uint8Array): UnpackResult {
  if (zipBytes.byteLength === 0) {
    return { ok: false, message: "Zip is empty." };
  }
  if (zipBytes.byteLength > SHARE_MAX_BYTES) {
    return { ok: false, message: "Share is larger than 5 MB." };
  }

  const cap = createCapFilter();

  let extracted: Record<string, Uint8Array>;
  try {
    extracted = unzipSync(zipBytes, { filter: cap.filter });
  } catch {
    return { ok: false, message: "That is not a usable zip." };
  }

  if (cap.exceeded()) {
    return { ok: false, message: "Share is larger than 5 MB." };
  }

  const rawPaths: string[] = [];
  const rawFiles = new Map<string, Uint8Array>();
  let uncompressed = 0;
  for (const [name, bytes] of Object.entries(extracted)) {
    if (shouldSkipEntry(name)) {
      continue;
    }
    // Second gate. The declared sizes above come from the archive itself and an
    // attacker writes those, so the real expanded bytes are counted too.
    uncompressed += bytes.byteLength;
    if (uncompressed > SHARE_MAX_BYTES) {
      return { ok: false, message: "Share is larger than 5 MB." };
    }
    rawPaths.push(name.replaceAll("\\", "/"));
    rawFiles.set(name.replaceAll("\\", "/"), bytes);
  }

  if (rawPaths.length === 0) {
    return { ok: false, message: "Zip has no files." };
  }

  let mappedPaths = rawPaths;
  if (!rawPaths.includes("index.html")) {
    const stripped = stripWrappingFolder(rawPaths);
    if (stripped) {
      mappedPaths = stripped;
    }
  }

  const files: SiteFile[] = [];
  for (const [index, mapped] of mappedPaths.entries()) {
    const safe = normalizeSharePath(mapped);
    if (!safe) {
      return { ok: false, message: "Zip contains a path that leaves the site." };
    }
    const original = rawPaths[index];
    const bytes = rawFiles.get(original);
    if (!bytes) {
      continue;
    }
    files.push({ path: safe, bytes });
  }

  const hasIndex = files.some((file) => file.path === "index.html");
  if (!hasIndex) {
    return { ok: false, message: "Zip must include index.html." };
  }

  return { ok: true, files };
}
