/* Virtualized, positioned rows use the ARIA grid pattern rather than native table layout. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState, useDeferredValue, type CSSProperties } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { TableManifest } from "../lib/table-workbook";

const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 74;
const count = (value: number) => value.toLocaleString();
async function loadJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "This sheet could not be opened. Refresh to try again; the share may have expired.",
    );
  return response.json();
}

function Workbook() {
  const [manifest, setManifest] = useState<TableManifest>();
  const [error, setError] = useState("");
  const [sheetIndex, setSheetIndex] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadJson<TableManifest>("manifest.json", controller.signal)
      .then((value) => {
        setManifest(value);
        const requested = new URLSearchParams(location.hash.slice(1)).get("sheet");
        const index = value.sheets.findIndex((sheet) => sheet.name === requested);
        if (index >= 0) setSheetIndex(index);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message);
      });
    return () => controller.abort();
  }, []);
  function changeSheet(index: number) {
    setSheetIndex(index);
    history.replaceState(
      null,
      "",
      `#${new URLSearchParams({ sheet: manifest!.sheets[index].name })}`,
    );
  }
  if (error)
    return (
      <main className="opening">
        <h1>Couldn’t open this workbook</h1>
        <p role="alert">{error}</p>
        <button onClick={() => location.reload()}>Try again</button>
      </main>
    );
  if (!manifest)
    return (
      <main className="opening">
        <h1>Opening workbook…</h1>
        <p role="status">Loading sheet names and dimensions.</p>
      </main>
    );
  return (
    <div className="workbook">
      <header className="workbook-header">
        <div>
          <a className="wordmark" href="https://showmeatsack.com" target="_blank" rel="noreferrer">
            showmeatsack.com
          </a>
          <h1>{manifest.title}</h1>
        </div>
        <a className="download" href={manifest.source} download>
          Download original
        </a>
      </header>
      <div className="sheet-stack">
        {manifest.sheets.map((sheet, index) => (
          <Sheet key={sheet.path} sheet={sheet} active={index === sheetIndex} />
        ))}
      </div>
      <footer>
        <nav aria-label="Workbook sheets">
          {manifest.sheets.map((sheet, index) => (
            <button
              key={sheet.path}
              aria-current={index === sheetIndex ? "page" : undefined}
              onClick={() => changeSheet(index)}
            >
              {sheet.name}
              <span>{count(sheet.rows)}</span>
            </button>
          ))}
        </nav>
        <span className="read-only">Read-only</span>
      </footer>
    </div>
  );
}

type SheetInfo = TableManifest["sheets"][number];
function Sheet({ sheet, active }: { sheet: SheetInfo; active: boolean }) {
  const [data, setData] = useState<string[][]>();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!active || data) return;
    const controller = new AbortController();
    setError("");
    loadJson<string[][]>(sheet.path, controller.signal)
      .then(setData)
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message);
      });
    return () => controller.abort();
  }, [active, data, sheet.path]);
  return (
    <section className="sheet" hidden={!active} aria-label={sheet.name}>
      {error ? (
        <div className="opening">
          <h2>Couldn’t open {sheet.name}</h2>
          <p role="alert">{error}</p>
          <button onClick={() => location.reload()}>Try again</button>
        </div>
      ) : data ? (
        <Grid data={data} sheet={sheet} active={active} />
      ) : (
        <div className="opening" role="status">
          <h2>Opening {sheet.name}…</h2>
          <p>
            {count(sheet.rows)} rows · {count(sheet.columns.length)} columns
          </p>
        </div>
      )}
    </section>
  );
}

function Grid({ data, sheet, active }: { data: string[][]; sheet: SheetInfo; active: boolean }) {
  const scroll = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [frozen, setFrozen] = useState(1);
  const [selected, setSelected] = useState<{ row: number; column: number; value: string }>();
  const [copyStatus, setCopyStatus] = useState("");
  const definitions = useMemo<ColumnDef<string[]>[]>(
    () =>
      sheet.columns.map((name, index) => ({
        id: String(index),
        header: name,
        accessorFn: (row) => row[index] ?? "",
        size: 180,
        minSize: 100,
        maxSize: 700,
        filterFn: "includesString",
        sortingFn: "alphanumeric",
      })),
    [sheet.columns],
  );
  const table = useReactTable({
    data,
    columns: definitions,
    state: {
      sorting,
      columnFilters: filters,
      globalFilter: deferredSearch,
      columnVisibility: visibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: "onChange",
    globalFilterFn: "includesString",
  });
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();
  const pinned = columns.slice(0, frozen);
  const unpinned = columns.slice(frozen);
  const pinnedWidth = pinned.reduce((sum, column) => sum + column.getSize(), 48);
  const rowVirtual = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scroll.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    scrollMargin: HEADER_HEIGHT,
    enabled: active,
  });
  const columnVirtual = useVirtualizer({
    horizontal: true,
    count: unpinned.length,
    getScrollElement: () => scroll.current,
    estimateSize: (index) => unpinned[index].getSize(),
    overscan: 2,
    scrollMargin: pinnedWidth,
    enabled: active,
  });
  const sizing = table.getState().columnSizing;
  useEffect(() => {
    columnVirtual.measure();
  }, [columnVirtual, sizing, visibility, frozen]);
  useEffect(() => {
    if (active) {
      rowVirtual.measure();
      columnVirtual.measure();
    }
  }, [active, rowVirtual, columnVirtual]);
  const positioned = [
    ...pinned.map((column, index) => ({
      column,
      pinned: true,
      x: 48 + pinned.slice(0, index).reduce((sum, entry) => sum + entry.getSize(), 0),
    })),
    ...columnVirtual
      .getVirtualItems()
      .map((item) => ({ column: unpinned[item.index], pinned: false, x: item.start })),
  ];
  const width = columns.reduce((sum, column) => sum + column.getSize(), 48);
  function cellStyle(entry: (typeof positioned)[number]): CSSProperties {
    return {
      width: entry.column.getSize(),
      left: entry.x,
      position: entry.pinned ? "sticky" : "absolute",
      zIndex: entry.pinned ? 2 : 1,
    };
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(selected?.value ?? "");
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable. Select the value below and copy it.");
    }
  }
  return (
    <>
      <div className="toolbar">
        <label className="search">
          <span>Search sheet</span>
          <input
            type="search"
            placeholder="Find across all columns"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              scroll.current?.scrollTo({ top: 0 });
            }}
          />
        </label>
        <label className="freeze">
          <span>Freeze columns</span>
          <select
            value={Math.min(frozen, columns.length)}
            onChange={(event) => setFrozen(Number(event.target.value))}
          >
            {[0, 1, 2, 3]
              .filter((value) => value <= columns.length)
              .map((value) => (
                <option key={value} value={value}>
                  {value === 0 ? "None" : `First ${value}`}
                </option>
              ))}
          </select>
        </label>
        <details className="column-menu">
          <summary>Columns</summary>
          <div>
            {table.getAllLeafColumns().map((column) => (
              <label key={column.id}>
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                {String(column.columnDef.header)}
              </label>
            ))}
          </div>
        </details>
        <button
          className="reset"
          disabled={
            !search &&
            !sorting.length &&
            !filters.length &&
            !Object.keys(visibility).length &&
            !Object.keys(sizing).length &&
            frozen === 1
          }
          onClick={() => {
            setSearch("");
            setSorting([]);
            setFilters([]);
            setVisibility({});
            table.resetColumnSizing();
            setFrozen(1);
            setSelected(undefined);
            scroll.current?.scrollTo({ top: 0, left: 0 });
          }}
        >
          Reset view
        </button>
        <p className="dimensions" aria-live="polite">
          {count(rows.length)}
          {rows.length !== data.length ? ` of ${count(data.length)}` : ""} rows ·{" "}
          {count(columns.length)} columns{search !== deferredSearch ? " · Searching…" : ""}
        </p>
      </div>
      <div className="grid-scroll" ref={scroll}>
        <div
          role="grid"
          aria-label={sheet.name}
          aria-readonly="true"
          aria-rowcount={rows.length + 1}
          aria-colcount={columns.length + 1}
          style={{ width: Math.max(width, 1), minWidth: "100%" }}
        >
          <div className="grid-header" role="row" aria-rowindex={1}>
            <div
              className="row-number header-number"
              role="columnheader"
              aria-label="Source row number"
            >
              #
            </div>
            {positioned.map((entry) => (
              <div
                className={`column-header ${entry.pinned ? "pinned" : ""}`}
                key={entry.column.id}
                role="columnheader"
                aria-colindex={columns.indexOf(entry.column) + 2}
                aria-sort={
                  entry.column.getIsSorted() === "asc"
                    ? "ascending"
                    : entry.column.getIsSorted() === "desc"
                      ? "descending"
                      : "none"
                }
                style={cellStyle(entry)}
              >
                <button
                  className="sort"
                  onClick={entry.column.getToggleSortingHandler()}
                  title={`Sort ${entry.column.columnDef.header}`}
                >
                  <span>{String(entry.column.columnDef.header)}</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d={entry.column.getIsSorted() === "desc" ? "M4 6l4 4 4-4" : "M4 10l4-4 4 4"}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity={entry.column.getIsSorted() ? 1 : 0.35}
                    />
                  </svg>
                </button>
                <input
                  aria-label={`Filter ${entry.column.columnDef.header}`}
                  placeholder="Filter…"
                  value={String(entry.column.getFilterValue() ?? "")}
                  onChange={(event) => {
                    entry.column.setFilterValue(event.target.value);
                    scroll.current?.scrollTo({ top: 0 });
                  }}
                />
                <div
                  className="resize"
                  onMouseDown={table
                    .getFlatHeaders()
                    .find((header) => header.column.id === entry.column.id)!
                    .getResizeHandler()}
                  onTouchStart={table
                    .getFlatHeaders()
                    .find((header) => header.column.id === entry.column.id)!
                    .getResizeHandler()}
                  role="separator"
                  aria-label={`Resize ${entry.column.columnDef.header}`}
                  aria-orientation="vertical"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault();
                      table.setColumnSizing((current) => ({
                        ...current,
                        [entry.column.id]: Math.min(
                          700,
                          Math.max(
                            100,
                            entry.column.getSize() + (event.key === "ArrowRight" ? 20 : -20),
                          ),
                        ),
                      }));
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ height: rowVirtual.getTotalSize(), position: "relative" }}>
            {rowVirtual.getVirtualItems().map((item) => {
              const row = rows[item.index];
              return (
                <div
                  className={`grid-row ${item.index % 2 ? "alternate" : ""}`}
                  role="row"
                  aria-rowindex={item.index + 2}
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: item.start - HEADER_HEIGHT,
                    height: ROW_HEIGHT,
                    width: "100%",
                  }}
                >
                  <div role="rowheader" className="row-number">
                    {count(row.index + sheet.firstDataRow)}
                  </div>
                  {positioned.map((entry) => {
                    const value = row.getValue<string>(entry.column.id);
                    const columnIndex = columns.indexOf(entry.column);
                    return (
                      <button
                        key={entry.column.id}
                        role="gridcell"
                        aria-colindex={columnIndex + 2}
                        className={`cell ${entry.pinned ? "pinned" : ""} ${selected?.row === row.index && selected.column === Number(entry.column.id) ? "selected" : ""}`}
                        style={cellStyle(entry)}
                        title={value}
                        onFocus={() => {
                          setSelected({ row: row.index, column: Number(entry.column.id), value });
                          setCopyStatus("");
                        }}
                        onKeyDown={(event) => {
                          const offsets: Record<string, [number, number]> = {
                            ArrowDown: [1, 0],
                            ArrowUp: [-1, 0],
                            ArrowLeft: [0, -1],
                            ArrowRight: [0, 1],
                          };
                          const offset = offsets[event.key];
                          if (!offset) return;
                          event.preventDefault();
                          const nextRow = Math.min(
                            rows.length - 1,
                            Math.max(0, item.index + offset[0]),
                          );
                          const nextColumn = Math.min(
                            columns.length - 1,
                            Math.max(0, columnIndex + offset[1]),
                          );
                          rowVirtual.scrollToIndex(nextRow);
                          if (nextColumn >= frozen)
                            columnVirtual.scrollToIndex(nextColumn - frozen);
                          requestAnimationFrame(() => {
                            scroll.current
                              ?.querySelector<HTMLElement>(
                                `[aria-rowindex="${nextRow + 2}"] [aria-colindex="${nextColumn + 2}"]`,
                              )
                              ?.focus();
                          });
                        }}
                      >
                        {value || <span className="empty-cell">—</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {!rows.length && (
          <div className="empty-state">
            <h2>{data.length ? "No matching rows" : "This sheet is empty"}</h2>
            <p>
              {data.length
                ? "Clear your search or filters to see the sheet again."
                : "Choose another sheet, or download the original workbook."}
            </p>
          </div>
        )}
      </div>
      <div className="cell-detail" aria-live="polite">
        {selected ? (
          <>
            <span className="cell-address">
              Row {count(selected.row + sheet.firstDataRow)} · {sheet.columns[selected.column]}
            </span>
            <p>{selected.value || "Empty cell"}</p>
            <button onClick={copy}>Copy value</button>
            <span role="status">{copyStatus}</span>
          </>
        ) : (
          <p>Select a cell to read its full value. Use arrow keys to move.</p>
        )}
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Workbook />);
