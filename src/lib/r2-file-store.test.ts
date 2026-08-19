import { describe, expect, it } from "vitest";
import type { StoredFile } from "./file-store";
import {
  createR2FileStore,
  r2ObjectKey,
  r2StoreAvailable,
  readR2Config,
  type R2Objects,
} from "./r2-file-store";

function memoryObjects(): R2Objects & { store: Map<string, StoredFile> } {
  const store = new Map<string, StoredFile>();
  return {
    store,
    async put(key, file) {
      store.set(key, {
        bytes: file.bytes,
        contentType: file.contentType,
      });
    },
    async get(key) {
      return store.get(key) ?? null;
    },
    async list(prefix) {
      const keys: string[] = [];
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    },
    async remove(keys) {
      for (const key of keys) {
        store.delete(key);
      }
    },
  };
}

describe("R2 file store", () => {
  it("namespaces objects under showmeatsack/{shareId}/", () => {
    expect(r2ObjectKey("shareid1", "index.html")).toBe("showmeatsack/shareid1/index.html");
    expect(r2ObjectKey("shareid1", "css/app.css")).toBe("showmeatsack/shareid1/css/app.css");
  });

  it("needs the four R2 secrets before it is available", () => {
    expect(r2StoreAvailable({})).toBe(false);
    expect(
      r2StoreAvailable({
        R2_ACCOUNT_ID: "acct",
        R2_ACCESS_KEY_ID: "key",
        R2_SECRET_ACCESS_KEY: "secret",
      }),
    ).toBe(false);
    expect(
      r2StoreAvailable({
        R2_ACCOUNT_ID: "acct",
        R2_ACCESS_KEY_ID: "key",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_BUCKET_NAME: "shares",
      }),
    ).toBe(true);
  });

  it("builds the default R2 endpoint from the account id", () => {
    const config = readR2Config({
      R2_ACCOUNT_ID: "acct",
      R2_ACCESS_KEY_ID: "key",
      R2_SECRET_ACCESS_KEY: "secret",
      R2_BUCKET_NAME: "shares",
    });
    expect(config?.endpoint).toBe("https://acct.r2.cloudflarestorage.com");
    expect(config?.bucket).toBe("shares");
  });

  it("puts, gets, and deletes only that share's files", async () => {
    const objects = memoryObjects();
    const files = createR2FileStore(objects);
    await files.put("shareid1", "index.html", {
      bytes: new TextEncoder().encode("<p>One</p>"),
      contentType: "text/html; charset=utf-8",
    });
    await files.put("shareid2", "index.html", {
      bytes: new TextEncoder().encode("<p>Two</p>"),
      contentType: "text/html; charset=utf-8",
    });

    const one = await files.get("shareid1", "index.html");
    expect(one).not.toBeNull();
    expect(new TextDecoder().decode(one?.bytes)).toBe("<p>One</p>");
    expect(one?.contentType).toBe("text/html; charset=utf-8");

    await files.deleteAll("shareid1");
    expect(await files.get("shareid1", "index.html")).toBeNull();
    const two = await files.get("shareid2", "index.html");
    expect(new TextDecoder().decode(two?.bytes)).toBe("<p>Two</p>");
    expect([...objects.store.keys()]).toEqual(["showmeatsack/shareid2/index.html"]);
  });

  it("returns null for a missing object", async () => {
    const files = createR2FileStore(memoryObjects());
    expect(await files.get("shareid1", "missing.css")).toBeNull();
  });
});
