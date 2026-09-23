"use client";

import {
  Card,
  DivergingBars,
  Funnel,
  Grid,
  Heatmap,
  Histogram,
  RankedBars,
  ScenarioCompare,
  Scatter,
  SmallMultiples,
  StackedBars,
  TrendChart,
  Waterfall,
  type FunnelStage,
  type HeatmapCell,
  type ScatterPoint,
  type ScenarioMetric,
  type SeriesSpec,
  type WaterfallStep,
} from "@factory/ui";

/** A chart card with the name, the one-line "use it when", and the chart. */
function ChartPart({ name, when, crossedOut, children }: { name: string; when: string; crossedOut?: string; children?: React.ReactNode }) {
  return (
    <Card title={name}>
      <p className="text-[11.5px] text-muted mt-[-4px] mb-3 leading-relaxed">{when}</p>
      {crossedOut && (
        <p className="text-[11px] text-muted mb-3">
          Not <span className="line-through">{crossedOut}</span> — that hides the one number the chart is here to show.
        </p>
      )}
      {children}
    </Card>
  );
}

/* Sample data — a made-up site-management dataset, deliberately about nothing. */

const SITE_TIERS = [
  { study: "Atlas", "Tier 1": 22, "Tier 2": 31, "Tier 3": 19, "Tier 4": 12 },
  { study: "Beacon", "Tier 1": 9, "Tier 2": 12, "Tier 3": 8, "Tier 4": 2 },
  { study: "Cascade", "Tier 1": 14, "Tier 2": 18, "Tier 3": 15, "Tier 4": 10 },
  { study: "Ember", "Tier 1": 17, "Tier 2": 15, "Tier 3": 9, "Tier 4": 3 },
];
const TIER_SPECS: SeriesSpec[] = [
  { key: "Tier 1", label: "Tier 1" },
  { key: "Tier 2", label: "Tier 2" },
  { key: "Tier 3", label: "Tier 3" },
  { key: "Tier 4", label: "Tier 4" },
];

const SITE_ENROLLMENT = [
  { key: "northgate", label: "Northgate General", value: 84 },
  { key: "riverside", label: "Riverside Institute", value: 61 },
  { key: "harbour", label: "Harbour Clinic", value: 58 },
  { key: "lakeside", label: "Lakeside Partners", value: 47 },
  { key: "meridian", label: "Meridian Labs", value: 33 },
  { key: "crestview", label: "Crestview Health", value: 21 },
];

const SITE_VS_PLAN = [
  { label: "Northgate General", value: 22 },
  { label: "Riverside Institute", value: 9 },
  { label: "Harbour Clinic", value: -4 },
  { label: "Lakeside Partners", value: -18 },
  { label: "Meridian Labs", value: 6 },
  { label: "Crestview Health", value: -11 },
];

const SITE_RATES = Array.from({ length: 60 }, (_, i) => {
  const base = 0.28 + Math.sin(i / 5) * 0.12 + (i % 7 === 0 ? 0.2 : 0);
  return Math.max(0.02, Math.min(0.95, base + ((i * 37) % 11) / 100));
});

const SITE_SCATTER: ScatterPoint[] = [
  { key: "northgate", label: "Northgate General", x: 4, y: 84, size: 120 },
  { key: "riverside", label: "Riverside Institute", x: 6, y: 61, size: 90 },
  { key: "harbour", label: "Harbour Clinic", x: 9, y: 58, size: 70 },
  { key: "lakeside", label: "Lakeside Partners", x: 11, y: 47, size: 60 },
  { key: "meridian", label: "Meridian Labs", x: 14, y: 33, size: 50 },
  { key: "crestview", label: "Crestview Health", x: 18, y: 21, size: 40 },
];

const HEATMAP_ROWS = ["Atlas", "Beacon", "Cascade", "Ember"];
const HEATMAP_COLUMNS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const HEATMAP_DATA: HeatmapCell[] = HEATMAP_ROWS.flatMap((row, r) =>
  HEATMAP_COLUMNS.map((column, c) => ({ row, column, value: Math.round(20 + r * 14 + c * 9 + ((r + c) % 3) * 6) })),
);

const FORECAST_STEPS: WaterfallStep[] = [
  { label: "Site reactivation", value: 34 },
  { label: "Eye Care cohort delay", value: -21 },
  { label: "New Tier 1 sites", value: 48 },
  { label: "Screen-fail rate up", value: -15 },
];

const FEASIBILITY_STAGES: FunnelStage[] = [
  { label: "Sites screened", value: 340 },
  { label: "Contacted", value: 245 },
  { label: "Qualified", value: 148 },
  { label: "Selected (Tier 1/2)", value: 96 },
  { label: "Activated", value: 71 },
];

const STUDY_TRENDS = ["Atlas", "Beacon", "Cascade"].map((study, i) => ({
  title: study,
  data: Array.from({ length: 10 }, (_, w) => ({
    week: `W${(w + 1) * 4}`,
    enrolled: Math.round((40 + i * 30) * Math.min(1, (w + 1) / (8 - i))),
  })),
}));

const TREND_WITH_MARKERS = Array.from({ length: 16 }, (_, i) => ({
  month: `M${i + 1}`,
  planned: Math.round(12 * i * 1.05),
  actual: Math.round(11 * i * (i < 9 ? 1.2 : 0.75)),
}));

const SCENARIO_METRICS: ScenarioMetric[] = [
  { key: "enrolled", label: "Enrolled at week 26", format: (v) => `${v}` },
  { key: "cost", label: "Cost per patient", higherIsBetter: false, format: (v) => `$${v.toLocaleString()}` },
  { key: "weeks", label: "Weeks to full enrollment", higherIsBetter: false, format: (v) => `${v} wks` },
];
const SCENARIO_VALUES: Record<string, Record<string, number>> = {
  Baseline: { enrolled: 210, cost: 18400, weeks: 42 },
  "Accelerated activation": { enrolled: 268, cost: 21100, weeks: 33 },
  Conservative: { enrolled: 184, cost: 16800, weeks: 48 },
};

/**
 * Charts and analysis: every chart wrapper in `@factory/ui`, each captioned
 * with the job it does and, for the first three, the chart type it deliberately
 * replaces.
 */
export function ChartsSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[18px] font-semibold text-secondary">Charts and analysis</h2>
        <p className="text-[12px] text-muted mt-1">
          Recharts lives only in <code className="cx-num">components/charts.tsx</code>. Everything here is sample data.
        </p>
      </div>

      <Grid cols={3}>
        <ChartPart name="StackedBars" when="A whole made of parts — site tiers within a study." crossedOut="a donut">
          <StackedBars data={SITE_TIERS} xKey="study" series={TIER_SPECS} height={220} />
        </ChartPart>
        <ChartPart name="RankedBars" when="One site against the field — the top performer, everyone else muted." crossedOut="rainbow bars">
          <RankedBars data={SITE_ENROLLMENT} highlightKey="northgate" height={200} valueFormat={(v) => `${v}`} />
        </ChartPart>
        <ChartPart name="DivergingBars" when="Sites ahead of plan vs behind it, split at a centred zero line." crossedOut="a dual-axis chart">
          <DivergingBars data={SITE_VS_PLAN} height={220} valueFormat={(v) => `${v > 0 ? "+" : ""}${v}`} />
        </ChartPart>
      </Grid>

      <Grid cols={2}>
        <ChartPart name="Histogram" when="Where 60 sites' enrollment rates cluster, not just their average.">
          <Histogram values={SITE_RATES} bins={12} height={200} label="Sites" valueFormat={(v) => v.toFixed(2)} />
        </ChartPart>
        <ChartPart name="Scatter" when="Activation timing against enrollment — is being early actually paying off?">
          <Scatter data={SITE_SCATTER} xLabel="Weeks to activate" yLabel="Patients enrolled" highlightKey="northgate" height={220} />
        </ChartPart>
      </Grid>

      <ChartPart name="Heatmap" when="Four studies' monthly enrollment side by side, magnitude in one hue.">
        <Heatmap rows={HEATMAP_ROWS} columns={HEATMAP_COLUMNS} data={HEATMAP_DATA} />
      </ChartPart>

      <Grid cols={2}>
        <ChartPart name="Waterfall" when="How the forecast moved from the last committed number to this one, and why.">
          <Waterfall start={612} startLabel="Last forecast" steps={FORECAST_STEPS} endLabel="Revised forecast" height={240} />
        </ChartPart>
        <ChartPart name="Funnel" when="Where sites drop out between screening and activation, with conversion between stages.">
          <Funnel stages={FEASIBILITY_STAGES} />
        </ChartPart>
      </Grid>

      <ChartPart name="SmallMultiples" when="The same trend across several studies, on one shared y-axis so heights compare fairly.">
        <SmallMultiples panels={STUDY_TRENDS} xKey="week" series={[{ key: "enrolled", label: "Enrolled" }]} cols={3} height={130} />
      </ChartPart>

      <ChartPart
        name="TrendChart (v2)"
        when="Planned vs actual with a freeze window shaded in, a decision dated, a scrub brush, and a clickable legend."
      >
        <TrendChart
          data={TREND_WITH_MARKERS}
          xKey="month"
          series={[
            { key: "planned", label: "Planned", dashed: true },
            { key: "actual", label: "Actual", area: true },
          ]}
          referenceAreas={[{ x1: "M10", x2: "M13", label: "Change freeze", tone: "warn" }]}
          referenceDots={[{ x: "M9", y: 118, label: "Go-live" }]}
          brush
          seriesToggle
        />
      </ChartPart>

      <ChartPart name="ScenarioCompare" when="Metrics down the side, scenarios across the top, each cell toned against the baseline.">
        <ScenarioCompare
          metrics={SCENARIO_METRICS}
          scenarios={["Baseline", "Accelerated activation", "Conservative"]}
          baseline="Baseline"
          values={SCENARIO_VALUES}
        />
      </ChartPart>
    </div>
  );
}
