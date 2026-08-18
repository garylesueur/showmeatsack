import { blobStoreAvailable, createBlobFileStore } from "./blob-file-store";
import { createMemoryFileStore, type FileStore } from "./file-store";
import { publicOrigin, viewPublicOrigin } from "./public-origin";
import { createR2FileStoreFromEnv } from "./r2-file-store";
import {
  createMemoryShareStore,
  createRedisShareStore,
} from "./share-store";
import {
  createShareId,
  createShareService,
  createShareToken,
  type ShareServiceError,
} from "./shares";
import { createUpstashKvFromEnv } from "./upstash-kv";

export type ShareService = ReturnType<typeof createShareService>;

const globalForShares = globalThis as typeof globalThis & {
  showmeatsackShares?: ShareService;
};

export function getDefaultShareService(): ShareService {
  if (globalForShares.showmeatsackShares) {
    return globalForShares.showmeatsackShares;
  }

  const kv = createUpstashKvFromEnv();
  const now = () => new Date();
  const store = kv
    ? createRedisShareStore(kv, now)
    : createMemoryShareStore();

  const service = createShareService({
    store,
    files: createConfiguredFileStore(),
    now,
    createId: createShareId,
    createToken: createShareToken,
    publicBaseUrl: publicOrigin(),
    viewPublicBaseUrl: viewPublicOrigin(),
  });

  // Cached everywhere, not just outside production. The check used to be
  // inverted, so production built a fresh S3Client and Redis client for every
  // request while development reused one. askmeatsack has always done this.
  globalForShares.showmeatsackShares = service;
  return service;
}

export function createConfiguredFileStore(): FileStore {
  return (
    createR2FileStoreFromEnv() ??
    (blobStoreAvailable() ? createBlobFileStore() : createMemoryFileStore())
  );
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  headers?: HeadersInit,
): Response {
  return Response.json(
    { error: { code, message } },
    { status, headers },
  );
}

export function jsonFromError(error: ShareServiceError): Response {
  return jsonError(error.status, error.code, error.message);
}
