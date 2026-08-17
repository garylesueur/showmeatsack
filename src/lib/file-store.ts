export type StoredFile = {
  bytes: Uint8Array;
  contentType: string;
};

export type FileStore = {
  put(shareId: string, path: string, file: StoredFile): Promise<void>;
  get(shareId: string, path: string): Promise<StoredFile | null>;
  deleteAll(shareId: string): Promise<void>;
};

export function createMemoryFileStore(): FileStore {
  const files = new Map<string, StoredFile>();

  function key(shareId: string, path: string): string {
    return `${shareId}:${path}`;
  }

  return {
    async put(shareId: string, path: string, file: StoredFile): Promise<void> {
      files.set(key(shareId, path), {
        bytes: file.bytes,
        contentType: file.contentType,
      });
    },
    async get(shareId: string, path: string): Promise<StoredFile | null> {
      return files.get(key(shareId, path)) ?? null;
    },
    async deleteAll(shareId: string): Promise<void> {
      const prefix = `${shareId}:`;
      for (const fileKey of [...files.keys()]) {
        if (fileKey.startsWith(prefix)) {
          files.delete(fileKey);
        }
      }
    },
  };
}
