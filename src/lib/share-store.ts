export type ShareRecord = {
  id: string;
  createdAt: string;
  expiresAt: string;
  deletedAt?: string;
  manageToken: string;
};

export type ShareStore = {
  save(share: ShareRecord): Promise<void>;
  getById(id: string): Promise<ShareRecord | null>;
  delete(id: string): Promise<void>;
};

export function createMemoryShareStore(): ShareStore {
  const shares = new Map<string, ShareRecord>();
  return {
    async save(share: ShareRecord): Promise<void> {
      shares.set(share.id, { ...share });
    },
    async getById(id: string): Promise<ShareRecord | null> {
      const found = shares.get(id);
      return found ? { ...found } : null;
    },
    async delete(id: string): Promise<void> {
      shares.delete(id);
    },
  };
}

export type KvClient = {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: ShareRecord, opts: { ex: number }) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
};

function shareKey(id: string): string {
  return `showmeatsack:share:${id}`;
}

export function createRedisShareStore(kv: KvClient, now: () => Date): ShareStore {
  return {
    async save(share: ShareRecord): Promise<void> {
      const ttlMs = Date.parse(share.expiresAt) - now().getTime();
      const ex = Math.max(60, Math.ceil(ttlMs / 1000) + 24 * 60 * 60);
      await kv.set(shareKey(share.id), share, { ex });
    },
    async getById(id: string): Promise<ShareRecord | null> {
      return await kv.get<ShareRecord>(shareKey(id));
    },
    async delete(id: string): Promise<void> {
      await kv.del(shareKey(id));
    },
  };
}
