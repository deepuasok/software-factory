import React from "react";
import {
  Badge, Banner, Button, Card, CategoryBars, Chip, DataTable, PageHeader, RankBadge,
  SearchInput, Segmented, StatRow, StatTile, Toggle, Toolbar, TopBar, TrendChart, color,
} from "@factory/ui";

/**
 * The one page both the assembly scene and the click scene build. Rendered at
 * 1440px wide, then scaled to the film. Every element takes a style so the
 * scenes can animate it in or react to a click, and nothing is redrawn.
 */

export const TREND = Array.from({ length: 10 }, (_, i) => ({
  week: `W${i + 1}`,
  opened: [3, 4, 3, 3, 6, 6, 6, 7, 7, 1][i],
  closed: [1, 4, 0, 2, 1, 0, 1, 2, 1, 0][i],
}));

export const BUILDINGS = [
  { name: "Harborview Labs", v: 8 },
  { name: "Riverbend Tower", v: 7 },
  { name: "Westgate Distribution", v: 6 },
  { name: "Cedar Grove Clinic", v: 4 },
];

export const ROWS = [
  { id: "1", title: "Elevator B stuck between floors", where: "Riverbend Tower", rank: 1 as const, score: 100, sla: "8d overdue" },
  { id: "2", title: "Backup generator won't start", where: "Harborview Labs", rank: 1 as const, score: 96, sla: "20d overdue" },
  { id: "3", title: "Chiller room leak", where: "Harborview Labs", rank: 1 as const, score: 91, sla: "26d overdue" },
  { id: "4", title: "RTU-7 warm air on floor 4", where: "Riverbend Tower", rank: 2 as const, score: 74, sla: "13d overdue" },
];

export type DashState = {
  /** per-element style, keyed by slot name */
  s: Record<string, React.CSSProperties>;
  tiles: { open: number; past: number; approve: number; done: number };
  view: "all" | "past";
  toggle: boolean;
  chipOn: boolean;
  /** 0..1 how much of each chart is revealed */
  trend: number;
  bars: number;
  closedLine: boolean;
  bannerTone: "error" | "ok";
};

const clip = (p: number): React.CSSProperties => ({ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` });

export function Dashboard({ st }: { st: DashState }) {
  const g = (k: string) => st.s[k] ?? {};
  return (
    <div style={{ width: 1440, minHeight: 1000, background: color.ghostWhite }}>
      <div style={g("topbar")}>
        <TopBar brand="ACME" product="Work Order Triage" breadcrumb="Dashboard" right={<Button variant="primary" size="sm">Start triage</Button>} />
      </div>
      <div style={{ padding: "24px 32px" }}>
        <div style={g("header")}>
          <PageHeader
            title="Facilities work order triage"
            meta={<><Badge tone="brand">36 work orders</Badge><Badge>sample data</Badge></>}
            subtitle="Which open work orders get done first this week, and which high-cost jobs get approved."
            actions={<Button>Export list</Button>}
          />
        </div>

        <div style={{ marginBottom: 16, ...g("banner") }}>
          <Banner
            tone={st.bannerTone}
            title={st.bannerTone === "error" ? "25 work orders are past their SLA" : "Every past-SLA order now has an owner"}
            body={st.bannerTone === "error" ? "Priya Anand owns the most of them and is accountable for getting them scheduled this week." : "Scheduled this week. Nothing is waiting on a name."}
            action={<Button size="sm">Work the queue</Button>}
          />
        </div>

        <div style={g("tiles")}>
          <StatRow className="mb-4">
            <div style={g("tile1")}><StatTile label="Open work orders" value={st.tiles.open} note="new, triaged, approved or in progress" /></div>
            <div style={g("tile2")}><StatTile label="Past SLA" value={st.tiles.past} note="hours open already exceed the clock" tone="error" /></div>
            <div style={g("tile3")}><StatTile label="Awaiting approval" value={st.tiles.approve} note="triaged, over $25k estimated" tone="warn" /></div>
            <div style={g("tile4")}><StatTile label="Done this week" value={st.tiles.done} note="closed in the last 7 days" tone="ok" /></div>
          </StatRow>
        </div>

        <div style={g("toolbar")}>
          <Toolbar>
            <div style={{ width: 260 }}><SearchInput small placeholder="Search title, building, asset" /></div>
            <div style={g("seg")}>
              <Segmented value={st.view} onChange={() => {}} options={[{ value: "all", label: "All", count: 26 }, { value: "past", label: "Past SLA", count: 25 }]} />
            </div>
            <div style={g("chip")}><Chip on={st.chipOn}>Harborview Labs · 8</Chip></div>
            <div className="flex-1" />
            <div style={g("toggle")}><Toggle checked={st.toggle} onChange={() => {}} label="Show closed" /></div>
          </Toolbar>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={g("chart")}>
            <Card title="Open vs closed, by week" right="last 10 weeks">
              <div style={clip(st.trend)}>
                <TrendChart
                  data={TREND}
                  xKey="week"
                  series={st.closedLine ? [{ key: "opened", label: "Opened", area: true }, { key: "closed", label: "Closed" }] : [{ key: "opened", label: "Opened", area: true }]}
                  height={220}
                  referenceAreas={[{ x1: "W5", x2: "W7", label: "Holiday freeze", tone: "warn" }] as any}
                />
              </div>
            </Card>
          </div>
          <div style={g("bars")}>
            <Card title="Buildings by past-SLA count" right="worst first">
              <div style={clip(st.bars)}>
                <CategoryBars data={BUILDINGS} xKey="name" series={[{ key: "v", label: "Past SLA" }]} horizontal height={220} />
              </div>
            </Card>
          </div>
        </div>

        <div style={{ marginTop: 16, ...g("table") }}>
          <Card title="Most urgent right now" right="top 4 by urgency score" padded={false}>
            <DataTable
              rows={ROWS}
              rowKey={(r) => r.id}
              columns={[
                { key: "t", header: "Work order", render: (r) => <div><div className="font-medium">{r.title}</div><div className="text-[11px] text-muted">{r.where}</div></div> },
                { key: "p", header: "Priority", render: (r) => <RankBadge rank={r.rank} prefix="P" /> },
                { key: "s", header: "Urgency", align: "right", render: (r) => <span className="font-semibold">{r.score}</span> },
                { key: "d", header: "SLA", align: "right", render: (r) => <Badge tone="error">{r.sla}</Badge> },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export const REST: DashState = {
  s: {},
  tiles: { open: 26, past: 25, approve: 3, done: 2 },
  view: "all",
  toggle: false,
  chipOn: false,
  trend: 1,
  bars: 1,
  closedLine: false,
  bannerTone: "error",
};
