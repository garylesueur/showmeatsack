import { afterEach, describe, expect, it } from "vitest";
import { installTestShareService, zipBase64 } from "@/lib/share-test-helpers";
import { POST } from "./route";

function clearInstalledService() {
  const globalForShares = globalThis as typeof globalThis & {
    showmeatsackShares?: unknown;
  };
  delete globalForShares.showmeatsackShares;
}

async function create(body: unknown): Promise<Response> {
  return POST(
    new Request("https://showmeatsack.com/api/v1/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/v1/shares", () => {
  afterEach(() => {
    clearInstalledService();
  });

  it("publishes HTML and does not put the manage secret on the view URL", async () => {
    installTestShareService();
    const response = await create({ html: "<p>Hello</p>" });
    expect(response.status).toBe(201);
    const payload = (await response.json()) as {
      viewUrl: string;
      manageUrl: string;
      manageToken: string;
    };
    expect(payload.viewUrl).toBe("https://showmeatsack.com/s/shareid1/");
    expect(payload.viewUrl).not.toContain("token=");
    expect(payload.manageUrl).toContain("token=managetoken1");
    expect(payload.manageToken).toBe("managetoken1");
  });

  it("refuses invalid JSON, empty payloads, and both html and zip", async () => {
    installTestShareService();
    const invalid = await create("{");
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({
      error: { code: "invalid_json" },
    });

    const empty = await create({});
    expect(empty.status).toBe(400);

    const both = await create({
      html: "<p>A</p>",
      zipBase64: zipBase64({ "index.html": "x" }),
    });
    expect(both.status).toBe(400);
  });

  it("refuses a zip without index.html", async () => {
    installTestShareService();
    const response = await create({
      zipBase64: zipBase64({ "readme.txt": "hi" }),
    });
    expect(response.status).toBe(400);
    const payload = (await response.json()) as {
      error: { code: string; message: string };
    };
    expect(payload.error.code).toBe("invalid_payload");
    expect(payload.error.message).toContain("index.html");
  });
});
