"use client";

import React from "react";
import { WORLD_LAND_PATH } from "../data/world-land";
import { MAP_H, MAP_W, geoLookup, jitter, project } from "../data/geo";
import { cx } from "./primitives";
import { color } from "../tokens";

export type MapPoint = {
  id: string;
  /** Either give a city+country and let the map geocode it… */
  city?: string;
  country?: string;
  /** …or give coordinates directly. */
  lat?: number;
  lon?: number;
  label?: string;
  /** Filled dot when true, hollow when false. The in/out distinction. */
  active?: boolean;
  tone?: string;
};

/**
 * The map. One map, everywhere.
 *
 * Land is a flat grey silhouette so the dots carry all the meaning — a
 * coloured basemap competes with the data and is never used here. Points that
 * land on the same city are nudged apart deterministically so nothing hides
 * behind anything else.
 */
export function WorldMap({
  points,
  onPointClick,
  height = 300,
  className,
}: {
  points: MapPoint[];
  onPointClick?: (p: MapPoint) => void;
  height?: number;
  className?: string;
}) {
  const placed = points
    .map((p) => {
      let lat = p.lat;
      let lon = p.lon;
      if (lat === undefined || lon === undefined) {
        const hit = p.city ? geoLookup(p.city, p.country ?? "") : null;
        if (!hit) return null;
        [lat, lon] = hit;
      }
      const { x, y } = project(lat, lon);
      const j = jitter(p.id);
      return { ...p, x: x + j.dx, y: y + j.dy };
    })
    .filter(Boolean) as (MapPoint & { x: number; y: number })[];

  return (
    <div className={cx("w-full", className)} style={{ height }}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" height="100%" role="img" aria-label="Locations">
        <path d={WORLD_LAND_PATH} fill="#E8EBF0" stroke="#D3D9E2" strokeWidth={0.5} />
        {placed.map((p) => (
          <g
            key={p.id}
            onClick={onPointClick ? () => onPointClick(p) : undefined}
            style={{ cursor: onPointClick ? "pointer" : "default" }}
          >
            <title>{p.label ?? `${p.city ?? ""}${p.country ? ", " + p.country : ""}`}</title>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill={p.active ? p.tone ?? color.primary : "#FFFFFF"}
              stroke={p.active ? color.secondary : color.borderIdle}
              strokeWidth={1.4}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
