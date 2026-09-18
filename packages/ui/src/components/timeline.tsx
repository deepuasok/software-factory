"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { color, series as SERIES, type Tone } from "../tokens";
import { toneClass, toneHex } from "../tone";
import { cx } from "./primitives";
import { useTheme } from "../theme";
import { Field, DateInput } from "./fields";

/* Date helpers (package-local, not exported) ---------------------------- */

function toDate(d: Date | string): Date {
  if (d instanceof Date) return d;
  return new Date(d.length === 10 ? `${d}T00:00:00` : d);
}
function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 86400000;
}
function addDays(a: Date, days: number): Date {
  return new Date(a.getTime() + days * 86400000);
}
function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
function fmtDuration(days: number): string {
  if (days < 14) return `${Math.round(days)}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  const months = days / 30.4;
  return `${months < 10 ? months.toFixed(1) : Math.round(months)}mo`;
}

/* Gantt ------------------------------------------------------------------ */

export type GanttRow = {
  id: string;
  label: string;
  /** Rows sharing a group get the same colour and sit together. */
  group?: string;
  start: Date | string;
  end: Date | string;
  tone?: Tone;
  /** 0–1. Renders as a darker fill over the bar, left to right. */
  progress?: number;
};

export type GanttReferenceLine = {
  date: Date | string;
  label: string;
  tone?: Tone;
};

const ROW_H = 30;
/** Space above row 0 for the Today / reference-line labels. Matches the label column's top padding. */
const HEADER_H = 22;
const LABEL_W = 168;
const MIN_SPAN_DAYS = 14;

/**
 * A horizontal schedule: one bar per row, grouped and coloured by `group`,
 * zoomable and pannable, with a window slider under the chart.
 *
 * Use it for anything with a start and an end that people need to compare
 * side by side — cohorts, workstreams, site activation. For a single trend
 * over time, use `TrendChart` instead; this is for concurrent spans, not a
 * series of values.
 */
export function Gantt({
  rows,
  referenceLines = [],
  height,
  onRowClick,
  className,
}: {
  rows: GanttRow[];
  /** Vertical dated lines — a committed date, a cutoff, a go-live. */
  referenceLines?: GanttReferenceLine[];
  /** Chart height in px. Defaults to a height that fits every row. */
  height?: number;
  onRowClick?: (row: GanttRow) => void;
  className?: string;
}) {
  const { color } = useTheme();
  const parsed = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        startDate: toDate(r.start),
        endDate: toDate(r.end),
        group: r.group ?? "Ungrouped",
      })),
    [rows],
  );

  const groups = useMemo(() => {
    const seen: string[] = [];
    for (const r of parsed) if (!seen.includes(r.group)) seen.push(r.group);
    return seen;
  }, [parsed]);
  const groupColor = (g: string) => SERIES[groups.indexOf(g) % SERIES.length];

  const ordered = useMemo(
    () =>
      [...parsed].sort(
        (a, b) => groups.indexOf(a.group) - groups.indexOf(b.group) || daysBetween(new Date(0), a.startDate) - daysBetween(new Date(0), b.startDate),
      ),
    [parsed, groups],
  );

  const rangeStart = useMemo(
    () => (parsed.length ? new Date(Math.min(...parsed.map((r) => r.startDate.getTime()))) : new Date()),
    [parsed],
  );
  const rangeEnd = useMemo(
    () => (parsed.length ? new Date(Math.max(...parsed.map((r) => r.endDate.getTime()))) : addDays(rangeStart, 30)),
    [parsed, rangeStart],
  );
  const totalDays = Math.max(MIN_SPAN_DAYS, daysBetween(rangeStart, rangeEnd));

  const [win, setWin] = useState<[number, number]>([0, totalDays]);
  useEffect(() => setWin([0, totalDays]), [totalDays]);
  const winRef = useRef(win);
  winRef.current = win;

  const clampWindow = useCallback(
    (lo: number, hi: number): [number, number] => {
      const span = Math.min(totalDays, Math.max(MIN_SPAN_DAYS, hi - lo));
      let nlo = lo;
      if (nlo < 0) nlo = 0;
      if (nlo + span > totalDays) nlo = totalDays - span;
      return [Math.round(nlo), Math.round(nlo + span)];
    },
    [totalDays],
  );

  const plotRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; lo: number; hi: number } | null>(null);
  const [plotWidth, setPlotWidth] = useState(600);

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPlotWidth(Math.max(120, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dayAtClientX = useCallback(
    (clientX: number) => {
      const el = plotRef.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 1) return null;
      const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      const [lo, hi] = winRef.current;
      return lo + f * (hi - lo);
    },
    [],
  );

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 0.5) return;
      e.preventDefault();
      const anchor = dayAtClientX(e.clientX);
      if (anchor == null) return;
      const [lo, hi] = winRef.current;
      const span = hi - lo;
      const nextSpan = Math.min(totalDays, Math.max(MIN_SPAN_DAYS, span * Math.exp(e.deltaY * 0.0015)));
      const f = span > 0 ? (anchor - lo) / span : 0.5;
      setWin(clampWindow(anchor - f * nextSpan, anchor - f * nextSpan + nextSpan));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dayAtClientX, clampWindow, totalDays]);

  const chartHeight = height ?? Math.max(180, ordered.length * ROW_H + 36);
  const pxPerDay = plotWidth / Math.max(1, win[1] - win[0]);
  const dayToX = (d: number) => (d - win[0]) * pxPerDay;

  const today = daysBetween(rangeStart, new Date());
  const zoomed = win[0] > 0 || win[1] < totalDays;

  const [hover, setHover] = useState<{ row: (typeof ordered)[number]; x: number; y: number } | null>(null);

  if (!ordered.length) {
    return (
      <div className={cx("flex items-center justify-center h-40 text-[12px] text-muted", className)}>
        No rows to schedule yet.
      </div>
    );
  }

  return (
    <div className={cx("relative", className)}>
      {/* Legend — one colour per group, taken from the series order. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2" style={{ paddingLeft: LABEL_W }}>
        {groups.map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: groupColor(g) }} />
            {g}
          </span>
        ))}
      </div>

      <div className="flex">
        {/* Row labels */}
        <div style={{ width: LABEL_W }} className="shrink-0 pt-[22px]">
          {ordered.map((r) => (
            <div
              key={r.id}
              style={{ height: ROW_H }}
              className={cx(
                "flex items-center text-[11px] text-secondary truncate pr-2",
                onRowClick && "cursor-pointer hover:text-primary hover:underline",
              )}
              title={r.label}
              onClick={() => onRowClick?.(r)}
            >
              {r.label}
            </div>
          ))}
        </div>

        {/* Plot */}
        <div
          ref={plotRef}
          className="relative flex-1 min-w-0 select-none touch-none"
          style={{ height: chartHeight }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            pan.current = { x: e.clientX, lo: win[0], hi: win[1] };
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* synthetic pointers throw NotFoundError — panning still works */
            }
          }}
          onPointerMove={(e) => {
            const p = pan.current;
            if (p && plotWidth > 1) {
              const daysPerPx = (p.hi - p.lo) / plotWidth;
              const shift = (e.clientX - p.x) * daysPerPx;
              setWin(clampWindow(p.lo - shift, p.hi - shift));
            }
          }}
          onPointerUp={() => (pan.current = null)}
          onPointerCancel={() => (pan.current = null)}
        >
          <svg width="100%" height={chartHeight} className="absolute inset-0 overflow-visible" style={{ cursor: pan.current ? "grabbing" : "grab" }}>
            {/* horizontal gridline per row */}
            {ordered.map((r, i) => (
              <line key={r.id} x1={0} x2="100%" y1={HEADER_H + i * ROW_H + ROW_H} y2={HEADER_H + i * ROW_H + ROW_H} stroke={color.edge} strokeWidth={1} />
            ))}

            {/* today line */}
            {today >= win[0] && today <= win[1] && (
              <>
                <line x1={dayToX(today)} x2={dayToX(today)} y1={HEADER_H} y2={chartHeight} stroke={color.secondary} strokeDasharray="2 3" strokeWidth={1} />
                <text x={dayToX(today) + 3} y={10} fontSize={9} fill={color.secondary} fontWeight={700}>
                  Today
                </text>
              </>
            )}

            {/* reference lines (committed dates, cutoffs) */}
            {referenceLines.map((rl) => {
              const d = daysBetween(rangeStart, toDate(rl.date));
              if (d < win[0] || d > win[1]) return null;
              const hex = toneHex(rl.tone ?? "error", color);
              return (
                <g key={rl.label}>
                  <line x1={dayToX(d)} x2={dayToX(d)} y1={HEADER_H} y2={chartHeight} stroke={hex} strokeDasharray="4 3" strokeWidth={1.5} />
                  <text x={dayToX(d) + 3} y={22} fontSize={9} fill={hex} fontWeight={700}>
                    {rl.label}
                  </text>
                </g>
              );
            })}

            {/* bars */}
            {ordered.map((r, i) => {
              const x0 = dayToX(Math.max(win[0], daysBetween(rangeStart, r.startDate)));
              const x1 = dayToX(Math.min(win[1], daysBetween(rangeStart, r.endDate)));
              const w = Math.max(2, x1 - x0);
              const y = HEADER_H + i * ROW_H + 5;
              const h = ROW_H - 10;
              const fill = r.tone ? toneHex(r.tone, color) : groupColor(r.group);
              return (
                <g
                  key={r.id}
                  onMouseEnter={(e) => setHover({ row: r, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setHover({ row: r, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onRowClick?.(r)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  <rect x={x0} y={y} width={w} height={h} rx={3} fill={fill} opacity={0.32} />
                  {r.progress !== undefined && (
                    <rect x={x0} y={y} width={Math.max(0, w * Math.min(1, r.progress))} height={h} rx={3} fill={fill} />
                  )}
                  {r.progress === undefined && <rect x={x0} y={y} width={w} height={h} rx={3} fill={fill} />}
                </g>
              );
            })}
          </svg>

          {hover && (
            <div
              className="fixed z-50 bg-white border border-edge rounded-md shadow-raised px-3 py-2 pointer-events-none"
              style={{ left: hover.x + 14, top: hover.y + 14 }}
            >
              <div className="text-[11px] font-semibold text-secondary mb-0.5">{hover.row.label}</div>
              <div className="text-[11px] text-muted cx-num">
                {fmtDay(hover.row.startDate)} → {fmtDay(hover.row.endDate)}
              </div>
              <div className="text-[11px] text-muted cx-num">{fmtDuration(daysBetween(hover.row.startDate, hover.row.endDate))} duration</div>
            </div>
          )}
        </div>
      </div>

      {/* window slider */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-edge" style={{ marginLeft: LABEL_W }}>
        <span className="cx-label shrink-0">Window</span>
        <input
          type="range"
          min={0}
          max={totalDays}
          step={1}
          value={win[0]}
          onChange={(e) => setWin(([, hi]) => clampWindow(+e.target.value, hi))}
          className="w-32 accent-primary"
          aria-label="Window start"
        />
        <input
          type="range"
          min={0}
          max={totalDays}
          step={1}
          value={win[1]}
          onChange={(e) => setWin(([lo]) => clampWindow(lo, +e.target.value))}
          className="w-32 accent-primary"
          aria-label="Window end"
        />
        <span className="text-[11px] text-muted cx-num">
          {fmtMonth(addDays(rangeStart, win[0]))} → {fmtMonth(addDays(rangeStart, win[1]))}
        </span>
        {zoomed && (
          <button type="button" onClick={() => setWin([0, totalDays])} className="text-[11px] text-primary font-semibold ml-1">
            Reset
          </button>
        )}
        <span className="text-[10px] text-muted ml-auto">Scroll to zoom, drag to pan</span>
      </div>
    </div>
  );
}

/* CurveMilestones --------------------------------------------------------- */

export type CurvePoint = { date: Date | string; value: number };

/**
 * Computed checkpoints for a cumulative curve — start, 25%, 50%, 75% and
 * 100% of a target, each dated by where the curve actually crosses it.
 *
 * Use it wherever the milestone dates are the output of a model, not a fixed
 * plan — `MilestoneRail` still owns the case where every date is typed in by
 * hand. A fraction the curve never reaches is left off the rail rather than
 * guessed.
 */
export function CurveMilestones({
  curve,
  target,
  className,
}: {
  curve: CurvePoint[];
  target: number;
  className?: string;
}) {
  const { color } = useTheme();
  const points = useMemo(() => curve.map((p) => ({ date: toDate(p.date), value: p.value })).sort((a, b) => a.date.getTime() - b.date.getTime()), [curve]);

  const crossing = useCallback(
    (fraction: number): Date | null => {
      if (!points.length || target <= 0) return null;
      const goal = target * fraction;
      if (fraction === 0) return points[0].date;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        if (cur.value >= goal) {
          if (cur.value === prev.value) return cur.date;
          const t = (goal - prev.value) / (cur.value - prev.value);
          return new Date(prev.date.getTime() + t * (cur.date.getTime() - prev.date.getTime()));
        }
      }
      return null;
    },
    [points, target],
  );

  const stones = useMemo(
    () =>
      [
        { key: "start", label: "Start", fraction: 0, major: false },
        { key: "25", label: "25%", fraction: 0.25, major: false },
        { key: "50", label: "50%", fraction: 0.5, major: false },
        { key: "75", label: "75%", fraction: 0.75, major: false },
        { key: "100", label: "100%", fraction: 1, major: true },
      ]
        .map((s) => ({ ...s, date: crossing(s.fraction) }))
        .filter((s): s is typeof s & { date: Date } => s.date !== null),
    [crossing],
  );

  if (stones.length < 2) {
    return <div className={cx("text-[12px] text-muted py-3", className)}>Not enough of the curve has crossed the target yet.</div>;
  }

  const rangeStart = stones[0].date.getTime();
  const rangeEnd = stones[stones.length - 1].date.getTime();
  const span = Math.max(1, rangeEnd - rangeStart);
  const pos = (d: Date) => `${(((d.getTime() - rangeStart) / span) * 100).toFixed(2)}%`;

  return (
    <div className={cx("relative h-16 pt-6 pb-1", className)}>
      <div className="absolute left-0 right-0 top-[27px] h-1.5 rounded-full bg-surface-grey">
        <div className="h-full rounded-full bg-primary/70" style={{ width: "100%" }} />
      </div>
      {stones.map((s) => (
        <div key={s.key} className="absolute top-0 flex flex-col items-center -translate-x-1/2" style={{ left: pos(s.date) }}>
          <span className={cx("text-[9px] font-bold leading-none", s.major ? "text-primary" : "text-muted")}>{s.label}</span>
          <span
            className={cx("mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white", s.major ? "bg-primary" : "bg-secondary")}
            style={{ boxShadow: `0 0 0 1px ${color.borderIdle}` }}
          />
          <span className="mt-1.5 text-[9px] text-muted whitespace-nowrap cx-num">{fmtDay(s.date)}</span>
        </div>
      ))}
    </div>
  );
}

/* CapacityMeterGrid --------------------------------------------------------- */

export type CapacityPeriod = { id: string; label: string };
export type CapacityResource = { id: string; label: string };
export type CapacityCell = { demand: number; capacity: number };

/**
 * A periods-by-resources grid where every cell shows demand against capacity
 * as a bar, with row and column totals.
 *
 * Use it to spot where a plan overloads one resource in one period — a table
 * of raw numbers hides that; the bar makes it visible at a glance. For a
 * single resource over time, `TrendChart` is the simpler part.
 */
export function CapacityMeterGrid({
  periods,
  resources,
  cells,
  onCellClick,
  className,
}: {
  periods: CapacityPeriod[];
  resources: CapacityResource[];
  /** Keyed `${resourceId}:${periodId}`. A missing key renders as no data. */
  cells: Record<string, CapacityCell>;
  onCellClick?: (resourceId: string, periodId: string, cell: CapacityCell) => void;
  className?: string;
}) {
  const { color } = useTheme();
  const cellTone = (pct: number): Tone => (pct > 100 ? "error" : pct > 90 ? "warn" : "ok");

  const rowTotal = (resourceId: string): CapacityCell =>
    periods.reduce(
      (acc, p) => {
        const c = cells[`${resourceId}:${p.id}`];
        return c ? { demand: acc.demand + c.demand, capacity: acc.capacity + c.capacity } : acc;
      },
      { demand: 0, capacity: 0 },
    );
  const colTotal = (periodId: string): CapacityCell =>
    resources.reduce(
      (acc, r) => {
        const c = cells[`${r.id}:${periodId}`];
        return c ? { demand: acc.demand + c.demand, capacity: acc.capacity + c.capacity } : acc;
      },
      { demand: 0, capacity: 0 },
    );
  const grandTotal = periods.reduce(
    (acc, p) => {
      const t = colTotal(p.id);
      return { demand: acc.demand + t.demand, capacity: acc.capacity + t.capacity };
    },
    { demand: 0, capacity: 0 },
  );

  function Meter({ demand, capacity, dense }: CapacityCell & { dense?: boolean }) {
    const pct = capacity > 0 ? (demand / capacity) * 100 : 0;
    const tone = cellTone(pct);
    return (
      <div className="flex flex-col gap-0.5 min-w-[86px]">
        <span className="h-1.5 w-full rounded-full bg-surface-grey overflow-hidden">
          <span className={cx("block h-full rounded-full", toneClass(tone, "fill"))} style={{ width: `${Math.min(100, pct)}%` }} />
        </span>
        <span className={cx("text-[10.5px] cx-num", dense ? "font-semibold text-secondary" : "text-muted")}>
          {demand}/{capacity}
          <span className={cx("ml-1", toneClass(tone, "text"))}>({Math.round(pct)}%)</span>
        </span>
      </div>
    );
  }

  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="w-full border-collapse min-w-[560px]">
        <thead>
          <tr>
            <th className="cx-label text-left px-2 py-2 border-b border-edge sticky left-0 bg-white">Resource</th>
            {periods.map((p) => (
              <th key={p.id} className="cx-label text-left px-2 py-2 border-b border-edge whitespace-nowrap">
                {p.label}
              </th>
            ))}
            <th className="cx-label text-left px-2 py-2 border-b border-edge whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id} className="border-b border-edge last:border-0">
              <td className="px-2 py-2 text-[12px] text-secondary font-medium whitespace-nowrap sticky left-0 bg-white">{r.label}</td>
              {periods.map((p) => {
                const c = cells[`${r.id}:${p.id}`];
                return (
                  <td
                    key={p.id}
                    className={cx("px-2 py-2", onCellClick && c && "cursor-pointer")}
                    onClick={() => c && onCellClick?.(r.id, p.id, c)}
                  >
                    {c ? <Meter {...c} /> : <span className="text-[11px] text-muted">—</span>}
                  </td>
                );
              })}
              <td className="px-2 py-2">
                <Meter {...rowTotal(r.id)} dense />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="px-2 py-2 text-[11px] font-semibold text-secondary sticky left-0 bg-white">Total</td>
            {periods.map((p) => (
              <td key={p.id} className="px-2 py-2">
                <Meter {...colTotal(p.id)} dense />
              </td>
            ))}
            <td className="px-2 py-2">
              <Meter {...grandTotal} dense />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* TargetSolveRail --------------------------------------------------------- */

/**
 * A small control: pick a target date, and see the rate it takes to get
 * there — "requires N per month from 12 Oct 2026". Pure UI plus a callback;
 * it does not own the plan, the caller decides what to do with the date.
 *
 * Use it wherever a page lets someone test a date against a total, such as a
 * target completion date against an enrollment count. Pass `maxRate` when
 * there is a known ceiling, so an impossible date reads as `error` rather
 * than a plausible-looking number.
 */
export function TargetSolveRail({
  total,
  remaining,
  start,
  target,
  onTargetChange,
  maxRate,
  unit = "per month",
  className,
}: {
  /** The total still to deliver — enrollments left, sites left to open. */
  total: number;
  /** Already delivered, subtracted from `total` before the rate is solved. */
  remaining?: number;
  start: Date | string;
  target: string;
  onTargetChange: (date: string) => void;
  /** The fastest rate believed achievable. Above it, the readout turns `error`. */
  maxRate?: number;
  unit?: string;
  className?: string;
}) {
  const { color } = useTheme();
  const startDate = toDate(start);
  const targetDate = target ? toDate(target) : null;
  const need = remaining !== undefined ? remaining : total;
  const months = targetDate ? Math.max(daysBetween(startDate, targetDate) / 30.4, 1 / 30.4) : null;
  const rate = months ? need / months : null;
  const infeasible = rate !== null && maxRate !== undefined && rate > maxRate;
  const past = targetDate !== null && targetDate.getTime() <= startDate.getTime();
  const tone: Tone = infeasible || past ? "error" : "brand";

  return (
    <div className={cx("cx-card p-3.5 flex flex-wrap items-end gap-4", className)}>
      <Field label="Target date" hint={`From ${fmtDay(startDate)}`}>
        <DateInput
          small
          value={target}
          min={startDate.toISOString().slice(0, 10)}
          onChange={(e) => onTargetChange(e.target.value)}
        />
      </Field>
      <div className="min-w-[220px]">
        <div className="cx-label mb-1">Requires</div>
        {past ? (
          <div className={cx("text-[13px] font-semibold", toneClass("error", "text"))}>Target date is not after the start date.</div>
        ) : rate === null ? (
          <div className="text-[13px] text-muted">Pick a target date.</div>
        ) : (
          <div className={cx("text-[15px] font-bold cx-num", toneClass(tone, "text"))}>
            {rate < 10 ? rate.toFixed(1) : Math.round(rate)} {unit} from {fmtDay(startDate)}
          </div>
        )}
        {infeasible && (
          <div className="text-[11px] text-error mt-0.5">Above the fastest rate believed achievable ({maxRate} {unit}).</div>
        )}
      </div>
    </div>
  );
}
