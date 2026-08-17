import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  OP_ITEM_NAME,
  secretEnvVaults,
  secretKeys,
  vaultForLocalDev,
} from "./secret-envs";

const root = process.cwd();

function envKeys(name: string): string[] {
  const keys: string[] = [];
  for (const line of readFileSync(join(root, name), "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const key = trimmed.split("=", 1)[0];
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

describe("1Password env template", () => {
  it("lists the same keys as .env.example", () => {
    expect(envKeys(".env.tpl")).toEqual(envKeys(".env.example"));
  });

  it("points secrets at 1Password and keeps PUBLIC_BASE_URL local", () => {
    const body = readFileSync(join(root, ".env.tpl"), "utf8");
    expect(body).toContain("PUBLIC_BASE_URL=http://localhost:3000");
    expect(body).toContain(secretEnvVaults.development);
    expect(body).toContain(secretEnvVaults.preview);
    expect(body).toContain(secretEnvVaults.production);
    for (const key of secretKeys) {
      expect(body).toContain(
        `${key}=op://\${OP_VAULT:-${vaultForLocalDev()}}/${OP_ITEM_NAME}/${key}`,
      );
    }
  });

  it("pins local scripts to Development and only syncs Preview or Production to Vercel", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.env).toContain(`OP_VAULT=${vaultForLocalDev()}`);
    expect(pkg.scripts["dev:op"]).toContain(`OP_VAULT=${vaultForLocalDev()}`);
    expect(pkg.scripts["env:vercel"]).toBe("bash scripts/sync-vercel-env.sh");

    const sync = readFileSync(join(root, "scripts/sync-vercel-env.sh"), "utf8");
    expect(sync).toContain(`vault=${secretEnvVaults.preview}`);
    expect(sync).toContain(`vault=${secretEnvVaults.production}`);
    expect(sync).toContain('item="showmeatsack.com"');
    expect(sync).toContain("Development stays in 1Password");
  });
});
