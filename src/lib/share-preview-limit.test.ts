import { describe, expect, it } from "vitest";
import { createCaptureLimiter } from "./share-preview-limit";

describe("share preview capture limiter", () => {
  it("refuses a third concurrent capture", () => {
    const limiter = createCaptureLimiter(2);
    expect(limiter.tryEnter()).toBe(true);
    expect(limiter.tryEnter()).toBe(true);
    expect(limiter.tryEnter()).toBe(false);
    limiter.leave();
    expect(limiter.tryEnter()).toBe(true);
  });
});
