import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(root, name), "utf8"));
}

describe("Agent Plugin package", () => {
  it("declares the portable manifest", () => {
    const manifest = readJson("plugin.json") as {
      $schema: string;
      name: string;
      homepage: string;
    };
    expect(manifest.$schema).toBe(
      "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    );
    expect(manifest.name).toBe("showmeatsack.com");
    expect(manifest.homepage).toBe("https://showmeatsack.com");
  });

  it("points Agent Plugins MCP at the hosted Streamable HTTP server", () => {
    const mcp = readJson("mcp.json") as {
      $schema: string;
      mcpServers: {
        "showmeatsack.com": { type: string; url: string };
      };
    };
    expect(mcp.$schema).toBe(
      "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    );
    expect(mcp.mcpServers["showmeatsack.com"]).toEqual({
      type: "streamable-http",
      url: "https://showmeatsack.com/mcp",
    });
  });

  it("keeps cursor.directory .mcp.json on the same URL", () => {
    const directory = readJson(".mcp.json") as {
      mcpServers: { "showmeatsack.com": { url: string } };
    };
    const mcp = readJson("mcp.json") as {
      mcpServers: { "showmeatsack.com": { url: string } };
    };
    expect(directory.mcpServers["showmeatsack.com"].url).toBe(
      mcp.mcpServers["showmeatsack.com"].url,
    );
  });

  it("ships the plugin skill with frontmatter", () => {
    const onDisk = readFileSync(
      join(root, "skills/showmeatsack/SKILL.md"),
      "utf8",
    );
    expect(onDisk.startsWith("---\n")).toBe(true);
    expect(onDisk).toContain("name: showmeatsack\n");
    expect(onDisk).toContain("showmeatsack.com");
  });
});
