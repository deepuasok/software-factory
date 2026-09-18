"use client";

import React, { useEffect, useState } from "react";
import { Button, cx } from "./primitives";
import { ProgressBar } from "./data";
import { Select } from "./fields";
import { toneClass } from "../tone";
import type { Tone } from "../tokens";

/* Drawer ----------------------------------------------------------------- */

/**
 * A panel that slides in from the right over the current page.
 *
 * Use it to open one record from a list or a queue without losing the page
 * behind it — the page stays mounted and visible at the edges, so coming back
 * keeps scroll position and selection. Do not use it for a page-to-page
 * navigation, and do not use it for creating a record — that is `Modal`.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = 420,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-secondary/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full bg-white shadow-overlay flex flex-col"
        style={{ width }}
      >
        <div className="flex items-start gap-3 px-4 py-3.5 border-b border-edge shrink-0">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-secondary truncate">{title}</h2>
            {subtitle && <div className="text-[11px] text-muted mt-0.5 truncate">{subtitle}</div>}
          </div>
          <div className="flex-1" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-secondary text-[18px] leading-none shrink-0"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="flex items-center gap-2 px-4 py-3 border-t border-edge shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

/* Initials -------------------------------------------------------------- */

/** Two-letter initials from a name, for the places a photo would go. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/* DetailHeader ------------------------------------------------------------ */

/**
 * The header of a record opened for review: title, status, owner and the key
 * facts, with room for the page's actions on the right.
 *
 * Use it at the top of a Drawer or a detail pane. Do not use it as a generic
 * page header — for that, use `PageHeader`.
 */
export function DetailHeader({
  title,
  subtitle,
  status,
  owner,
  facts,
  actions,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  /** The record's state. Rendered as a tinted pill, same shape as `StatusPill`. */
  status?: { label: string; tone?: Tone };
  /** Owner's display name. Shown as initials until the shop has real avatars. */
  owner?: string;
  /** Short key-value facts, shown as a row of badges under the title. */
  facts?: { label: string; tone?: Tone }[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start gap-3", className)}>
      {owner && (
        <span className="w-8 h-8 rounded-full bg-selected text-primary text-[11px] font-bold grid place-items-center shrink-0">
          {initials(owner)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-[15px] font-semibold text-secondary truncate">{title}</h2>
          {status && (
            <span
              className={cx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
                toneClass(status.tone ?? "neutral", "soft"),
              )}
            >
              {status.label}
            </span>
          )}
        </div>
        {subtitle && <div className="text-[12px] text-muted mt-0.5">{subtitle}</div>}
        {facts && facts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {facts.map((f, i) => (
              <span
                key={i}
                className={cx(
                  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                  toneClass(f.tone ?? "neutral", "soft"),
                )}
              >
                {f.label}
              </span>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* StickyActionBar ---------------------------------------------------------- */

/**
 * A bar stuck to the bottom of the viewport with a summary on the left and
 * the page's actions on the right.
 *
 * Use it for the decision at the end of a queue or a detail page — approve,
 * reject, submit — so the action is always reachable without scrolling. Do
 * not use it for row-level actions; those belong on the row.
 */
export function StickyActionBar({
  summary,
  children,
  className,
}: {
  summary?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "sticky bottom-0 z-10 flex items-center gap-3 bg-white border-t border-edge px-4 py-3",
        className,
      )}
    >
      <div className="text-[12px] text-muted min-w-0 truncate">{summary}</div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

/* useRowKeys ---------------------------------------------------------------- */

/**
 * Keyboard navigation over a list of N items: j/down moves next, k/up moves
 * back, Enter opens the current one.
 *
 * Spread the returned `onKeyDown` onto a focusable container (`tabIndex={0}`)
 * that wraps the list — `Queue` already does this. Use it directly only when
 * building a custom rail that is not `Queue`.
 */
export function useRowKeys(count: number, onOpen?: (index: number) => void) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count === 0) {
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(i, count - 1));
  }, [count]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (count === 0) return;
    if (e.key === "j" || e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(count - 1, i + 1));
    } else if (e.key === "k" || e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onOpen?.(index);
    }
  }

  return { index, setIndex, onKeyDown };
}

/* Queue ---------------------------------------------------------------------- */

/**
 * A left list of items with a count header, beside the selected item's
 * content on the right. j/k or the arrow keys move the selection, Enter opens
 * it.
 *
 * Use it for working a list one record at a time — a review queue, an
 * approval inbox. For a list where the point is the table itself, use
 * `DataTable` in a `SplitPane` instead.
 */
export function Queue<T>({
  items,
  itemKey,
  renderRow,
  renderDetail,
  selectedIndex,
  onSelect,
  countLabel,
  progress,
  railWidth = 320,
  emptyState,
  className,
}: {
  items: T[];
  itemKey: (item: T, index: number) => string;
  /** A `ListRow`-shaped row for one item. Receives whether it is selected. */
  renderRow: (item: T, index: number, selected: boolean) => React.ReactNode;
  /** The content pane for the selected item. */
  renderDetail: (item: T, index: number) => React.ReactNode;
  /** Controlled selection. Leave it out and Queue keeps its own. */
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  /** Header text above the list, e.g. "180 in queue". */
  countLabel?: React.ReactNode;
  /** A `ReviewProgress` or `ProgressBar` shown under the count header. */
  progress?: React.ReactNode;
  railWidth?: number;
  emptyState?: React.ReactNode;
  className?: string;
}) {
  const keys = useRowKeys(items.length, (i) => setIndex(i));
  const [ownIndex, setOwnIndex] = useState(0);
  const index = selectedIndex !== undefined ? selectedIndex : keys.index;

  function setIndex(next: number) {
    if (onSelect) onSelect(next);
    else setOwnIndex(next);
    keys.setIndex(next);
  }

  const active = selectedIndex !== undefined ? selectedIndex : ownIndex;

  return (
    <div className={cx("flex border border-edge rounded-lg overflow-hidden bg-white", className)}>
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          keys.onKeyDown(e);
          if (e.key === "j" || e.key === "ArrowDown" || e.key === "k" || e.key === "ArrowUp") {
            const next = e.key === "j" || e.key === "ArrowDown" ? Math.min(items.length - 1, active + 1) : Math.max(0, active - 1);
            setIndex(next);
          }
        }}
        className="shrink-0 border-r border-edge overflow-y-auto outline-none focus:bg-ghost-white"
        style={{ width: railWidth }}
      >
        {(countLabel || progress) && (
          <div className="px-3 py-2.5 border-b border-edge">
            {countLabel && <div className="cx-label">{countLabel}</div>}
            {progress && <div className="mt-1.5">{progress}</div>}
          </div>
        )}
        {items.length === 0
          ? emptyState
          : items.map((item, i) => (
              <div key={itemKey(item, i)} onClick={() => setIndex(i)}>
                {renderRow(item, i, i === active)}
              </div>
            ))}
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto p-4">
        {items.length > 0 && items[active] ? renderDetail(items[active]!, active) : emptyState}
      </div>
    </div>
  );
}

/* DispositionControl ---------------------------------------------------------- */

export type Disposition = "include" | "exclude" | "hold";

const DISPOSITION_TONE: Record<Disposition, Tone> = { include: "ok", exclude: "error", hold: "warn" };

/**
 * The Include / Exclude / Hold call on one item, with a reason that becomes
 * required the moment the call is not Include.
 *
 * Use it on any row or record that a reviewer must dispose of one at a time.
 * For a decision with more than three outcomes, this is the wrong part.
 */
export function DispositionControl({
  disposition,
  reason = "",
  reasons,
  onChange,
}: {
  disposition: Disposition | null;
  reason?: string;
  /** Choices for the reason select. Required once disposition is not Include. */
  reasons: string[];
  onChange: (next: { disposition: Disposition; reason: string }) => void;
}) {
  const needsReason = disposition === "exclude" || disposition === "hold";
  const options: { value: Disposition; label: string }[] = [
    { value: "include", label: "Include" },
    { value: "exclude", label: "Exclude" },
    { value: "hold", label: "Hold" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-lg border border-border-idle bg-white p-0.5">
        {options.map((o) => {
          const on = disposition === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ disposition: o.value, reason: o.value === "include" ? "" : reason })}
              className={cx(
                "h-7 px-3 rounded text-[11px] font-semibold transition-colors whitespace-nowrap",
                on ? cx(toneClass(DISPOSITION_TONE[o.value], "bg")) : "text-muted hover:text-primary",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {needsReason && (
        <label className="flex items-center gap-1.5 text-[11px] text-muted">
          Reason
          <span aria-hidden className="text-error">*</span>
          <Select
            small
            aria-label="Reason"
            aria-required="true"
            value={reason}
            onChange={(e) => onChange({ disposition: disposition!, reason: e.target.value })}
            className={cx(!reason && "border-error")}
          >
            <option value="" disabled>
              Choose a reason
            </option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </label>
      )}
    </div>
  );
}

/* ReviewProgress ---------------------------------------------------------- */

/**
 * "42 of 180 reviewed" over a progress bar.
 *
 * Use it at the head of any queue people work through one item at a time. Do
 * not use it for progress toward a date — that is a plain `ProgressBar` with
 * a caveat line.
 */
export function ReviewProgress({
  reviewed,
  total,
  tone = "brand",
  className,
}: {
  reviewed: number;
  total: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] text-muted cx-num">
        {reviewed} of {total} reviewed
      </div>
      <div className="mt-1">
        <ProgressBar value={reviewed} target={total} tone={tone} />
      </div>
    </div>
  );
}

/* ApprovalActions ------------------------------------------------------------ */

export type ApprovalDecision = "approve" | "request-changes" | "reject";

/**
 * Approve / Request changes / Reject on one record. The two negative paths
 * open an inline comment box and will not fire until it is filled in.
 *
 * Use it as the final decision on an approval flow. It is not a general
 * three-button row — Approve always means the positive outcome.
 */
export function ApprovalActions({
  onDecide,
  disabled,
}: {
  onDecide: (decision: { decision: ApprovalDecision; comment: string }) => void;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState<ApprovalDecision | null>(null);
  const [comment, setComment] = useState("");

  if (pending) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="text-[11px] text-muted">
          {pending === "reject" ? "Reason for rejecting" : "What needs to change"}
          <span aria-hidden className="text-error"> *</span>
        </label>
        <textarea
          autoFocus
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="cx-field w-full resize-none"
          placeholder="Say what needs to happen next."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            disabled={disabled || comment.trim().length === 0}
            onClick={() => {
              onDecide({ decision: pending, comment: comment.trim() });
              setPending(null);
              setComment("");
            }}
          >
            Submit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPending(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" disabled={disabled} onClick={() => setPending("request-changes")}>
        Request changes
      </Button>
      <Button variant="danger" size="sm" disabled={disabled} onClick={() => setPending("reject")}>
        Reject
      </Button>
      <Button
        variant="primary"
        size="sm"
        disabled={disabled}
        onClick={() => onDecide({ decision: "approve", comment: "" })}
      >
        Approve
      </Button>
    </div>
  );
}

/* StatusStepper --------------------------------------------------------------- */

/**
 * An ordered set of states with the current one marked, done ones behind it
 * and the rest ahead — with an optional date under each.
 *
 * Use it for a record's fixed lifecycle (draft → review → approved). For an
 * open-ended history of events, use a plain list instead.
 */
export function StatusStepper({
  steps,
  currentIndex,
  className,
}: {
  steps: { label: string; date?: string }[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start", className)}>
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center min-w-[72px]">
              <span
                className={cx(
                  "w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0",
                  done && "bg-ok text-white",
                  current && "bg-primary text-white",
                  !done && !current && "bg-surface-grey text-muted",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <div
                className={cx(
                  "text-[11px] mt-1.5 text-center leading-tight",
                  current ? "font-semibold text-secondary" : "text-muted",
                )}
              >
                {step.label}
              </div>
              {step.date && <div className="text-[10px] text-muted mt-0.5 cx-num">{step.date}</div>}
            </div>
            {i < steps.length - 1 && (
              <div className={cx("h-[2px] flex-1 mt-2.5 mx-1", done ? "bg-ok" : "bg-edge")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* DueDateBadge -------------------------------------------------------------- */

/**
 * A date rendered as "due in 3d" or "2d overdue", coloured by how close it
 * is.
 *
 * Use it anywhere a due date sits in a row or a header. Do not pass a raw
 * date string elsewhere and colour it by hand — this is the one place that
 * math happens.
 */
export function DueDateBadge({ date, now = new Date(), className }: { date: string | Date; now?: Date; className?: string }) {
  const due = typeof date === "string" ? new Date(date) : date;
  const days = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = days < 0;
  const label = overdue ? `${Math.abs(days)}d overdue` : days === 0 ? "due today" : `due in ${days}d`;
  const tone: Tone = overdue ? "error" : days <= 2 ? "warn" : "neutral";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap cx-num",
        toneClass(tone, "soft"),
        className,
      )}
    >
      {label}
    </span>
  );
}

/* PriorityBadge --------------------------------------------------------------- */

/**
 * P1 through P4, darkest and P1 always the most urgent — the same read as
 * `RankBadge`, spelled for priority instead of tier or risk.
 *
 * Use it wherever a work item carries a priority. Do not invent a fifth
 * level — group anything past P4 as P4.
 */
export function PriorityBadge({ priority }: { priority: 1 | 2 | 3 | 4 }) {
  const bg = { 1: "bg-rank-1", 2: "bg-rank-2", 3: "bg-rank-3", 4: "bg-rank-4" }[priority];
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded text-[10px] font-bold text-white px-1.5 py-0.5 min-w-[24px]",
        bg,
      )}
    >
      P{priority}
    </span>
  );
}

/* KanbanBoard ------------------------------------------------------------------ */

/**
 * Columns of cards a person moves between, by dragging or with the arrow
 * keys.
 *
 * Use it for work that is genuinely tracked by which bucket it sits in —
 * intake, in progress, done. For a list that is only ever sorted or filtered,
 * `DataTable` is the right part.
 *
 * Every card is focusable, and left/right arrow moves the focused card one
 * column. Drag and drop alone leaves the board unusable by keyboard, and
 * unreachable by any test that drives the page.
 */
export function KanbanBoard<T>({
  columns,
  cardId,
  renderCard,
  onMove,
  className,
}: {
  columns: { key: string; label: string; cards: T[] }[];
  cardId: (card: T) => string;
  renderCard: (card: T) => React.ReactNode;
  onMove: (cardId: string, toColumn: string) => void;
  className?: string;
}) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  function moveByKey(e: React.KeyboardEvent, id: string, columnIndex: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = columnIndex + (e.key === "ArrowRight" ? 1 : -1);
    const target = columns[next];
    if (!target) return;
    e.preventDefault();
    onMove(id, target.key);
  }

  return (
    <div className={cx("flex gap-3 overflow-x-auto pb-1", className)}>
      {columns.map((col, columnIndex) => (
        <div
          key={col.key}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(col.key);
          }}
          onDragLeave={() => setDragOver((k) => (k === col.key ? null : k))}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            setDragOver(null);
            if (id) onMove(id, col.key);
          }}
          className={cx(
            "shrink-0 w-64 rounded-lg border border-edge bg-ghost-white flex flex-col",
            dragOver === col.key && "ring-2 ring-primary bg-selected",
          )}
        >
          <div className="cx-label px-3 py-2 border-b border-edge flex items-center gap-1.5">
            {col.label}
            <span className="cx-num opacity-70">· {col.cards.length}</span>
          </div>
          <div className="flex flex-col gap-2 p-2 overflow-y-auto">
            {col.cards.length === 0 && (
              <div className="text-[11px] text-muted text-center py-4">Nothing here.</div>
            )}
            {col.cards.map((card) => (
              <div
                key={cardId(card)}
                draggable
                tabIndex={0}
                title={`In ${col.label}. Drag it, or press the left and right arrow keys to move it.`}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", cardId(card))}
                onKeyDown={(e) => moveByKey(e, cardId(card), columnIndex)}
                className="bg-white rounded-lg border border-edge p-2.5 cursor-grab active:cursor-grabbing shadow-card outline-none focus:ring-2 focus:ring-primary"
              >
                {renderCard(card)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Checklist ------------------------------------------------------------------- */

/**
 * A list of items with a done toggle and a running count.
 *
 * Use it for a fixed set of steps a person ticks off on one record — intake
 * requirements, sign-off steps. For a to-do list people add to freely, this
 * is the wrong part.
 */
export function Checklist({
  items,
  onToggle,
  className,
}: {
  items: { id: string; label: string; done: boolean }[];
  onToggle: (id: string) => void;
  className?: string;
}) {
  const done = items.filter((i) => i.done).length;
  return (
    <div className={className}>
      <div className="cx-label mb-1.5">
        {done} of {items.length} done
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 py-1.5 border-b border-edge last:border-b-0 text-[12.5px] text-secondary cursor-pointer"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => onToggle(item.id)}
              className="w-3.5 h-3.5 rounded-sm border border-border-idle accent-primary cursor-pointer"
            />
            <span className={cx(item.done && "line-through text-muted")}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
