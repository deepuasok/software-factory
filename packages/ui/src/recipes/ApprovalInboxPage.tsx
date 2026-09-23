"use client";

import { useState } from "react";
import {
  ApprovalActions,
  type ApprovalDecision,
  DetailHeader,
  PageHeader,
  Queue,
  StatusStepper,
  StickyActionBar,
  type Tone,
} from "../index";

const STEPS = ["Submitted", "Manager review", "Compliance review", "Approved"];

/** One approval request. Swap the fields; keep the shape. */
export type ApprovalInboxRow = {
  id: string;
  title: string;
  requester: string;
  submittedDate: string;
  currentStepIndex: number;
  status: string;
  statusTone: Tone;
  log: { decision: ApprovalDecision; comment: string }[];
};

const SAMPLE_ROWS: ApprovalInboxRow[] = [
  { id: "A-201", title: "Budget increase — Northgate General", requester: "Priya Raman", submittedDate: "2026-09-10", currentStepIndex: 1, status: "Pending", statusTone: "warn", log: [] },
  { id: "A-202", title: "New vendor — Meridian Labs", requester: "Tom Alvarez", submittedDate: "2026-09-08", currentStepIndex: 2, status: "Pending", statusTone: "warn", log: [] },
  { id: "A-203", title: "Site closeout — Harbour Clinic", requester: "Dana Okonjo", submittedDate: "2026-09-14", currentStepIndex: 0, status: "Pending", statusTone: "warn", log: [] },
];

/**
 * An approval inbox: a queue of pending requests, each with its lifecycle
 * shown as a stepper and a decision pinned to the bottom of the pane.
 *
 * Start here for any "sign off on this" screen — budget changes, vendor
 * approvals, closeouts. Not for a queue where the outcome is a disposition
 * rather than a yes/no decision — that is `ReviewQueuePage`.
 */
export function ApprovalInboxPage({
  title = "Approval inbox",
  subtitle = "Sample data. Every request below is made up so the page reads as a working tool.",
  rows: initialRows = SAMPLE_ROWS,
}: {
  title?: string;
  subtitle?: string;
  rows?: ApprovalInboxRow[];
}) {
  const [rows, setRows] = useState(initialRows);

  function decide(id: string, next: { decision: ApprovalDecision; comment: string }) {
    setRows((cur) =>
      cur.map((r) => {
        if (r.id !== id) return r;
        if (next.decision === "approve") {
          const atEnd = r.currentStepIndex >= STEPS.length - 1;
          return {
            ...r,
            currentStepIndex: atEnd ? r.currentStepIndex : r.currentStepIndex + 1,
            status: atEnd ? "Approved" : "Pending",
            statusTone: atEnd ? "ok" : "warn",
            log: [...r.log, next],
          };
        }
        return {
          ...r,
          status: next.decision === "reject" ? "Rejected" : "Changes requested",
          statusTone: next.decision === "reject" ? "error" : "warn",
          log: [...r.log, next],
        };
      }),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={subtitle} />
      <Queue
        items={rows}
        itemKey={(r) => r.id}
        countLabel={`${rows.length} pending`}
        renderRow={(row, _i, selected) => (
          <div
            className={
              "flex items-center gap-2 px-3 py-2.5 border-b border-edge cursor-pointer transition-colors " +
              (selected ? "bg-selected" : "hover:bg-surface-grey")
            }
          >
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium text-secondary truncate">{row.title}</div>
              <div className="text-[11px] text-muted truncate">{row.requester} · {row.submittedDate}</div>
            </div>
          </div>
        )}
        renderDetail={(row) => (
          <div className="flex flex-col gap-4 h-full">
            <DetailHeader
              title={row.title}
              subtitle={`Submitted ${row.submittedDate}`}
              status={{ label: row.status, tone: row.statusTone }}
              owner={row.requester}
            />
            <StatusStepper steps={STEPS.map((label) => ({ label }))} currentIndex={row.currentStepIndex} />
            <div className="flex-1" />
            <StickyActionBar summary={`${row.log.length} decision${row.log.length === 1 ? "" : "s"} logged`}>
              <ApprovalActions
                disabled={row.status === "Approved"}
                onDecide={(next) => decide(row.id, next)}
              />
            </StickyActionBar>
          </div>
        )}
        emptyState={<div className="p-6 text-[12px] text-muted">Nothing pending.</div>}
      />
    </div>
  );
}
