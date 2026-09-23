"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter as RScatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { series as SERIES, sequential, color, type Tone } from "../tokens";
import { toneHex } from "../tone";
import { cx } from "./primitives";
import { useTheme } from "../theme";
import { DataTable, DeltaValue, type Column } from "./data";

/**
 * Chart wrappers.
 *
 * Apps never call Recharts directly — they call these. That is what keeps the
 * grid weight, the axis colour, the tooltip and the series order identical in
 * every app the shop ships.
 *
 * House rules baked in here, from the dataviz method:
 *  - Series colours come from the validated categorical order, never cycled.
 *  - One y-axis. There is no dual-axis option, on purpose.
 *  - Lines are 2px, dots appear on hover at 8px, grid and axes stay recessive.
 *  - Two or more series always get a legend.
 */

const axisStyle = (c: { muted: string }) => ({ fontSize: 10, fill: c.muted, fontFamily: "Roboto, sans-serif" });

function ChartTooltip({ active, payload, label, valueFormat, sortByValue }: any) {
  const { color } = useTheme();
  if (!active || !payload?.length) return null;
  const items = sortByValue ? [...payload].sort((a: any, b: any) => b.value - a.value) : payload;
  return (
    <div className="bg-white border border-edge rounded-md shadow-raised px-3 py-2">
      <div className="text-[11px] font-semibold text-secondary mb-1">{label}</div>
      {items.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[11px] text-muted">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="cx-num font-semibold text-secondary">
            {valueFormat ? valueFormat(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export type SeriesSpec = {
  key: string;
  label: string;
  /** Leave unset to take the next validated colour in order. */
  color?: string;
  /** Draw the area under the line. Only sensible with one series. */
  area?: boolean;
  dashed?: boolean;
};

export type MarkerSpec = {
  /** x value on the category axis where the line is drawn. */
  x: string | number;
  label: string;
  tone?: "warn" | "error" | "muted";
};

/** A single labelled point pinned to the line — a decision date, an outlier. */
export type ReferenceDotSpec = { x: string | number; y: number; label?: string };

/** A shaded span on the x-axis — a freeze window, a forecast range. */
export type ReferenceAreaSpec = { x1: string | number; x2: string | number; label?: string; tone?: Tone };

/**
 * A shared "which one is hovered" between a table and a chart.
 *
 * `bind(key)` returns the mouse handlers for the row or mark with that key;
 * `hovered` is the key to pass as `highlightKey` to TrendChart / RankedBars on
 * the other side of the pairing.
 */
export function useLinkedHighlight() {
  const [hovered, setHovered] = useState<string | null>(null);
  const bind = useCallback(
    (key: string) => ({
      onMouseEnter: () => setHovered(key),
      onMouseLeave: () => setHovered((h) => (h === key ? null : h)),
    }),
    [],
  );
  return { hovered, bind };
}

/** Change over time. The default chart for anything with a date axis. */
export function TrendChart({
  data,
  xKey,
  series: specs,
  height = 260,
  yTarget,
  yTargetLabel,
  yDomain,
  markers = [],
  referenceDots = [],
  referenceAreas = [],
  brush = false,
  seriesToggle = false,
  highlightKey,
  onHover,
  valueFormat,
  className,
}: {
  data: any[];
  xKey: string;
  series: SeriesSpec[];
  height?: number;
  /** A horizontal goal line — the number the plan is judged against. */
  yTarget?: number;
  yTargetLabel?: string;
  /** Force the y-axis range — use to keep a row of SmallMultiples comparable. */
  yDomain?: [number, number];
  /** Vertical dated markers: a committed date, a go-live, a cutoff. */
  markers?: MarkerSpec[];
  /** Labelled points, drawn on top of the line — an outlier, a decision. */
  referenceDots?: ReferenceDotSpec[];
  /** Shaded x-axis spans — a freeze window, the forecast horizon. */
  referenceAreas?: ReferenceAreaSpec[];
  /** Adds a Recharts range brush under the chart for scrubbing a long series. */
  brush?: boolean;
  /** Makes the legend clickable: click a series to hide/show its line. */
  seriesToggle?: boolean;
  /** The key of the series to emphasize; the rest dim. Pair with `onHover`. */
  highlightKey?: string;
  onHover?: (key: string | null) => void;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const tone = { warn: color.warn, error: color.error, muted: color.muted };
  const toggle = (key: string) => {
    if (!seriesToggle) return;
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 12, right: yTarget !== undefined ? 64 : 18, bottom: 4, left: 0 }}>
          <defs>
            {specs.map((s, i) => (
              <linearGradient key={s.key} id={`cxfill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color ?? SERIES[i % SERIES.length]} stopOpacity={0.18} />
                <stop offset="100%" stopColor={s.color ?? SERIES[i % SERIES.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={color.edge} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: color.edge }} minTickGap={28} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={valueFormat ? 54 : 44}
            tickFormatter={valueFormat as any}
            domain={yDomain ?? ["auto", "auto"]}
          />
          <Tooltip
            content={<ChartTooltip valueFormat={valueFormat} sortByValue />}
            cursor={{ stroke: color.borderIdle, strokeDasharray: "3 3" }}
          />
          {referenceAreas.map((a, i) => (
            <ReferenceArea
              key={i}
              x1={a.x1}
              x2={a.x2}
              fill={toneHex(a.tone ?? "info", color)}
              fillOpacity={0.1}
              label={a.label ? { value: a.label, position: "insideTop", fill: toneHex(a.tone ?? "info", color), fontSize: 10 } : undefined}
            />
          ))}
          {yTarget !== undefined && (
            <ReferenceLine
              y={yTarget}
              stroke={color.error}
              strokeDasharray="4 4"
              label={{ value: yTargetLabel ?? `target ${yTarget}`, position: "right", fill: color.error, fontSize: 10 }}
            />
          )}
          {markers.map((m) => (
            <ReferenceLine
              key={m.label}
              x={m.x}
              stroke={tone[m.tone ?? "warn"]}
              strokeDasharray="3 4"
              label={{ value: m.label, position: "top", fill: tone[m.tone ?? "warn"], fontSize: 10 }}
            />
          ))}
          {referenceDots.map((d, i) => (
            <ReferenceDot
              key={i}
              x={d.x}
              y={d.y}
              r={4}
              fill={color.white}
              stroke={color.primary}
              strokeWidth={2}
              label={d.label ? { value: d.label, position: "top", fill: color.secondary, fontSize: 10 } : undefined}
            />
          ))}
          {specs.map((s, i) => {
            if (hidden.has(s.key)) return null;
            const dimmed = !!highlightKey && highlightKey !== s.key;
            const strokeOpacity = dimmed ? 0.25 : 1;
            return s.area ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color ?? SERIES[i % SERIES.length]}
                strokeWidth={2}
                strokeOpacity={strokeOpacity}
                fill={`url(#cxfill-${s.key})`}
                fillOpacity={dimmed ? 0.4 : 1}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: color.white }}
                onMouseEnter={() => onHover?.(s.key)}
                onMouseLeave={() => onHover?.(null)}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color ?? SERIES[i % SERIES.length]}
                strokeWidth={2}
                strokeOpacity={strokeOpacity}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: color.white }}
                onMouseEnter={() => onHover?.(s.key)}
                onMouseLeave={() => onHover?.(null)}
              />
            );
          })}
          {brush && <Brush dataKey={xKey} height={20} stroke={color.borderIdle} travellerWidth={8} />}
        </ComposedChart>
      </ResponsiveContainer>
      {specs.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted mt-2 pl-11">
          {specs.map((s, i) => {
            const isHidden = hidden.has(s.key);
            const isDimmed = !!highlightKey && highlightKey !== s.key;
            return (
              <span
                key={s.key}
                className={cx(
                  "inline-flex items-center gap-1.5",
                  seriesToggle && "cursor-pointer select-none",
                  isHidden && "opacity-40",
                  isDimmed && "opacity-50",
                )}
                onClick={() => toggle(s.key)}
                onMouseEnter={() => onHover?.(s.key)}
                onMouseLeave={() => onHover?.(null)}
              >
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color ?? SERIES[i % SERIES.length] }} />
                {s.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Magnitude across categories. Horizontal when the labels are names. */
export function CategoryBars({
  data,
  xKey,
  series: specs,
  height = 240,
  horizontal = false,
  valueFormat,
  className,
}: {
  data: any[];
  xKey: string;
  series: SeriesSpec[];
  height?: number;
  horizontal?: boolean;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 18, bottom: 4, left: horizontal ? 8 : 0 }}
          barGap={2}
        >
          <CartesianGrid stroke={color.edge} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={valueFormat as any} />
              <YAxis type="category" dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} width={110} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: color.edge }} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={valueFormat ? 54 : 44} tickFormatter={valueFormat as any} />
            </>
          )}
          <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} cursor={{ fill: "rgba(27,57,117,.05)" }} />
          {specs.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color ?? SERIES[i % SERIES.length]}
              isAnimationActive={false}
              radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              maxBarSize={horizontal ? 18 : 42}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {specs.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted mt-2">
          {specs.map((s, i) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color ?? SERIES[i % SERIES.length] }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** A tiny inline trend for a table cell. No axes, no tooltip, no legend. */
export function Sparkline({
  values,
  width = 70,
  height = 20,
  tone = SERIES[0],
}: {
  values: number[];
  width?: number;
  height?: number;
  tone?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 2) + 1;
      const y = height - 1 - ((v - min) / span) * (height - 2);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
  return (
    <svg width={width} height={height} className="inline-block align-middle" aria-hidden>
      <path d={d} fill="none" stroke={tone} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** A milestone rail under a chart: evenly spaced dated dots. */
export function MilestoneRail({
  items,
  className,
}: {
  items: { label: string; date: string }[];
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  return (
    <div className={cx("relative flex items-start justify-between pt-3", className)}>
      <div className="absolute left-0 right-0 top-[15px] h-[3px] rounded-full bg-selected" />
      {items.map((m) => (
        <div key={m.label} className="relative flex flex-col items-center gap-1 flex-1">
          <span className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm z-10" />
          <span className="text-[10px] font-semibold text-secondary">{m.label}</span>
          <span className="text-[10px] text-muted">{m.date}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Composition: parts of a whole, one bar per category. Horizontal by default
 * because the labels are usually names, not dates. Never a pie or a donut —
 * see docs/CONTRACTS.md §5.
 */
export function StackedBars({
  data,
  xKey,
  series: specs,
  horizontal = true,
  height = 260,
  valueFormat,
  className,
}: {
  data: any[];
  xKey: string;
  series: SeriesSpec[];
  /** Vertical stacks (dates on the x-axis) when false. */
  horizontal?: boolean;
  height?: number;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 18, bottom: 4, left: horizontal ? 8 : 0 }}
        >
          <CartesianGrid stroke={color.edge} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={valueFormat as any} />
              <YAxis type="category" dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} width={110} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: color.edge }} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={valueFormat ? 54 : 44} tickFormatter={valueFormat as any} />
            </>
          )}
          <Tooltip content={<ChartTooltip valueFormat={valueFormat} sortByValue />} cursor={{ fill: "rgba(27,57,117,.05)" }} />
          {specs.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="stack"
              fill={s.color ?? SERIES[i % SERIES.length]}
              stroke={color.white}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted mt-2">
        {specs.map((s, i) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color ?? SERIES[i % SERIES.length] }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A distribution of raw numbers, bucketed into even-width bins. One hue. */
export function Histogram({
  values,
  bins = 10,
  height = 220,
  label = "Count",
  valueFormat,
  className,
}: {
  values: number[];
  bins?: number;
  height?: number;
  /** What the y-axis / tooltip calls the count. */
  label?: string;
  /** Formats a bin's boundary value. Defaults to one decimal place. */
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const fmt = valueFormat ?? ((v: number) => v.toFixed(1));
  const data = useMemo(() => {
    if (!values.length) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = (max - min || 1) / bins;
    const counts = Array.from({ length: bins }, () => 0);
    values.forEach((v) => {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - min) / width)));
      counts[idx]++;
    });
    return counts.map((count, i) => ({
      bucket: `${fmt(min + i * width)}–${fmt(min + (i + 1) * width)}`,
      count,
    }));
  }, [values, bins]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 18, bottom: 24, left: 0 }} barCategoryGap={2}>
          <CartesianGrid stroke={color.edge} vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={{ ...AXIS, fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: color.edge }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={46}
          />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(27,57,117,.05)" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-edge rounded-md shadow-raised px-3 py-2">
                  <div className="text-[11px] font-semibold text-secondary mb-1">{payload[0].payload.bucket}</div>
                  <div className="text-[11px] text-muted">
                    {label} <span className="cx-num font-semibold text-secondary">{payload[0].value}</span>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" name={label} fill={SERIES[0]} isAnimationActive={false} radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type ScatterPoint = { key: string; x: number; y: number; size?: number; label?: string };

/**
 * Two numeric measures against each other, optionally sized by a third. Use
 * `highlightKey` to pick one point out of a cloud — the rest mute.
 */
export function Scatter({
  data,
  xLabel,
  yLabel,
  height = 280,
  valueFormat,
  highlightKey,
  onHover,
  className,
}: {
  data: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  height?: number;
  valueFormat?: (v: number) => string;
  /** The key of the point to emphasize in brand; the rest mute. */
  highlightKey?: string;
  onHover?: (key: string | null) => void;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const hasSize = data.some((d) => d.size !== undefined);
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 12, right: 18, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={color.edge} />
          <XAxis type="number" dataKey="x" name={xLabel} tick={AXIS} tickLine={false} axisLine={{ stroke: color.edge }} tickFormatter={valueFormat as any} />
          <YAxis type="number" dataKey="y" name={yLabel} tick={AXIS} tickLine={false} axisLine={false} width={44} tickFormatter={valueFormat as any} />
          {hasSize && <ZAxis type="number" dataKey="size" range={[40, 400]} />}
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: color.borderIdle }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as ScatterPoint;
              return (
                <div className="bg-white border border-edge rounded-md shadow-raised px-3 py-2">
                  <div className="text-[11px] font-semibold text-secondary mb-1">{p.label ?? p.key}</div>
                  <div className="text-[11px] text-muted">
                    {xLabel} <span className="cx-num font-semibold text-secondary">{fmt(p.x)}</span>
                  </div>
                  <div className="text-[11px] text-muted">
                    {yLabel} <span className="cx-num font-semibold text-secondary">{fmt(p.y)}</span>
                  </div>
                </div>
              );
            }}
          />
          <RScatter
            data={data}
            isAnimationActive={false}
            onMouseEnter={(p: any) => onHover?.(p.key)}
            onMouseLeave={() => onHover?.(null)}
          >
            {data.map((d) => {
              const on = !highlightKey || d.key === highlightKey;
              return <Cell key={d.key} fill={on ? toneHex("brand", color) : toneHex("neutral", color)} fillOpacity={on ? 0.85 : 0.35} />;
            })}
          </RScatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export type HeatmapCell = { row: string; column: string; value: number };

/** A rows-by-columns grid of magnitude. Never a rainbow — one sequential hue. */
export function Heatmap({
  rows,
  columns,
  data,
  valueFormat,
  className,
}: {
  rows: string[];
  columns: string[];
  data: HeatmapCell[];
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const [hover, setHover] = useState<string | null>(null);
  const { lookup, min, max } = useMemo(() => {
    const lookup = new Map(data.map((d) => [`${d.row}|${d.column}`, d.value]));
    const values = data.map((d) => d.value);
    return { lookup, min: Math.min(...values, 0), max: Math.max(...values, 1) };
  }, [data]);
  const span = max - min || 1;

  return (
    <div className={cx("overflow-x-auto", className)}>
      <div
        className="inline-grid gap-[2px]"
        style={{ gridTemplateColumns: `120px repeat(${columns.length}, minmax(52px,1fr))` }}
      >
        <div />
        {columns.map((c) => (
          <div key={c} className="text-[10px] text-muted text-center px-1 pb-1 truncate" title={c}>
            {c}
          </div>
        ))}
        {rows.map((r) => (
          <React.Fragment key={r}>
            <div className="text-[11px] text-muted pr-2 flex items-center justify-end truncate" title={r}>
              {r}
            </div>
            {columns.map((c) => {
              const key = `${r}|${c}`;
              const v = lookup.get(key);
              const t = v === undefined ? 0 : (v - min) / span;
              const step = Math.min(sequential.length - 1, Math.max(0, Math.floor(t * sequential.length)));
              return (
                <div
                  key={c}
                  className={cx(
                    "relative h-7 rounded-sm flex items-center justify-center cx-num text-[10px] font-medium",
                    v !== undefined && (step >= 3 ? "text-white" : "text-secondary"),
                  )}
                  style={{ background: v === undefined ? color.surfaceGrey : sequential[step] }}
                  onMouseEnter={() => setHover(key)}
                  onMouseLeave={() => setHover((h) => (h === key ? null : h))}
                  title={v === undefined ? `${r} · ${c}: no data` : `${r} · ${c}: ${fmt(v)}`}
                >
                  {hover === key && v !== undefined ? fmt(v) : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export type WaterfallStep = { label: string; value: number };
type WaterfallRow = { label: string; base: number; value: number; tone: "neutral" | "ok" | "error"; total: number; delta?: number };

/** A start, a sequence of ups and downs, and where they land. A bridge, not a bar chart. */
export function Waterfall({
  start,
  startLabel = "Start",
  steps,
  endLabel = "End",
  height = 260,
  valueFormat,
  className,
}: {
  start: number;
  startLabel?: string;
  steps: WaterfallStep[];
  endLabel?: string;
  height?: number;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const rows = useMemo<WaterfallRow[]>(() => {
    let running = start;
    const mid: WaterfallRow[] = steps.map((s) => {
      const from = running;
      running += s.value;
      return {
        label: s.label,
        base: Math.min(from, running),
        value: Math.abs(s.value),
        tone: s.value >= 0 ? "ok" : "error",
        total: running,
        delta: s.value,
      };
    });
    return [
      { label: startLabel, base: 0, value: start, tone: "neutral", total: start },
      ...mid,
      { label: endLabel, base: 0, value: running, tone: "neutral", total: running },
    ];
  }, [start, steps, startLabel, endLabel]);

  const fill = { neutral: color.muted, ok: color.ok, error: color.error };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} margin={{ top: 22, right: 18, bottom: 4, left: 0 }} barGap={2}>
          <CartesianGrid stroke={color.edge} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: color.edge }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={valueFormat ? 54 : 44} tickFormatter={fmt as any} />
          <Tooltip
            cursor={{ fill: "rgba(27,57,117,.05)" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const r = payload[0]?.payload as WaterfallRow | undefined;
              if (!r) return null;
              return (
                <div className="bg-white border border-edge rounded-md shadow-raised px-3 py-2">
                  <div className="text-[11px] font-semibold text-secondary mb-1">{r.label}</div>
                  <div className="text-[11px] text-muted">
                    Running total <span className="cx-num font-semibold text-secondary">{fmt(r.total)}</span>
                  </div>
                  {r.delta !== undefined && (
                    <div className="text-[11px] text-muted">
                      Change{" "}
                      <span className="cx-num font-semibold" style={{ color: r.delta >= 0 ? color.ok : color.error }}>
                        {r.delta >= 0 ? "+" : ""}
                        {fmt(r.delta)}
                      </span>
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="w" isAnimationActive={false} radius={[3, 3, 3, 3]} maxBarSize={48}>
            {rows.map((r, i) => (
              <Cell key={i} fill={fill[r.tone]} />
            ))}
            <LabelList
              dataKey="total"
              position="top"
              formatter={fmt as any}
              style={{ fontSize: 10, fill: color.muted, fontFamily: "Roboto, sans-serif" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type FunnelStage = { label: string; value: number };

/**
 * Stages that shrink in one direction, with the conversion rate between each.
 * Built as bars, not the Recharts Funnel primitive, so the conversion labels
 * sit exactly between stages.
 */
export function Funnel({
  stages,
  valueFormat,
  className,
}: {
  stages: FunnelStage[];
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const max = stages[0]?.value || 1;
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {stages.map((s, i) => {
        const width = Math.max(4, (s.value / max) * 100);
        const prev = i > 0 ? stages[i - 1].value : null;
        const conv = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <div key={s.label}>
            {conv !== null && <div className="text-[10px] text-muted text-center mb-1.5 cx-num">↓ {conv}% conversion</div>}
            <div className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-[11px] text-muted text-right truncate" title={s.label}>
                {s.label}
              </div>
              <div className="flex-1 h-6 rounded bg-surface-grey overflow-hidden">
                <div className="h-full rounded bg-primary flex items-center justify-end pr-2" style={{ width: `${width}%` }}>
                  <span className="cx-num text-[11px] font-semibold text-white">{fmt(s.value)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type SmallMultiplePanel = { title: string; data: any[] };

/** A grid of small TrendCharts sharing one y-axis, so heights compare fairly. */
export function SmallMultiples({
  panels,
  xKey,
  series: specs,
  cols = 3,
  height = 140,
  valueFormat,
  className,
}: {
  panels: SmallMultiplePanel[];
  xKey: string;
  series: SeriesSpec[];
  cols?: 2 | 3 | 4;
  height?: number;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const domain = useMemo<[number, number]>(() => {
    const all: number[] = [];
    panels.forEach((p) =>
      p.data.forEach((row) => specs.forEach((s) => typeof row[s.key] === "number" && all.push(row[s.key]))),
    );
    return [Math.min(...all, 0), Math.max(...all, 1)];
  }, [panels, specs]);
  const at = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];

  return (
    <div className={cx("grid grid-cols-1 gap-3", at, className)}>
      {panels.map((p) => (
        <div key={p.title} className="cx-card p-3">
          <div className="cx-label mb-1">{p.title}</div>
          <TrendChart data={p.data} xKey={xKey} series={specs} height={height} valueFormat={valueFormat} yDomain={domain} />
        </div>
      ))}
    </div>
  );
}

export type RankedBarDatum = { key: string; label: string; value: number };

/**
 * Horizontal bars sorted highest first, with one entity picked out in brand
 * and the rest in neutral grey. Use for "how does this one compare to the
 * field" — not for plain magnitude, which is `CategoryBars`.
 */
export function RankedBars({
  data,
  highlightKey,
  onHover,
  height,
  valueFormat,
  className,
}: {
  data: RankedBarDatum[];
  /** Defaults to the top-ranked entity — this part exists to emphasize one. */
  highlightKey?: string;
  onHover?: (key: string | null) => void;
  height?: number;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const sorted = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  const activeKey = highlightKey ?? sorted[0]?.key;
  const max = Math.max(...sorted.map((d) => d.value), 1);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const h = height ?? Math.max(120, sorted.length * 28);

  return (
    <div className={cx("flex flex-col gap-1.5", className)} style={{ minHeight: h }}>
      {sorted.map((d) => {
        const on = d.key === activeKey;
        return (
          <div
            key={d.key}
            className="flex items-center gap-2"
            onMouseEnter={() => onHover?.(d.key)}
            onMouseLeave={() => onHover?.(null)}
          >
            <div className="w-28 shrink-0 text-[11px] text-muted truncate text-right" title={d.label}>
              {d.label}
            </div>
            <div className="flex-1 h-5 rounded bg-surface-grey overflow-hidden">
              <div
                className="h-full rounded flex items-center justify-end pr-1.5"
                style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: on ? toneHex("brand", color) : toneHex("neutral", color) }}
              >
                <span className="cx-num text-[10px] font-semibold text-white">{fmt(d.value)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type DivergingBarDatum = { label: string; value: number };

/** Values above and below a baseline, split into ok / error tones around a centred zero line. */
export function DivergingBars({
  data,
  baseline = 0,
  higherIsBetter = true,
  height = 260,
  valueFormat,
  className,
}: {
  data: DivergingBarDatum[];
  /** The line values are measured against. Defaults to zero. */
  baseline?: number;
  /** Set false when below-baseline is the good direction (cost, days late). */
  higherIsBetter?: boolean;
  height?: number;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const rows = useMemo(() => data.map((d) => ({ ...d, delta: d.value - baseline })), [data, baseline]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 32, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={color.edge} vertical horizontal={false} />
          <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={valueFormat as any} />
          <YAxis type="category" dataKey="label" tick={AXIS} tickLine={false} axisLine={false} width={110} />
          <ReferenceLine x={0} stroke={color.secondary} />
          <Tooltip
            cursor={{ fill: "rgba(27,57,117,.05)" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload;
              const good = r.delta >= 0 === higherIsBetter;
              return (
                <div className="bg-white border border-edge rounded-md shadow-raised px-3 py-2">
                  <div className="text-[11px] font-semibold text-secondary mb-1">{r.label}</div>
                  <div className="text-[11px] text-muted">
                    vs baseline{" "}
                    <span className="cx-num font-semibold" style={{ color: good ? color.ok : color.error }}>
                      {r.delta >= 0 ? "+" : ""}
                      {fmt(r.delta)}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="delta" isAnimationActive={false} radius={[0, 3, 3, 0]} maxBarSize={18}>
            {rows.map((r, i) => (
              <Cell key={i} fill={r.delta >= 0 === higherIsBetter ? color.ok : color.error} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type ScenarioMetric = {
  key: string;
  label: string;
  /** Set false for metrics you want to go down: cost, backlog, days late. */
  higherIsBetter?: boolean;
  format?: (v: number) => string;
};

/**
 * A table for comparing scenarios metric by metric. Every non-baseline cell
 * carries its value plus a `DeltaValue` against the baseline column, toned by
 * whether that metric's direction of improvement is up or down.
 */
export function ScenarioCompare({
  metrics,
  scenarios,
  baseline,
  values,
  className,
}: {
  metrics: ScenarioMetric[];
  /** Column order, left to right. Include `baseline` in this list. */
  scenarios: string[];
  baseline: string;
  /** `values[scenario][metricKey]`. */
  values: Record<string, Record<string, number>>;
  className?: string;
}) {
  const { color } = useTheme();
  const AXIS = axisStyle(color);
  const columns: Column<ScenarioMetric>[] = [
    {
      key: "metric",
      header: "Metric",
      render: (m) => <span className="font-semibold text-secondary">{m.label}</span>,
    },
    ...scenarios.map(
      (s): Column<ScenarioMetric> => ({
        key: s,
        header: s,
        align: "right",
        render: (m) => {
          const format = m.format ?? ((n: number) => String(n));
          const v = values[s]?.[m.key];
          if (v === undefined) return <span className="text-muted">—</span>;
          if (s === baseline) return <span className="cx-num text-secondary">{format(v)}</span>;
          const b = values[baseline]?.[m.key];
          const delta = b === undefined ? 0 : v - b;
          return (
            <div className="flex items-center justify-end gap-2">
              <span className="cx-num text-secondary">{format(v)}</span>
              <DeltaValue
                value={delta}
                higherIsBetter={m.higherIsBetter ?? true}
                format={(d) => `${d > 0 ? "+" : d < 0 ? "-" : "±"}${format(Math.abs(d))}`}
              />
            </div>
          );
        },
      }),
    ),
  ];

  return (
    <DataTable
      columns={columns}
      rows={metrics}
      rowKey={(m) => m.key}
      empty="Add scenarios to compare their metrics."
      className={className}
    />
  );
}
