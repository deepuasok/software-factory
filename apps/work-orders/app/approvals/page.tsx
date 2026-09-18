"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityFeed, ApprovalActions, type ApprovalDecision, AppShell, Badge, Button,
  CommentThread, DetailHeader, EmptyState, PageHeader, Queue, recordChange, Segmented,
  StatusStepper,
} from "@factory/ui";
import { WorkOrderNav } from "../_nav";
import { seedWorkOrders } from "@/lib/data";
import { currentUser } from "@/lib/user";
import { HIGH_COST_THRESHOLD_K } from "@/lib/model";
import type { Status, WorkOrder } from "@/lib/types";

const STEPS = ["Submitted", "Triaged", "Approved", "In progress", "Done"];
const STEP_FOR: Record<Status, number> = { new: 0, triaged: 1, approved: 2, "in progress": 3, done: 4, rejected: 1 };
const NEXT_STATUS: Record<string, Status> = { triaged: "approved", approved: "in progress", "in progress": "done" };

export default function ApprovalInbox() {
  const [orders, setOrders] = useState<WorkOrder[]>(() =>
    seedWorkOrders().filter((o) => o.estimatedCostK > HIGH_COST_THRESHOLD_K && o.status === "triaged"),
  );
  const [view, setView] = useState<"pending" | "decided">("pending");
  const user = currentUser();
  const pendingCount = orders.filter((o) => o.status === "triaged").length;
  const decidedCount = orders.length - pendingCount;
  const shown = orders.filter((o) => (view === "pending" ? o.status === "triaged" : o.status !== "triaged"));

  function decide(id: string, next: { decision: ApprovalDecision; comment: string }) {
    setOrders((cur) =>
      cur.map((o) => {
        if (o.id !== id) return o;
        const fromStatus = o.status;
        let toStatus: Status = fromStatus;
        let verb: "approved" | "rejected" | "commented" = "commented";
        if (next.decision === "approve") {
          toStatus = NEXT_STATUS[fromStatus] ?? fromStatus;
          verb = "approved";
        } else if (next.decision === "reject") {
          toStatus = "rejected";
          verb = "rejected";
        }
        const entry = recordChange({ actor: user.name, verb, field: "status", from: fromStatus, to: toStatus });
        const comments =
          next.comment.trim().length > 0
            ? [...o.comments, { id: `${o.id}-a${o.comments.length + 1}`, author: user.name, body: next.comment, at: new Date().toISOString() }]
            : o.comments;
        return { ...o, status: toStatus, comments, history: [...o.history, entry] };
      }),
    );
  }

  return (
    <AppShell brand="ACME" product="Work Order Triage" breadcrumb="Approvals" topBarRight={<WorkOrderNav />}>
      <PageHeader
        title="Approval inbox"
        subtitle={`Triaged work orders estimated above $${HIGH_COST_THRESHOLD_K}k. Rejecting or sending one back requires a comment.`}
        meta={<Badge tone={pendingCount > 0 ? "warn" : "ok"}>{pendingCount} awaiting a decision</Badge>}
      />
      {orders.length === 0 ? (
        <EmptyState
          title="Nothing above the cost threshold"
          body={`No triaged work order is currently estimated above $${HIGH_COST_THRESHOLD_K}k.`}
          action={<Link href="/triage"><Button variant="primary">Go to triage</Button></Link>}
        />
      ) : (
        <>
          <Segmented
            className="mb-3"
            value={view}
            onChange={setView}
            options={[
              { value: "pending", label: "Pending", count: pendingCount },
              { value: "decided", label: "Decided", count: decidedCount },
            ]}
          />
          <Queue
            items={shown}
            itemKey={(o) => o.id}
            countLabel={`${shown.length} of ${orders.length} shown`}
          renderRow={(o, _i, selected) => (
            <div
              className={
                "flex items-center gap-2 px-3 py-2.5 border-b border-edge cursor-pointer transition-colors " +
                (selected ? "bg-selected" : "hover:bg-surface-grey")
              }
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-secondary truncate">{o.title}</div>
                <div className="text-[11px] text-muted truncate">{o.building} · ${o.estimatedCostK}k estimated</div>
              </div>
            </div>
          )}
          renderDetail={(o) => (
            <div className="flex flex-col gap-4 h-full">
              <DetailHeader
                title={o.title}
                subtitle={`${o.building} · ${o.asset} · $${o.estimatedCostK}k estimated`}
                status={{ label: o.status, tone: o.status === "rejected" ? "error" : o.status === "done" ? "ok" : "warn" }}
                owner={o.owner}
              />
              <StatusStepper steps={STEPS.map((label) => ({ label }))} currentIndex={STEP_FOR[o.status]} />
              {o.status === "rejected" && (
                <p className="text-[12px] text-error">Rejected. The reason is in the comments below.</p>
              )}
              <div>
                <div className="cx-label mb-1.5">Comments</div>
                <CommentThread
                  comments={o.comments}
                  currentUser={user.name}
                  emptyState="No comment yet. Rejecting or sending this back will add one."
                />
              </div>
              <div>
                <div className="cx-label mb-1.5">Activity</div>
                <ActivityFeed entries={o.history} />
              </div>
              <div className="flex-1" />
              <ApprovalActions disabled={o.status === "done" || o.status === "rejected"} onDecide={(next) => decide(o.id, next)} />
            </div>
          )}
            emptyState={
              view === "pending" ? (
                <EmptyState
                  title="Nothing pending"
                  body="Every high-cost order has a decision. The decided tab has the trail."
                  action={<Button size="sm" onClick={() => setView("decided")}>See what was decided</Button>}
                />
              ) : (
                <EmptyState
                  title="No decisions logged yet"
                  body="Approve or reject a pending order and it moves here with its comment."
                  action={<Button size="sm" onClick={() => setView("pending")}>Back to pending</Button>}
                />
              )
            }
          />
        </>
      )}
    </AppShell>
  );
}
