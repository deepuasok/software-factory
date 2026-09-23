"use client";

import { useMemo, useState } from "react";
import {
  Card,
  DataTable,
  GeoFilterRail,
  Grid,
  PageHeader,
  WorldMap,
  type Column,
  type GeoFilterOption,
  type MapPoint,
  type Tone,
} from "../index";

/** One site on the map and in the table below it. Swap the fields; keep the shape. */
export type MapExplorerPageRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  value: number;
  tone: Tone;
};

const SAMPLE_ROWS: MapExplorerPageRow[] = [
  { id: "S-101", name: "Northgate General", city: "Chicago", country: "United States", region: "North America", value: 42, tone: "ok" },
  { id: "S-102", name: "Riverside Institute", city: "Madrid", country: "Spain", region: "Europe", value: 28, tone: "ok" },
  { id: "S-103", name: "Harbour Clinic", city: "Osaka", country: "Japan", region: "Asia Pacific", value: 9, tone: "error" },
  { id: "S-104", name: "Lakeside Partners", city: "Toronto", country: "Canada", region: "North America", value: 21, tone: "warn" },
  { id: "S-105", name: "Meridian Labs", city: "Berlin", country: "Germany", region: "Europe", value: 33, tone: "ok" },
  { id: "S-106", name: "Delta Research", city: "Sao Paulo", country: "Brazil", region: "Latin America", value: 15, tone: "warn" },
  { id: "S-107", name: "Crescent Health", city: "Sydney", country: "Australia", region: "Asia Pacific", value: 24, tone: "ok" },
  { id: "S-108", name: "Vantage Site", city: "Mumbai", country: "India", region: "Asia Pacific", value: 6, tone: "error" },
];

const REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America"];

/**
 * Filter a geography on the left, see it and scan it on the right.
 *
 * Start here for "which sites are where, and which ones need attention" — the
 * rail narrows both the map and the table together, and picking a table row
 * lights up its dot so a name and a place are never two separate lookups.
 * Not the place for a single number — that is a readout, not an explorer.
 *
 * `DataTable` (package A) has no hover event today, only `onRowClick`, so the
 * "hover a row, highlight its dot" behaviour this recipe was asked for is
 * click-to-highlight here instead. `hoveredKey`/`onHover` are still real,
 * controlled props — wire them to `useLinkedHighlight` (package D) or to a
 * future DataTable row-hover event without changing this component's API.
 */
export function MapExplorerPage({
  rows = SAMPLE_ROWS,
  hoveredKey,
  onHover,
}: {
  rows?: MapExplorerPageRow[];
  /** Row id to highlight on the map. Uncontrolled (hover-driven) if left out. */
  hoveredKey?: string | null;
  /** Fires on row hover so a page can wire this into shared highlight state. */
  onHover?: (id: string | null) => void;
}) {
  const [localHover, setLocalHover] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const hovered = hoveredKey !== undefined ? hoveredKey : localHover;

  function setHovered(id: string | null) {
    onHover?.(id);
    if (hoveredKey === undefined) setLocalHover(id);
  }

  const regionOptions: GeoFilterOption[] = useMemo(
    () =>
      REGIONS.map((r) => ({
        key: r,
        label: r,
        count: rows.filter((row) => row.region === r).length,
      })),
    [rows],
  );

  const filtered = useMemo(
    () => (selectedRegions.size === 0 ? rows : rows.filter((r) => selectedRegions.has(r.region))),
    [rows, selectedRegions],
  );

  const points: MapPoint[] = filtered.map((r) => ({
    id: r.id,
    city: r.city,
    country: r.country,
    label: r.name,
    valueLabel: `${r.value} sites`,
    tone: r.tone,
    value: r.value,
    active: hovered === null || hovered === r.id,
  }));

  const columns: Column<MapExplorerPageRow>[] = [
    { key: "name", header: "Site", render: (r) => r.name },
    { key: "city", header: "City", render: (r) => `${r.city}, ${r.country}` },
    { key: "region", header: "Region", render: (r) => r.region },
    { key: "value", header: "Value", align: "right", sortable: true, sortValue: (r) => r.value, render: (r) => <span className="cx-num">{r.value}</span> },
  ];

  function toggleRegion(key: string) {
    setSelectedRegions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Site map" subtitle={`${filtered.length} of ${rows.length} sites shown`} />
      <Grid cols={4}>
        <Card title="Filter" className="lg:col-span-1">
          <GeoFilterRail
            options={regionOptions}
            selected={selectedRegions}
            onToggle={toggleRegion}
            onClear={() => setSelectedRegions(new Set())}
          />
        </Card>
        <Card padded={false} className="lg:col-span-3" title="Sites by value">
          <div className="p-2">
            <WorldMap points={points} sizeKey="value" sizeRange={[4, 12]} height={320} />
          </div>
        </Card>
      </Grid>
      <Card padded={false} title="Sites — click a row to highlight it on the map">
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          isSelected={(r) => r.id === hovered}
          onRowClick={(r) => setHovered(hovered === r.id ? null : r.id)}
        />
      </Card>
    </div>
  );
}
