import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { FileStore, StoredFile } from "./file-store";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
};

export type R2Objects = {
  put(key: string, file: StoredFile): Promise<void>;
  get(key: string): Promise<StoredFile | null>;
  list(prefix: string): Promise<string[]>;
  remove(keys: string[]): Promise<void>;
};

const DELETE_BATCH = 1000;

export function r2ObjectKey(shareId: string, path: string): string {
  return `showmeatsack/${shareId}/${path}`;
}

export type EnvMap = Record<string, string | undefined>;

export function readR2Config(env: EnvMap = process.env): R2Config | null {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  const jurisdiction = env.R2_JURISDICTION;
  const endpoint =
    env.R2_ENDPOINT ??
    (jurisdiction
      ? `https://${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
      : `https://${accountId}.r2.cloudflarestorage.com`);
  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}

export function r2StoreAvailable(env: EnvMap = process.env): boolean {
  return readR2Config(env) !== null;
}

export function createR2FileStore(objects: R2Objects): FileStore {
  return {
    async put(shareId: string, path: string, file: StoredFile): Promise<void> {
      await objects.put(r2ObjectKey(shareId, path), file);
    },
    async get(shareId: string, path: string): Promise<StoredFile | null> {
      return objects.get(r2ObjectKey(shareId, path));
    },
    async deleteAll(shareId: string): Promise<void> {
      const keys = await objects.list(`showmeatsack/${shareId}/`);
      if (keys.length === 0) {
        return;
      }
      await objects.remove(keys);
    },
  };
}

export function createR2S3Objects(client: S3Client, bucket: string): R2Objects {
  return {
    async put(key: string, file: StoredFile): Promise<void> {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: Buffer.from(file.bytes),
          ContentType: file.contentType,
        }),
      );
    },
    async get(key: string): Promise<StoredFile | null> {
      try {
        const result = await client.send(
          new GetObjectCommand({ Bucket: bucket, Key: key }),
        );
        if (!result.Body) {
          return null;
        }
        return {
          bytes: await result.Body.transformToByteArray(),
          contentType: result.ContentType ?? "application/octet-stream",
        };
      } catch (error) {
        if (isMissingKey(error)) {
          return null;
        }
        throw error;
      }
    },
    async list(prefix: string): Promise<string[]> {
      const keys: string[] = [];
      let token: string | undefined;
      for (;;) {
        const result = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: token,
          }),
        );
        for (const object of result.Contents ?? []) {
          if (object.Key) {
            keys.push(object.Key);
          }
        }
        if (!result.IsTruncated || !result.NextContinuationToken) {
          break;
        }
        token = result.NextContinuationToken;
      }
      return keys;
    },
    async remove(keys: string[]): Promise<void> {
      for (let index = 0; index < keys.length; index += DELETE_BATCH) {
        const batch = keys.slice(index, index + DELETE_BATCH);
        if (batch.length === 0) {
          continue;
        }
        await client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: batch.map((Key) => ({ Key })),
              Quiet: true,
            },
          }),
        );
      }
    },
  };
}

export function createR2FileStoreFromEnv(
  env: EnvMap = process.env,
): FileStore | null {
  const config = readR2Config(env);
  if (!config) {
    return null;
  }
  const client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return createR2FileStore(createR2S3Objects(client, config.bucket));
}

function isMissingKey(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const name = "name" in error ? error.name : undefined;
  const metadata =
    "$metadata" in error && error.$metadata && typeof error.$metadata === "object"
      ? error.$metadata
      : undefined;
  const status =
    metadata && "httpStatusCode" in metadata
      ? metadata.httpStatusCode
      : undefined;
  return name === "NoSuchKey" || status === 404;
}
