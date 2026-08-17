import { randomBytes, timingSafeEqual } from "node:crypto";
import type { FileStore } from "./file-store";
import { contentTypeForPath } from "./mime";
import {
  SHARE_DEFAULT_TTL_SECONDS,
  SHARE_MAX_BYTES,
  createShareSchema,
  replaceShareSchema,
} from "./schema";
import type { ShareRecord, ShareStore } from "./share-store";
import { normalizeSharePath } from "./site-paths";
import { htmlAsSite, unpackZipSite, type SiteFile } from "./zip-site";

export type ShareServiceError = {
  code: string;
  message: string;
  status: number;
};

export function isShareServiceError(
  value: unknown,
): value is ShareServiceError {
  return Boolean(
    value &&
      typeof value === "object" &&
      "code" in value &&
      "status" in value &&
      "message" in value,
  );
}

export type ShareServiceDeps = {
  store: ShareStore;
  files: FileStore;
  now: () => Date;
  createId: () => string;
  createToken: () => string;
  publicBaseUrl: string;
};

export type CreateShareResult = {
  shareId: string;
  viewUrl: string;
  manageUrl: string;
  manageToken: string;
  expiresAt: string;
  status: "live";
};

export type ShareStatusResult = {
  shareId: string;
  status: "live" | "gone";
  expiresAt: string;
};

export type ViewFileResult = {
  kind: "file";
  path: string;
  bytes: Uint8Array;
  contentType: string;
};

export type ViewGoneResult = {
  kind: "expired" | "not_found" | "bad_path";
};

export type ViewResult = ViewFileResult | ViewGoneResult;

function error(
  status: number,
  code: string,
  message: string,
): ShareServiceError {
  return { status, code, message };
}

function tokensEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function decodeZip(zipBase64: string): Uint8Array | ShareServiceError {
  try {
    const bytes = Buffer.from(zipBase64, "base64");
    if (bytes.byteLength === 0) {
      return error(400, "invalid_payload", "Zip is empty.");
    }
    return new Uint8Array(bytes);
  } catch {
    return error(400, "invalid_payload", "Zip is not valid base64.");
  }
}

function payloadToFiles(input: {
  html?: string;
  zipBase64?: string;
}): SiteFile[] | ShareServiceError {
  if (input.html !== undefined && input.zipBase64 !== undefined) {
    return error(400, "invalid_payload", "Send either html or a zip, not both.");
  }
  if (input.html !== undefined) {
    if (Buffer.byteLength(input.html, "utf8") > SHARE_MAX_BYTES) {
      return error(400, "too_large", "Share is larger than 5 MB.");
    }
    const unpacked = htmlAsSite(input.html);
    if (!unpacked.ok) {
      return error(400, "invalid_payload", unpacked.message);
    }
    return unpacked.files;
  }
  if (input.zipBase64 !== undefined) {
    const zipBytes = decodeZip(input.zipBase64);
    if (!(zipBytes instanceof Uint8Array)) {
      return zipBytes;
    }
    if (zipBytes.byteLength > SHARE_MAX_BYTES) {
      return error(400, "too_large", "Share is larger than 5 MB.");
    }
    const unpacked = unpackZipSite(zipBytes);
    if (!unpacked.ok) {
      const code = unpacked.message.includes("5 MB")
        ? "too_large"
        : "invalid_payload";
      return error(400, code, unpacked.message);
    }
    return unpacked.files;
  }
  return error(400, "invalid_payload", "Send html or a zip.");
}

function urlsFor(
  base: string,
  shareId: string,
  manageToken: string,
): { viewUrl: string; manageUrl: string } {
  return {
    viewUrl: `${base}/s/${shareId}/`,
    manageUrl: `${base}/api/v1/shares/${shareId}?token=${manageToken}`,
  };
}

function isExpired(share: ShareRecord, now: Date): boolean {
  return Date.parse(share.expiresAt) <= now.getTime();
}

function isGone(share: ShareRecord, now: Date): boolean {
  return Boolean(share.deletedAt) || isExpired(share, now);
}

async function writeFiles(
  files: FileStore,
  shareId: string,
  siteFiles: SiteFile[],
): Promise<void> {
  await files.deleteAll(shareId);
  for (const file of siteFiles) {
    await files.put(shareId, file.path, {
      bytes: file.bytes,
      contentType: contentTypeForPath(file.path),
    });
  }
}

export function createShareService(deps: ShareServiceDeps) {
  async function create(raw: unknown): Promise<CreateShareResult | ShareServiceError> {
    const parsed = createShareSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return error(400, "invalid_payload", first?.message ?? "Payload is not usable.");
    }

    const siteFiles = payloadToFiles(parsed.data);
    if (!(siteFiles instanceof Array)) {
      return siteFiles;
    }

    const now = deps.now();
    const ttl = parsed.data.expiresInSeconds ?? SHARE_DEFAULT_TTL_SECONDS;
    const shareId = deps.createId();
    const manageToken = deps.createToken();
    const share: ShareRecord = {
      id: shareId,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttl * 1000).toISOString(),
      manageToken,
    };
    await writeFiles(deps.files, shareId, siteFiles);
    await deps.store.save(share);
    const urls = urlsFor(deps.publicBaseUrl, shareId, manageToken);
    return {
      shareId,
      viewUrl: urls.viewUrl,
      manageUrl: urls.manageUrl,
      manageToken,
      expiresAt: share.expiresAt,
      status: "live",
    };
  }

  async function requireManage(
    shareId: string,
    manageToken: string | undefined,
  ): Promise<ShareRecord | ShareServiceError> {
    if (!manageToken) {
      return error(404, "not_found", "Share not found.");
    }
    const share = await deps.store.getById(shareId);
    if (!share || !tokensEqual(share.manageToken, manageToken)) {
      return error(404, "not_found", "Share not found.");
    }
    return share;
  }

  async function status(
    shareId: string,
    manageToken: string | undefined,
  ): Promise<ShareStatusResult | ShareServiceError> {
    const share = await requireManage(shareId, manageToken);
    if (isShareServiceError(share)) {
      return share;
    }
    if (isGone(share, deps.now())) {
      return { shareId: share.id, status: "gone", expiresAt: share.expiresAt };
    }
    return { shareId: share.id, status: "live", expiresAt: share.expiresAt };
  }

  async function replace(
    shareId: string,
    manageToken: string | undefined,
    raw: unknown,
  ): Promise<CreateShareResult | ShareServiceError> {
    const share = await requireManage(shareId, manageToken);
    if (isShareServiceError(share)) {
      return share;
    }
    if (isGone(share, deps.now())) {
      return error(404, "not_found", "Share not found.");
    }

    const parsed = replaceShareSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return error(400, "invalid_payload", first?.message ?? "Payload is not usable.");
    }

    const siteFiles = payloadToFiles(parsed.data);
    if (!(siteFiles instanceof Array)) {
      return siteFiles;
    }

    await writeFiles(deps.files, share.id, siteFiles);
    await deps.store.save(share);
    const urls = urlsFor(deps.publicBaseUrl, share.id, share.manageToken);
    return {
      shareId: share.id,
      viewUrl: urls.viewUrl,
      manageUrl: urls.manageUrl,
      manageToken: share.manageToken,
      expiresAt: share.expiresAt,
      status: "live",
    };
  }

  async function remove(
    shareId: string,
    manageToken: string | undefined,
  ): Promise<{ status: "gone" } | ShareServiceError> {
    const share = await requireManage(shareId, manageToken);
    if (isShareServiceError(share)) {
      return share;
    }
    if (share.deletedAt) {
      return { status: "gone" };
    }
    share.deletedAt = deps.now().toISOString();
    await deps.files.deleteAll(share.id);
    await deps.store.save(share);
    return { status: "gone" };
  }

  async function view(shareId: string, rawPath: string): Promise<ViewResult> {
    const path = normalizeSharePath(rawPath);
    if (!path) {
      return { kind: "bad_path" };
    }
    const share = await deps.store.getById(shareId);
    if (!share || share.deletedAt) {
      return { kind: "not_found" };
    }
    if (isExpired(share, deps.now())) {
      return { kind: "expired" };
    }
    const file = await deps.files.get(shareId, path);
    if (!file) {
      return { kind: "not_found" };
    }
    return {
      kind: "file",
      path,
      bytes: file.bytes,
      contentType: file.contentType,
    };
  }

  return { create, status, replace, remove, view };
}

export function createShareId(): string {
  return randomBytes(16).toString("base64url");
}

export function createShareToken(): string {
  return randomBytes(24).toString("base64url");
}
