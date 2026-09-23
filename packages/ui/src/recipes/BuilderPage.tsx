"use client";

import { useMemo, useState } from "react";
import {
  AppShell,
  AutosaveChip,
  Button,
  Card,
  InlineEdit,
  ListRow,
  SearchInput,
  SplitPane,
  StatRow,
  StatTile,
  TrendChart,
  type AutosaveState,
} from "../index";

export type BuilderItem = {
  id: string;
  name: string;
  detail: string;
  value: number;
};

const SAMPLE_ITEMS: BuilderItem[] = [
  { id: "R-101", name: "Northgate General", detail: "Imaging · Priya Raman", value: 412 },
  { id: "R-108", name: "Riverside Institute", detail: "Laboratory · Tom Alvarez", value: 268 },
  { id: "R-114", name: "Harbour Clinic", detail: "Imaging · Priya Raman", value: 96 },
  { id: "R-119", name: "Lakeside Partners", detail: "Consulting · Dana Okonjo", value: 540 },
  { id: "R-123", name: "Meridian Labs", detail: "Laboratory · Tom Alvarez", value: 187 },
  { id: "R-131", name: "Summit Diagnostics", detail: "Imaging · Dana Okonjo", value: 155 },
];

const TARGET = 1400;

function money(n: number): string {
  return `$${n.toFixed(0)}k`;
}

function trendFromItems(items: BuilderItem[]) {
  // Cosmetic release curve — spreads the current total evenly over six
  // months so the right rail always has something to draw, not real history.
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return months.map((month, i) => ({
    month,
    committed: Math.round(total * (0.6 + i * 0.08)),
    planned: Math.round(total * ((i + 1) / months.length)),
  }));
}

/**
 * A builder screen: a searchable rail of records on the left, each with a
 * figure you can nudge in place, and the consequence of every change on the
 * right — stat tiles and a trend redraw the instant a value changes.
 *
 * Model any "edit a plan and watch the total move" screen on this rather than
 * building a form-and-submit page for it (see `docs/PRINCIPLES.md` §3-4).
 * Use `width="full"`, matching every other builder screen in the shop.
 */
export function BuilderPage({
  brand = "ACME",
  product = "Builder",
  items: initialItems = SAMPLE_ITEMS,
  target = TARGET,
}: {
  brand?: string;
  product?: string;
  items?: BuilderItem[];
  target?: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [autosave, setAutosave] = useState<AutosaveState>("saved");
  const [savedAt, setSavedAt] = useState(new Date());

  const shown = items.filter((i) => {
    const q = query.trim().toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.detail.toLowerCase().includes(q);
  });

  function setValue(id: string, next: number) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, value: Math.max(0, Math.round(next)) } : i)));
    setAutosave("unsaved");
  }

  function save() {
    setAutosave("saving");
    setTimeout(() => {
      setAutosave("saved");
      setSavedAt(new Date());
    }, 500);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + i.value, 0), [items]);
  const over = total > target;
  const trend = useMemo(() => trendFromItems(items), [items]);

  return (
    <AppShell
      brand={brand}
      product={product}
      width="full"
      topBarRight={
        <>
          <AutosaveChip state={autosave} savedAt={savedAt} />
          <Button variant="primary" size="sm" onClick={save} disabled={autosave === "saved"}>
            Save
          </Button>
        </>
      }
    >
      <SplitPane
        railWidth={340}
        rail={
          <>
            <div className="p-3 border-b border-edge sticky top-0 bg-white z-10">
              <SearchInput small placeholder="Search records" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {shown.map((i) => (
              <ListRow
                key={i.id}
                title={i.name}
                subtitle={i.detail}
                right={
                  <InlineEdit
                    value={i.value}
                    onCommit={(v) => setValue(i.id, v)}
                    format={(v) => money(v)}
                    step={10}
                    className="text-[12px] font-semibold"
                  />
                }
              />
            ))}
          </>
        }
      >
        <StatRow className="mb-4">
          <StatTile label="Total" value={money(total)} tone={over ? "error" : "ok"} note={over ? "over target" : "on target"} />
          <StatTile label="Target" value={money(target)} />
          <StatTile
            label="Against target"
            value={over ? `${money(total - target)} over` : `${money(target - total)} under`}
            tone={over ? "error" : "ok"}
          />
          <StatTile label="Records" value={items.length} note={`${shown.length} shown`} />
        </StatRow>

        <Card title="How the total gets there" right="cumulative, next 6 months">
          <TrendChart
            data={trend}
            xKey="month"
            series={[
              { key: "committed", label: "If nothing changes", area: true },
              { key: "planned", label: "This plan" },
            ]}
            height={240}
            valueFormat={money}
          />
        </Card>
      </SplitPane>
    </AppShell>
  );
}
