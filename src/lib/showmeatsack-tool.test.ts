import { describe, expect, it } from "vitest";
import { createMemoryFileStore } from "./file-store";
import { createMemoryShareStore } from "./share-store";
import { createShareService, isShareServiceError } from "./shares";
import { createShowmeatsackTool } from "./showmeatsack-tool";

describe("showmeatsack.com tool", () => {
  it("B11 — tool create, status, replace, and delete match the service", async () => {
    const shares = createShareService({
      store: createMemoryShareStore(),
      files: createMemoryFileStore(),
      now: () => new Date("2026-08-17T10:00:00.000Z"),
      createId: () => "shareid1",
      createToken: () => "managetoken1",
      publicBaseUrl: "https://showmeatsack.com",
    });
    const tool = createShowmeatsackTool(shares);

    const created = await tool.invoke({
      action: "create",
      html: "<p>Via tool</p>",
    });
    expect(isShareServiceError(created)).toBe(false);
    if (isShareServiceError(created)) {
      return;
    }

    const status = await tool.invoke({
      action: "status",
      shareId: "shareid1",
      manageToken: "managetoken1",
    });
    expect(status).toMatchObject({ status: "live" });

    const replaced = await tool.invoke({
      action: "replace",
      shareId: "shareid1",
      manageToken: "managetoken1",
      html: "<p>Updated</p>",
    });
    expect(isShareServiceError(replaced)).toBe(false);

    const viewed = await shares.view("shareid1", "");
    expect(viewed.kind).toBe("file");
    if (viewed.kind === "file") {
      expect(new TextDecoder().decode(viewed.bytes)).toBe("<p>Updated</p>");
    }

    const removed = await tool.invoke({
      action: "delete",
      shareId: "shareid1",
      manageToken: "managetoken1",
    });
    expect(removed).toEqual({ status: "gone" });
  });
});
