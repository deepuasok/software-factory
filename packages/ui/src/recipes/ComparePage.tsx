"use client";

import { useMemo } from "react";
import {
  Card,
  DeltaValue,
  Grid,
  PageHeader,
  ScenarioCompare,
  StatTile,
  TrendChart,
  useLinkedHighlight,
  type ScenarioMetric,
  type SeriesSpec,
} from "../index";

const BASELINE = "Baseline";
const SCENARIOS = [BASELINE, "Accelerated activation", "Conservative"];

const METRICS: ScenarioMetric[] = [
  { key: "enrolled", label: "Patients enrolled at week 26", format: (v) => `${v}` },
  { key: "cost", label: "Cost per enrolled patient", higherIsBetter: false, format: (v) => `$${v.toLocaleString()}` },
  { key: "weeks", label: "Weeks to full enrollment", higherIsBetter: false, format: (v) => `${v} wks` },
  { key: "sites", label: "Tier 1 sites activated", format: (v) => `${v}` },
];

const VALUES: Record<string, Record<string, number>> = {
  Baseline: { enrolled: 210, cost: 18400, weeks: 42, sites: 14 },
  "Accelerated activation": { enrolled: 268, cost: 21100, weeks: 33, sites: 19 },
  Conservative: { enrolled: 184, cost: 16800, weeks: 48, sites: 11 },
};

const TREND_SPECS: SeriesSpec[] = [
  { key: "Baseline", label: "Baseline" },
  { key: "Accelerated activation", label: "Accelerated activation" },
  { key: "Conservative", label: "Conservative" },
];

/** Made-up week-by-week enrollment curve for each scenario, for the sample chart. */
function buildTrend() {
  return Array.from({ length: 12 }, (_, i) => {
    const week = (i + 1) * 4;
    return {
      week: `W${week}`,
      Baseline: Math.round(210 * Math.min(1, week / 42)),
      "Accelerated activation": Math.round(268 * Math.min(1, week / 33)),
      Conservative: Math.round(184 * Math.min(1, week / 48)),
    };
  });
}

/**
 * Compare page: pick a plan by seeing what each scenario costs and delivers,
 * side by side against the baseline. Start here for "which plan do we fund" —
 * not for a single scenario's own detail, which belongs on a DetailPage.
 */
export function ComparePage({
  title = "Enrollment plan comparison",
  subtitle = "Sample data. Three funding scenarios for the same protocol.",
  metrics = METRICS,
  scenarios = SCENARIOS,
  baseline = BASELINE,
  values = VALUES,
}: {
  title?: string;
  subtitle?: string;
  metrics?: ScenarioMetric[];
  scenarios?: string[];
  baseline?: string;
  values?: Record<string, Record<string, number>>;
}) {
  const { hovered, bind } = useLinkedHighlight();
  const trend = useMemo(() => buildTrend(), []);
  const compared = scenarios.filter((s) => s !== baseline);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={subtitle} />

      <Grid cols={2}>
        {compared.map((s) => (
          <div key={s} {...bind(s)}>
            <StatTile
              label={s}
              value={
                <DeltaValue
                  value={values[s].enrolled - values[baseline].enrolled}
                  format={(v) => `${v > 0 ? "+" : ""}${v} patients`}
                />
              }
              note="vs baseline, enrolled at week 26"
              tone={hovered === s ? "brand" : "neutral"}
            />
          </div>
        ))}
      </Grid>

      <Card title="Enrollment over time" right="Hover a scenario tile above to trace its line">
        <TrendChart
          data={trend}
          xKey="week"
          series={TREND_SPECS}
          seriesToggle
          highlightKey={hovered ?? undefined}
          onHover={(key) => (key ? bind(key).onMouseEnter() : hovered && bind(hovered).onMouseLeave())}
        />
      </Card>

      <Card title="Scenario comparison" padded={false}>
        <ScenarioCompare metrics={metrics} scenarios={scenarios} baseline={baseline} values={values} />
      </Card>
    </div>
  );
}
