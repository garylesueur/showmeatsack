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

describe("reading a share through the tool", () => {
  function toolWithShares() {
    const shares = createShareService({
      store: createMemoryShareStore(),
      files: createMemoryFileStore(),
      now: () => new Date("2026-08-17T10:00:00.000Z"),
      createId: () => "shareid1",
      createToken: () => "managetoken1",
      publicBaseUrl: "https://showmeatsack.com",
    });
    return { shares, tool: createShowmeatsackTool(shares) };
  }

  it("B21 — an agent handed a share id reads the page with no manage token", async () => {
    const { tool } = toolWithShares();
    await tool.invoke({ action: "create", html: "<h1>Pasted to me</h1>" });

    const read = await tool.invoke({ action: "read", shareId: "shareid1" });
    expect(isShareServiceError(read)).toBe(false);
    expect(read).toMatchObject({
      shareId: "shareid1",
      path: "index.html",
      encoding: "utf-8",
      content: "<h1>Pasted to me</h1>",
    });
  });

  it("B21 — read defaults to the homepage and accepts an explicit path", async () => {
    const { tool } = toolWithShares();
    await tool.invoke({ action: "create", html: "<h1>Home</h1>" });

    const implicit = await tool.invoke({ action: "read", shareId: "shareid1" });
    const explicit = await tool.invoke({
      action: "read",
      shareId: "shareid1",
      path: "index.html",
    });
    expect(implicit).toEqual(explicit);
  });

  it("B21 — read without a shareId is refused", async () => {
    const { tool } = toolWithShares();
    const read = await tool.invoke({ action: "read" });
    expect(isShareServiceError(read)).toBe(true);
    if (!isShareServiceError(read)) {
      return;
    }
    expect(read.code).toBe("invalid_action");
  });

  it("B21 B11 — tool read matches the service read", async () => {
    const { shares, tool } = toolWithShares();
    await tool.invoke({ action: "create", html: "<p>Same either way</p>" });
    expect(await tool.invoke({ action: "read", shareId: "shareid1" })).toEqual(
      await shares.read("shareid1", ""),
    );
  });
});
