"use client";

import { useMemo, useState } from "react";
import { AppShell, AssigneePicker, Badge, DueDateBadge, KanbanBoard, PageHeader, PriorityBadge, recordChange, type ProvenanceUser } from "@factory/ui";
import { WorkOrderNav } from "../_nav";
import { seedWorkOrders } from "@/lib/data";
import { currentUser } from "@/lib/user";
import { dueDateFromSla, effectiveUrgency, TODAY } from "@/lib/model";
import type { Status, WorkOrder } from "@/lib/types";

const COLUMN_DEFS: { key: Status; label: string }[] = [
  { key: "new", label: "New" },
  { key: "triaged", label: "Triaged" },
  { key: "approved", label: "Approved" },
  { key: "in progress", label: "In progress" },
  { key: "done", label: "Done" },
  { key: "rejected", label: "Rejected" },
];

function priorityFor(urgency: number): 1 | 2 | 3 | 4 {
  if (urgency >= 75) return 1;
  if (urgency >= 55) return 2;
  if (urgency >= 35) return 3;
  return 4;
}

export default function Board() {
  const [orders, setOrders] = useState<WorkOrder[]>(seedWorkOrders);
  const user = currentUser();

  const owners: ProvenanceUser[] = useMemo(
    () => [...new Set(orders.map((o) => o.owner))].sort().map((name) => ({ id: name, name })),
    [orders],
  );

  const columns = COLUMN_DEFS.map((c) => ({ ...c, cards: orders.filter((o) => o.status === c.key) }));

  function move(id: string, toColumn: string) {
    setOrders((cur) =>
      cur.map((o) => {
        if (o.id !== id || o.status === toColumn) return o;
        const entry = recordChange({ actor: user.name, verb: "updated", field: "status", from: o.status, to: toColumn });
        return { ...o, status: toColumn as Status, history: [...o.history, entry] };
      }),
    );
  }

  function assign(id: string, ownerId: string | null) {
    setOrders((cur) =>
      cur.map((o) => {
        if (o.id !== id || !ownerId || o.owner === ownerId) return o;
        const entry = recordChange({ actor: user.name, verb: "updated", field: "owner", from: o.owner, to: ownerId });
        return { ...o, owner: ownerId, history: [...o.history, entry] };
      }),
    );
  }

  return (
    <AppShell brand="ACME" product="Work Order Triage" breadcrumb="Board" topBarRight={<WorkOrderNav />}>
      <PageHeader
        title="Work order board"
        subtitle="Every open and closed work order, by status. Drag a card to move it, or focus one and press the left or right arrow key. Every move is logged."
      />
      <KanbanBoard
        columns={columns}
        cardId={(o) => o.id}
        onMove={move}
        renderCard={(o) => (
          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-medium text-secondary leading-snug">{o.title}</div>
            <div className="text-[10px] text-muted">{o.building} · {o.asset}</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <PriorityBadge priority={priorityFor(effectiveUrgency(o))} />
              {o.status === "done" || o.status === "rejected" ? (
                <Badge tone="neutral">
                  closed {o.closedOn ? new Date(o.closedOn).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "date unknown"}
                </Badge>
              ) : (
                <DueDateBadge date={dueDateFromSla(o)} now={TODAY} />
              )}
            </div>
            <AssigneePicker
              value={o.owner}
              onChange={(v) => assign(o.id, v)}
              users={owners}
              className="w-full"
            />
          </div>
        )}
      />
    </AppShell>
  );
}
