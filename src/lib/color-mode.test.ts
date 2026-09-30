import { describe, expect, it } from "vitest";
import {
  colorModeCookieDomain,
  isStoredColorMode,
  persistColorModeCookie,
} from "./color-mode";

describe("colour mode persistence", () => {
  it("accepts light, dark, and auto", () => {
    expect(isStoredColorMode("auto")).toBe(true);
    expect(isStoredColorMode("light")).toBe(true);
    expect(isStoredColorMode("system")).toBe(false);
  });

  it("shares the cookie across showmeatsack.com and s.showmeatsack.com", () => {
    expect(colorModeCookieDomain("s.showmeatsack.com")).toBe("; Domain=.showmeatsack.com");
    expect(colorModeCookieDomain("showmeatsack.com")).toBe("; Domain=.showmeatsack.com");
    expect(colorModeCookieDomain("askmeatsack.com")).toBe("; Domain=.askmeatsack.com");
    expect(colorModeCookieDomain("localhost")).toBe("");
  });

  it("writes a year-long SameSite cookie", () => {
    const cookie = persistColorModeCookie("dark", "s.showmeatsack.com", "https:");
    expect(cookie).toContain("meatsack_color_mode=dark");
    expect(cookie).toContain("Domain=.showmeatsack.com");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
  });
});
