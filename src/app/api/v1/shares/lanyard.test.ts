import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryCounterStore } from "@/lib/counter-store";
import {
  clearInstalledCreateRateLimiter,
  createCreateRateLimiter,
  installTestCreateRateLimiter,
} from "@/lib/create-rate-limit";
import { runWithIncomingRequest } from "@/lib/incoming-request";
import {
  clearInstalledLanyardVerifier,
  installTestLanyardVerifier,
  lanyardSignInHref,
} from "@/lib/lanyard";
import { createTokenVerifier } from "@/lib/lanyard/product-verifier";
import { createMemoryShareStore } from "@/lib/share-store";
import { installTestShareService } from "@/lib/share-test-helpers";
import { createShowmeatsackTool } from "@/lib/showmeatsack-tool";
import { DELETE, GET, PUT } from "./[shareId]/route";
import { POST } from "./route";

const LANYARD = "https://lanyard.test";
const GOOD = "lny_pat_good";
const BAD = "lny_pat_bad";

/**
 * A stand-in lanyard behind the real verifier, so the request shape and the
 * grace window are what production gets. `down` makes it unreachable.
 */
function fakeLanyard() {
  const state = { down: false, calls: [] as unknown[], now: 0 };
  const verify = createTokenVerifier({
    lanyardUrl: LANYARD,
    product: "showmeatsack",
    now: () => state.now,
    fetch: async (input, init) => {
      if (state.down) throw new TypeError("fetch failed");
      expect(String(input)).toBe(`${LANYARD}/api/v1/verify`);
      const body = JSON.parse(String(init?.body)) as { token: string; product: string };
      state.calls.push(body);
      return body.token === GOOD
        ? Response.json({ account: "acct_1" })
        : new Response(null, { status: 401 });
    },
  });
  installTestLanyardVerifier(LANYARD, verify);
  return state;
}

function createRequest(bearer?: string): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
  return new Request("https://show.imeatsack.com/api/v1/shares", {
    method: "POST",
    headers,
    body: JSON.stringify({ html: "<p>Hi</p>" }),
  });
}

function manage(method: string, bearer: string, body?: unknown): Request {
  const headers = new Headers({ Authorization: `Bearer ${bearer}` });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  return new Request("https://show.imeatsack.com/api/v1/shares/shareid1", {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const params = () => ({ params: Promise.resolve({ shareId: "shareid1" }) });

describe("lanyard sign-in on create", () => {
  let store: ReturnType<typeof createMemoryShareStore>;

  beforeEach(() => {
    store = createMemoryShareStore();
    installTestShareService({ store });
    installTestCreateRateLimiter(createCreateRateLimiter({ store: createMemoryCounterStore() }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    clearInstalledLanyardVerifier();
    clearInstalledCreateRateLimiter();
    delete (globalThis as { showmeatsackShares?: unknown }).showmeatsackShares;
  });

  it("with LANYARD_URL unset, ignores any Bearer on create and hides Sign in", async () => {
    vi.stubEnv("LANYARD_URL", "");
    const lanyard = fakeLanyard();
    const response = await POST(createRequest(BAD));
    expect(response.status).toBe(201);
    expect(lanyard.calls).toEqual([]);
    expect((await store.getById("shareid1"))?.account).toBeUndefined();
    expect(lanyardSignInHref()).toBeUndefined();
  });

  it("links Sign in to lanyard for this product when configured", () => {
    vi.stubEnv("LANYARD_URL", `${LANYARD}/`);
    expect(lanyardSignInHref()).toBe(`${LANYARD}/sign-in?product=showmeatsack`);
  });

  it("keeps anonymous create and manage-token routes working while lanyard is down", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    const lanyard = fakeLanyard();
    lanyard.down = true;

    const created = await POST(createRequest());
    expect(created.status).toBe(201);
    const { manageToken } = (await created.json()) as { manageToken: string };
    expect((await store.getById("shareid1"))?.account).toBeUndefined();

    expect((await GET(manage("GET", manageToken), params())).status).toBe(200);
    expect((await PUT(manage("PUT", manageToken, { html: "<p>Again</p>" }), params())).status).toBe(
      200,
    );
    expect((await DELETE(manage("DELETE", manageToken), params())).status).toBe(200);
    expect(lanyard.calls).toEqual([]);
  });

  it("treats a manage-token-shaped Bearer on create as anonymous, as before", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    const lanyard = fakeLanyard();
    const response = await POST(createRequest("A".repeat(32)));
    expect(response.status).toBe(201);
    expect(lanyard.calls).toEqual([]);
  });

  it("records the account for an accepted token, without exposing it", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    const lanyard = fakeLanyard();
    const response = await POST(createRequest(GOOD));
    expect(response.status).toBe(201);
    expect(JSON.stringify(await response.json())).not.toContain("acct_1");
    expect(lanyard.calls).toEqual([{ token: GOOD, product: "showmeatsack" }]);
    expect((await store.getById("shareid1"))?.account).toBe("acct_1");
  });

  it("refuses a refused token with 401 and stores nothing", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    fakeLanyard();
    const response = await POST(createRequest(BAD));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: { code: "unauthorized" } });
    expect(await store.getById("shareid1")).toBeNull();
  });

  it("accepts a recently verified token for five minutes while lanyard is down, then refuses", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    const lanyard = fakeLanyard();
    expect((await POST(createRequest(GOOD))).status).toBe(201);

    lanyard.down = true;
    lanyard.now = 4 * 60 * 1000;
    expect((await POST(createRequest(GOOD))).status).toBe(201);

    lanyard.now = 6 * 60 * 1000;
    expect((await POST(createRequest(GOOD))).status).toBe(401);
  });

  it("never treats a lanyard token as a manage token", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    const lanyard = fakeLanyard();
    expect((await POST(createRequest())).status).toBe(201);

    expect((await GET(manage("GET", GOOD), params())).status).toBe(404);
    expect((await PUT(manage("PUT", GOOD, { html: "<p>No</p>" }), params())).status).toBe(404);
    expect((await DELETE(manage("DELETE", GOOD), params())).status).toBe(404);
    expect(lanyard.calls).toEqual([]);
  });

  it("MCP create reads the token from the MCP request; manage actions ignore it", async () => {
    vi.stubEnv("LANYARD_URL", LANYARD);
    fakeLanyard();
    const shares = installTestShareService({ store });
    const tool = createShowmeatsackTool(shares);
    const mcp = (bearer: string) =>
      new Request("https://show.imeatsack.com/mcp", {
        method: "POST",
        headers: { Authorization: `Bearer ${bearer}` },
      });

    const refused = await runWithIncomingRequest(mcp(BAD), () =>
      tool.invoke({ action: "create", html: "<p>Hi</p>" }),
    );
    expect(refused).toMatchObject({ status: 401, code: "unauthorized" });

    const created = await runWithIncomingRequest(mcp(GOOD), () =>
      tool.invoke({ action: "create", html: "<p>Hi</p>" }),
    );
    expect(created).toMatchObject({ manageToken: "managetoken1" });
    expect((await store.getById("shareid1"))?.account).toBe("acct_1");

    const status = await runWithIncomingRequest(mcp(BAD), () =>
      tool.invoke({ action: "status", shareId: "shareid1", manageToken: "managetoken1" }),
    );
    expect(status).toMatchObject({ status: "live" });
  });
});
