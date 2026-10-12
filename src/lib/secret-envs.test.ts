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
      development: "kurrh2l5nm5jd2ajqchctrls4q",
      preview: "iwuprml52wmzuvgq4eg37pzrly",
      production: "gzow46cckd6yenaplpsv3mre6y",
    });
    expect(envTemplateFiles).toEqual({
      development: ".env.development.tpl",
      preview: ".env.preview.tpl",
      production: ".env.production.tpl",
    });
  });

  it("pins local work to the Development item", () => {
    expect(itemForLocalDev()).toBe("kurrh2l5nm5jd2ajqchctrls4q");
  });

  it("maps Vercel targets to their own items and refuses Development", () => {
    expect(itemForVercelTarget("preview")).toBe("iwuprml52wmzuvgq4eg37pzrly");
    expect(itemForVercelTarget("production")).toBe("gzow46cckd6yenaplpsv3mre6y");
    expect(parseVercelSecretTarget("preview")).toBe("preview");
    expect(parseVercelSecretTarget("production")).toBe("production");
    expect(() => parseVercelSecretTarget("development")).toThrow(/Development stays in 1Password/);
  });

  it("builds op:// references without embedding values", () => {
    expect(
      opSecretReference(OP_VAULT_DEFAULT, "iwuprml52wmzuvgq4eg37pzrly", "R2_BUCKET_NAME"),
    ).toBe("op://mep374l3cpdtzwibf5fswsimbi/iwuprml52wmzuvgq4eg37pzrly/R2_BUCKET_NAME");
    expect(opTemplateReference(secretEnvItems.development, "R2_ACCOUNT_ID")).toBe(
      "op://${OP_VAULT:-mep374l3cpdtzwibf5fswsimbi}/kurrh2l5nm5jd2ajqchctrls4q/R2_ACCOUNT_ID",
    );
    expect(secretKeys).toContain("R2_SECRET_ACCESS_KEY");
    expect(secretKeys).not.toContain("PUBLIC_BASE_URL");
    expect(secretKeys).not.toContain("VIEW_PUBLIC_BASE_URL");
  });
});
