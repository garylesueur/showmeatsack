import { describe, expect, it } from "vitest";
import { shareHostDecision } from "./share-host";

const product = "https://showmeatsack.com";
const view = "https://s.showmeatsack.com";

describe("share host isolation", () => {
  it("B14 — product-origin view paths go to the view origin", () => {
    const decision = shareHostDecision({
      host: "showmeatsack.com",
      pathname: "/s/shareid1/",
      search: "",
      productOrigin: product,
      viewOrigin: view,
    });
    expect(decision).toEqual({
      kind: "redirect",
      location: "https://s.showmeatsack.com/s/shareid1/",
    });
  });

  it("B14 — the view origin serves share paths and not the product", () => {
    expect(
      shareHostDecision({
        host: "s.showmeatsack.com",
        pathname: "/s/shareid1/",
        search: "",
        productOrigin: product,
        viewOrigin: view,
      }),
    ).toEqual({ kind: "next" });
    expect(
      shareHostDecision({
        host: "s.showmeatsack.com",
        pathname: "/api/v1/shares",
        search: "",
        productOrigin: product,
        viewOrigin: view,
      }),
    ).toEqual({ kind: "not_found" });
    expect(
      shareHostDecision({
        host: "s.showmeatsack.com",
        pathname: "/",
        search: "",
        productOrigin: product,
        viewOrigin: view,
      }),
    ).toEqual({ kind: "redirect", location: "https://showmeatsack.com/" });
  });

  it("B14 — the same origin is a no-op", () => {
    expect(
      shareHostDecision({
        host: "localhost:3000",
        pathname: "/s/shareid1/",
        search: "",
        productOrigin: "http://localhost:3000",
        viewOrigin: "http://localhost:3000",
      }),
    ).toEqual({ kind: "next" });
  });
});
