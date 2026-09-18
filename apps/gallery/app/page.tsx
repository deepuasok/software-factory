"use client";

import { useState } from "react";
import {
  AppShell, Badge, BarMeter, Breadcrumb, Button, CategoryBars, Card, Checkbox, Chip,
  ConfirmButton, DataTable, DateInput, Divider, EmptyState, Field, Grid, InlineEdit,
  Label, Legend, ListRow, MilestoneRail, Modal, NumberInput, PageHeader, ProgressBar,
  RankBadge, SearchInput, Segmented, Select, Sparkline, Spinner, SplitPane, StatRow,
  StatTile, Tabs, TextArea, TextInput, Toggle, Toolbar, TrendChart, WorldMap,
  series, color,
} from "@factory/ui";

/* Sample data — deliberately about nothing, so the parts carry the page. */
const trend = Array.from({ length: 18 }, (_, i) => ({
  month: `M${i + 1}`,
  planned: Math.round(10 * i * 1.1),
  actual: Math.round(9 * i * (i < 10 ? 1.25 : 0.8)),
}));
const bars = [
  { name: "Chicago", value: 42 }, { name: "Madrid", value: 35 },
  { name: "Osaka", value: 28 }, { name: "Toronto", value: 21 }, { name: "Berlin", value: 14 },
];
const rows = [
  { id: "A-1", name: "Northgate General", city: "Chicago", country: "United States", rank: 1 as const, rate: 0.62, status: "Active" },
  { id: "A-2", name: "Riverside Institute", city: "Madrid", country: "Spain", rank: 2 as const, rate: 0.41, status: "Pending" },
  { id: "A-3", name: "Harbour Clinic", city: "Osaka", country: "Japan", rank: 3 as const, rate: 0.28, status: "Blocked" },
];

function Spec({ name, when, children }: { name: string; when: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-4">
      <div className="flex items-baseline gap-3 mb-1">
        <h3 className="text-[13px] font-bold text-secondary">{name}</h3>
      </div>
      <p className="text-[11.5px] text-muted mb-3.5 leading-relaxed">{when}</p>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

export default function Gallery() {
  const [seg, setSeg] = useState("all");
  const [tab, setTab] = useState("parts");
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [chips, setChips] = useState<string[]>(["tier1"]);
  const [open, setOpen] = useState(false);
  const [psm, setPsm] = useState(0.62);

  const toggleChip = (k: string) =>
    setChips((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  return (
    <AppShell
      product="Design System"
      breadcrumb="Parts and rules"
      topBarRight={<Button variant="primary" size="sm" onClick={() => setOpen(true)}>Open a modal</Button>}
    >
      <PageHeader
        title="The parts bin"
        meta={<><Badge tone="brand">v1.0</Badge><Badge>44 parts</Badge><Badge tone="ok">palette validated</Badge></>}
        subtitle="Every part an app in this shop is allowed to use, with the rule for when to reach for it. If a screen needs something that is not on this page, it gets added to @factory/ui first — never styled inside one app."
        actions={<Button>Copy tokens</Button>}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[{ value: "parts", label: "Parts" }, { value: "tokens", label: "Tokens" }]}
        className="mb-5"
      />

      {tab === "tokens" ? (
        <Card title="Paint chips" className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-1">
            {Object.entries(color).map(([k, v]) => (
              <div key={k} className="rounded-md border border-edge overflow-hidden">
                <div style={{ background: v, height: 46 }} />
                <div className="px-2 py-1.5">
                  <div className="text-[11px] font-semibold text-secondary">{k}</div>
                  <div className="text-[10px] text-muted cx-num">{v}</div>
                </div>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <Label>Series order — take them in sequence, never cycle</Label>
          <div className="flex gap-2 mt-2">
            {series.map((s, i) => (
              <div key={s} className="flex-1">
                <div style={{ background: s, height: 34 }} className="rounded-md" />
                <div className="text-[10px] text-muted cx-num mt-1">{i + 1} · {s}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          <StatRow className="mb-4">
            <StatTile label="Predicted finish" value="Nov 1, 2029" note="41 months from approval" />
            <StatTile label="Behind plan" value="74w" note="against the committed date" tone="error" />
            <StatTile label="In plan" value="13/30" note="7 rank 1" />
            <StatTile label="Run rate" value="5.7" note="per month at full speed" tone="ok" />
          </StatRow>

          <Grid cols={2} className="mb-4">
            <Card title="Trend chart" right="two series, one axis">
              <TrendChart
                data={trend}
                xKey="month"
                series={[
                  { key: "planned", label: "Planned", area: true },
                  { key: "actual", label: "Actual" },
                ]}
                yTarget={180}
                markers={[{ x: "M12", label: "committed" }]}
                height={230}
              />
            </Card>
            <Card title="Category bars" right="magnitude across names">
              <CategoryBars data={bars} xKey="name" series={[{ key: "value", label: "Patients" }]} horizontal height={230} />
            </Card>
          </Grid>

          <Grid cols={2} className="mb-4">
            <Card title="Map" right="one basemap, everywhere">
              <WorldMap
                height={240}
                points={rows.map((r, i) => ({ id: r.id, city: r.city, country: r.country, active: i < 2, label: r.name }))}
              />
              <Legend items={[{ color: color.primary, label: "in plan" }, { color: color.white, label: "available" }]} />
            </Card>
            <Card title="Table" padded={false} right="click a row to open it">
              <DataTable
                rows={rows}
                rowKey={(r) => r.id}
                onRowClick={() => {}}
                columns={[
                  { key: "name", header: "Record", render: (r) => (
                    <div><div className="font-medium">{r.name}</div><div className="text-[11px] text-muted">{r.city}, {r.country}</div></div>
                  )},
                  { key: "rank", header: "Rank", render: (r) => <RankBadge rank={r.rank} /> },
                  { key: "rate", header: "Rate", align: "right", render: (r) => r.rate.toFixed(2) },
                  { key: "trend", header: "Trend", align: "right", render: () => <Sparkline values={[3, 5, 4, 8, 11, 9, 14]} /> },
                  { key: "status", header: "Status", align: "right", render: (r) => (
                    <Badge tone={r.status === "Active" ? "ok" : r.status === "Blocked" ? "error" : "warn"}>{r.status}</Badge>
                  )},
                ]}
              />
            </Card>
          </Grid>

          <Grid cols={3} className="mb-4">
            <Spec name="Button" when="One primary per view — the action the page wants. Secondary for everything else, ghost inside toolbars and rows, danger always paired with a confirm.">
              <Button variant="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <ConfirmButton onConfirm={() => {}} />
            </Spec>

            <Spec name="Segmented" when="Two to four exclusive choices that switch a view. More than four, or non-exclusive, means chips or a select.">
              <Segmented
                value={seg}
                onChange={setSeg}
                options={[{ value: "all", label: "All", count: 30 }, { value: "t1", label: "Rank 1", count: 7 }, { value: "mine", label: "Mine", count: 4 }]}
              />
            </Spec>

            <Spec name="Chips" when="Narrow a list. Several can be on at once — that is the difference from segmented.">
              <Chip on={chips.includes("tier1")} onToggle={() => toggleChip("tier1")} count={7}>Rank 1</Chip>
              <Chip on={chips.includes("eu")} onToggle={() => toggleChip("eu")} count={11}>Europe</Chip>
              <Chip on={chips.includes("open")} onToggle={() => toggleChip("open")} count={3}>Open</Chip>
            </Spec>

            <Spec name="Toggle vs Checkbox" when="Toggle takes effect immediately. Checkbox applies on Save. That is the only rule that decides between them.">
              <Toggle checked={on} onChange={setOn} label="Live filter" />
              <Checkbox checked={checked} onChange={setChecked} label="Applies on save" />
            </Spec>

            <Spec name="Badges" when="A read-only fact: status, category, count. Never clickable, never a button in disguise.">
              <Badge>Neutral</Badge><Badge tone="brand">Brand</Badge><Badge tone="ok">Good</Badge>
              <Badge tone="warn">Watch</Badge><Badge tone="error">Bad</Badge>
              <RankBadge rank={1} /><RankBadge rank={2} /><RankBadge rank={3} />
            </Spec>

            <Spec name="Inline edit" when="A figure people nudge repeatedly while arguing over a plan. Click, type, Enter. Never a dialog.">
              <InlineEdit value={psm} onCommit={setPsm} format={(v) => v.toFixed(2)} step={0.01} />
              <span className="text-[11px] text-muted">click the number</span>
            </Spec>
          </Grid>

          <Grid cols={2} className="mb-4">
            <Card title="Fields">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" required htmlFor="n"><TextInput id="n" placeholder="Northgate General" /></Field>
                <Field label="Target" hint="Whole patients"><NumberInput defaultValue={180} /></Field>
                <Field label="Approval date"><DateInput defaultValue="2026-06-01" /></Field>
                <Field label="Area"><Select defaultValue="imm"><option value="north">Northern</option><option value="south">Southern</option></Select></Field>
                <Field label="Search" className="col-span-2"><SearchInput placeholder="Search records, cities, countries" /></Field>
                <Field label="Notes" error="Say what changed and why." className="col-span-2"><TextArea placeholder="One or two lines." /></Field>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              <Card title="Meters">
                <BarMeter label="Chicago" value={42} max={42} display="24.1%" />
                <BarMeter label="Madrid" value={35} max={42} display="20.1%" />
                <BarMeter label="Osaka" value={28} max={42} display="16.1%" />
                <Divider className="my-3" />
                <Label>Progress to target</Label>
                <div className="mt-2"><ProgressBar value={132} target={180} /></div>
              </Card>
              <Card title="Milestones">
                <MilestoneRail items={[
                  { label: "Start", date: "Feb 27" }, { label: "25%", date: "Dec 27" },
                  { label: "50%", date: "Jul 28" }, { label: "Finish", date: "Nov 29" },
                ]} />
              </Card>
            </div>
          </Grid>

          <Grid cols={2} className="mb-4">
            <Card title="List rows" padded={false} right="left-rail selection">
              {rows.map((r, i) => (
                <ListRow
                  key={r.id}
                  selected={i < 2}
                  onClick={() => {}}
                  title={r.name}
                  subtitle={`${r.city}, ${r.country}`}
                  right={<><div className="text-[12px] font-semibold cx-num">{r.rate.toFixed(2)}</div><div className="text-[10px] text-muted">rank {r.rank}</div></>}
                />
              ))}
            </Card>
            <EmptyState
              title="Nothing here yet"
              body="An empty screen always says what the thing is and gives the one button that makes the first one."
              action={<Button variant="primary">+ New record</Button>}
            />
          </Grid>

          <Card title="Toolbar" className="mb-10">
            <Toolbar className="mb-0">
              <SearchInput small placeholder="Search" className="w-56" />
              <Segmented value={seg} onChange={setSeg} options={[{ value: "all", label: "All" }, { value: "t1", label: "Rank 1" }]} />
              <Chip on={chips.includes("eu")} onToggle={() => toggleChip("eu")}>Europe</Chip>
              <div className="flex-1" />
              <Spinner />
              <Button size="sm">Export</Button>
              <Button size="sm" variant="primary">Save</Button>
            </Toolbar>
          </Card>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New record"
        footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => setOpen(false)}>Create</Button></>}
      >
        <div className="flex flex-col gap-3">
          <Field label="Name" required><TextInput placeholder="Northgate General" /></Field>
          <Field label="Target" hint="A modal is only for a decision that cannot be shown inline."><NumberInput defaultValue={180} /></Field>
        </div>
      </Modal>
    </AppShell>
  );
}
