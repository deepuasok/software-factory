"use client";

import { useState } from "react";
import { DueDateBadge, KanbanBoard, PageHeader, PriorityBadge } from "../index";

/** One card on the board. Swap the fields; keep the shape. */
export type BoardCard = {
  id: string;
  title: string;
  assignee: string;
  priority: 1 | 2 | 3 | 4;
  dueDate: string;
  column: string;
};

const COLUMN_DEFS = [
  { key: "backlog", label: "Backlog" },
  { key: "in-progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

const SAMPLE_CARDS: BoardCard[] = [
  { id: "K-301", title: "Confirm Tier 1 site list — Northgate", assignee: "Priya Raman", priority: 1, dueDate: "2026-09-19", column: "in-progress" },
  { id: "K-302", title: "Vendor contract redline — Meridian", assignee: "Tom Alvarez", priority: 2, dueDate: "2026-09-25", column: "backlog" },
  { id: "K-303", title: "Waiting on legal — Harbour", assignee: "Dana Okonjo", priority: 3, dueDate: "2026-09-12", column: "blocked" },
  { id: "K-304", title: "Closeout paperwork — Lakeside", assignee: "Priya Raman", priority: 4, dueDate: "2026-09-08", column: "done" },
  { id: "K-305", title: "Feasibility survey — Riverside", assignee: "Tom Alvarez", priority: 2, dueDate: "2026-09-30", column: "backlog" },
];

/** Two-letter initials from a name, for the places a photo would go. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * A kanban board: drag a card between columns, with its priority, due date
 * and assignee shown on the face of the card.
 *
 * Start here for work that is really tracked by which bucket it is in. Not
 * for a list that is only ever sorted or filtered — that is `ListPage`.
 */
export function BoardPage({
  title = "Site workstream board",
  subtitle = "Sample data. Drag a card to another column.",
  cards: initialCards = SAMPLE_CARDS,
}: {
  title?: string;
  subtitle?: string;
  cards?: BoardCard[];
}) {
  const [cards, setCards] = useState(initialCards);

  const columns = COLUMN_DEFS.map((c) => ({
    ...c,
    cards: cards.filter((card) => card.column === c.key),
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={subtitle} />
      <KanbanBoard
        columns={columns}
        cardId={(card) => card.id}
        onMove={(cardId, toColumn) =>
          setCards((cur) => cur.map((c) => (c.id === cardId ? { ...c, column: toColumn } : c)))
        }
        renderCard={(card) => (
          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-medium text-secondary leading-snug">{card.title}</div>
            <div className="flex items-center gap-1.5">
              <PriorityBadge priority={card.priority} />
              <DueDateBadge date={card.dueDate} />
              <div className="flex-1" />
              <span
                className="w-5 h-5 rounded-full bg-selected text-primary text-[9px] font-bold grid place-items-center shrink-0"
                title={card.assignee}
              >
                {initials(card.assignee)}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
