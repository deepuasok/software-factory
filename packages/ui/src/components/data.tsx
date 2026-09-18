"use client";

import React, { useMemo, useState } from "react";
import { Button, cx } from "./primitives";
import { Sparkline } from "./charts";
import { toneClass } from "../tone";
import { sequential, type Tone } from "../tokens";

/* Stat tile ------------------------------------------------------------ */

/**
 * One number that matters, with the label above it and the caveat below.
 *
 * A tile states a fact; it never explains the method. If the number is bad
 * news, pass tone="error" — colour is the only thing that changes. Four across
 * is the ceiling; past that nothing on the row reads as key.
 */
export function StatTile({
  label,
  value,
  note,
  tone = "default",
  delta,
  sparkline,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  /** "default" is kept for older callers and means the same as "neutral". */
  tone?: Tone | "default";
  /** The change since last time, shown under the value with an arrow. */
  delta?: { value: number; format?: (v: number) => string; higherIsBetter?: boolean };
  /** A trend, drawn small in the corner with the existing Sparkline. */
  sparkline?: number[];
  className?: string;
}) {
  return (
    <div className={cx("cx-card px-4 py-3.5", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="cx-label">{label}</div>
        {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} width={56} height={18} />}
      </div>
      <div
        className={cx(
          "cx-num text-[24px] font-bold leading-tight mt-1.5",
          toneClass(tone === "default" ? "neutral" : tone, "text"),
        )}
      >
        {value}
      </div>
      {delta && (
        <div className="mt-1">
          <DeltaValue value={delta.value} format={delta.format} higherIsBetter={delta.higherIsBetter} />
        </div>
      )}
      {note && <div className="text-[11px] text-muted mt-1">{note}</div>}
    </div>
  );
}

/**
 * A row of tiles. Four is the ceiling — past that nothing reads as key.
 *
 * Pass `wideFirst` when the first tile is the headline figure the rest
 * support — it spans two columns instead of standing the same width as
 * everything beside it.
 */
export function StatRow({
  children,
  wideFirst = false,
  className,
}: {
  children: React.ReactNode;
  wideFirst?: boolean;
  className?: string;
}) {
  const items = React.Children.toArray(children);
  return (
    <div className={cx("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {items.map((child, i) => (
        <div key={i} className={wideFirst && i === 0 ? "col-span-2" : undefined}>
          {child}
        </div>
      ))}
    </div>
  );
}

/* Small state parts ----------------------------------------------------- */

/**
 * A tone dot with a word beside it, for a health read-out in a row or a rail.
 *
 * Use it when the state is judged — on plan, at risk, behind. For a plain
 * category or a count, use Badge; a dot there implies a judgement that is not
 * being made.
 */
export function RagStatus({
  tone = "neutral",
  label,
  className,
}: {
  tone?: Tone;
  label: string;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-[12px] text-secondary", className)}>
      <span className={cx("w-2 h-2 rounded-full shrink-0", toneClass(tone, "fill"))} />
      {label}
    </span>
  );
}

/**
 * A status word in a tinted pill, sized for a table cell.
 *
 * Use it for the one status column a table has. For a category, a count or an
 * identifier, use Badge — a pill on everything turns the column into wallpaper.
 */
export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        toneClass(tone, "soft"),
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * A change with its direction shown, coloured by whether the change is good
 * news. Up is not always good, so say which way you want it to go.
 *
 * Use it beside a figure that moved. Do not use it for the figure itself — a
 * total is a fact, not a change.
 */
export function DeltaValue({
  value,
  format = (v: number) => `${v > 0 ? "+" : ""}${v}`,
  higherIsBetter = true,
  className,
}: {
  value: number;
  format?: (v: number) => string;
  /** Set false for things you want to go down: cost, backlog, days late. */
  higherIsBetter?: boolean;
  className?: string;
}) {
  const good = value === 0 ? null : value > 0 === higherIsBetter;
  const tone: Tone = good === null ? "neutral" : good ? "ok" : "error";
  const arrow = value === 0 ? "–" : value > 0 ? "▲" : "▼";
  return (
    <span
      className={cx("inline-flex items-center gap-1 cx-num text-[12px] font-semibold", toneClass(tone, "text"), className)}
    >
      <span aria-hidden className="text-[9px]">{arrow}</span>
      {format(value)}
    </span>
  );
}

/**
 * A number with its magnitude painted behind it, so a column of them reads as
 * a shape before it reads as figures.
 *
 * Use it in a table where every row is the same measure on the same scale. Do
 * not use it on a column of mixed units — the ramp would compare apples to
 * pears.
 */
export function HeatCell({
  value,
  min,
  max,
  format = (v: number) => String(v),
  className,
}: {
  value: number;
  min: number;
  max: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const span = max - min;
  const t = span > 0 ? (value - min) / span : 0;
  const step = Math.min(sequential.length - 1, Math.max(0, Math.floor(t * sequential.length)));
  return (
    <span
      className={cx(
        "inline-block w-full rounded px-2 py-0.5 text-right cx-num text-[12px] font-medium",
        step >= 3 ? "text-white" : "text-secondary",
        className,
      )}
      style={{ background: sequential[step] }}
    >
      {format(value)}
    </span>
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
  /** Let people sort on this column. Pair it with `sortValue`. */
  sortable?: boolean;
  /** What to sort on. Without it a sortable column falls back to the row order. */
  sortValue?: (row: T) => string | number;
  /** Let people hide this column from the column chooser. */
  hideable?: boolean;
};

export type SortState = { key: string; direction: "asc" | "desc" } | null;

/** Cycles a header through ascending, descending, then back to row order. */
function nextSort(current: SortState, key: string): SortState {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

/**
 * The bar that appears above a table once rows are ticked.
 *
 * Use it for actions that only make sense on several rows at once. A single
 * row's actions belong in that row, not up here.
 */
export function BulkActionBar({
  count,
  onClear,
  children,
  className,
}: {
  count: number;
  onClear?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  if (count === 0) return null;
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-2 px-3 py-2 bg-selected border-b border-edge",
        className,
      )}
    >
      <span className="text-[12px] font-semibold text-primary cx-num">{count} selected</span>
      <div className="flex-1" />
      {children}
      {onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}

/** The ⋯ menu at the end of a row. Opens on click, closes on the next one. */
function RowMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Row actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        ⋯
      </Button>
      {open && (
        <>
          <span className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <span
            className="absolute right-0 top-full z-50 mt-1 min-w-[160px] flex flex-col items-stretch gap-0.5 p-1 bg-white rounded-lg border border-edge shadow-raised text-left"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
}

/** The Columns menu. Only columns marked `hideable` can be switched off. */
function ColumnChooser<T>({
  columns,
  hidden,
  onToggle,
}: {
  columns: Column<T>[];
  hidden: string[];
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const choices = columns.filter((c) => c.hideable);
  if (choices.length === 0) return null;
  return (
    <div className="relative">
      <Button variant="ghost" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Columns
        {hidden.length > 0 && <span className="cx-num opacity-70">· {choices.length - hidden.length}</span>}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] p-2 bg-white rounded-lg border border-edge shadow-raised">
            {choices.map((c) => (
              <label
                key={c.key}
                className="flex items-center gap-2 px-1 py-1 text-[12px] text-secondary cursor-pointer hover:text-primary"
              >
                <input
                  type="checkbox"
                  checked={!hidden.includes(c.key)}
                  onChange={() => onToggle(c.key)}
                  className="w-3.5 h-3.5 rounded-sm border border-border-idle accent-primary cursor-pointer"
                />
                {c.header}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The table.
 *
 * Header is a thin uppercase rule, rows are hairline-separated, numbers are
 * tabular so columns line up. Clicking a row is the way to open a record.
 *
 * Everything past the plain table is opt-in: pass `selectable` for tick boxes
 * and a bulk bar, `renderExpanded` for detail under a row, `columnChooser` to
 * let people hide columns, `rowActions` for a ⋯ menu. Turn none of it on
 * unless people actually do that job here — an ordinary list of twenty rows
 * needs none of it.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isSelected,
  empty = "Nothing here yet.",
  className,
  sort,
  onSortChange,
  stickyHeader = false,
  maxHeight,
  selectable = false,
  selected,
  onSelectionChange,
  bulkActions,
  renderExpanded,
  columnChooser = false,
  dense = false,
  rowActions,
  freezeFirstColumn = false,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  isSelected?: (row: T) => boolean;
  empty?: React.ReactNode;
  className?: string;
  /** Controlled sort. Leave it out and the table keeps its own. */
  sort?: SortState;
  onSortChange?: (next: SortState) => void;
  /** Header stays put while the body scrolls. Needs a height — see `maxHeight`. */
  stickyHeader?: boolean;
  /** Height of the scrolling body in pixels. Defaults to 520 when the header sticks. */
  maxHeight?: number;
  /** Tick boxes down the left, and the bulk bar above. */
  selectable?: boolean;
  selected?: Set<string>;
  onSelectionChange?: (next: Set<string>) => void;
  /** Buttons for the bulk bar. Shown only while something is ticked. */
  bulkActions?: React.ReactNode;
  /** Detail panel under a row, opened by the triangle on the left. */
  renderExpanded?: (row: T, index: number) => React.ReactNode;
  /** Show the Columns menu. Only columns marked `hideable` appear in it. */
  columnChooser?: boolean;
  /** Tighter rows, for a table people scan rather than read. */
  dense?: boolean;
  /** Per-row actions, gathered into a ⋯ menu at the end of the row. */
  rowActions?: (row: T, index: number) => React.ReactNode;
  /** Keep the first column in view while the rest scrolls sideways. */
  freezeFirstColumn?: boolean;
}) {
  const [ownSort, setOwnSort] = useState<SortState>(null);
  const [ownSelected, setOwnSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const activeSort = sort !== undefined ? sort : ownSort;
  const setSort = onSortChange ?? setOwnSort;
  const activeSelected = selected !== undefined ? selected : ownSelected;
  const setSelected = onSelectionChange ?? setOwnSelected;

  const shown = useMemo(() => columns.filter((c) => !hidden.includes(c.key)), [columns, hidden]);

  const ordered = useMemo(() => {
    if (!activeSort) return rows;
    const col = columns.find((c) => c.key === activeSort.key);
    if (!col?.sortValue) return rows;
    const read = col.sortValue;
    const sign = activeSort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = read(a);
      const y = read(b);
      if (typeof x === "number" && typeof y === "number") return (x - y) * sign;
      return String(x).localeCompare(String(y)) * sign;
    });
  }, [rows, columns, activeSort]);

  const allKeys = ordered.map((r, i) => rowKey(r, i));
  const allTicked = allKeys.length > 0 && allKeys.every((k) => activeSelected.has(k));

  function toggleRow(key: string) {
    const next = new Set(activeSelected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }

  const pad = dense ? "px-3 py-1.5" : "px-3 py-2.5";
  const headPad = dense ? "px-3 py-1.5" : "px-3 py-2.5";

  /* Where the frozen cells sit, left to right. */
  let offset = 0;
  const expandLeft = offset;
  if (renderExpanded) offset += 30;
  const tickLeft = offset;
  if (selectable) offset += 34;
  const firstLeft = offset;

  const freezeCell = freezeFirstColumn ? "sticky z-[2] bg-inherit" : "";

  const body = (
    <table className="w-full border-collapse">
      <thead className={cx(stickyHeader && "sticky top-0 z-10 bg-white")}>
        <tr>
          {renderExpanded && (
            <th
              style={freezeFirstColumn ? { width: 30, left: expandLeft } : { width: 30 }}
              className={cx("border-b border-edge", freezeFirstColumn && "sticky z-[3] bg-white")}
            />
          )}
          {selectable && (
            <th
              style={freezeFirstColumn ? { width: 34, left: tickLeft } : { width: 34 }}
              className={cx("border-b border-edge px-3", freezeFirstColumn && "sticky z-[3] bg-white")}
            >
              <input
                type="checkbox"
                aria-label="Select every row"
                checked={allTicked}
                onChange={() => setSelected(allTicked ? new Set() : new Set(allKeys))}
                className="w-3.5 h-3.5 rounded-sm border border-border-idle accent-primary cursor-pointer align-middle"
              />
            </th>
          )}
          {shown.map((c, ci) => {
            const on = activeSort?.key === c.key;
            const arrow = !c.sortable ? null : on ? (activeSort!.direction === "asc" ? "▲" : "▼") : "↕";
            const freezeThis = freezeFirstColumn && ci === 0;
            return (
              <th
                key={c.key}
                style={freezeThis ? { width: c.width, left: firstLeft } : { width: c.width }}
                aria-sort={on ? (activeSort!.direction === "asc" ? "ascending" : "descending") : undefined}
                className={cx(
                  "cx-label border-b border-edge whitespace-nowrap",
                  headPad,
                  c.align === "right" ? "text-right" : "text-left",
                  freezeThis && "sticky z-[3] bg-white",
                )}
              >
                {c.sortable ? (
                  <button
                    type="button"
                    onClick={() => setSort(nextSort(activeSort, c.key))}
                    className="cx-label inline-flex items-center gap-1 hover:text-primary"
                  >
                    {c.header}
                    <span aria-hidden className={cx("text-[8px]", on ? "text-primary" : "opacity-40")}>
                      {arrow}
                    </span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            );
          })}
          {rowActions && <th style={{ width: 44 }} className="border-b border-edge" />}
        </tr>
      </thead>
      <tbody>
        {ordered.map((row, i) => {
          const key = rowKey(row, i);
          const isOpen = expanded.includes(key);
          const ticked = activeSelected.has(key);
          return (
            <React.Fragment key={key}>
              <tr
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cx(
                  "border-b border-edge transition-colors bg-white",
                  onRowClick && "cursor-pointer hover:bg-surface-grey",
                  (isSelected?.(row) || ticked) && "bg-selected",
                  isOpen && "bg-surface-grey",
                )}
              >
                {renderExpanded && (
                  <td
                    style={freezeFirstColumn ? { left: expandLeft } : undefined}
                    className={cx("pl-2 align-middle", freezeCell)}
                  >
                    <button
                      type="button"
                      aria-label={isOpen ? "Hide detail" : "Show detail"}
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((x) => (x.includes(key) ? x.filter((k) => k !== key) : [...x, key]));
                      }}
                      className={cx(
                        "w-5 h-5 rounded text-[9px] text-muted hover:bg-selected hover:text-primary transition-transform",
                        isOpen && "rotate-90",
                      )}
                    >
                      ▶
                    </button>
                  </td>
                )}
                {selectable && (
                  <td
                    style={freezeFirstColumn ? { left: tickLeft } : undefined}
                    className={cx("px-3 align-middle", freezeCell)}
                  >
                    <input
                      type="checkbox"
                      aria-label="Select row"
                      checked={ticked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleRow(key)}
                      className="w-3.5 h-3.5 rounded-sm border border-border-idle accent-primary cursor-pointer align-middle"
                    />
                  </td>
                )}
                {shown.map((c, ci) => {
                  const freezeThis = freezeFirstColumn && ci === 0;
                  return (
                    <td
                      key={c.key}
                      style={freezeThis ? { left: firstLeft } : undefined}
                      className={cx(
                        "text-[12.5px] text-secondary align-middle",
                        pad,
                        c.align === "right" && "text-right cx-num",
                        freezeThis && "sticky z-[2] bg-inherit",
                      )}
                    >
                      {c.render(row, i)}
                    </td>
                  );
                })}
                {rowActions && (
                  <td className={cx("text-right align-middle", pad)}>
                    <RowMenu>{rowActions(row, i)}</RowMenu>
                  </td>
                )}
              </tr>
              {renderExpanded && isOpen && (
                <tr className="border-b border-edge bg-surface-grey">
                  <td
                    colSpan={shown.length + (selectable ? 1 : 0) + 1 + (rowActions ? 1 : 0)}
                    className="px-4 py-3 text-[12px] text-secondary"
                  >
                    {renderExpanded(row, i)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  if (rows.length === 0) {
    return <div className="px-4 py-8 text-center text-[12px] text-muted">{empty}</div>;
  }

  const scroll = stickyHeader
    ? { className: "overflow-auto", style: { maxHeight: maxHeight ?? 520 } }
    : { className: "overflow-x-auto", style: maxHeight ? { maxHeight, overflowY: "auto" as const } : undefined };

  return (
    <div className={className}>
      {bulkActions && (
        <BulkActionBar count={activeSelected.size} onClear={() => setSelected(new Set())}>
          {bulkActions}
        </BulkActionBar>
      )}
      {columnChooser && (
        <div className="flex justify-end px-3 py-1.5 border-b border-edge">
          <ColumnChooser
            columns={columns}
            hidden={hidden}
            onToggle={(k) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))}
          />
        </div>
      )}
      <div className={scroll.className} style={scroll.style}>
        {body}
      </div>
    </div>
  );
}

/* List row -------------------------------------------------------------- */

/**
 * A selectable row in a left rail: a dot for in/out, a name over a quieter
 * second line, and figures on the right.
 *
 * Pass `tone` when the dot should report health rather than selection — a rail
 * of studies where three are behind plan. Leave it out and the dot means
 * "this is the one you are looking at".
 */
export function ListRow({
  selected,
  onClick,
  title,
  subtitle,
  right,
  tone,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  tone?: Tone;
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
          tone
            ? cx(toneClass(tone, "fill"), toneClass(tone, "border"))
            : selected
              ? "bg-primary border-primary"
              : "bg-white border-border-idle",
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
  tone?: Tone;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-32 shrink-0 text-[12px] text-muted truncate">{label}</span>
      <span className="flex-1 h-2 rounded-full bg-surface-grey overflow-hidden">
        <span className={cx("block h-full rounded-full", toneClass(tone, "fill"))} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-14 text-right text-[12px] font-semibold cx-num text-secondary">
        {display ?? value}
      </span>
    </div>
  );
}

/**
 * Progress toward a target. Pass tone="error" when it will not make it, or
 * pass `thresholds` and let the percent of target pick the tone for you.
 */
export function ProgressBar({
  value,
  target,
  tone = "brand",
  thresholds,
}: {
  value: number;
  target: number;
  tone?: Tone;
  /** Percent-of-target cutoffs. Below `errorBelow` wins over below `warnBelow`. */
  thresholds?: { warnBelow?: number; errorBelow?: number };
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  let resolvedTone = tone;
  if (thresholds) {
    if (thresholds.errorBelow !== undefined && pct < thresholds.errorBelow) resolvedTone = "error";
    else if (thresholds.warnBelow !== undefined && pct < thresholds.warnBelow) resolvedTone = "warn";
  }
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-grey overflow-hidden">
      <div
        className={cx("h-full rounded-full transition-all", toneClass(resolvedTone, "fill"))}
        style={{ width: `${pct}%` }}
      />
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
