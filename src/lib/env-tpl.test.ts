import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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
    for (const key of envKeys(".env.tpl")) {
      if (key === "PUBLIC_BASE_URL") {
        continue;
      }
      expect(body).toContain(
        `${key}=op://\${OP_VAULT:-Development}/showmeatsack.com/${key}`,
      );
    }
  });
});
