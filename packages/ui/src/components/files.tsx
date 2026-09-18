"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Spinner, cx } from "./primitives";
import { Select } from "./fields";
import { toneClass } from "../tone";
import { color, type Tone } from "../tokens";
import { applySpec, buildMapping, readTable, toCSV, type TableSpec } from "../lib/parse";

/** Re-exported so an app can build a spec without importing `lib/parse` directly. */
export type { ColumnSpec, ColumnType, ParseResult, Reject, TableSpec } from "../lib/parse";

/* FileDrop --------------------------------------------------------------- */

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A drag-and-drop zone that is also a click-to-browse button.
 *
 * Use it as the first step of any file import. It shows the chosen file's
 * name and size once one lands, and paints itself `tone="error"` when the
 * caller rejects the file — for anything that only ever picks one file. It is
 * not a general-purpose upload widget with a progress bar; `ImportWizard`
 * owns what happens after the drop.
 */
export function FileDrop({
  accept,
  file,
  onFile,
  error,
  label = "Drop a file here, or click to browse",
  hint,
  className,
}: {
  /** e.g. ".csv,.xlsx" — passed straight to the hidden input. */
  accept?: string;
  file?: { name: string; size: number } | null;
  onFile: (file: File) => void;
  /** Set once the caller has looked at the file and rejected it. */
  error?: string;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tone: Tone = error ? "error" : dragOver ? "brand" : "neutral";

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) onFile(files[0]);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cx(
        "flex flex-col items-center justify-center gap-1.5 text-center rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors",
        toneClass(tone, "border"),
        dragOver ? "bg-selected" : "bg-white hover:bg-surface-grey",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={color.muted} strokeWidth="1.8" aria-hidden>
        <path d="M12 16V4M12 4 7 9M12 4l5 5" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      {file ? (
        <div className="text-[12px] text-secondary font-medium">
          {file.name} <span className="text-muted font-normal">· {formatBytes(file.size)}</span>
        </div>
      ) : (
        <div className="text-[12px] text-secondary font-medium">{label}</div>
      )}
      {error ? (
        <div className="text-[11px] text-error">{error}</div>
      ) : (
        hint && <div className="text-[11px] text-muted">{hint}</div>
      )}
      {accept && !file && <div className="text-[10.5px] text-muted opacity-70">Accepts {accept}</div>}
    </div>
  );
}

/* FindingsPanel ----------------------------------------------------------- */

export type Finding = {
  severity: "error" | "warn" | "info";
  message: string;
  rowIndex?: number;
  jumpTo?: () => void;
};

const SEVERITY_LABEL: Record<Finding["severity"], string> = { error: "Errors", warn: "Warnings", info: "Notes" };
const SEVERITY_TONE: Record<Finding["severity"], Tone> = { error: "error", warn: "warn", info: "info" };
const ORDER: Finding["severity"][] = ["error", "warn", "info"];

/**
 * A summary of import findings, grouped by severity with counts and a jump
 * link back to the offending row.
 *
 * Use it after a validation pass over rows. Do not use it for a single error
 * message — that belongs on the `Field` it came from.
 */
export function FindingsPanel({ findings, className }: { findings: Finding[]; className?: string }) {
  const groups = useMemo(() => {
    const by = new Map<Finding["severity"], Finding[]>();
    for (const f of findings) by.set(f.severity, [...(by.get(f.severity) ?? []), f]);
    return by;
  }, [findings]);

  if (findings.length === 0) {
    return (
      <div className={cx("flex items-center gap-2 text-[12px] text-ok font-medium", className)}>
        <span className={cx("w-2 h-2 rounded-full", toneClass("ok", "fill"))} />
        Nothing to flag. Every row checks out.
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {ORDER.filter((s) => groups.get(s)?.length).map((s) => (
          <span key={s} className={cx("inline-flex items-center gap-1.5 text-[12px] font-semibold", toneClass(SEVERITY_TONE[s], "text"))}>
            <span className={cx("w-2 h-2 rounded-full", toneClass(SEVERITY_TONE[s], "fill"))} />
            {groups.get(s)!.length} {SEVERITY_LABEL[s].toLowerCase()}
          </span>
        ))}
      </div>
      <div className="flex flex-col divide-y divide-edge rounded-lg border border-edge overflow-hidden">
        {ORDER.flatMap((s) => groups.get(s) ?? []).map((f, i) => (
          <div key={i} className="flex items-start gap-2.5 px-3 py-2 bg-white">
            <span className={cx("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", toneClass(SEVERITY_TONE[f.severity], "fill"))} />
            <span className="flex-1 text-[12px] text-secondary">
              {f.rowIndex !== undefined && <span className="cx-num text-muted mr-1.5">Row {f.rowIndex + 1}</span>}
              {f.message}
            </span>
            {f.jumpTo && (
              <button type="button" onClick={f.jumpTo} className="text-[11px] font-semibold text-primary hover:underline shrink-0">
                Jump to row
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ExportButton -------------------------------------------------------------- */

/**
 * Turn rows + columns into a downloaded CSV. There is one export shape in the
 * shop; do not build a second button that writes xlsx or json next to it.
 */
export function ExportButton({
  rows,
  columns,
  filename = "export.csv",
  label = "Export",
}: {
  rows: Record<string, unknown>[];
  columns: { key: string; header: string }[];
  filename?: string;
  label?: string;
}) {
  function download() {
    const csv = toCSV(rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Button variant="secondary" onClick={download}>
      {label}
    </Button>
  );
}

/* AutosaveChip -------------------------------------------------------------- */

export type AutosaveState = "saved" | "saving" | "unsaved" | "error";

const AUTOSAVE: Record<AutosaveState, { tone: Tone; text: string }> = {
  saved: { tone: "ok", text: "Saved" },
  saving: { tone: "info", text: "Saving…" },
  unsaved: { tone: "warn", text: "Unsaved changes" },
  error: { tone: "error", text: "Couldn't save" },
};

function relativeTime(from: Date, now: Date): string {
  const seconds = Math.max(0, Math.round((now.getTime() - from.getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

/**
 * A small chip that says whether a record's edits have made it to the
 * server: `saved`, `saving`, `unsaved`, or `error`.
 *
 * Use it beside a Save button on any screen with `InlineEdit` fields, so
 * people never have to guess whether their last change stuck.
 */
export function AutosaveChip({
  state,
  savedAt,
  now = new Date(),
  className,
}: {
  state: AutosaveState;
  /** When the last successful save happened, for the "Saved 2m ago" text. */
  savedAt?: Date;
  now?: Date;
  className?: string;
}) {
  const spec = AUTOSAVE[state];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        toneClass(spec.tone, "soft"),
        className,
      )}
    >
      {state === "saving" ? <Spinner size={10} /> : <span className={cx("w-1.5 h-1.5 rounded-full", toneClass(spec.tone, "fill"))} />}
      {spec.text}
      {state === "saved" && savedAt && <span className="opacity-70 font-normal">· {relativeTime(savedAt, now)}</span>}
    </span>
  );
}

/* ImportWizard -------------------------------------------------------------- */

type WizardStep = "drop" | "preview" | "map" | "validate" | "commit";
const STEPS: { key: WizardStep; label: string }[] = [
  { key: "drop", label: "Drop" },
  { key: "preview", label: "Preview" },
  { key: "map", label: "Map columns" },
  { key: "validate", label: "Validate" },
  { key: "commit", label: "Commit" },
];

/**
 * Drawn locally in the Segmented style — `StatusStepper` belongs to another
 * family, and a wizard header is not a status readout.
 */
function WizardSteps({ step }: { step: WizardStep }) {
  const index = STEPS.findIndex((s) => s.key === step);
  return (
    <div className="inline-flex rounded-lg border border-border-idle bg-white p-0.5">
      {STEPS.map((s, i) => (
        <span
          key={s.key}
          className={cx(
            "h-7 px-3 rounded text-[11px] font-semibold whitespace-nowrap inline-flex items-center gap-1.5",
            i === index ? "bg-primary text-white" : i < index ? "text-ok" : "text-muted",
          )}
        >
          <span className="cx-num opacity-70">{i + 1}</span>
          {s.label}
        </span>
      ))}
    </div>
  );
}

function firstRows<T>(rows: T[], n: number): T[] {
  return rows.slice(0, n);
}

/**
 * The whole file-import flow: Drop, Preview, Map columns, Validate, Commit.
 *
 * Use it any time an app needs to take in a spreadsheet or CSV from someone
 * outside the team, rather than typing rows in one at a time. For a single
 * known-good file with nothing to map or reject, `FileDrop` alone is enough.
 */
export function ImportWizard({
  spec,
  onCommit,
  sampleName = "import",
  initialFile,
}: {
  spec: TableSpec;
  onCommit: (rows: Record<string, unknown>[]) => void;
  /** Used for the downloaded filename on the commit step's log, and nothing else. */
  sampleName?: string;
  /** Skip the Drop step and load this file immediately — a bundled sample, in a demo. */
  initialFile?: File;
}) {
  const [step, setStep] = useState<WizardStep>("drop");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sourceRows, setSourceRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [committed, setCommitted] = useState(false);
  const loadedInitial = useRef(false);

  const { rows: mappedRows, rejects } = useMemo(
    () => applySpec(sourceRows, spec, mapping),
    [applySpec, sourceRows, spec, mapping],
  );

  useEffect(() => {
    if (initialFile && !loadedInitial.current) {
      loadedInitial.current = true;
      // Same path a real drop takes, just kicked off on mount.
      void handleFile(initialFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);

  async function handleFile(f: File) {
    setError(undefined);
    setFile({ name: f.name, size: f.size });
    try {
      // Read raw headers + rows first — the mapping in step 3 is something
      // the person can still change, so nothing here bakes in the spec yet.
      const { headers: hdrs, rows } = await readTable(f);
      setHeaders(hdrs);
      setSourceRows(rows);
      setMapping(buildMapping(hdrs, spec));
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file");
    }
  }

  function commit() {
    onCommit(mappedRows);
    setCommitted(true);
  }

  const requiredUnmapped = spec.columns.filter((c) => c.required && !mapping[c.key]);
  const findings: Finding[] = [
    ...requiredUnmapped.map((c): Finding => ({ severity: "error", message: `"${c.key}" has no source column mapped.` })),
    ...rejects.map((r): Finding => ({ severity: "error", message: `${r.field}: ${r.reason}`, rowIndex: r.row })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <WizardSteps step={step} />

      {step === "drop" && (
        <FileDrop accept=".csv,.tsv,.xlsx,.xls" file={file} error={error} onFile={handleFile} hint="CSV, TSV or an Excel workbook." />
      )}

      {step === "preview" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-muted">
            Showing the first {Math.min(20, sourceRows.length)} of {sourceRows.length} rows in{" "}
            <span className="font-semibold text-secondary">{file?.name}</span>.
          </p>
          <div className="overflow-x-auto rounded-lg border border-edge">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="cx-label px-2.5 py-2 border-b border-edge text-left whitespace-nowrap bg-surface-grey">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {firstRows(sourceRows, 20).map((row, i) => (
                  <tr key={i} className="border-b border-edge last:border-0">
                    {headers.map((h) => (
                      <td key={h} className="px-2.5 py-1.5 whitespace-nowrap text-secondary">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep("drop")}>Back</Button>
            <Button variant="primary" onClick={() => setStep("map")}>Map columns</Button>
          </div>
        </div>
      )}

      {step === "map" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col divide-y divide-edge rounded-lg border border-edge overflow-hidden">
            {spec.columns.map((c) => (
              <div key={c.key} className="flex items-center gap-3 px-3 py-2 bg-white">
                <span className="text-[12px] font-medium text-secondary w-40 shrink-0">
                  {c.key}
                  {c.required && <span className="text-error"> *</span>}
                </span>
                <Select
                  small
                  value={mapping[c.key] ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [c.key]: e.target.value }))}
                  className="flex-1"
                >
                  <option value="">Not mapped</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep("preview")}>Back</Button>
            <Button variant="primary" onClick={() => setStep("validate")}>Validate</Button>
          </div>
        </div>
      )}

      {step === "validate" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-secondary">
            <span className="font-semibold cx-num">{mappedRows.length}</span> of{" "}
            <span className="cx-num">{sourceRows.length}</span> rows accepted.
          </p>
          <FindingsPanel findings={findings} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep("map")}>Back</Button>
            <Button variant="primary" disabled={requiredUnmapped.length > 0} onClick={() => setStep("commit")}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "commit" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-secondary">
            Ready to import <span className="font-semibold cx-num">{mappedRows.length}</span> rows from{" "}
            <span className="font-semibold">{file?.name ?? sampleName}</span>.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep("validate")}>Back</Button>
            <Button variant="primary" onClick={commit} disabled={committed}>
              {committed ? "Imported" : `Import ${mappedRows.length} rows`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
