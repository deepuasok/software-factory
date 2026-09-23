"use client";

/**
 * Client-side state for the whole app, shared across routes.
 *
 * There is no live database in this proof — see the README — so this module
 * plays the part `lib/api.ts` + Prisma play in a wired app: one place that
 * holds the lines, and the only place that writes to the activity log.
 * Every mutation goes through `recordChange` (the same `@factory/ui` helper
 * the ReconcilePage recipe uses) so the ActivityFeed on every screen shows
 * real entries, not sample ones.
 */

import { useSyncExternalStore } from "react";
import { recordChange, type ActivityEntry } from "@factory/ui";
import { seedLines } from "./data";
import { REASON_LABEL, SOURCE_LABEL, STATUS_LABEL } from "./types";
import type { DispositionComment, InvoiceLine, LineStatus, ReasonCode, SourceKey } from "./types";
import { payAmount, money } from "./model";

type State = {
  lines: InvoiceLine[];
  activity: ActivityEntry[];
  comments: DispositionComment[];
};

const listeners = new Set<() => void>();

const initialLines = seedLines();

const state: State = {
  lines: initialLines,
  activity: [
    recordChange({
      verb: "created",
      actor: "AP import",
      field: "Pay cycle",
      from: "—",
      to: `September 2026, ${initialLines.length} lines`,
      at: new Date(2026, 8, 1, 9, 0, 0).toISOString(),
    }),
  ],
  comments: [],
};

/**
 * `useSyncExternalStore` only re-renders when `getSnapshot` returns a value
 * that fails `Object.is` against the last one. `state` itself never changes
 * identity — only its properties do — so every mutation below rebuilds this
 * snapshot before calling `emit`. Skipping that step is the classic bug: the
 * mutation "works" (state.lines really changes) but no screen redraws.
 */
let snapshot: State = { ...state };

function emit() {
  snapshot = { ...state };
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): State {
  return snapshot;
}

/** Read-only hook for any component that wants the live lines, activity and comments. */
export function useStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function findLine(id: string): InvoiceLine | undefined {
  return state.lines.find((l) => l.id === id);
}

function touch(line: InvoiceLine): InvoiceLine {
  return { ...line, updatedAt: new Date().toISOString() };
}

function log(entry: Omit<Parameters<typeof recordChange>[0], "at">) {
  state.activity = [recordChange({ ...entry, at: new Date().toISOString() }), ...state.activity];
}

/** A person picks the source they trust for a line. */
export function setTrustedSource(lineId: string, source: SourceKey) {
  const line = findLine(lineId);
  if (!line) return;
  const from = line.trustedSource ? SOURCE_LABEL[line.trustedSource] : "no source chosen";
  state.lines = state.lines.map((l) => (l.id === lineId ? touch({ ...l, trustedSource: source, correctedAmount: undefined }) : l));
  log({ verb: "chose", actor: "You", field: `${line.id} trusted source`, from, to: SOURCE_LABEL[source] });
  emit();
}

/** A person overrides every source with a figure of their own, and says why. */
export function submitOverride(lineId: string, amount: number, reasonCode: ReasonCode, reasonText: string) {
  const line = findLine(lineId);
  if (!line) return;
  const from = payAmount(line);
  state.lines = state.lines.map((l) =>
    l.id === lineId ? touch({ ...l, correctedAmount: amount, reasonCode, status: "corrected" }) : l,
  );
  log({
    verb: "overrode",
    actor: "You",
    field: `${line.id} pay amount`,
    from: from === null ? "no figure" : money(from, line.currency),
    to: `${money(amount, line.currency)} — ${REASON_LABEL[reasonCode]}${reasonText ? `: ${reasonText}` : ""}`,
  });
  emit();
}

/** Bulk or single status change — used by the list's bulk bar and the reconcile screen. */
export function setStatus(lineIds: string[], status: LineStatus) {
  for (const id of lineIds) {
    const line = findLine(id);
    if (!line || line.status === status) continue;
    state.lines = state.lines.map((l) => (l.id === id ? touch({ ...l, status }) : l));
    log({ verb: "updated", actor: "You", field: `${id} status`, from: STATUS_LABEL[line.status], to: STATUS_LABEL[status] });
  }
  emit();
}

/** Rows accepted by the import wizard, appended to the current month. */
export function commitImportedLines(rows: InvoiceLine[]) {
  if (rows.length === 0) return;
  state.lines = [...state.lines, ...rows];
  log({ verb: "created", actor: "You", field: "Import", from: `${state.lines.length - rows.length} lines`, to: `${state.lines.length} lines (+${rows.length})` });
  emit();
}

export function addComment(lineId: string, body: string) {
  state.comments = [
    ...state.comments,
    { id: `c-${Date.now()}`, lineId, author: "You", body, at: new Date().toISOString() },
  ];
  log({ verb: "commented", actor: "You", field: lineId, from: "—", to: body.length > 60 ? `${body.slice(0, 60)}…` : body });
  emit();
}

export function resolveComment(id: string, resolved: boolean) {
  state.comments = state.comments.map((c) => (c.id === id ? { ...c, resolved } : c));
  emit();
}

export function commentsFor(comments: DispositionComment[], lineId: string) {
  return comments.filter((c) => c.lineId === lineId);
}

export function activityFor(activity: ActivityEntry[], lineId: string) {
  return activity.filter((a) => a.field.startsWith(lineId));
}
