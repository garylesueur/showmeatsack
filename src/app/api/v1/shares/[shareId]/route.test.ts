import { afterEach, describe, expect, it } from "vitest";
import { installTestShareService } from "@/lib/share-test-helpers";
import { DELETE, GET, PUT } from "./route";

function clearInstalledService() {
  const globalForShares = globalThis as typeof globalThis & {
    showmeatsackShares?: unknown;
  };
  delete globalForShares.showmeatsackShares;
}

function request(
  method: string,
  shareId: string,
  options: { token?: string; bearer?: string; body?: unknown } = {},
): Request {
  const url = new URL(`https://showmeatsack.com/api/v1/shares/${shareId}`);
  if (options.token) {
    url.searchParams.set("token", options.token);
  }
  const headers = new Headers();
  if (options.bearer) {
    headers.set("Authorization", `Bearer ${options.bearer}`);
  }
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  return new Request(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

const params = Promise.resolve({ shareId: "shareid1" });

describe("manage /api/v1/shares/[shareId]", () => {
  afterEach(() => {
    clearInstalledService();
  });

  it("returns 404 for a missing token or a wrong token", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Secret</p>" });

    const missing = await GET(request("GET", "shareid1"), { params });
    expect(missing.status).toBe(404);

    const wrong = await GET(request("GET", "shareid1", { token: "nope" }), {
      params,
    });
    expect(wrong.status).toBe(404);
    expect(await wrong.json()).toMatchObject({
      error: { code: "not_found" },
    });
  });

  it("does not leak that a share exists when the secret is wrong", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Secret</p>" });
    const unknown = await GET(request("GET", "other", { token: "nope" }), {
      params: Promise.resolve({ shareId: "other" }),
    });
    const wrong = await GET(request("GET", "shareid1", { token: "nope" }), {
      params,
    });
    expect(unknown.status).toBe(404);
    expect(wrong.status).toBe(404);
    expect(await unknown.json()).toEqual(await wrong.json());
  });

  it("accepts the manage token from a bearer header", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Live</p>" });
    const response = await GET(
      request("GET", "shareid1", { bearer: "managetoken1" }),
      { params },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "live",
      shareId: "shareid1",
    });
  });

  it("refuses replace without a matching secret and leaves the page", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Keep</p>" });
    const response = await PUT(
      request("PUT", "shareid1", {
        token: "wrong",
        body: { html: "<p>New</p>" },
      }),
      { params },
    );
    expect(response.status).toBe(404);
    const viewed = await shares.view("shareid1", "");
    if (viewed.kind !== "file") {
      throw new Error("expected file");
    }
    expect(new TextDecoder().decode(viewed.bytes)).toBe("<p>Keep</p>");
  });

  it("returns 404 for replace after the share is gone", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Bye</p>" });
    await shares.remove("shareid1", "managetoken1");
    const response = await PUT(
      request("PUT", "shareid1", {
        token: "managetoken1",
        body: { html: "<p>No</p>" },
      }),
      { params },
    );
    expect(response.status).toBe(404);
  });

  it("delete with the right secret is gone; a second delete is still gone", async () => {
    const shares = installTestShareService();
    await shares.create({ html: "<p>Bye</p>" });
    const first = await DELETE(
      request("DELETE", "shareid1", { token: "managetoken1" }),
      { params },
    );
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ status: "gone" });
    const second = await DELETE(
      request("DELETE", "shareid1", { token: "managetoken1" }),
      { params },
    );
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ status: "gone" });
  });
});
