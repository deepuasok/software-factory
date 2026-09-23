"use client";

import { useState } from "react";
import {
  Card,
  Choropleth,
  GeoFilterRail,
  Grid,
  WorldMap,
  type ChoroplethPoint,
  type GeoFilterOption,
  type MapPoint,
} from "@factory/ui";

/** One card: the part, its "use it when" caption, then a live sample. */
function Spec({
  name,
  when,
  children,
}: {
  name: string;
  when: string;
  children: React.ReactNode;
}) {
  return (
    <Card title={name}>
      <p className="text-[11.5px] text-muted mb-3.5 leading-relaxed">{when}</p>
      {children}
    </Card>
  );
}

const POINTS: MapPoint[] = [
  { id: "1", city: "Chicago", country: "United States", label: "Northgate General", valueLabel: "42 sites", tone: "ok", value: 42 },
  { id: "2", city: "Madrid", country: "Spain", label: "Riverside Institute", valueLabel: "28 sites", tone: "ok", value: 28 },
  { id: "3", city: "Osaka", country: "Japan", label: "Harbour Clinic", valueLabel: "9 sites", tone: "error", value: 9 },
  { id: "4", city: "Toronto", country: "Canada", label: "Lakeside Partners", valueLabel: "21 sites", tone: "warn", value: 21 },
  { id: "5", city: "Berlin", country: "Germany", label: "Meridian Labs", valueLabel: "33 sites", tone: "ok", value: 33 },
  { id: "6", city: "Sao Paulo", country: "Brazil", label: "Delta Research", valueLabel: "15 sites", tone: "warn", value: 15 },
  { id: "7", city: "Sydney", country: "Australia", label: "Crescent Health", valueLabel: "24 sites", tone: "ok", value: 24 },
  { id: "8", city: "Mumbai", country: "India", label: "Vantage Site", valueLabel: "6 sites", tone: "error", value: 6 },
  // The messy half of a real export. Every one of these still lands.
  { id: "9", city: "SÃO PAULO", label: "Upper-case, accented", valueLabel: "11 sites", tone: "ok", value: 11 },
  { id: "10", city: "Bostn", country: "USA", label: "Misspelt city", valueLabel: "8 sites", tone: "ok", value: 8 },
  { id: "11", city: "NYC", label: "Abbreviation", valueLabel: "19 sites", tone: "ok", value: 19 },
  { id: "12", city: "Bavaria", country: "DE", label: "A region, not a city", valueLabel: "5 sites", tone: "warn", value: 5 },
  { id: "13", city: "Nowheresville", country: "Korea, Republic of", label: "Unknown town, known country", valueLabel: "3 sites", tone: "warn", value: 3 },
  { id: "14", city: "", country: "", label: "Nothing at all", valueLabel: "2 sites", tone: "error", value: 2 },
];

const CHOROPLETH_DATA: ChoroplethPoint[] = [
  { country: "United States", value: 84, valueLabel: "84 sites" },
  { country: "Germany", value: 33, valueLabel: "33 sites" },
  { country: "Spain", value: 28, valueLabel: "28 sites" },
  { country: "Canada", value: 21, valueLabel: "21 sites" },
  { country: "Australia", value: 24, valueLabel: "24 sites" },
  { country: "Brazil", value: 15, valueLabel: "15 sites" },
  { country: "Japan", value: 9, valueLabel: "9 sites" },
  { country: "India", value: 6, valueLabel: "6 sites" },
  { country: "United Kingdom", value: 18, valueLabel: "18 sites" },
  { country: "South Africa", value: 4, valueLabel: "4 sites" },
];

const REGION_OPTIONS: GeoFilterOption[] = [
  { key: "amer", label: "Americas", count: 4 },
  { key: "emea", label: "Europe, Middle East & Africa", count: 2 },
  { key: "apac", label: "Asia Pacific", count: 2 },
];

/** Every part from the map family, live, with sample data. */
export function MapSection() {
  const [regions, setRegions] = useState<Set<string>>(new Set(["amer"]));

  function toggle(key: string) {
    setRegions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Spec
        name="WorldMap v2 — never drops a row"
        when="Locations, mixed tones and value-sized dots. Ctrl/cmd + scroll to zoom (anchored under the cursor), drag to pan once zoomed, hover a dot for its tooltip. Zoom and pan are clamped so the map never leaves the frame."
      >
        <WorldMap points={POINTS} sizeKey="value" sizeRange={[4, 13]} height={300} graticule />
      </Spec>

      <Grid cols={2}>
        <Spec
          name="Choropleth"
          when="One number per country, ten countries here. Not a true filled-polygon choropleth — the parts bin only has a land outline, so this draws a centroid circle per country, coloured on the sequential ramp and sized by value. Say so to whoever reads the map."
        >
          <Choropleth data={CHOROPLETH_DATA} height={260} />
        </Spec>

        <Spec
          name="GeoFilterRail"
          when="A rail of region or country chips with counts, for narrowing a map or a table by geography. Controlled — the caller owns the selection and gets a key back on toggle."
        >
          <GeoFilterRail
            title="Region"
            options={REGION_OPTIONS}
            selected={regions}
            onToggle={toggle}
            onClear={() => setRegions(new Set())}
          />
        </Spec>
      </Grid>
    </div>
  );
}
