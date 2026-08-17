import { del, get, list, put } from "@vercel/blob";
import type { FileStore, StoredFile } from "./file-store";

function pathnameFor(shareId: string, path: string): string {
  return `showmeatsack/${shareId}/${path}`;
}

async function streamToBytes(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    total += value.byteLength;
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export function blobStoreAvailable(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function createBlobFileStore(): FileStore {
  return {
    async put(shareId: string, path: string, file: StoredFile): Promise<void> {
      await put(pathnameFor(shareId, path), Buffer.from(file.bytes), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: file.contentType,
      });
    },
    async get(shareId: string, path: string): Promise<StoredFile | null> {
      const result = await get(pathnameFor(shareId, path), {
        access: "private",
        useCache: false,
      });
      if (!result || result.statusCode !== 200) {
        return null;
      }
      return {
        bytes: await streamToBytes(result.stream),
        contentType: result.blob.contentType ?? "application/octet-stream",
      };
    },
    async deleteAll(shareId: string): Promise<void> {
      const listed = await list({ prefix: `showmeatsack/${shareId}/` });
      const urls = listed.blobs.map((blob) => blob.url);
      if (urls.length > 0) {
        await del(urls);
      }
    },
  };
}
