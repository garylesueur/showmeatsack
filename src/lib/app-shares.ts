import { blobStoreAvailable, createBlobFileStore } from "./blob-file-store";
import { createMemoryFileStore, type FileStore } from "./file-store";
import { publicOrigin } from "./public-origin";
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
  });

  if (process.env.NODE_ENV !== "production") {
    globalForShares.showmeatsackShares = service;
  }
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
): Response {
  return Response.json({ error: { code, message } }, { status });
}

export function jsonFromError(error: ShareServiceError): Response {
  return jsonError(error.status, error.code, error.message);
}
