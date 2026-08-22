import { describe, expect, it } from "vitest";
import { looksLikeHtml } from "./looks-like-html";

describe("looksLikeHtml", () => {
  it("recognises a page and an HTML fragment", () => {
    expect(looksLikeHtml("<!DOCTYPE html><p>Hi</p>")).toBe(true);
    expect(looksLikeHtml("<h1>Hello</h1>")).toBe(true);
    expect(looksLikeHtml("  <p>Hello</p>")).toBe(true);
  });

  it("treats markdown, including autolinks, as not HTML", () => {
    expect(looksLikeHtml("# Organisation isolation")).toBe(false);
    expect(looksLikeHtml("A paragraph with a table and a list.")).toBe(false);
    expect(looksLikeHtml("<https://example.com> is a link")).toBe(false);
  });
});
