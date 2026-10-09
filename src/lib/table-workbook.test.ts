import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { zipSync } from "fflate";
import { tableAsSite, TABLE_EXPANDED_MAX_BYTES } from "./table-workbook";
import { testShareService } from "./share-test-helpers";
import { createShowmeatsackTool } from "./showmeatsack-tool";
import { isShareServiceError } from "./shares";

function files(input: Parameters<typeof tableAsSite>[0]) {
  const result = tableAsSite(input);
  if (!result.ok) throw new Error(result.message);
  return new Map(result.files.map((file) => [file.path, file.bytes]));
}
function json(output: Map<string, Uint8Array>, path: string) {
  return JSON.parse(new TextDecoder().decode(output.get(path)));
}
function excel() {
  const workbook = utils.book_new();
  const sheet = utils.aoa_to_sheet([
    ["Code", "Amount"],
    ["00123", 12.5],
  ]);
  sheet.B2.z = "0.00";
  utils.book_append_sheet(workbook, sheet, "Sales");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([["Title"], ["Second sheet"]]), "Notes");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([["Secret"]]), "Hidden");
  workbook.Workbook = {
    Sheets: [
      { name: "Sales", Hidden: 0 },
      { name: "Notes", Hidden: 0 },
      { name: "Hidden", Hidden: 1 },
    ],
  };
  return write(workbook, { type: "base64", bookType: "xlsx" }) as string;
}

describe("B22 — publishing a workbook", () => {
  it.each(["", "\uFEFF"])(
    "preserves quoted CSV, unicode, multiline values, duplicate headers and leading zeros (BOM %j)",
    (bom) => {
      const output = files({
        csv: bom + 'Code,Name,Name\r\n00123,"Café, 東京","first\nsecond"\r\n',
        title: "</title><script>alert(1)</script>",
      });
      expect(json(output, "sheet-0.json")).toEqual([["00123", "Café, 東京", "first\nsecond"]]);
      expect(json(output, "manifest.json").sheets[0]).toMatchObject({
        columns: ["Code", "Name", "Name"],
        firstDataRow: 2,
        rows: 1,
      });
      const html = new TextDecoder().decode(output.get("index.html"));
      expect(html).not.toContain("<script>alert(1)</script>");
      expect(output.has("viewer.js")).toBe(true);
      expect(html).toContain("00123");
    },
  );
  it("preserves visible Excel sheets and displayed number formats, and offers the original file", () => {
    const encoded = excel();
    const output = files({ xlsxBase64: encoded });
    expect(
      json(output, "manifest.json").sheets.map((sheet: { name: string }) => sheet.name),
    ).toEqual(["Sales", "Notes"]);
    expect(json(output, "sheet-0.json")).toEqual([["00123", "12.50"]]);
    expect(Buffer.from(output.get("original.xlsx")!).toString("base64")).toBe(encoded);
  });
  it("supports an explicit header row or no headers, including empty sheets", () => {
    const csv = "Report\nCode,Value\n001,2";
    expect(json(files({ csv, headerRow: 2 }), "sheet-0.json")).toEqual([["001", "2"]]);
    expect(json(files({ csv: "001,2", headerRow: 0 }), "manifest.json").sheets[0]).toMatchObject({
      columns: ["A", "B"],
      rows: 1,
      firstDataRow: 1,
    });
    expect(tableAsSite({ csv, headerRow: 20 }).ok).toBe(false);
    expect(json(files({ csv: "Code,Value" }), "sheet-0.json")).toEqual([]);
  });
  it("accepts more than 100,000 rows without a row-count ceiling", () => {
    const csv = "Id\n" + Array.from({ length: 100_001 }, (_, index) => String(index)).join("\n");
    expect(json(files({ csv }), "manifest.json").sheets[0].rows).toBe(100_001);
  });
  it("refuses malformed workbooks and oversized expanded archives before parsing", () => {
    expect(tableAsSite({ xlsxBase64: "!!!" }).ok).toBe(false);
    expect(tableAsSite({ xlsxBase64: Buffer.from("not Excel").toString("base64") }).ok).toBe(false);
    const bomb = zipSync({ "xl/workbook.xml": new Uint8Array(TABLE_EXPANDED_MAX_BYTES + 1) });
    expect(tableAsSite({ xlsxBase64: Buffer.from(bomb).toString("base64") })).toMatchObject({
      ok: false,
      message: expect.stringContaining("32 MB"),
    });
  });
  it("uses the same tool lifecycle and refuses ambiguous payloads without replacing a live table", async () => {
    const shares = testShareService();
    const tool = createShowmeatsackTool(shares);
    const created = await tool.invoke({ action: "create", table: { csv: "Name\nAlice" } });
    expect(isShareServiceError(created)).toBe(false);
    if (
      isShareServiceError(created) ||
      !("manageToken" in created) ||
      typeof created.manageToken !== "string" ||
      !("viewUrl" in created)
    )
      throw new Error("Create failed");
    expect(await shares.read("shareid1", "sheet-0.json")).toMatchObject({ content: '[["Alice"]]' });
    expect(
      isShareServiceError(
        await shares.replace("shareid1", created.manageToken, {
          table: { csv: "Name\nBob" },
          html: "<p>Ambiguous</p>",
        }),
      ),
    ).toBe(true);
    expect(await shares.read("shareid1", "sheet-0.json")).toMatchObject({ content: '[["Alice"]]' });
    expect(
      await tool.invoke({
        action: "replace",
        shareId: "shareid1",
        manageToken: created.manageToken,
        table: { xlsxBase64: excel() },
      }),
    ).toMatchObject({ viewUrl: created.viewUrl });
    expect(
      isShareServiceError(
        await shares.replace("shareid1", "wrong-token", { table: { csv: "Secret" } }),
      ),
    ).toBe(true);
    await tool.invoke({ action: "delete", shareId: "shareid1", manageToken: created.manageToken });
    expect(await shares.view("shareid1", "sheet-0.json")).toMatchObject({ kind: "not_found" });
  });
});
