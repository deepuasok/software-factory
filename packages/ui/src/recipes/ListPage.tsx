"use client";

import React from "react";
import {
  Button,
  Card,
  DataTable,
  DeltaValue,
  EmptyState,
  FilterBar,
  HeatCell,
  PageHeader,
  SavedViews,
  StatusPill,
  useTableState,
  type Column,
  type FilterChip,
  type FilterField,
  type Tone,
} from "../index";

/** One row of the list. Swap the fields; keep the shape. */
export type ListPageRow = {
  id: string;
  name: string;
  owner: string;
  category: string;
  status: string;
  statusTone: Tone;
  renewal: string;
  spend: number;
  change: number;
};

const SAMPLE_ROWS: ListPageRow[] = [
  { id: "C-104", name: "Northgate General", owner: "Priya Raman", category: "Imaging", status: "On plan", statusTone: "ok", renewal: "2026-11-30", spend: 412, change: 6 },
  { id: "C-118", name: "Riverside Institute", owner: "Tom Alvarez", category: "Laboratory", status: "At risk", statusTone: "warn", renewal: "2026-10-14", spend: 268, change: -3 },
  { id: "C-122", name: "Harbour Clinic", owner: "Priya Raman", category: "Imaging", status: "Overdue", statusTone: "error", renewal: "2026-09-02", spend: 96, change: -18 },
  { id: "C-131", name: "Lakeside Partners", owner: "Dana Okonjo", category: "Consulting", status: "On plan", statusTone: "ok", renewal: "2027-01-20", spend: 540, change: 11 },
  { id: "C-147", name: "Meridian Labs", owner: "Tom Alvarez", category: "Laboratory", status: "In review", statusTone: "info", renewal: "2026-12-08", spend: 187, change: 0 },
];

const SAMPLE_CHIPS: FilterChip[] = [
  { key: "mine", label: "Mine", count: 2 },
  { key: "at-risk", label: "At risk", count: 1, tone: "warn" },
  { key: "overdue", label: "Overdue", count: 1, tone: "error" },
];

const SAMPLE_FIELDS: FilterField[] = [
  { key: "owner", label: "Owner", choices: ["Priya Raman", "Tom Alvarez", "Dana Okonjo"] },
  { key: "category", label: "Category", choices: ["Imaging", "Laboratory", "Consulting"] },
  { key: "spend", label: "Annual spend" },
];

/**
 * The list page: a heading, the filters, the saved views, and the table.
 *
 * Start here for anything people scan, narrow and act on in bulk. Do not start
 * here for a page that answers one question — that is a readout, and the
 * number belongs at the top instead of a table.
 */
export function ListPage({
  title = "Contracts",
  subtitle = "Sample data. Every figure below is made up so the page reads as a working tool.",
  rows = SAMPLE_ROWS,
  chips = SAMPLE_CHIPS,
  fields = SAMPLE_FIELDS,
}: {
  title?: string;
  subtitle?: string;
  rows?: ListPageRow[];
  chips?: FilterChip[];
  fields?: FilterField[];
}) {
  const table = useTableState();
  const shown = rows;

  const spends = rows.map((r) => r.spend);
  const low = Math.min(...spends, 0);
  const high = Math.max(...spends, 1);

  const columns: Column<ListPageRow>[] = [
    {
      key: "name",
      header: "Contract",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <span className="block">
          <span className="font-medium">{r.name}</span>
          <span className="block text-[11px] text-muted">
            {r.id} · {r.category}
          </span>
        </span>
      ),
    },
    { key: "owner", header: "Owner", sortable: true, sortValue: (r) => r.owner, hideable: true, render: (r) => r.owner },
    { key: "status", header: "Status", render: (r) => <StatusPill label={r.status} tone={r.statusTone} /> },
    {
      key: "renewal",
      header: "Renews",
      align: "right",
      sortable: true,
      sortValue: (r) => r.renewal,
      render: (r) => r.renewal,
    },
    {
      key: "spend",
      header: "Annual spend",
      align: "right",
      sortable: true,
      sortValue: (r) => r.spend,
      render: (r) => <HeatCell value={r.spend} min={low} max={high} format={(v) => `$${v}k`} />,
    },
    {
      key: "change",
      header: "Change on last year",
      align: "right",
      hideable: true,
      sortable: true,
      sortValue: (r) => r.change,
      render: (r) => <DeltaValue value={r.change} higherIsBetter={false} format={(v) => `${v > 0 ? "+" : ""}${v}%`} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary">Export to spreadsheet</Button>
            <Button variant="primary">Add a contract</Button>
          </>
        }
      />

      <FilterBar
        value={table.filters}
        onChange={table.setFilters}
        chips={chips}
        fields={fields}
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

      {shown.length === 0 ? (
        <EmptyState
          title="No contracts yet"
          body="Contracts appear here once one is added or imported from the finance export."
          action={<Button variant="primary">Add a contract</Button>}
        />
      ) : (
        <Card padded={false}>
          <DataTable
            rows={shown}
            columns={columns}
            rowKey={(r) => r.id}
            sort={table.sort}
            onSortChange={table.setSort}
            selectable
            selected={table.selected}
            onSelectionChange={table.setSelected}
            columnChooser
            stickyHeader
            maxHeight={420}
            bulkActions={
              <>
                <Button variant="secondary" size="sm">Reassign owner</Button>
                <Button variant="secondary" size="sm">Send for review</Button>
              </>
            }
            rowActions={(r) => (
              <>
                <Button variant="ghost" size="sm">Open {r.id}</Button>
                <Button variant="ghost" size="sm">Duplicate</Button>
              </>
            )}
            renderExpanded={(r) => (
              <span className="block">
                <span className="font-semibold">{r.name}</span> renews on {r.renewal} and is owned by{" "}
                {r.owner}. Last review noted no change to scope.
              </span>
            )}
          />
        </Card>
      )}
    </div>
  );
}
