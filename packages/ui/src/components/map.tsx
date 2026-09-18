"use client";

import { useTheme } from "../theme";

import React, { useMemo, useRef, useState } from "react";
import { WORLD_LAND_PATH } from "../data/world-land";
import { MAP_H, MAP_W, jitter, project } from "../data/geo";
import { geocode, type Precision } from "../geocode";
import { countryCentroid } from "../data/country-centroids";
import { Button, Chip, cx } from "./primitives";
import { color, sequential, type Tone } from "../tokens";
import { toneHex } from "../tone";

export type MapPoint = {
  id: string;
  /** Either give a city+country and let the map geocode it… */
  city?: string;
  country?: string;
  /** …or give coordinates directly. */
  lat?: number;
  lon?: number;
  label?: string;
  /** A second line in the tooltip, e.g. "42 sites". Purely descriptive. */
  valueLabel?: string;
  /** Region or state, used when the city is unknown or missing. */
  region?: string;
  /** Filled dot when true, hollow when false. The in/out distinction. */
  active?: boolean;
  /**
   * Meaning, not decoration — the same six tones as everywhere else. A point
   * with no tone renders in brand navy, same as before.
   */
  tone?: Tone;
  /** Numeric magnitude read by `sizeKey` to drive dot radius. */
  value?: number;
};

type View = { x: number; y: number; k: number };

const MIN_K = 1;
const MAX_K = 8;

/** Clamp a view so it can never pan or zoom past the edge of the world. */
function clampView(v: View): View {
  const k = Math.max(MIN_K, Math.min(MAX_K, v.k));
  const w = MAP_W / k;
  const h = MAP_H / k;
  return {
    k,
    x: Math.max(0, Math.min(MAP_W - w, v.x)),
    y: Math.max(0, Math.min(MAP_H - h, v.y)),
  };
}

const GRATICULE_PATH = (() => {
  let d = "";
  for (const lon of [-120, -60, 0, 60, 120]) d += `M${project(0, lon).x.toFixed(1)} 0V${MAP_H}`;
  for (const lat of [60, 30, 0, -30]) d += `M0 ${project(lat, 0).y.toFixed(1)}H${MAP_W}`;
  return d;
})();

type Placed = MapPoint & { x: number; y: number; r: number; precision: Precision; matched: string };

type Tip = { point: MapPoint; left: number; top: number };

/**
 * The map. One map, everywhere.
 *
 * Land is a flat grey silhouette so the dots carry all the meaning — a
 * coloured basemap competes with the data and is never used here. Points that
 * land on the same city are nudged apart deterministically so nothing hides
 * behind anything else. Ctrl/cmd + scroll (or the corner buttons) zooms,
 * anchored under the cursor; drag pans once zoomed in; both are clamped so the
 * map never leaves the frame. Give `sizeKey`/`sizeRange` to size dots by a
 * numeric field, and `tone` on a point to colour it — never a raw hex.
 */
export function WorldMap({
  points,
  onPointClick,
  height = 300,
  className,
  sizeKey,
  sizeRange = [4, 4],
  graticule = false,
  showTooltip = true,
}: {
  points: MapPoint[];
  onPointClick?: (p: MapPoint) => void;
  height?: number;
  className?: string;
  /** Numeric field on the point to size dots by, e.g. `"value"`. */
  sizeKey?: "value";
  /** [min, max] pixel radius across the range of `sizeKey`. */
  sizeRange?: [number, number];
  /** Faint lat/lon reference lines. Off by default — most maps don't need them. */
  graticule?: boolean;
  showTooltip?: boolean;
}) {
  const { color } = useTheme();
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [tip, setTip] = useState<Tip | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);
  const movedRef = useRef(false);

  const maxValue = useMemo(
    () => (sizeKey ? Math.max(...points.map((p) => p.value ?? 0), 0.0001) : 0),
    [points, sizeKey],
  );

  const placed = useMemo<Placed[]>(() => {
    return points
      .map((p) => {
        // Never drop a row silently: a city we know, else its region, else
        // the country. Only a row with nothing recognisable stays off the map,
        // and it is counted in the caption.
        const g = geocode({ lat: p.lat, lon: p.lon, city: p.city, region: p.region, country: p.country });
        if (g.precision === "none") return null;
        const { x, y } = project(g.lat, g.lon);
        const j = jitter(p.id);
        const r = sizeKey
          ? sizeRange[0] + (Math.max(0, p.value ?? 0) / maxValue) * (sizeRange[1] - sizeRange[0])
          : sizeRange[1];
        return { ...p, x: x + j.dx, y: y + j.dy, r, precision: g.precision, matched: g.matched };
      })
      .filter(Boolean) as Placed[];
  }, [points, sizeKey, sizeRange, maxValue]);

  const unplaced = points.length - placed.length;
  const coarse = placed.filter((p) => p.precision === "region" || p.precision === "country").length;

  function zoom(factor: number, clientX?: number, clientY?: number) {
    setView((prev) => {
      const k1 = Math.max(MIN_K, Math.min(MAX_K, prev.k * factor));
      if (k1 === prev.k) return prev;
      const rect = wrapRef.current?.getBoundingClientRect();
      const fx = clientX !== undefined && rect ? (clientX - rect.left) / rect.width : 0.5;
      const fy = clientY !== undefined && rect ? (clientY - rect.top) / rect.height : 0.5;
      const cx0 = prev.x + (fx * MAP_W) / prev.k;
      const cy0 = prev.y + (fy * MAP_H) / prev.k;
      return clampView({ k: k1, x: cx0 - (fx * MAP_W) / k1, y: cy0 - (fy * MAP_H) / k1 });
    });
  }

  const viewBox = `${view.x.toFixed(1)} ${view.y.toFixed(1)} ${(MAP_W / view.k).toFixed(1)} ${(
    MAP_H / view.k
  ).toFixed(1)}`;
  // Keep dots and stroke widths roughly constant on screen as the view zooms in.
  const shrink = Math.sqrt(view.k);

  return (
    <div
      ref={wrapRef}
      className={cx("relative w-full bg-white border border-edge rounded-lg overflow-hidden select-none", className)}
      style={{ height, cursor: view.k > 1 ? "grab" : "default" }}
      onWheel={(e) => {
        // Plain scroll keeps scrolling the page; ctrl/cmd + scroll zooms the map.
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        zoom(e.deltaY < 0 ? 1.25 : 1 / 1.25, e.clientX, e.clientY);
      }}
      onPointerDown={(e) => {
        if (view.k === 1) return;
        dragRef.current = { px: e.clientX, py: e.clientY, vx: view.x, vy: view.y };
        movedRef.current = false;
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        const drag = dragRef.current;
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!drag || !rect) return;
        const dx = e.clientX - drag.px;
        const dy = e.clientY - drag.py;
        if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
        setView((prev) =>
          clampView({
            k: prev.k,
            x: drag.vx - (dx / rect.width) * (MAP_W / prev.k),
            y: drag.vy - (dy / rect.height) * (MAP_H / prev.k),
          }),
        );
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerLeave={() => {
        dragRef.current = null;
        setTip(null);
      }}
    >
      <svg viewBox={viewBox} width="100%" height="100%" role="img" aria-label="Locations">
        {graticule && <path d={GRATICULE_PATH} fill="none" stroke={color.edge} strokeWidth={0.5 / shrink} />}
        <path d={WORLD_LAND_PATH} fill={color.land} stroke={color.landEdge} strokeWidth={0.5 / shrink} />
        {placed.map((p) => (
          <g
            key={p.id}
            onClick={() => {
              if (movedRef.current) {
                movedRef.current = false;
                return;
              }
              onPointClick?.(p);
            }}
            onPointerEnter={(e) => {
              if (!showTooltip || dragRef.current) return;
              const rect = wrapRef.current?.getBoundingClientRect();
              const dot = (e.target as SVGCircleElement).getBoundingClientRect();
              if (!rect) return;
              setTip({ point: p, left: dot.left + dot.width / 2 - rect.left, top: dot.top - rect.top });
            }}
            onPointerLeave={() => setTip(null)}
            style={{ cursor: onPointClick ? "pointer" : "default" }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r / shrink}
              fill={p.active === false ? color.white : p.tone ? toneHex(p.tone, color) : color.primary}
              fillOpacity={p.precision === "country" ? 0.45 : 1}
              strokeDasharray={p.precision === "region" || p.precision === "country" ? `${2 / shrink} ${2 / shrink}` : undefined}
              stroke={p.active === false ? color.borderIdle : color.secondary}
              strokeWidth={1.4 / shrink}
            />
          </g>
        ))}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full mb-1 bg-secondary text-white text-[10px] leading-snug rounded px-2 py-1.5 shadow-lg whitespace-nowrap"
          style={{ left: tip.left, top: tip.top - 6 }}
        >
          <strong className="block text-[11px]">
            {tip.point.label ?? `${tip.point.city ?? ""}${tip.point.country ? ", " + tip.point.country : ""}`}
          </strong>
          {tip.point.valueLabel && <span className="cx-num opacity-80">{tip.point.valueLabel}</span>}
          {(tip.point as Placed).precision !== "city" && (tip.point as Placed).precision !== "exact" && (
            <span className="block opacity-70">placed at {(tip.point as Placed).precision} level: {(tip.point as Placed).matched}</span>
          )}
        </div>
      )}

      {(coarse > 0 || unplaced > 0) && (
        <div className="absolute bottom-2 left-2 text-[10px] text-muted bg-white/90 rounded px-1.5 py-0.5">
          {coarse > 0 && `${coarse} placed at region or country level (dashed)`}
          {coarse > 0 && unplaced > 0 && " · "}
          {unplaced > 0 && `${unplaced} could not be placed`}
        </div>
      )}

      {view.k > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 right-2 bg-white/90"
          onClick={() => setView({ x: 0, y: 0, k: 1 })}
        >
          Reset view
        </Button>
      )}
    </div>
  );
}

/* Choropleth ------------------------------------------------------------ */

export type ChoroplethPoint = {
  /** Common English country name — see `data/country-centroids.ts`. */
  country: string;
  value: number;
  valueLabel?: string;
};

/** Bucket a value into one of six steps of `sequential`, low to high. */
function sequentialColor(value: number, max: number): string {
  if (max <= 0) return sequential[0];
  const t = Math.max(0, Math.min(1, value / max));
  const idx = Math.min(sequential.length - 1, Math.floor(t * sequential.length));
  return sequential[idx];
}

/**
 * Magnitude by country, on the world map.
 *
 * This is not a true choropleth: the parts bin has a land silhouette, not
 * country polygons, so there is nothing to fill in. Every country instead
 * gets a circle at its centroid (`data/country-centroids.ts`, the ~60 most
 * common countries), coloured on the `sequential` ramp and sized by value.
 * Reach for `WorldMap` with `sizeKey` if the truth is city- or site-level —
 * use this only when the data really is one number per country.
 */
export function Choropleth({
  data,
  height = 300,
  className,
}: {
  data: ChoroplethPoint[];
  height?: number;
  className?: string;
}) {
  const { color } = useTheme();
  const [tip, setTip] = useState<{ d: ChoroplethPoint; left: number; top: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const max = useMemo(() => Math.max(...data.map((d) => d.value), 0.0001), [data]);

  const placed = useMemo(
    () =>
      data
        .map((d) => {
          const hit = countryCentroid(d.country);
          if (!hit) return null;
          const { x, y } = project(hit[0], hit[1]);
          const r = 5 + (d.value / max) * 15;
          return { ...d, x, y, r, fill: sequentialColor(d.value, max) };
        })
        .filter(Boolean) as (ChoroplethPoint & { x: number; y: number; r: number; fill: string })[],
    [data, max],
  );

  return (
    <div
      ref={wrapRef}
      className={cx("relative w-full bg-white border border-edge rounded-lg overflow-hidden", className)}
      style={{ height }}
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" height="100%" role="img" aria-label="Magnitude by country">
        <path d={WORLD_LAND_PATH} fill={color.land} stroke={color.landEdge} strokeWidth={0.5} />
        {placed.map((d) => (
          <circle
            key={d.country}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.fill}
            fillOpacity={0.85}
            stroke={color.white}
            strokeWidth={1}
            onPointerEnter={(e) => {
              const rect = wrapRef.current?.getBoundingClientRect();
              const dot = (e.target as SVGCircleElement).getBoundingClientRect();
              if (!rect) return;
              setTip({ d, left: dot.left + dot.width / 2 - rect.left, top: dot.top - rect.top });
            }}
            onPointerLeave={() => setTip(null)}
          />
        ))}
      </svg>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full mb-1 bg-secondary text-white text-[10px] leading-snug rounded px-2 py-1.5 shadow-lg whitespace-nowrap"
          style={{ left: tip.left, top: tip.top - 6 }}
        >
          <strong className="block text-[11px]">{tip.d.country}</strong>
          <span className="cx-num opacity-80">{tip.d.valueLabel ?? tip.d.value}</span>
        </div>
      )}
    </div>
  );
}

/* GeoFilterRail ----------------------------------------------------------- */

export type GeoFilterOption = {
  key: string;
  label: string;
  count: number;
};

/**
 * A rail of region or country chips with counts, for narrowing a map or a
 * table by geography. Controlled, like every other filter in the system —
 * the caller owns `selected` and gets a key back on toggle.
 */
export function GeoFilterRail({
  title = "Region",
  options,
  selected,
  onToggle,
  onClear,
  className,
}: {
  title?: string;
  options: GeoFilterOption[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  onClear?: () => void;
  className?: string;
}) {
  const { color } = useTheme();
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="cx-label">{title}</div>
        {selected.size > 0 && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1.5 items-start">
        {options.length === 0 && <div className="text-[12px] text-muted">Nothing to filter by yet.</div>}
        {options.map((o) => (
          <Chip key={o.key} on={selected.has(o.key)} onToggle={() => onToggle(o.key)} count={o.count} className="w-full justify-between">
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
