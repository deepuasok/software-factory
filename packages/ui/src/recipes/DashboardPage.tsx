"use client";

import React from "react";
import {
  Banner,
  Button,
  Card,
  CategoryBars,
  DataTable,
  DeltaValue,
  PageHeader,
  ProgressBar,
  StatRow,
  StatTile,
  TrendChart,
  type Column,
} from "../index";

/** One row of the top-items table. Swap the fields; keep the shape. */
export type DashboardTopItem = {
  id: string;
  name: string;
  owner: string;
  value: number;
  change: number;
};

const TREND = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  planned: Math.round(120 + i * 9.5),
  actual: Math.round(115 + i * (i < 8 ? 10.5 : 6)),
}));

const RANKED = [
  { name: "Northgate General", value: 62 },
  { name: "Riverside Institute", value: 48 },
  { name: "Harbour Clinic", value: 35 },
  { name: "Lakeside Partners", value: 27 },
  { name: "Meridian Labs", value: 19 },
];

const TOP_ITEMS: DashboardTopItem[] = [
  { id: "S-01", name: "Northgate General", owner: "Priya Raman", value: 612, change: 6 },
  { id: "S-02", name: "Riverside Institute", owner: "Tom Alvarez", value: 471, change: -3 },
  { id: "S-03", name: "Harbour Clinic", owner: "Priya Raman", value: 388, change: 11 },
  { id: "S-04", name: "Lakeside Partners", owner: "Dana Okonjo", value: 301, change: -8 },
];

/**
 * The dashboard: a heading, a banner if something needs attention, the
 * headline stats, a trend, a ranked bar chart and the table behind it.
 *
 * Start here for the page people open first thing to see where things stand.
 * For a page that answers one question with an action attached, a stat and a
 * table may be all you need — this recipe is for the page that answers several
 * at once.
 */
export function DashboardPage({
  title = "Enrollment overview",
  subtitle = "Sample data. Every figure below is made up so the page reads as a working tool.",
  needsAttention,
  topItems = TOP_ITEMS,
}: {
  title?: string;
  subtitle?: string;
  /** Pass a message to show the attention banner. Leave it out and it disappears. */
  needsAttention?: string;
  topItems?: DashboardTopItem[];
}) {
  const columns: Column<DashboardTopItem>[] = [
    {
      key: "name",
      header: "Site",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <span className="block">
          <span className="font-medium">{r.name}</span>
          <span className="block text-[11px] text-muted">{r.id} · {r.owner}</span>
        </span>
      ),
    },
    {
      key: "value",
      header: "Patients enrolled",
      align: "right",
      sortable: true,
      sortValue: (r) => r.value,
      render: (r) => r.value,
    },
    {
      key: "change",
      header: "Change on last month",
      align: "right",
      sortable: true,
      sortValue: (r) => r.change,
      render: (r) => <DeltaValue value={r.change} format={(v) => `${v > 0 ? "+" : ""}${v}%`} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Button variant="primary">Export to spreadsheet</Button>}
      />

      {needsAttention && (
        <Banner tone="warn" title="Needs attention" body={needsAttention} action={<Button variant="secondary" size="sm">Review</Button>} />
      )}

      <StatRow wideFirst>
        <StatTile
          label="Patients enrolled"
          value="1,772"
          tone="ok"
          delta={{ value: 8, format: (v) => `${v > 0 ? "+" : ""}${v}% vs last month` }}
          sparkline={TREND.map((t) => t.actual)}
        />
        <StatTile label="Sites active" value="84" note="4 pending activation" />
        <StatTile label="Sites at Tier 1" value="31" tone="brand" note="40% better than study average" />
        <StatTile label="Days to committed date" value="112" tone="warn" delta={{ value: -6, higherIsBetter: false }} />
      </StatRow>

      <Card title="Enrollment vs plan" right="Monthly, cumulative">
        <TrendChart
          data={TREND}
          xKey="month"
          series={[
            { key: "planned", label: "Planned", dashed: true },
            { key: "actual", label: "Actual", area: true },
          ]}
        />
      </Card>

      <Card title="Target for the quarter">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={1772} target={2100} thresholds={{ warnBelow: 80, errorBelow: 60 }} />
          </div>
          <span className="cx-num text-[12px] font-semibold text-secondary shrink-0">1,772 / 2,100</span>
        </div>
      </Card>

      <Card title="Top sites by enrollment" right="Ranked, highest first">
        <CategoryBars data={RANKED} xKey="name" series={[{ key: "value", label: "Patients" }]} horizontal />
      </Card>

      <Card title="Top sites" padded={false}>
        <DataTable rows={topItems} columns={columns} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
