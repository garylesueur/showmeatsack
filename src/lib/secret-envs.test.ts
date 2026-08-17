import { describe, expect, it } from "vitest";
import {
  OP_ITEM_NAME,
  opSecretReference,
  parseVercelSecretTarget,
  secretEnvVaults,
  secretKeys,
  vaultForLocalDev,
  vaultForVercelTarget,
} from "./secret-envs";

describe("secret environments", () => {
  it("uses one item name across Development, Preview, and Production vaults", () => {
    expect(OP_ITEM_NAME).toBe("showmeatsack.com");
    expect(secretEnvVaults).toEqual({
      development: "Development",
      preview: "Preview",
      production: "Production",
    });
  });

  it("pins local work to the Development vault", () => {
    expect(vaultForLocalDev()).toBe("Development");
  });

  it("maps Vercel targets to their own vaults and refuses Development", () => {
    expect(vaultForVercelTarget("preview")).toBe("Preview");
    expect(vaultForVercelTarget("production")).toBe("Production");
    expect(parseVercelSecretTarget("preview")).toBe("preview");
    expect(parseVercelSecretTarget("production")).toBe("production");
    expect(() => parseVercelSecretTarget("development")).toThrow(
      /Development stays in 1Password/,
    );
  });

  it("builds op:// references without embedding values", () => {
    expect(opSecretReference("Preview", "R2_BUCKET_NAME")).toBe(
      "op://Preview/showmeatsack.com/R2_BUCKET_NAME",
    );
    expect(secretKeys).toContain("R2_SECRET_ACCESS_KEY");
    expect(secretKeys).not.toContain("PUBLIC_BASE_URL");
  });
});
