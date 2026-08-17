import { describe, expect, it } from "vitest";
import { manageTokenFrom } from "./manage-token";

describe("manage token", () => {
  it("B16 — bearer wins over a query token", () => {
    const request = new Request(
      "https://showmeatsack.com/api/v1/shares/shareid1?token=query",
      { headers: { Authorization: "Bearer header" } },
    );
    expect(manageTokenFrom(request)).toBe("header");
  });

  it("B16 — a query token is still accepted on its own", () => {
    const request = new Request(
      "https://showmeatsack.com/api/v1/shares/shareid1?token=query",
    );
    expect(manageTokenFrom(request)).toBe("query");
  });
});
