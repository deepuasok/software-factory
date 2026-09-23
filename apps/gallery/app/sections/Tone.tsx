"use client";

import { useState } from "react";
import {
  Badge,
  BulkActionBar,
  Button,
  Card,
  Chip,
  Combobox,
  DataTable,
  DateRangePicker,
  DeltaValue,
  Field,
  FilterBar,
  Form,
  FormRow,
  FormSection,
  Grid,
  HeatCell,
  Label,
  MultiSelect,
  RadioCards,
  RagStatus,
  SavedViews,
  Slider,
  StatTile,
  StatusPill,
  TagInput,
  TextInput,
  TONES,
  ValidationSummary,
  color,
  toneHex,
  useTableState,
  type Column,
  type DateRange,
  type Tone,
} from "@factory/ui";

/* What each tone is allowed to mean. Straight from docs/CONTRACTS.md. */
const MEANING: Record<Tone, { means: string; never: string; example: string }> = {
  neutral: { means: "A fact with no judgement", never: "Unimportant", example: "Category: Imaging" },
  brand: { means: "Selected, active, primary action", never: "Good", example: "The row you are on" },
  ok: { means: "On plan, approved, healthy", never: "Finished", example: "Approved 3 days ago" },
  warn: { means: "Watch this, at risk, pending", never: "Error", example: "Renews in 14 days" },
  error: { means: "Behind plan, rejected, failed, overdue", never: "Important", example: "Overdue by 6 days" },
  info: { means: "A note from the system", never: "Anything human-judged", example: "Recalculated overnight" },
};

const SAMPLE_VALUE: Record<Tone, number> = { neutral: 41, brand: 68, ok: 92, warn: 57, error: 12, info: 34 };
const SAMPLE_DELTA: Record<Tone, number> = { neutral: 0, brand: 4, ok: 11, warn: -3, error: -18, info: 2 };

/** A small inline dot, the size a chart marker or a map pin would be. */
function Dot({ tone, shape }: { tone: Tone; shape: "marker" | "pin" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      {shape === "marker" ? (
        <circle cx="9" cy="9" r="5" fill={toneHex(tone)} stroke={color.white} strokeWidth="1.5" />
      ) : (
        <path d="M9 2c-2.8 0-5 2.1-5 4.8C4 10.4 9 16 9 16s5-5.6 5-9.2C14 4.1 11.8 2 9 2Z" fill={toneHex(tone)} />
      )}
    </svg>
  );
}

/* Sample table --------------------------------------------------------- */

type Study = {
  id: string;
  name: string;
  phase: string;
  sites: number;
  enrolled: number;
  status: string;
  tone: Tone;
  note: string;
};

const STUDIES: Study[] = [
  { id: "ST-1042", name: "Atlas", phase: "Phase 3", sites: 84, enrolled: 612, status: "On plan", tone: "ok", note: "Enrolment is tracking two weeks ahead of the committed date." },
  { id: "ST-1057", name: "Beacon", phase: "Phase 2", sites: 31, enrolled: 188, status: "At risk", tone: "warn", note: "Four sites have not activated. The date holds if two of them open by March." },
  { id: "ST-0988", name: "Cascade", phase: "Phase 3", sites: 57, enrolled: 94, status: "Behind plan", tone: "error", note: "Seventy-four weeks behind the committed date. Site selection is being redone." },
  { id: "ST-1063", name: "Delta", phase: "Phase 1", sites: 12, enrolled: 47, status: "In review", tone: "info", note: "Figures were recalculated overnight and have not been checked by the study team." },
  { id: "ST-1011", name: "Ember", phase: "Phase 2", sites: 44, enrolled: 301, status: "On plan", tone: "ok", note: "No change since the last review." },
];

const OWNERS = [
  { value: "praman", label: "Priya Raman", hint: "Study start-up" },
  { value: "talvarez", label: "Tom Alvarez", hint: "Feasibility" },
  { value: "dokonjo", label: "Dana Okonjo", hint: "Site management" },
];

const REGIONS = [
  { value: "amer", label: "Americas" },
  { value: "emea", label: "Europe and Middle East" },
  { value: "apac", label: "Asia Pacific" },
];

/** A part with the one line that says when to reach for it. */
function Part({ name, when, children }: { name: string; when: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-4">
      <h3 className="text-[13px] font-bold text-secondary">{name}</h3>
      <p className="text-[11.5px] text-muted mt-1 mb-3.5 leading-relaxed">{when}</p>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

/**
 * The tone row and the parts built on it.
 *
 * Six tones, one row each, every part that carries state side by side — so a
 * part whose amber has drifted is visible without reading any code.
 */
export function ToneSection() {
  const table = useTableState();
  const [owner, setOwner] = useState("praman");
  const [regions, setRegions] = useState<string[]>(["amer"]);
  const [tags, setTags] = useState<string[]>(["feasibility"]);
  const [cadence, setCadence] = useState<"monthly" | "quarterly" | "on-change">("quarterly");
  const [threshold, setThreshold] = useState(60);
  const [period, setPeriod] = useState<DateRange>({ from: "2026-07-01", to: "2026-09-17" });
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

  const enrolled = STUDIES.map((s) => s.enrolled);
  const low = Math.min(...enrolled);
  const high = Math.max(...enrolled);

  const columns: Column<Study>[] = [
    {
      key: "study",
      header: "Study",
      sortable: true,
      sortValue: (s) => s.name,
      render: (s) => (
        <span className="block">
          <span className="font-medium">{s.name}</span>
          <span className="block text-[11px] text-muted">
            {s.id} · {s.phase}
          </span>
        </span>
      ),
    },
    { key: "status", header: "Status", render: (s) => <StatusPill label={s.status} tone={s.tone} /> },
    { key: "health", header: "Health", hideable: true, render: (s) => <RagStatus tone={s.tone} label={s.status} /> },
    { key: "sites", header: "Sites", align: "right", sortable: true, sortValue: (s) => s.sites, render: (s) => s.sites },
    {
      key: "enrolled",
      header: "Patients enrolled",
      align: "right",
      sortable: true,
      sortValue: (s) => s.enrolled,
      render: (s) => <HeatCell value={s.enrolled} min={low} max={high} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ---- The tone row ---- */}
      <Card
        title="Tone, side by side"
        right="One row per tone. Every part reads the same colour from toneClass."
        padded={false}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[980px]">
            <thead>
              <tr>
                {["Tone", "Means", "Stat tile", "Chip", "Table cell", "Chart", "Map", "Badge"].map((h) => (
                  <th key={h} className="cx-label px-3 py-2.5 border-b border-edge text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TONES.map((tone) => (
                <tr key={tone} className="border-b border-edge last:border-0 align-middle">
                  <td className="px-3 py-3">
                    <Label>{tone}</Label>
                  </td>
                  <td className="px-3 py-3 text-[11.5px] text-muted max-w-[220px]">
                    {MEANING[tone].means}
                    <span className="block text-[11px] opacity-70">Never: {MEANING[tone].never}</span>
                  </td>
                  <td className="px-3 py-3 w-[168px]">
                    <StatTile
                      label="Sites on plan"
                      value={SAMPLE_VALUE[tone]}
                      tone={tone}
                      note={<DeltaValue value={SAMPLE_DELTA[tone]} format={(v) => `${v > 0 ? "+" : ""}${v} on last month`} />}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Chip on tone={tone}>
                      {MEANING[tone].means.split(",")[0]}
                    </Chip>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <StatusPill label={MEANING[tone].example} tone={tone} />
                      <span className="w-16">
                        <HeatCell value={SAMPLE_VALUE[tone]} min={0} max={100} />
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Dot tone={tone} shape="marker" />
                  </td>
                  <td className="px-3 py-3">
                    <Dot tone={tone} shape="pin" />
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={tone}>{tone}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ---- The table ---- */}
      <Card
        title="The table, with everything switched on"
        right="Sort a column, tick a row, open the triangle, hide a column."
        padded={false}
      >
        <DataTable
          rows={STUDIES}
          columns={columns}
          rowKey={(s) => s.id}
          sort={table.sort}
          onSortChange={table.setSort}
          selectable
          selected={table.selected}
          onSelectionChange={table.setSelected}
          columnChooser
          dense
          bulkActions={
            <>
              <Button variant="secondary" size="sm">Reassign</Button>
              <Button variant="secondary" size="sm">Export</Button>
            </>
          }
          rowActions={(s) => (
            <>
              <Button variant="ghost" size="sm">Open {s.id}</Button>
              <Button variant="ghost" size="sm">Add a comment</Button>
            </>
          )}
          renderExpanded={(s) => <span className="block max-w-[70ch]">{s.note}</span>}
        />
      </Card>

      {/* ---- Filters ---- */}
      <Card title="Filters and saved views" padded={false}>
        <div className="px-4 pt-3.5 pb-1">
          <FilterBar
            value={table.filters}
            onChange={table.setFilters}
            chips={[
              { key: "mine", label: "Mine", count: 2 },
              { key: "risk", label: "At risk", count: 1, tone: "warn" },
              { key: "behind", label: "Behind plan", count: 1, tone: "error" },
            ]}
            fields={[
              { key: "owner", label: "Owner", choices: ["Priya Raman", "Tom Alvarez", "Dana Okonjo"] },
              { key: "phase", label: "Phase", choices: ["Phase 1", "Phase 2", "Phase 3"] },
              { key: "sites", label: "Sites" },
            ]}
            right={
              <SavedViews
                views={table.views}
                activeId={table.activeView}
                onSelect={table.selectView}
                onSave={table.saveView}
                onDelete={table.deleteView}
              />
            }
          />
        </div>
      </Card>

      <Grid cols={2}>
        <Part name="BulkActionBar" when="Use it when an action only makes sense on several rows at once.">
          <div className="w-full border border-edge rounded-lg overflow-hidden">
            <BulkActionBar count={3} onClear={() => undefined}>
              <Button variant="secondary" size="sm">Reassign</Button>
            </BulkActionBar>
          </div>
        </Part>
        <Part name="DeltaValue" when="Use it beside a figure that moved, and say which way you want it to go.">
          <DeltaValue value={11} format={(v) => `${v > 0 ? "+" : ""}${v}%`} />
          <DeltaValue value={-18} format={(v) => `${v}%`} />
          <DeltaValue value={-3} higherIsBetter={false} format={(v) => `${v} days`} />
          <DeltaValue value={0} />
        </Part>
        <Part name="RagStatus" when="Use it when the state is judged: on plan, at risk, behind.">
          <RagStatus tone="ok" label="On plan" />
          <RagStatus tone="warn" label="At risk" />
          <RagStatus tone="error" label="Behind plan" />
        </Part>
        <Part name="HeatCell" when="Use it on a column where every row is the same measure on the same scale.">
          <span className="w-16"><HeatCell value={12} min={0} max={100} /></span>
          <span className="w-16"><HeatCell value={48} min={0} max={100} /></span>
          <span className="w-16"><HeatCell value={92} min={0} max={100} /></span>
        </Part>
      </Grid>

      {/* ---- Forms ---- */}
      <Card title="The form parts" right="Every control here is wrapped in a Field.">
        <Form onSubmit={() => setErrors(name.trim() ? [] : [{ field: "Study name", message: "Give the study a name." }])}>
          <div className="flex flex-col gap-4">
            <ValidationSummary items={errors} />

            <FormSection
              title="Who and what"
              description="Use it when a form is long enough that people lose their place."
            >
              <FormRow>
                <Field label="Study name" required hint="Use it when an input needs a label, a hint or an error.">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Atlas" />
                </Field>
                <Field label="Owner" hint="Combobox: use it past about ten options.">
                  <Combobox value={owner} onChange={setOwner} options={OWNERS} />
                </Field>
              </FormRow>
              <FormRow>
                <Field label="Regions" hint="MultiSelect: use it when the list is known and closed.">
                  <MultiSelect value={regions} onChange={setRegions} options={REGIONS} />
                </Field>
                <Field label="Tags" hint="TagInput: use it for free text nobody governs.">
                  <TagInput value={tags} onChange={setTags} />
                </Field>
              </FormRow>
              <Field label="Period covered" hint="DateRangePicker: use it wherever a report has a period.">
                <DateRangePicker value={period} onChange={setPeriod} today={new Date("2026-09-17")} />
              </Field>
            </FormSection>

            <FormSection
              title="How it gets watched"
              description="Use RadioCards when the difference between the choices needs a sentence."
            >
              <Field label="Review cadence">
                <RadioCards
                  value={cadence}
                  onChange={setCadence}
                  columns={3}
                  options={[
                    { value: "monthly", title: "Every month", description: "For studies inside ninety days of a milestone. Noisy on purpose." },
                    { value: "quarterly", title: "Every quarter", description: "The usual choice. One reminder per quarter to the study lead." },
                    { value: "on-change", title: "Only on a change", description: "Silent until enrolment or status moves. Nothing lands in a calendar." },
                  ]}
                />
              </Field>
              <Field label="Flag when enrolment drops below" hint="Slider: use it when roughly right is good enough.">
                <Slider value={threshold} onChange={setThreshold} min={0} max={100} step={5} format={(v) => `${v}%`} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button">Cancel</Button>
                <Button variant="primary" type="submit">Save study</Button>
              </div>
            </FormSection>
          </div>
        </Form>
      </Card>
    </div>
  );
}
