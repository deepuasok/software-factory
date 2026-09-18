/**
 * A generic file-to-rows parser for import wizards.
 *
 * Real exports never agree on column names — the same field shows up as
 * "Site Predicted PSM", "Predicted PSM" or just "PSM" depending on who wrote
 * the file. The fuzzy header matching below is lifted from the CATALYST
 * site-workbench prototype (`normalise, strip punctuation, substring match in
 * priority order`) and generalised so any caller can supply its own column
 * spec instead of a hard-coded CATALYST field list.
 *
 * Supports csv/tsv (hand-written parser, no dependency) and xlsx. The xlsx
 * package is not resolvable from `packages/ui` today, so `parseXLSXFile`
 * loads it as an optional dynamic import and throws a plain, actionable error
 * if it is still missing at runtime — it is never a hard dependency of this
 * package.
 */

export type ColumnType = "string" | "number" | "date" | "boolean";

export type ColumnSpec = {
  key: string;
  /** Header spellings to try, in priority order, against every source header. */
  aliases: string[];
  type: ColumnType;
  required?: boolean;
};

export type TableSpec = { columns: ColumnSpec[] };

export type Reject = { row: number; field: string; reason: string };

export type ParseResult = {
  rows: Record<string, unknown>[];
  /** Target column key → the source header it was matched to. */
  mapping: Record<string, string>;
  rejects: Reject[];
};

/** Lower-case, punctuation and whitespace stripped — the shared comparison key. */
export function norm(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Match one target column against the source headers.
 *
 * Aliases are tried in order, and each is checked against every header before
 * moving to the next alias — so a short alias earlier in the file does not
 * steal a column a later, more specific alias was meant for.
 */
export function findColumn(headers: string[], column: ColumnSpec): string | null {
  const candidates = column.aliases.length ? column.aliases : [column.key];
  for (const alias of candidates) {
    const a = norm(alias);
    for (const h of headers) {
      const hn = norm(h);
      if (hn === a || hn.includes(a) || a.includes(hn)) return h;
    }
  }
  return null;
}

/** Fuzzy-match every column in a spec against a set of source headers. */
export function buildMapping(headers: string[], spec: TableSpec): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const column of spec.columns) {
    const h = findColumn(headers, column);
    if (h) mapping[column.key] = h;
  }
  return mapping;
}

function coerce(raw: unknown, type: ColumnType): { value: unknown; error?: string } {
  const s = typeof raw === "string" ? raw.trim() : raw;
  if (s === "" || s === undefined || s === null) return { value: undefined };
  switch (type) {
    case "string":
      return { value: String(s) };
    case "number": {
      const n = typeof s === "number" ? s : parseFloat(String(s).replace(/,/g, ""));
      return isNaN(n) ? { value: undefined, error: `"${s}" is not a number` } : { value: n };
    }
    case "boolean": {
      const t = String(s).toLowerCase();
      if (["true", "yes", "1", "y"].includes(t)) return { value: true };
      if (["false", "no", "0", "n"].includes(t)) return { value: false };
      return { value: undefined, error: `"${s}" is not yes/no` };
    }
    case "date": {
      const d = s instanceof Date ? s : new Date(String(s));
      if (isNaN(d.getTime())) return { value: undefined, error: `"${s}" is not a date` };
      const pad = (n: number) => String(n).padStart(2, "0");
      return { value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` };
    }
  }
}

/** Apply a spec + mapping to raw source rows, coercing types and collecting rejects. */
export function applySpec(
  sourceRows: Record<string, unknown>[],
  spec: TableSpec,
  mapping: Record<string, string>,
): { rows: Record<string, unknown>[]; rejects: Reject[] } {
  const rows: Record<string, unknown>[] = [];
  const rejects: Reject[] = [];

  sourceRows.forEach((sourceRow, i) => {
    const out: Record<string, unknown> = {};
    let hasAnyValue = false;
    for (const column of spec.columns) {
      const sourceHeader = mapping[column.key];
      const raw = sourceHeader !== undefined ? sourceRow[sourceHeader] : undefined;
      const { value, error } = coerce(raw, column.type);
      if (error) {
        rejects.push({ row: i, field: column.key, reason: error });
        continue;
      }
      if (value === undefined) {
        if (column.required) {
          rejects.push({ row: i, field: column.key, reason: "Required field is empty" });
        }
        continue;
      }
      out[column.key] = value;
      hasAnyValue = true;
    }
    if (hasAnyValue) rows.push(out);
  });

  return { rows, rejects };
}

/** Split one delimited line, honouring quoted fields. */
function splitLine(line: string, sep: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === sep && !inQuotes) {
      cols.push(cur);
      cur = "";
    } else cur += ch;
  }
  cols.push(cur);
  return cols;
}

function parseDelimitedText(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines = text.replace(/^﻿/, "").trim().split(/\r?\n/);
  if (lines.length < 1) return { headers: [], rows: [] };
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitLine(lines[0], sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitLine(lines[i], sep);
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] !== undefined ? cols[idx].replace(/^"|"$/g, "").trim() : "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

/**
 * Read an .xlsx workbook's first (or first plausibly-tabular) sheet.
 *
 * The `xlsx` package is an optional dependency of this package — it is loaded
 * with a dynamic import so a caller that never touches xlsx never pays for it,
 * and so this file still compiles when the package is not installed at all.
 */
async function parseXLSXBuffer(data: ArrayBuffer): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  // Typed as `any`, not `typeof import("xlsx")` — the type-only import would
  // itself fail to resolve when the package is missing, which is exactly the
  // install this function has to keep compiling under.
  let XLSX: any;
  try {
    const xlsxModuleName = "xlsx"; // indirected so TS never tries to resolve types for it
    XLSX = await import(xlsxModuleName);
  } catch {
    throw new Error("xlsx support needs the xlsx package");
  }
  const wb = XLSX.read(data, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("This workbook has no sheets");
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

/**
 * Read a file into raw headers + rows, with no spec applied yet — what
 * `ImportWizard`'s Preview and Map-columns steps work from before the
 * mapping the person picks gets baked in.
 */
export async function readTable(file: File | ArrayBuffer): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  return readSource(file);
}

async function readSource(file: File | ArrayBuffer): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  if (file instanceof ArrayBuffer) return parseXLSXBuffer(file);
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseXLSXBuffer(await file.arrayBuffer());
  }
  return parseDelimitedText(await file.text());
}

/**
 * Parse a file against a column spec: fuzzy-match headers, coerce types, and
 * report every row that failed a required field or a type check.
 *
 * `file` can be a `File` (from a drop zone or `<input type="file">`) — csv,
 * tsv and xlsx are all dispatched by extension — or a raw `ArrayBuffer`,
 * which is always treated as an xlsx workbook.
 */
export async function parseTable(file: File | ArrayBuffer, spec: TableSpec): Promise<ParseResult> {
  const { headers, rows: sourceRows } = await readSource(file);
  if (!sourceRows.length) throw new Error("This file has no data rows");
  const mapping = buildMapping(headers, spec);
  const missingRequired = spec.columns.filter((c) => c.required && !mapping[c.key]);
  if (missingRequired.length) {
    throw new Error(
      `Could not find a column for: ${missingRequired.map((c) => c.key).join(", ")}`,
    );
  }
  const { rows, rejects } = applySpec(sourceRows, spec, mapping);
  return { rows, mapping, rejects };
}

/** Parse a plain CSV/TSV string directly, without going through a `File`. */
export function parseTableText(text: string, spec: TableSpec): ParseResult {
  const { headers, rows: sourceRows } = parseDelimitedText(text);
  const mapping = buildMapping(headers, spec);
  const { rows, rejects } = applySpec(sourceRows, spec, mapping);
  return { rows, mapping, rejects };
}

/** Rows + columns → a CSV string, for `ExportButton`. */
export function toCSV(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => esc(c.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => esc(row[c.key])).join(","));
  }
  return lines.join("\n");
}
