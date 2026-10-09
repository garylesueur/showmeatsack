import { read, utils } from "xlsx";
import { unzipSync } from "fflate";
import { escapeHtml } from "./agent-docs";
import { SHARE_MAX_BYTES, type TablePayload } from "./schema";
import { createCapFilter, type UnpackResult, type SiteFile } from "./zip-site";
import { TABLE_VIEWER_CSS, TABLE_VIEWER_JS } from "./table-viewer-bundle.generated";

// Bound expansion and normalized data by bytes, not an arbitrary row count.
export const TABLE_EXPANDED_MAX_BYTES = 32 * 1024 * 1024;
export type TableManifest = {
  title: string;
  source: string;
  sheets: { name: string; columns: string[]; rows: number; path: string; firstDataRow: number }[];
};

export function tableAsSite(input: TablePayload): UnpackResult {
  try {
    const filename = input.filename ?? (input.csv !== undefined ? "Table.csv" : "Workbook.xlsx");
    const isCsv = input.csv !== undefined;
    if (isCsv === (input.xlsxBase64 !== undefined))
      throw new Error("Send csv or xlsxBase64 inside table, exactly one.");
    let bytes: Uint8Array;
    if (isCsv) bytes = new TextEncoder().encode(input.csv);
    else {
      const encoded = input.xlsxBase64!;
      if (encoded.length > Math.ceil(SHARE_MAX_BYTES / 3) * 4)
        throw new Error("Table upload is larger than 5 MB.");
      if (encoded.length % 4 !== 0 || /[^A-Za-z0-9+/]/.test(encoded.replace(/={1,2}$/, "")))
        throw new Error("Excel file is not valid base64.");
      bytes = Buffer.from(encoded, "base64");
    }
    if (!bytes.length) throw new Error("Table is empty.");
    if (bytes.length > SHARE_MAX_BYTES)
      throw new Error(
        "Table upload is larger than 5 MB. The request must also fit the hosting platform's body limit.",
      );
    if (!isCsv) {
      if (bytes[0] !== 0x50 || bytes[1] !== 0x4b)
        throw new Error("Upload an .xlsx workbook, not a legacy or encrypted Excel file.");
      const cap = createCapFilter(TABLE_EXPANDED_MAX_BYTES);
      const entries = unzipSync(bytes, { filter: cap.filter });
      if (
        cap.exceeded() ||
        Object.values(entries).reduce((sum, entry) => sum + entry.length, 0) >
          TABLE_EXPANDED_MAX_BYTES
      )
        throw new Error("Workbook expands beyond the 32 MB processing budget.");
      if (!entries["xl/workbook.xml"]) throw new Error("That file is not an .xlsx workbook.");
    }
    const workbook = read(isCsv ? input.csv!.replace(/^\uFEFF/, "") : bytes, {
      type: isCsv ? "string" : "array",
      dense: true,
      raw: isCsv,
      cellHTML: false,
      cellFormula: false,
    });
    const files: SiteFile[] = [];
    const manifest: TableManifest = {
      title: input.title ?? filename,
      source: isCsv ? "original.csv" : "original.xlsx",
      sheets: [],
    };
    let normalizedBytes = 0;
    let preview = "";
    workbook.SheetNames.forEach((name, sheetIndex) => {
      if (workbook.Workbook?.Sheets?.[sheetIndex]?.Hidden) return;
      const sheet = workbook.Sheets[name];
      const range = sheet["!ref"] ? utils.decode_range(sheet["!ref"]) : null;
      // Even empty cells occupy memory when materialized. Reject pathological sparse ranges before allocation.
      if (range && (range.e.r + 1) * (range.e.c + 1) * 3 > TABLE_EXPANDED_MAX_BYTES)
        throw new Error("Sheet dimensions exceed the 32 MB processing budget.");
      const values = utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        raw: false,
        defval: "",
        blankrows: true,
        range: range ? { s: { r: 0, c: 0 }, e: range.e } : undefined,
      });
      const width = values.reduce((max, row) => Math.max(max, row.length), 0);
      const header = input.headerRow === 0 ? null : values[(input.headerRow ?? 1) - 1];
      if (input.headerRow !== 0 && values.length && !header)
        throw new Error(`Header row does not exist in sheet ${name}.`);
      const columns = Array.from(
        { length: width },
        (_, index) => header?.[index] || utils.encode_col(index),
      );
      const rows = values.slice(input.headerRow ?? 1);
      const path = `sheet-${sheetIndex}.json`;
      const data = new TextEncoder().encode(JSON.stringify(rows));
      normalizedBytes += data.length;
      if (normalizedBytes > TABLE_EXPANDED_MAX_BYTES)
        throw new Error("Normalized workbook exceeds the 32 MB processing budget.");
      manifest.sheets.push({
        name,
        columns,
        rows: rows.length,
        path,
        firstDataRow: (input.headerRow ?? 1) + 1,
      });
      if (manifest.sheets.length === 1) {
        const headings = columns
          .slice(0, 8)
          .map((column) => `<th>${escapeHtml(column)}</th>`)
          .join("");
        const body = rows
          .slice(0, 12)
          .map(
            (row) =>
              `<tr>${columns
                .slice(0, 8)
                .map((_, index) => `<td>${escapeHtml((row[index] ?? "").slice(0, 120))}</td>`)
                .join("")}</tr>`,
          )
          .join("");
        preview = `<p>${escapeHtml(name)} · ${rows.length.toLocaleString("en-GB")} rows · ${columns.length} columns</p><div class="preview-scroll"><table class="preview-table"><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table></div>`;
      }
      files.push({ path, bytes: data });
    });
    if (!manifest.sheets.length) throw new Error("Workbook has no visible sheets.");
    const title = escapeHtml(manifest.title);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · showmeatsack.com</title><link rel="stylesheet" href="viewer.css"></head><body><div id="root"><main class="opening"><h1>${title}</h1>${preview}<p>Opening interactive workbook…</p><noscript>Enable JavaScript to explore this table. <a href="${manifest.source}" download>Download the original file</a>.</noscript></main></div><script src="viewer.js" defer></script></body></html>`;
    const text = (path: string, content: string): SiteFile => ({
      path,
      bytes: new TextEncoder().encode(content),
    });
    return {
      ok: true,
      files: [
        text("index.html", html),
        text("manifest.json", JSON.stringify(manifest)),
        text("viewer.js", TABLE_VIEWER_JS),
        text("viewer.css", TABLE_VIEWER_CSS),
        { path: manifest.source, bytes },
        ...files,
      ],
    };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error
          ? cause.message
          : "Could not read that workbook. Upload CSV or an .xlsx file.",
    };
  }
}
