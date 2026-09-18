"use client";

import React from "react";
import { cx } from "./primitives";

/* Stat tile ------------------------------------------------------------ */

/**
 * One number that matters, with the label above it and the caveat below.
 *
 * A tile states a fact; it never explains the method. If the number is bad
 * news, pass tone="error" — colour is the only thing that changes.
 */
export function StatTile({
  label,
  value,
  note,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  tone?: "default" | "ok" | "warn" | "error";
  className?: string;
}) {
  const valueTone = {
    default: "text-secondary",
    ok: "text-ok",
    warn: "text-warn",
    error: "text-error",
  }[tone];
  return (
    <div className={cx("cx-card px-4 py-3.5", className)}>
      <div className="cx-label">{label}</div>
      <div className={cx("cx-num text-[24px] font-bold leading-tight mt-1.5", valueTone)}>{value}</div>
      {note && <div className="text-[11px] text-muted mt-1">{note}</div>}
    </div>
  );
}

/** A row of tiles. Four is the ceiling — past that nothing reads as key. */
export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>{children}</div>
  );
}

/* Table ---------------------------------------------------------------- */

export type Column<T> = {
  key: string;
  header: string;
  /** Numbers right-align. Text left-aligns. There is no third option. */
  align?: "left" | "right";
  width?: number | string;
  render: (row: T, index: number) => React.ReactNode;
};

/**
 * The table.
 *
 * Header is a thin uppercase rule, rows are hairline-separated, numbers are
 * tabular so columns line up. Clicking a row is the way to open a record;
 * a chevron column is not needed.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isSelected,
  empty = "Nothing here yet.",
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  isSelected?: (row: T) => boolean;
  empty?: React.ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return <div className="px-4 py-8 text-center text-[12px] text-muted">{empty}</div>;
  }
  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cx(
                  "cx-label px-3 py-2.5 border-b border-edge whitespace-nowrap",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              className={cx(
                "border-b border-edge last:border-0 transition-colors",
                onRowClick && "cursor-pointer hover:bg-surface-grey",
                isSelected?.(row) && "bg-selected",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx(
                    "px-3 py-2.5 text-[12.5px] text-secondary align-middle",
                    c.align === "right" && "text-right cx-num",
                  )}
                >
                  {c.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* List row -------------------------------------------------------------- */

/**
 * A selectable row in a left rail: a dot for in/out, a name over a quieter
 * second line, and figures on the right.
 */
export function ListRow({
  selected,
  onClick,
  title,
  subtitle,
  right,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "flex items-center gap-3 px-3 py-2.5 border-b border-edge transition-colors",
        onClick && "cursor-pointer hover:bg-surface-grey",
        selected && "bg-selected",
        className,
      )}
    >
      <span
        className={cx(
          "w-2.5 h-2.5 rounded-full shrink-0 border",
          selected ? "bg-primary border-primary" : "bg-white border-border-idle",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-secondary truncate">{title}</div>
        {subtitle && <div className="text-[11px] text-muted truncate">{subtitle}</div>}
      </div>
      {right && <div className="text-right shrink-0">{right}</div>}
    </div>
  );
}

/* Meters ---------------------------------------------------------------- */

/** A share-of-total bar. Label, track, value — always in that order. */
export function BarMeter({
  label,
  value,
  max,
  display,
  tone = "brand",
}: {
  label: string;
  value: number;
  max: number;
  display?: string;
  tone?: "brand" | "ok" | "warn" | "error";
}) {
  const fill = { brand: "bg-primary", ok: "bg-ok", warn: "bg-warn", error: "bg-error" }[tone];
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-32 shrink-0 text-[12px] text-muted truncate">{label}</span>
      <span className="flex-1 h-2 rounded-full bg-surface-grey overflow-hidden">
        <span className={cx("block h-full rounded-full", fill)} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-14 text-right text-[12px] font-semibold cx-num text-secondary">
        {display ?? value}
      </span>
    </div>
  );
}

/** Progress toward a target. Turns red when it will not make it. */
export function ProgressBar({
  value,
  target,
  tone = "brand",
}: {
  value: number;
  target: number;
  tone?: "brand" | "ok" | "warn" | "error";
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const fill = { brand: "bg-primary", ok: "bg-ok", warn: "bg-warn", error: "bg-error" }[tone];
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-grey overflow-hidden">
      <div className={cx("h-full rounded-full transition-all", fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** The key under a chart or map. Never leave a colour unexplained. */
export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm border border-border-idle"
            style={{ background: i.color }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}
