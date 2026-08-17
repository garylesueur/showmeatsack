export const OP_ITEM_NAME = "showmeatsack.com";

export const secretEnvVaults = {
  development: "Development",
  preview: "Preview",
  production: "Production",
} as const;

export type LocalSecretEnv = "development";
export type VercelSecretEnv = "preview" | "production";
export type SecretEnv = LocalSecretEnv | VercelSecretEnv;

export const secretKeys = [
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "BLOB_READ_WRITE_TOKEN",
] as const;

export function vaultForLocalDev(): (typeof secretEnvVaults)["development"] {
  return secretEnvVaults.development;
}

export function vaultForVercelTarget(
  target: VercelSecretEnv,
): (typeof secretEnvVaults)[VercelSecretEnv] {
  return secretEnvVaults[target];
}

export function parseVercelSecretTarget(value: string): VercelSecretEnv {
  if (value === "preview" || value === "production") {
    return value;
  }
  throw new Error(
    "Only preview and production are pushed to Vercel. Development stays in 1Password and is loaded locally.",
  );
}

export function opSecretReference(vault: string, key: string): string {
  return `op://${vault}/${OP_ITEM_NAME}/${key}`;
}
