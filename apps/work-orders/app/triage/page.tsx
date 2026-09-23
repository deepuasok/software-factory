"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityFeed, AppShell, Badge, Button, CommentThread, DetailHeader, DispositionControl,
  Drawer, DueDateBadge, EmptyState, ExplainPanel, OverrideControl, PageHeader, PriorityBadge,
  Queue, recordChange, ReviewProgress, SearchInput, SourceBadge, Toolbar, type Tone,
} from "@factory/ui";
import { WorkOrderNav } from "../_nav";
import { seedWorkOrders } from "@/lib/data";
import { currentUser } from "@/lib/user";
import {
  dueDateFromSla, effectiveUrgency, TODAY, urgencyContributions,
} from "@/lib/model";
import type { Disposition, WorkOrder } from "@/lib/types";

const REASONS = [
  "Waiting on a part",
  "Needs a specialist vendor",
  "Duplicate of another order",
  "Low impact, can wait",
  "Building access restricted",
];

const DISPOSITION_TONE: Record<Disposition, Tone> = { include: "ok", exclude: "error", hold: "warn" };

/** "Jan 4, 2:20 PM" — short enough to sit on a queue row. */
function stamp(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

/** P1 for a criticality-4 asset already past its own SLA math, down to P4. */
function priorityFor(urgency: number): 1 | 2 | 3 | 4 {
  if (urgency >= 75) return 1;
  if (urgency >= 55) return 2;
  if (urgency >= 35) return 3;
  return 4;
}

export default function ReviewQueue() {
  const [orders, setOrders] = useState<WorkOrder[]>(() => seedWorkOrders().filter((o) => o.status === "new" || o.status === "triaged"));
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const user = currentUser();

  const reviewed = orders.filter((o) => o.disposition !== undefined).length;
  const q = query.trim().toLowerCase();
  const shown = q ? orders.filter((o) => [o.title, o.building, o.asset].some((f) => f.toLowerCase().includes(q))) : orders;
  const drawerOrder = orders.find((o) => o.id === drawerId) ?? null;

  function updateOrder(id: string, patch: Partial<WorkOrder>) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function setDisposition(id: string, next: { disposition: Disposition; reason: string }) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const entry = recordChange({
      actor: user.name,
      verb: "updated",
      field: "disposition",
      from: order.disposition ?? "undecided",
      to: next.disposition,
    });
    updateOrder(id, {
      disposition: next.disposition,
      dispositionReason: next.reason,
      dispositionBy: user.name,
      dispositionAt: new Date().toISOString(),
      status: next.disposition === "include" && order.status === "new" ? "triaged" : order.status,
      history: [...order.history, entry],
    });
  }

  function saveOverride(
    id: string,
    override: { field: string; modelValue: string; humanValue: string; reasonCode: string; reasonText: string },
  ) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const value = Math.max(0, Math.min(100, Math.round(Number(override.humanValue))));
    if (Number.isNaN(value)) return;
    const entry = recordChange({
      actor: user.name,
      verb: "overrode",
      field: "urgency score",
      from: order.urgencyScore,
      to: value,
    });
    updateOrder(id, {
      humanUrgencyOverride: {
        value,
        reasonCode: override.reasonCode,
        reasonText: override.reasonText,
        at: new Date().toISOString(),
        actor: user.name,
      },
      history: [...order.history, entry],
    });
  }

  function addComment(id: string, body: string) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    updateOrder(id, {
      comments: [
        ...order.comments,
        { id: `${id}-${order.comments.length + 1}`, author: user.name, body, at: new Date().toISOString() },
      ],
    });
  }

  function resolveComment(id: string, commentId: string, resolved: boolean) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    updateOrder(id, {
      comments: order.comments.map((c) => (c.id === commentId ? { ...c, resolved } : c)),
    });
  }

  return (
    <AppShell brand="ACME" product="Work Order Triage" breadcrumb="Triage" topBarRight={<WorkOrderNav />}>
      <PageHeader
        title="Review queue"
        subtitle="New and triaged work orders. Decide whether each gets scheduled this week, deferred, or held for more information."
        meta={<ReviewProgress reviewed={reviewed} total={orders.length} className="w-56" />}
      />
      <Toolbar className="mb-3">
        <SearchInput
          small
          className="w-64"
          placeholder="Search title, building, asset"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Toolbar>
      <Queue
        items={shown}
        itemKey={(o) => o.id}
        railWidth={360}
        countLabel={`${shown.length} of ${orders.length} in queue`}
        renderRow={(o, _i, selected) => (
          <div
            className={
              "flex items-center gap-2 px-3 py-2.5 border-b border-edge cursor-pointer transition-colors " +
              (selected ? "bg-selected" : "hover:bg-surface-grey")
            }
          >
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium text-secondary truncate">{o.title}</div>
              <div className="text-[11px] text-muted truncate">{o.building} · {o.asset}</div>
              {o.disposition ? (
                <div className="mt-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge tone={DISPOSITION_TONE[o.disposition]}>{o.disposition}</Badge>
                    <span className="text-[10.5px] text-muted truncate">
                      {o.dispositionReason ?? (o.disposition === "include" ? "no reason needed" : "no reason given")}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-muted truncate">
                    {o.dispositionBy ?? "unknown reviewer"}
                    {o.dispositionAt ? ` · ${stamp(o.dispositionAt)}` : " · time not recorded"}
                  </div>
                </div>
              ) : (
                <div className="text-[10.5px] text-muted mt-1">Not yet decided</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <PriorityBadge priority={priorityFor(effectiveUrgency(o))} />
              <DueDateBadge date={dueDateFromSla(o)} now={TODAY} />
            </div>
          </div>
        )}
        renderDetail={(o) => (
          <div className="flex flex-col gap-4">
            <DetailHeader
              title={o.title}
              subtitle={`${o.building} · ${o.asset} · reported: ${o.reportedSymptom}`}
              status={{ label: o.status, tone: o.status === "new" ? "info" : "warn" }}
              owner={o.owner}
              facts={[
                { label: `Criticality ${o.assetCriticality}/4`, tone: "neutral" },
                { label: `SLA ${o.slaHours}h`, tone: "neutral" },
                { label: `Est. $${o.estimatedCostK}k`, tone: "neutral" },
              ]}
              actions={
                <Button variant="ghost" size="sm" onClick={() => setDrawerId(o.id)}>
                  View full record
                </Button>
              }
            />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="cx-label">Urgency score</span>
                <SourceBadge
                  sourceSystem={o.humanUrgencyOverride ? "Facilities lead" : "Urgency model"}
                  modelVersion={o.humanUrgencyOverride ? undefined : "v1.2"}
                  confidence={o.humanUrgencyOverride ? undefined : 0.82}
                />
              </div>
              <div className="text-[24px] font-bold cx-num text-secondary leading-tight mb-1">
                {effectiveUrgency(o)} out of 100
              </div>
              {o.humanUrgencyOverride && (
                <p className="text-[11.5px] text-warn mb-2">
                  Overridden to {o.humanUrgencyOverride.value} by {o.humanUrgencyOverride.actor}: {o.humanUrgencyOverride.reasonText}
                </p>
              )}
              <ExplainPanel
                title={o.humanUrgencyOverride ? `The model scored this ${o.urgencyScore} out of 100` : "How the model got there"}
                summary="Weighted from how far past the SLA clock the order is (the full 50 points at four times the clock), the asset's criticality, and the reported symptom's severity."
                contributions={urgencyContributions(o)}
              />
              <OverrideControl
                field="urgency score"
                modelValue={String(o.urgencyScore)}
                onOverride={(next) => saveOverride(o.id, next)}
                className="mt-2"
              />
            </div>

            <div>
              <div className="cx-label mb-1.5">Disposition</div>
              <DispositionControl
                disposition={o.disposition ?? null}
                reason={o.dispositionReason ?? ""}
                reasons={REASONS}
                onChange={(next) => setDisposition(o.id, next)}
              />
            </div>

            <div>
              <div className="cx-label mb-1.5">Comments</div>
              <CommentThread
                comments={o.comments}
                onAdd={(body) => addComment(o.id, body)}
                onResolve={(id, resolved) => resolveComment(o.id, id, resolved)}
                currentUser={user.name}
              />
            </div>
          </div>
        )}
        emptyState={
          q ? (
            <EmptyState
              title="No work order matches that search"
              body={`Nothing in the queue mentions "${query}".`}
              action={<Button size="sm" onClick={() => setQuery("")}>Clear the search</Button>}
            />
          ) : (
            <EmptyState
              title="Nothing left to triage"
              body="Every new order has a disposition. The board shows what happens to them next."
              action={<Link href="/board"><Button size="sm">Open the board</Button></Link>}
            />
          )
        }
      />

      <Drawer
        open={drawerOrder !== null}
        onClose={() => setDrawerId(null)}
        title={drawerOrder?.title ?? ""}
        subtitle={drawerOrder ? `${drawerOrder.building} · ${drawerOrder.asset}` : undefined}
        footer={drawerOrder && <Badge tone={drawerOrder.disposition ? "ok" : "neutral"}>{drawerOrder.disposition ? `Disposed: ${drawerOrder.disposition}` : "Not yet disposed"}</Badge>}
      >
        {drawerOrder && (
          <div className="flex flex-col gap-4">
            <p className="text-[12.5px] text-secondary leading-relaxed">{drawerOrder.reportedSymptom}</p>
            <div>
              <div className="cx-label mb-1.5">Activity</div>
              <ActivityFeed entries={drawerOrder.history} />
            </div>
          </div>
        )}
      </Drawer>
    </AppShell>
  );
}
