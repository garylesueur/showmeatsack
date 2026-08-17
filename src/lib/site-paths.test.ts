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

  it("treats a lone dot-slash as index.html", () => {
    expect(normalizeSharePath("./")).toBe("index.html");
    expect(normalizeSharePath(".")).toBe("index.html");
  });

  it("strips a leading slash so absolute zip paths stay inside the share", () => {
    expect(normalizeSharePath("/index.html")).toBe("index.html");
    expect(normalizeSharePath("/css/app.css")).toBe("css/app.css");
  });

  it("normalises backslashes", () => {
    expect(normalizeSharePath("css\\app.css")).toBe("css/app.css");
  });

  it("refuses NUL and other control characters", () => {
    expect(normalizeSharePath("index.html\0.js")).toBeNull();
    expect(normalizeSharePath("css/\napp.css")).toBeNull();
    expect(normalizeSharePath("ok/\u007fnope")).toBeNull();
  });

  it("refuses an over-long path", () => {
    expect(normalizeSharePath(`${"a".repeat(1025)}.css`)).toBeNull();
  });
});
