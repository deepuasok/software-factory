"use client";

import React from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { series as SERIES, color } from "../tokens";
import { cx } from "./primitives";

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

const AXIS = { fontSize: 10, fill: color.muted, fontFamily: "Roboto, sans-serif" };

function ChartTooltip({ active, payload, label, valueFormat }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-edge rounded-md shadow-raised px-3 py-2">
      <div className="text-[11px] font-semibold text-secondary mb-1">{label}</div>
      {payload.map((p: any) => (
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

/** Change over time. The default chart for anything with a date axis. */
export function TrendChart({
  data,
  xKey,
  series: specs,
  height = 260,
  yTarget,
  yTargetLabel,
  markers = [],
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
  /** Vertical dated markers: a committed date, a go-live, a cutoff. */
  markers?: MarkerSpec[];
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const tone = { warn: color.warn, error: color.error, muted: color.muted };
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
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={valueFormat ? 54 : 44} tickFormatter={valueFormat as any} />
          <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} cursor={{ stroke: color.borderIdle, strokeDasharray: "3 3" }} />
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
          {specs.map((s, i) =>
            s.area ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color ?? SERIES[i % SERIES.length]}
                strokeWidth={2}
                fill={`url(#cxfill-${s.key})`}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color ?? SERIES[i % SERIES.length]}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {specs.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted mt-2 pl-11">
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
