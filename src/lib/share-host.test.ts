import { describe, expect, it } from "vitest";
import { shareHostDecision } from "./share-host";

const product = "https://show.imeatsack.com";
const view = "https://s.imeatsack.com";

describe("share host isolation", () => {
  it("B14 — product-origin view paths go to the view origin", () => {
    const decision = shareHostDecision({
      host: "show.imeatsack.com",
      pathname: "/s/shareid1/",
      search: "",
      productOrigin: product,
      viewOrigin: view,
    });
    expect(decision).toEqual({
      kind: "redirect",
      location: "https://s.imeatsack.com/s/shareid1/",
    });
  });

  it("B14 — the view origin serves share paths and not the product", () => {
    expect(
      shareHostDecision({
        host: "s.imeatsack.com",
        pathname: "/s/shareid1/",
        search: "",
        productOrigin: product,
        viewOrigin: view,
      }),
    ).toEqual({ kind: "next" });
    expect(
      shareHostDecision({
        host: "s.imeatsack.com",
        pathname: "/api/v1/shares",
        search: "",
        productOrigin: product,
        viewOrigin: view,
      }),
    ).toEqual({ kind: "not_found" });
    expect(
      shareHostDecision({
        host: "s.imeatsack.com",
        pathname: "/",
        search: "",
        productOrigin: product,
        viewOrigin: view,
      }),
    ).toEqual({ kind: "redirect", location: "https://show.imeatsack.com/" });
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

  it("B14 — the unavailable-page illustrations load on the isolated view host", () => {
    const input = {
      host: "s.imeatsack.com",
      pathname: "/lost-meatsack.webp",
      search: "",
      productOrigin: product,
      viewOrigin: view,
    };
    expect(shareHostDecision(input)).toEqual({ kind: "next" });
    expect(shareHostDecision({ ...input, pathname: "/expired-meatsack.webp" })).toEqual({
      kind: "next",
    });
    expect(shareHostDecision({ ...input, pathname: "/brand/hero.jpg" })).toEqual({
      kind: "not_found",
    });
  });
});
