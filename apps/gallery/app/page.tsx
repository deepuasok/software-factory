"use client";

import { useState } from "react";
import {
  AppShell, ApprovalInboxPage, Badge, BarMeter, BoardPage, BuilderPage, Button, Callout,
  CategoryBars, Card, Checkbox, Chip, ComparePage, ConfirmButton, DashboardPage, DataTable,
  DateInput, DetailPage, Divider, EmptyState, Field, FormPage, Grid, ImportWizardPage,
  InlineEdit, JumpList, Label, Legend, ListPage, ListRow, MapExplorerPage, MilestoneRail,
  Modal, NumberInput, PageHeader, ProgressBar, RankBadge, ReconcilePage, ReportPage,
  ReviewQueuePage, SchedulePage, SearchInput, Section, Segmented, Select, SideNav, Sparkline,
  Spinner, StatRow, StatTile, TextArea, TextInput, Toggle, Toolbar, TrendChart, WorldMap,
  color, diverging, sequential, series, type Tone,
} from "@factory/ui";

import { ChartsSection } from "./sections/Charts";
import { FilesSection } from "./sections/Files";
import { FurnitureSection } from "./sections/Furniture";
import { MapSection } from "./sections/Map";
import { ProvenanceSection } from "./sections/Provenance";
import { TimelineSection } from "./sections/Timeline";
import { ToneSection } from "./sections/Tone";
import { WorkflowSection } from "./sections/Workflow";

/* How many parts there are, counted from index.ts and kept honest by hand. */
const PART_COUNT = 113;
const RECIPE_COUNT = 14;

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

/* ---------------------------------------------------------------------------
 * The archetypes. Eight shapes of work; every app in the shop is one of them
 * or a short sequence of them. Full write-up in docs/ARCHETYPES.md.
 * ------------------------------------------------------------------------ */

type ArchetypeSpec = {
  id: string;
  label: string;
  /** What the person at the screen is actually doing. */
  does: string;
  /** The recipe to copy on day one. */
  recipe: string;
  /** The parts this shape of work needs, in the order they show up on screen. */
  parts: string[];
  /** The line the checklist adds for this archetype. */
  addendum: string;
  /** Tone for the addendum callout — never decorative, always `info`. */
  tone?: Tone;
};

const ARCHETYPES: ArchetypeSpec[] = [
  {
    id: "monitor",
    label: "Monitor & alert",
    does: "Comes in cold, wants to know in ten seconds whether anything needs them today, and where it is.",
    recipe: "DashboardPage",
    parts: ["StatRow", "StatTile", "DeltaValue", "Sparkline", "TrendChart", "WorldMap", "Choropleth", "GeoFilterRail", "Banner", "InlineAlert", "RagStatus", "AsOf"],
    addendum: "Every tile carries an as-of stamp, and every alert names an owner. A figure with no date is a rumour, and an alert nobody owns is noise.",
  },
  {
    id: "review",
    label: "Review & disposition",
    does: "Works a list one record at a time and makes the same small call on each: in, out, or hold.",
    recipe: "ReviewQueuePage",
    parts: ["Queue", "useRowKeys", "ReviewProgress", "DispositionControl", "Drawer", "DetailHeader", "StickyActionBar", "DataTable", "SplitPane"],
    addendum: "Every row shows its disposition, the reason, who decided and when. A call with no reason cannot be defended a month later.",
  },
  {
    id: "scenario",
    label: "Scenario workbench",
    does: "Changes an assumption and watches the consequence redraw, then compares the versions side by side.",
    recipe: "ComparePage",
    parts: ["ScenarioCompare", "DivergingBars", "RankedBars", "Waterfall", "SmallMultiples", "Slider", "InlineEdit", "AutosaveChip", "useLinkedHighlight"],
    addendum: "Scenarios are named, not numbered, and every diff column is toned against the baseline. An unnamed scenario is forgotten by Friday.",
  },
  {
    id: "schedule",
    label: "Plan & schedule",
    does: "Puts dated work on a timeline, finds where it collides, and argues about whether the date still holds.",
    recipe: "SchedulePage",
    parts: ["Gantt", "CurveMilestones", "MilestoneRail", "CapacityMeterGrid", "TargetSolveRail", "ProgressBar", "DateRangePicker"],
    addendum: "The committed date is drawn on the chart, and slip is stated in weeks. A plan that hides the original date is a plan nobody can hold.",
  },
  {
    id: "reconcile",
    label: "Reconcile & attribute",
    does: "Has the same number from two systems, picks the one to trust, and leaves a record of why.",
    recipe: "ReconcilePage",
    parts: ["SourceBadge", "OverrideControl", "ExplainPanel", "ActivityFeed", "AsOf", "ImportWizard", "FindingsPanel", "FileDrop", "ExportButton"],
    addendum: "Every field shows its source, and every correction writes an Override with a reason code. A silent fix is indistinguishable from a bug.",
  },
  {
    id: "approve",
    label: "Approve & route",
    does: "Holds the pen. Reads what somebody else prepared, then approves it, sends it back, or stops it.",
    recipe: "ApprovalInboxPage",
    parts: ["ApprovalActions", "StatusStepper", "AssigneePicker", "CommentThread", "ActivityFeed", "Queue", "Drawer", "StickyActionBar"],
    addendum: "Reject requires a comment, and the state history is visible on the record. A decision with no trail gets relitigated.",
  },
  {
    id: "track",
    label: "Track & follow up",
    does: "Owns a pile of open work and keeps it moving — who has it, when it is due, what is stuck.",
    recipe: "BoardPage",
    parts: ["KanbanBoard", "Checklist", "DueDateBadge", "PriorityBadge", "AssigneePicker", "Avatar", "CommentThread", "BulkActionBar"],
    addendum: "Every item shows an owner and a due date, and overdue is toned `error`. Work with neither is not tracked, it is remembered.",
  },
  {
    id: "report",
    label: "Report & readout",
    does: "Is not using the tool at all. They are reading the sheet it printed, on a phone or in a meeting.",
    recipe: "ReportPage",
    parts: ["PrintLayout", "Section", "JumpList", "Callout", "StatRow", "TrendChart", "CategoryBars", "AsOf"],
    addendum: "It prints on one page, and every chart carries a takeaway caption. A chart with no sentence under it is a picture, not a finding.",
  },
];

function ArchetypeBrief({ spec }: { spec: ArchetypeSpec }) {
  return (
    <Card title={spec.label} right={<Badge tone="brand">start from {spec.recipe}</Badge>} className="mb-5">
      <p className="text-[12.5px] leading-relaxed text-secondary max-w-[78ch]">{spec.does}</p>
      <Divider className="my-3.5" />
      <Label>Parts this shape of work needs</Label>
      <div className="flex flex-wrap gap-1.5 mt-2 mb-3.5">
        {spec.parts.map((p) => (
          <Badge key={p}>{p}</Badge>
        ))}
      </div>
      <Callout tone="info" label="Checklist addendum">{spec.addendum}</Callout>
    </Card>
  );
}

/* A recipe, framed, with the sentence that says when to start from it. */
function RecipeFrame({ id, name, when, children }: { id: string; name: string; when: string; children: React.ReactNode }) {
  return (
    <Section id={id} title={name} right={<Badge>recipes/{name}.tsx</Badge>} className="mb-8">
      <p className="text-[12px] text-muted mb-3 max-w-[78ch] leading-relaxed">{when}</p>
      <div className="rounded-lg border border-edge bg-ghost-white overflow-hidden">{children}</div>
    </Section>
  );
}

const RECIPES: { id: string; name: string; when: string; render: () => React.ReactNode }[] = [
  { id: "r-list", name: "ListPage", when: "People scan, narrow and act on rows in bulk. Header, filter bar, saved views, table, empty state.", render: () => <ListPage /> },
  { id: "r-form", name: "FormPage", when: "People create or edit one record. Two sections, errors on top, Save pinned to the bottom.", render: () => <FormPage /> },
  { id: "r-detail", name: "DetailPage", when: "One record opened to be understood: the facts, where each came from, and what has happened to it.", render: () => <DetailPage /> },
  { id: "r-dashboard", name: "DashboardPage", when: "The ten-second answer to whether anything needs attention today.", render: () => <DashboardPage needsAttention="Two sites have not reported enrolment since Friday. Roland owns the chase." /> },
  { id: "r-reviewqueue", name: "ReviewQueuePage", when: "A list worked one record at a time, with the same call made on each.", render: () => <ReviewQueuePage /> },
  { id: "r-approval", name: "ApprovalInboxPage", when: "Somebody else's work, read and then approved, sent back, or stopped.", render: () => <ApprovalInboxPage /> },
  { id: "r-board", name: "BoardPage", when: "Open work tracked by which bucket it sits in, dragged between columns.", render: () => <BoardPage /> },
  { id: "r-compare", name: "ComparePage", when: "Two or more named scenarios for the same thing, compared metric by metric against a baseline.", render: () => <ComparePage /> },
  { id: "r-reconcile", name: "ReconcilePage", when: "The same figure from two systems, with a source picked per field and an override written when a human knows better.", render: () => <ReconcilePage /> },
  { id: "r-import", name: "ImportWizardPage", when: "A spreadsheet coming in: Drop, Preview, Map columns, Validate, Commit.", render: () => <ImportWizardPage /> },
  { id: "r-schedule", name: "SchedulePage", when: "Dated work on a timeline, with the committed date drawn and capacity checked period by period.", render: () => <SchedulePage /> },
  { id: "r-map", name: "MapExplorerPage", when: "A table and a map of the same records, linked — click a row and its dot lights up.", render: () => <MapExplorerPage /> },
  { id: "r-report", name: "ReportPage", when: "The printed sheet, not the tool around it. Sections, jump list, a takeaway under every chart.", render: () => <ReportPage /> },
  { id: "r-builder", name: "BuilderPage", when: "An assumption nudged in place while the totals and the curve redraw. Owns its own full-width shell, so it appears here as a whole screen.", render: () => <BuilderPage /> },
];

const NAV_MAIN = [{ value: "foundations", label: "Foundations" }];
const NAV_ARCHETYPES = ARCHETYPES.map((a) => ({ value: a.id, label: a.label, count: a.parts.length }));
const NAV_REFERENCE = [
  { value: "tokens", label: "Tokens & tone" },
  { value: "recipes", label: "Recipes", count: RECIPE_COUNT },
];

export default function Gallery() {
  const [seg, setSeg] = useState("all");
  const [view, setView] = useState("foundations");
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [chips, setChips] = useState<string[]>(["tier1"]);
  const [open, setOpen] = useState(false);
  const [psm, setPsm] = useState(0.62);

  const toggleChip = (k: string) =>
    setChips((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  const archetype = ARCHETYPES.find((a) => a.id === view);

  return (
    <AppShell
      brand="ACME"
      product="Design System"
      breadcrumb="Parts, archetypes and recipes"
      topBarRight={<Button variant="primary" size="sm" onClick={() => setOpen(true)}>Open a modal</Button>}
    >
      <PageHeader
        title="The parts bin"
        meta={<><Badge tone="brand">v1.0</Badge><Badge>{PART_COUNT} parts</Badge><Badge>{RECIPE_COUNT} recipes</Badge><Badge tone="ok">palette validated</Badge></>}
        subtitle="Every part an app in this shop is allowed to use, with the rule for when to reach for it. The eight archetypes below are the shapes of work these parts assemble into — start from the recipe, then swap the sample data for yours. If a screen needs something that is not on this page, it gets added to @factory/ui first, never styled inside one app."
        actions={<Button>Copy tokens</Button>}
      />

      <div className="flex items-start gap-5">
        <aside className="w-[196px] shrink-0 sticky top-4 cx-card py-2">
          <div className="px-3 pt-1 pb-0.5"><Label>Parts</Label></div>
          <SideNav items={NAV_MAIN} active={view} onSelect={setView} />
          <Divider className="my-1" />
          <div className="px-3 pt-1 pb-0.5"><Label>Archetypes</Label></div>
          <SideNav items={NAV_ARCHETYPES} active={view} onSelect={setView} />
          <Divider className="my-1" />
          <div className="px-3 pt-1 pb-0.5"><Label>Reference</Label></div>
          <SideNav items={NAV_REFERENCE} active={view} onSelect={setView} />
        </aside>

        <div className="flex-1 min-w-0">
          {archetype && (
            <>
              <ArchetypeBrief spec={archetype} />
              {view === "monitor" && <MapSection />}
              {view === "review" && <WorkflowSection />}
              {view === "scenario" && <ChartsSection />}
              {view === "schedule" && <TimelineSection />}
              {view === "reconcile" && (
                <div className="flex flex-col gap-5">
                  <ProvenanceSection />
                  <FilesSection />
                </div>
              )}
              {view === "approve" && (
                <Card title="The shape, assembled" right="ApprovalInboxPage with its own sample data" padded={false}>
                  <div className="bg-ghost-white"><ApprovalInboxPage /></div>
                </Card>
              )}
              {view === "track" && (
                <Card title="The shape, assembled" right="BoardPage with its own sample data" padded={false}>
                  <div className="bg-ghost-white"><BoardPage /></div>
                </Card>
              )}
              {view === "report" && <FurnitureSection />}
            </>
          )}

          {view === "tokens" && (
            <>
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
                <Divider className="my-4" />
                <Label>Sequential — magnitude on one hue, light to dark</Label>
                <div className="flex gap-2 mt-2">
                  {sequential.map((s, i) => (
                    <div key={s} className="flex-1">
                      <div style={{ background: s, height: 28 }} className="rounded-md border border-edge" />
                      <div className="text-[10px] text-muted cx-num mt-1">{i + 1} · {s}</div>
                    </div>
                  ))}
                </div>
                <Divider className="my-4" />
                <Label>Diverging — two poles around a neutral middle</Label>
                <div className="flex gap-2 mt-2">
                  {Object.entries(diverging).map(([k, v]) => (
                    <div key={k} className="flex-1">
                      <div style={{ background: v, height: 28 }} className="rounded-md border border-edge" />
                      <div className="text-[10px] text-muted cx-num mt-1">{k} · {v}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <ToneSection />
            </>
          )}

          {view === "recipes" && (
            <>
              <Card title="Recipes" right={`${RECIPE_COUNT} assembled pages`} className="mb-5">
                <p className="text-[12.5px] leading-relaxed text-secondary max-w-[78ch] mb-3">
                  A recipe is a whole page, already assembled from the parts bin, with sample data
                  built in. Copy the file, pass your own rows, delete what the screen does not need.
                  Each one below is the real component rendering its own defaults.
                </p>
                <JumpList items={RECIPES.map((r) => ({ id: r.id, label: r.name }))} />
              </Card>
              {RECIPES.map((r) => (
                <RecipeFrame key={r.id} id={r.id} name={r.name} when={r.when}>
                  {r.render()}
                </RecipeFrame>
              ))}
            </>
          )}

          {view === "foundations" && (
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
        </div>
      </div>

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
