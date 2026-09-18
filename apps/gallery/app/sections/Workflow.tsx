"use client";

import { useState } from "react";
import {
  ApprovalActions,
  Card,
  Checklist,
  DetailHeader,
  DispositionControl,
  Drawer,
  DueDateBadge,
  Grid,
  KanbanBoard,
  PriorityBadge,
  Queue,
  ReviewProgress,
  StatusStepper,
  StickyActionBar,
  type ApprovalDecision,
  type Disposition,
} from "@factory/ui";

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

type MiniItem = { id: string; name: string; category: string; priority: 1 | 2 | 3 | 4; dueDate: string; disposition: Disposition | null; reason: string };

const MINI_QUEUE: MiniItem[] = [
  { id: "R-1", name: "Northgate General", category: "Site feasibility", priority: 1, dueDate: "2026-09-19", disposition: null, reason: "" },
  { id: "R-2", name: "Riverside Institute", category: "Site feasibility", priority: 2, dueDate: "2026-09-15", disposition: "include", reason: "" },
  { id: "R-3", name: "Harbour Clinic", category: "Vendor renewal", priority: 3, dueDate: "2026-09-10", disposition: null, reason: "" },
];

const REASONS = ["Capacity constraint", "Data quality gap", "Duplicate record"];

const CHECKLIST_ITEMS = [
  { id: "c1", label: "Confirm site contact", done: true },
  { id: "c2", label: "Verify enrollment history", done: true },
  { id: "c3", label: "Reviewer sign-off", done: false },
];

type BoardCard = { id: string; title: string; priority: 1 | 2 | 3 | 4; dueDate: string; column: string };

const BOARD_COLUMNS = [
  { key: "backlog", label: "Backlog" },
  { key: "in-progress", label: "In progress" },
  { key: "done", label: "Done" },
];

const BOARD_CARDS: BoardCard[] = [
  { id: "K-1", title: "Confirm Tier 1 list", priority: 1, dueDate: "2026-09-19", column: "in-progress" },
  { id: "K-2", title: "Vendor redline", priority: 2, dueDate: "2026-09-25", column: "backlog" },
  { id: "K-3", title: "Closeout paperwork", priority: 4, dueDate: "2026-09-08", column: "done" },
];

/**
 * Workflow and queue — every part built for moving one record at a time
 * through a review, an approval or a board, side by side with a caption.
 */
export function WorkflowSection() {
  const [items, setItems] = useState(MINI_QUEUE);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [stepIndex, setStepIndex] = useState(1);
  const [decisions, setDecisions] = useState<{ decision: ApprovalDecision; comment: string }[]>([]);
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS);
  const [cards, setCards] = useState(BOARD_CARDS);

  const reviewed = items.filter((i) => i.disposition !== null).length;

  function setDisposition(id: string, next: { disposition: Disposition; reason: string }) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...next } : i)));
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Queue, live"
        right="Click into the list and press j/k or the arrow keys to move, Enter to open. Every badge is real."
        padded={false}
      >
        <div className="p-4 flex flex-col gap-3">
          <ReviewProgress reviewed={reviewed} total={items.length} className="max-w-xs" />
          <Queue
            items={items}
            itemKey={(i) => i.id}
            countLabel={`${items.length} in queue`}
            railWidth={260}
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
                  status={{ label: row.disposition ? "Disposed" : "In review", tone: row.disposition ? "ok" : "info" }}
                  owner="Priya Raman"
                  facts={[{ label: `P${row.priority}` }, { label: row.dueDate }]}
                />
                <DispositionControl
                  disposition={row.disposition}
                  reason={row.reason}
                  reasons={REASONS}
                  onChange={(next) => setDisposition(row.id, next)}
                />
              </div>
            )}
          />
        </div>
      </Card>

      <Grid cols={2}>
        <Part name="Drawer" when="Open a record from a list without losing the page behind it — the list stays put.">
          <button
            type="button"
            className="cx-btn cx-btn-secondary cx-btn-sm"
            onClick={() => setDrawerOpen(true)}
          >
            Open drawer
          </button>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Northgate General"
            subtitle="Site feasibility"
            footer={<span className="text-[11px] text-muted">Escape or the backdrop closes this.</span>}
          >
            <DetailHeader
              title="Northgate General"
              subtitle="Site feasibility"
              status={{ label: "In review", tone: "info" }}
              owner="Priya Raman"
              facts={[{ label: "P1" }, { label: "Due 2026-09-19" }]}
            />
          </Drawer>
        </Part>

        <Part name="StickyActionBar" when="The final decision on a queue or a detail page, always reachable at the bottom of the pane.">
          <div className="w-full rounded-lg border border-edge overflow-hidden">
            <div className="h-16 grid place-items-center text-[11px] text-muted">record content scrolls here</div>
            <StickyActionBar summary={`${decisions.length} decision${decisions.length === 1 ? "" : "s"} logged`}>
              <ApprovalActions onDecide={(d) => setDecisions((cur) => [...cur, d])} />
            </StickyActionBar>
          </div>
        </Part>

        <Part name="StatusStepper" when="A record's fixed lifecycle — done steps behind, the current one marked, the rest ahead.">
          <div className="w-full flex flex-col gap-2">
            <StatusStepper
              steps={[{ label: "Submitted", date: "09/08" }, { label: "Manager review" }, { label: "Compliance review" }, { label: "Approved" }]}
              currentIndex={stepIndex}
            />
            <div className="flex gap-2">
              <button className="cx-btn cx-btn-ghost cx-btn-sm" onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>Back</button>
              <button className="cx-btn cx-btn-ghost cx-btn-sm" onClick={() => setStepIndex((i) => Math.min(3, i + 1))}>Advance</button>
            </div>
          </div>
        </Part>

        <Part name="DueDateBadge + PriorityBadge" when="A due date coloured by how close it is, and P1-P4 with P1 always the most urgent.">
          <DueDateBadge date="2026-09-10" />
          <DueDateBadge date="2026-09-18" />
          <DueDateBadge date="2026-12-01" />
          <PriorityBadge priority={1} />
          <PriorityBadge priority={2} />
          <PriorityBadge priority={3} />
          <PriorityBadge priority={4} />
        </Part>

        <Part name="Checklist" when="A fixed set of steps a person ticks off on one record before it can move on.">
          <Checklist
            items={checklist}
            onToggle={(id) => setChecklist((cur) => cur.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))}
            className="w-full"
          />
        </Part>

        <Part name="KanbanBoard" when="Work genuinely tracked by which bucket it sits in. Drag a card to another column.">
          <KanbanBoard
            columns={BOARD_COLUMNS.map((c) => ({ ...c, cards: cards.filter((card) => card.column === c.key) }))}
            cardId={(c) => c.id}
            onMove={(cardId, toColumn) => setCards((cur) => cur.map((c) => (c.id === cardId ? { ...c, column: toColumn } : c)))}
            renderCard={(card) => (
              <div className="flex flex-col gap-1.5">
                <div className="text-[11.5px] font-medium text-secondary">{card.title}</div>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={card.priority} />
                  <DueDateBadge date={card.dueDate} />
                </div>
              </div>
            )}
          />
        </Part>
      </Grid>
    </div>
  );
}
