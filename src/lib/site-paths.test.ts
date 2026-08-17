import { describe, expect, it } from "vitest";
import { normalizeSharePath } from "./site-paths";

describe("normalizeSharePath", () => {
  it("treats empty and slash as index.html", () => {
    expect(normalizeSharePath("")).toBe("index.html");
    expect(normalizeSharePath("/")).toBe("index.html");
  });

  it("refuses parent segments", () => {
    expect(normalizeSharePath("../secret")).toBeNull();
    expect(normalizeSharePath("a/../../b")).toBeNull();
  });

  it("keeps a normal relative file", () => {
    expect(normalizeSharePath("./css/app.css")).toBe("css/app.css");
  });
});
