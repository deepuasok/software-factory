"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  DetailHeader,
  DispositionControl,
  Drawer,
  DueDateBadge,
  PageHeader,
  PriorityBadge,
  Queue,
  ReviewProgress,
  type Column,
  type Disposition,
  type Tone,
} from "../index";

/** One record moving through the review queue. Swap the fields; keep the shape. */
export type ReviewQueueRow = {
  id: string;
  name: string;
  category: string;
  reviewer: string;
  priority: 1 | 2 | 3 | 4;
  dueDate: string;
  status: string;
  statusTone: Tone;
  disposition: Disposition | null;
  reason: string;
};

const SAMPLE_ROWS: ReviewQueueRow[] = [
  { id: "R-101", name: "Northgate General", category: "Site feasibility", reviewer: "Priya Raman", priority: 1, dueDate: "2026-09-19", status: "In review", statusTone: "info", disposition: null, reason: "" },
  { id: "R-102", name: "Riverside Institute", category: "Site feasibility", reviewer: "Tom Alvarez", priority: 2, dueDate: "2026-09-15", status: "In review", statusTone: "info", disposition: "include", reason: "" },
  { id: "R-103", name: "Harbour Clinic", category: "Vendor renewal", reviewer: "Priya Raman", priority: 3, dueDate: "2026-09-22", status: "In review", statusTone: "info", disposition: null, reason: "" },
  { id: "R-104", name: "Lakeside Partners", category: "Vendor renewal", reviewer: "Dana Okonjo", priority: 4, dueDate: "2026-10-01", status: "In review", statusTone: "info", disposition: null, reason: "" },
  { id: "R-105", name: "Meridian Labs", category: "Site feasibility", reviewer: "Tom Alvarez", priority: 2, dueDate: "2026-09-18", status: "In review", statusTone: "info", disposition: "exclude", reason: "Capacity constraint" },
];

const REASONS = ["Capacity constraint", "Data quality gap", "Duplicate record", "Out of scope", "Needs more evidence"];

const HISTORY_COLUMNS: Column<{ date: string; actor: string; note: string }>[] = [
  { key: "date", header: "Date", width: 110, render: (r) => <span className="cx-num">{r.date}</span> },
  { key: "actor", header: "Actor", render: (r) => r.actor },
  { key: "note", header: "Note", render: (r) => r.note },
];

const SAMPLE_HISTORY = [
  { date: "2026-09-10", actor: "System", note: "Entered the review queue." },
  { date: "2026-09-12", actor: "Priya Raman", note: "Left a comment on enrollment pace." },
];

/**
 * A review queue: work through a list of records one at a time, disposing of
 * each as Include, Exclude or Hold, with a full record available in a Drawer.
 *
 * Start here for any "clear the backlog" screen — feasibility review,
 * intake triage. Not for a page that only ever shows one record.
 */
export function ReviewQueuePage({
  title = "Site feasibility review",
  subtitle = "Sample data. Every row below is made up so the page reads as a working tool.",
  rows: initialRows = SAMPLE_ROWS,
}: {
  title?: string;
  subtitle?: string;
  rows?: ReviewQueueRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const reviewed = rows.filter((r) => r.disposition !== null).length;
  const drawerRow = rows.find((r) => r.id === drawerId) ?? null;

  function setDisposition(id: string, next: { disposition: Disposition; reason: string }) {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...next } : r)));
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        meta={<ReviewProgress reviewed={reviewed} total={rows.length} className="w-56" />}
      />
      <Queue
        items={rows}
        itemKey={(r) => r.id}
        countLabel={`${rows.length} in queue`}
        renderRow={(row, _i, selected) => (
          <div
            className={
              "flex items-center gap-2 px-3 py-2.5 border-b border-edge cursor-pointer transition-colors " +
              (selected ? "bg-selected" : "hover:bg-surface-grey")
            }
          >
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium text-secondary truncate">{row.name}</div>
              <div className="text-[11px] text-muted truncate">{row.category}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <PriorityBadge priority={row.priority} />
              <DueDateBadge date={row.dueDate} />
            </div>
          </div>
        )}
        renderDetail={(row) => (
          <div className="flex flex-col gap-4">
            <DetailHeader
              title={row.name}
              subtitle={row.category}
              status={{ label: row.status, tone: row.statusTone }}
              owner={row.reviewer}
              facts={[
                { label: `P${row.priority}`, tone: "neutral" },
                { label: row.dueDate, tone: "neutral" },
              ]}
              actions={
                <Button variant="ghost" size="sm" onClick={() => setDrawerId(row.id)}>
                  View full record
                </Button>
              }
            />
            <div className="rounded-lg border border-dashed border-border-idle px-3 py-8 text-center text-[12px] text-muted">
              Explain panel — model reasoning for this record renders here.
            </div>
            <DispositionControl
              disposition={row.disposition}
              reason={row.reason}
              reasons={REASONS}
              onChange={(next) => setDisposition(row.id, next)}
            />
          </div>
        )}
        emptyState={<div className="p-6 text-[12px] text-muted">Nothing in the queue.</div>}
      />

      <Drawer
        open={drawerRow !== null}
        onClose={() => setDrawerId(null)}
        title={drawerRow?.name ?? ""}
        subtitle={drawerRow?.category}
        footer={
          drawerRow && (
            <Badge tone={drawerRow.disposition ? "ok" : "neutral"}>
              {drawerRow.disposition ? `Disposed: ${drawerRow.disposition}` : "Not yet disposed"}
            </Badge>
          )
        }
      >
        {drawerRow && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-dashed border-border-idle px-3 py-8 text-center text-[12px] text-muted">
              Explain panel — model reasoning for this record renders here.
            </div>
            <div>
              <div className="cx-label mb-1.5">History</div>
              <DataTable columns={HISTORY_COLUMNS} rows={SAMPLE_HISTORY} rowKey={(r) => r.date} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
