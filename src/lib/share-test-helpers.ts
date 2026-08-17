import { zipSync, strToU8 } from "fflate";
import { createMemoryFileStore } from "./file-store";
import { createMemoryShareStore } from "./share-store";
import {
  createShareService,
  type ShareServiceDeps,
} from "./shares";

export function zipBase64(files: Record<string, string | Uint8Array>): string {
  const encoded: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    encoded[path] = typeof content === "string" ? strToU8(content) : content;
  }
  return Buffer.from(zipSync(encoded)).toString("base64");
}

export function testShareService(overrides: Partial<ShareServiceDeps> = {}) {
  const nowMs = Date.parse("2026-08-17T10:00:00.000Z");
  return createShareService({
    store: createMemoryShareStore(),
    files: createMemoryFileStore(),
    now: () => new Date(nowMs),
    createId: () => "shareid1",
    createToken: () => "managetoken1",
    publicBaseUrl: "https://showmeatsack.com",
    ...overrides,
  });
}

export function installTestShareService(
  overrides: Partial<ShareServiceDeps> = {},
) {
  const shares = testShareService(overrides);
  const globalForShares = globalThis as typeof globalThis & {
    showmeatsackShares?: ReturnType<typeof createShareService>;
  };
  globalForShares.showmeatsackShares = shares;
  return shares;
}
