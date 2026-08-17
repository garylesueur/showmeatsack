import { describe, expect, it } from "vitest";
import {
  OP_VAULT_DEFAULT,
  OP_VAULT_NAME,
  envTemplateFiles,
  itemForLocalDev,
  itemForVercelTarget,
  opSecretReference,
  opTemplateReference,
  parseVercelSecretTarget,
  secretEnvItems,
  secretKeys,
} from "./secret-envs";

describe("secret environments", () => {
  it("uses three items in one vault", () => {
    expect(OP_VAULT_NAME).toBe("Agents");
    expect(OP_VAULT_DEFAULT).toBe("mep374l3cpdtzwibf5fswsimbi");
    expect(secretEnvItems).toEqual({
      development: "showmeatsack.com Development",
      preview: "showmeatsack.com Preview",
      production: "showmeatsack.com Production",
    });
    expect(envTemplateFiles).toEqual({
      development: ".env.development.tpl",
      preview: ".env.preview.tpl",
      production: ".env.production.tpl",
    });
  });

  it("pins local work to the Development item", () => {
    expect(itemForLocalDev()).toBe("showmeatsack.com Development");
  });

  it("maps Vercel targets to their own items and refuses Development", () => {
    expect(itemForVercelTarget("preview")).toBe("showmeatsack.com Preview");
    expect(itemForVercelTarget("production")).toBe(
      "showmeatsack.com Production",
    );
    expect(parseVercelSecretTarget("preview")).toBe("preview");
    expect(parseVercelSecretTarget("production")).toBe("production");
    expect(() => parseVercelSecretTarget("development")).toThrow(
      /Development stays in 1Password/,
    );
  });

  it("builds op:// references without embedding values", () => {
    expect(
      opSecretReference(
        OP_VAULT_DEFAULT,
        "showmeatsack.com Preview",
        "R2_BUCKET_NAME",
      ),
    ).toBe(
      "op://mep374l3cpdtzwibf5fswsimbi/showmeatsack.com Preview/R2_BUCKET_NAME",
    );
    expect(opTemplateReference(secretEnvItems.development, "R2_ACCOUNT_ID")).toBe(
      "op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/showmeatsack.com Development/R2_ACCOUNT_ID",
    );
    expect(secretKeys).toContain("R2_SECRET_ACCESS_KEY");
    expect(secretKeys).not.toContain("PUBLIC_BASE_URL");
  });
});
