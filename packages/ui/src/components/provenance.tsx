"use client";

import React, { useMemo, useState } from "react";
import { Button, cx } from "./primitives";
import { Field, Select, TextArea, TextInput } from "./fields";
import { toneClass } from "../tone";
import { type Tone } from "../tokens";

/* Avatar ----------------------------------------------------------------- */

const AVATAR_SIZE: Record<"sm" | "md", string> = {
  sm: "w-5 h-5 text-[9px]",
  md: "w-7 h-7 text-[11px]",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * A person, reduced to initials in a circle. `size="sm"` sits inline in a
 * table row or a comment; `size="md"` is for a picker or a composer.
 *
 * Use it anywhere a name needs a face and there is no photo to show. Do not
 * use it to imply status — a `tone` ring says "this is the current user" or
 * "this person is the one who changed the value", never good or bad.
 */
export function Avatar({
  name,
  size = "sm",
  tone,
  className,
}: {
  name: string;
  size?: "sm" | "md";
  /** A ring around the circle. Leave it out for an ordinary avatar. */
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      title={name}
      className={cx(
        "inline-flex items-center justify-center rounded-full bg-selected text-primary font-bold shrink-0",
        AVATAR_SIZE[size],
        tone && "ring-2 ring-offset-1",
        tone && toneClass(tone, "ring"),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

/* AssigneePicker ----------------------------------------------------------- */

export type ProvenanceUser = { id: string; name: string; hint?: string };

/**
 * Search-and-pick over a short list of people, showing each as an Avatar
 * beside their name. Controlled, like every other input in the shop.
 *
 * Use it wherever a record needs an owner or a reviewer. Past a couple of
 * hundred people, this still works because it only ever renders the filtered
 * list, but if the list arrives from the server already paged, filter there
 * instead of loading everyone up front.
 */
export function AssigneePicker({
  value,
  onChange,
  users,
  placeholder = "Assign to…",
  className,
}: {
  value: string | null;
  onChange: (userId: string | null) => void;
  users: ProvenanceUser[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = users.find((u) => u.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className={cx("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className="cx-field flex items-center gap-2 text-left"
      >
        {current ? (
          <>
            <Avatar name={current.name} size="sm" />
            <span className="truncate">{current.name}</span>
          </>
        ) : (
          <span className="text-muted">{placeholder}</span>
        )}
        <span className="flex-1" />
        <span aria-hidden className="text-muted text-[10px]">▾</span>
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[220px] bg-white rounded-lg border border-edge shadow-raised overflow-hidden">
            <div className="p-1.5 border-b border-edge">
              <TextInput
                small
                autoFocus
                placeholder="Search people…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto p-1">
              {value !== null && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-muted hover:bg-selected hover:text-primary text-left"
                >
                  Unassign
                </button>
              )}
              {filtered.length === 0 && (
                <div className="px-2 py-3 text-[12px] text-muted text-center">No one matches.</div>
              )}
              {filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onChange(u.id);
                    setOpen(false);
                  }}
                  className={cx(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-left hover:bg-selected",
                    u.id === value ? "text-primary font-semibold" : "text-secondary",
                  )}
                >
                  <Avatar name={u.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate">{u.name}</span>
                    {u.hint && <span className="block text-[11px] text-muted truncate">{u.hint}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* CommentThread ------------------------------------------------------------ */

export type ProvenanceComment = {
  id: string;
  author: string;
  body: string;
  at: string;
  resolved?: boolean;
};

function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * A discussion on a record: author, relative time, the body, and resolve. A
 * composer sits at the bottom for the current user when `onAdd` is given;
 * leave `onAdd` out and the thread is read-only, which is what an approval
 * inbox wants when the comments come from the decision itself.
 *
 * Use it on a record's detail page, one thread per record. Do not use it for
 * a single system-generated note — that is ActivityFeed instead.
 */
export function CommentThread({
  comments,
  onAdd,
  onResolve,
  currentUser,
  emptyState,
  className,
}: {
  comments: ProvenanceComment[];
  /** Leave it out for a read-only trail — the composer disappears with it. */
  onAdd?: (body: string) => void;
  /** Leave it out and comments cannot be resolved here. */
  onResolve?: (id: string, resolved: boolean) => void;
  /** Whoever is writing. Only used by the composer. */
  currentUser?: string;
  /** What shows when nobody has said anything yet. */
  emptyState?: React.ReactNode;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    const body = draft.trim();
    if (!body || !onAdd) return;
    onAdd(body);
    setDraft("");
  }

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      {comments.length === 0 && (
        <p className="text-[12px] text-muted">
          {emptyState ?? (onAdd ? "No comments yet. Be the first to leave one." : "No comments on this record.")}
        </p>
      )}
      {comments.map((c) => (
        <div key={c.id} className={cx("flex items-start gap-2.5", c.resolved && "opacity-60")}>
          <Avatar name={c.author} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold text-secondary">{c.author}</span>
              <span className="text-[11px] text-muted">{relativeTime(c.at)}</span>
              {c.resolved && (
                <span className={cx("text-[10px] font-semibold rounded px-1.5 py-0.5", toneClass("ok", "soft"))}>
                  Resolved
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-secondary mt-0.5 leading-relaxed">{c.body}</p>
            {onResolve && (
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => onResolve(c.id, !c.resolved)}
                  className="text-[11px] font-semibold text-muted hover:text-primary"
                >
                  {c.resolved ? "Reopen" : "Resolve"}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {onAdd && (
        <div className="flex items-start gap-2.5 pt-2 border-t border-edge">
          <Avatar name={currentUser ?? "You"} size="sm" />
          <div className="flex-1 flex flex-col gap-1.5">
            <TextArea
              rows={2}
              placeholder="Leave a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={submit} disabled={!draft.trim()}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ActivityFeed --------------------------------------------------------- */

export type ActivityEntry = {
  verb: string;
  actor: string;
  field: string;
  fromValue: string;
  toValue: string;
  at: string;
};

/**
 * Turn a `{ from, to }` change into an `ActivityEntry`. Keeps the append-only
 * shape (`fromValue` / `toValue`) that `ActivityFeed` renders, so callers can
 * keep writing `{ from, to }` at the call site — see docs/CONTRACTS.md §6.
 *
 * This is the client-side half of the audit trail: an app with no live
 * database calls it directly and appends the entry to its own state. An app
 * with a database calls `recordChange()` in `lib/audit.ts` on the server
 * instead, and this part only renders what comes back.
 *
 * `from` and `to` take a number as readily as a string — a score going 62 →
 * 74 should not need a `String()` at every call site — and `at` defaults to
 * now.
 */
export function recordChange(entry: {
  verb: string;
  actor: string;
  field: string;
  from: string | number;
  to: string | number;
  at?: string;
}): ActivityEntry {
  const { from, to, at, ...rest } = entry;
  return { ...rest, fromValue: String(from), toValue: String(to), at: at ?? new Date().toISOString() };
}

function dayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const that = new Date(d);
  that.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

/**
 * A read-only, append-only log of what changed, as plain sentences: "Moyo
 * changed PSM from 0.42 to 0.50." Grouped by day, newest day first.
 *
 * Use it beside a record to answer "what happened here" without a diff view.
 * It is written only through `lib/audit.ts` — this part only renders what it
 * is given, and never lets anyone edit or delete an entry.
 */
export function ActivityFeed({
  entries,
  emptyState,
  className,
}: {
  entries: ActivityEntry[];
  emptyState?: React.ReactNode;
  className?: string;
}) {
  const groups = useMemo(() => {
    const byDay = new Map<string, ActivityEntry[]>();
    for (const e of entries) {
      const label = dayLabel(e.at);
      const list = byDay.get(label) ?? [];
      list.push(e);
      byDay.set(label, list);
    }
    return Array.from(byDay.entries());
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className={cx("text-[12px] text-muted", className)}>
        {emptyState ?? "Nothing has happened here yet."}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col gap-4", className)}>
      {groups.map(([label, items]) => (
        <div key={label}>
          <div className="cx-label mb-1.5">{label}</div>
          <div className="flex flex-col gap-1.5">
            {items.map((e, i) => (
              <p key={i} className="text-[12px] text-secondary leading-relaxed">
                <span className="font-semibold">{e.actor}</span> {e.verb} {e.field} from{" "}
                <span className="cx-num font-medium">{e.fromValue}</span> to{" "}
                <span className="cx-num font-medium">{e.toValue}</span>
                <span className="text-muted"> · {new Date(e.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* OverrideControl -------------------------------------------------------- */

export type OverrideReasonCode = string;

export type OverrideReason = { value: OverrideReasonCode; label: string };

/**
 * The reasons every shop shares. Pass `reasonCodes` to add a domain's own
 * (price variance, waiting on a part) — keep "other" at the end so nobody is
 * forced to lie to get past the control.
 */
export const DEFAULT_OVERRIDE_REASONS: OverrideReason[] = [
  { value: "data-error", label: "The model input was wrong" },
  { value: "local-knowledge", label: "I know something the model does not" },
  { value: "manual-adjustment", label: "A manual adjustment we agreed on" },
  { value: "other", label: "Other" },
];

/**
 * Lets a person replace a model value with a human one, and forces them to
 * say why. Save stays disabled until a reason code and reason text are both
 * present — an override with no reason is how trust in the model erodes.
 *
 * Use it on any field a model produces where a human sometimes knows better.
 * Do not use it as a general edit control — a plain field with InlineEdit is
 * for values nobody needs to justify changing.
 */
export function OverrideControl({
  field,
  modelValue,
  onOverride,
  reasonCodes = DEFAULT_OVERRIDE_REASONS,
  className,
}: {
  field: string;
  modelValue: string;
  /** Domain reason codes. Defaults to the shared four. */
  reasonCodes?: OverrideReason[];
  onOverride: (override: {
    field: string;
    modelValue: string;
    humanValue: string;
    reasonCode: OverrideReasonCode;
    reasonText: string;
  }) => void;
  className?: string;
}) {
  const [humanValue, setHumanValue] = useState("");
  const [reasonCode, setReasonCode] = useState<OverrideReasonCode>(reasonCodes[0]?.value ?? "other");
  const [reasonText, setReasonText] = useState("");

  const canSave = humanValue.trim() !== "" && reasonText.trim() !== "";

  function save() {
    if (!canSave) return;
    onOverride({ field, modelValue, humanValue: humanValue.trim(), reasonCode, reasonText: reasonText.trim() });
    setHumanValue("");
    setReasonText("");
  }

  return (
    <div className={cx("flex flex-col gap-2.5 p-3 rounded-lg bg-surface-grey", className)}>
      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-muted">Model says</span>
        <span className="cx-num font-semibold text-secondary">{modelValue}</span>
      </div>
      <Field label={`Your value for ${field}`}>
        <TextInput small value={humanValue} onChange={(e) => setHumanValue(e.target.value)} placeholder={modelValue} />
      </Field>
      <Field label="Reason">
        <Select small value={reasonCode} onChange={(e) => setReasonCode(e.target.value as OverrideReasonCode)}>
          {reasonCodes.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Explain" required>
        <TextArea
          rows={2}
          placeholder="A sentence future you will thank you for."
          value={reasonText}
          onChange={(e) => setReasonText(e.target.value)}
        />
      </Field>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" disabled={!canSave} onClick={save}>
          Save override
        </Button>
      </div>
    </div>
  );
}

/* SourceBadge ------------------------------------------------------------ */

/**
 * A small neutral badge naming where a value came from, with the model
 * version and confidence in a tooltip. Tone is `info` when the source is a
 * model, `neutral` for a human-entered or system-of-record value.
 *
 * Use it next to every number that did not come straight from a form —
 * pairs with `ExplainPanel` and `OverrideControl` on the same figure. Do not
 * use it as a general-purpose label; it always means "this is where the
 * number came from".
 */
export function SourceBadge({
  sourceSystem,
  modelVersion,
  confidence,
  className,
}: {
  sourceSystem: string;
  /** Present when a model produced the value. Its absence means "human-entered". */
  modelVersion?: string;
  /** 0–1. Shown in the tooltip as a percentage. */
  confidence?: number;
  className?: string;
}) {
  const isModel = Boolean(modelVersion);
  const title = [
    sourceSystem,
    modelVersion && `model ${modelVersion}`,
    confidence !== undefined && `${Math.round(confidence * 100)}% confidence`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap cursor-help",
        toneClass(isModel ? "info" : "neutral", "soft"),
        className,
      )}
    >
      {sourceSystem}
    </span>
  );
}

/* ExplainPanel ------------------------------------------------------------ */

export type Contribution = { label: string; value: number; direction: "up" | "down" };

/**
 * Why a model number is what it is: ranked horizontal bars, one per
 * contributing factor, coloured by whether the factor pushed the value up or
 * down, plus one plain sentence summarising it.
 *
 * Use it next to a model-produced figure people are being asked to trust or
 * override. Do not use it for a figure with no model behind it — there is
 * nothing here to explain.
 */
export function ExplainPanel({
  title,
  contributions,
  summary,
  valueFormat,
  className,
}: {
  title: string;
  contributions: Contribution[];
  summary: string;
  /**
   * How to write each contribution's size. It receives the absolute value; the
   * sign is drawn separately. Without it the number is printed bare, which is
   * right for points out of 100 and wrong for money — pass a formatter
   * whenever the contributions carry a unit.
   */
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const max = Math.max(1, ...contributions.map((c) => Math.abs(c.value)));
  const ranked = [...contributions].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <h3 className="text-[13px] font-semibold text-secondary">{title}</h3>
      <p className="text-[12px] text-muted leading-relaxed">{summary}</p>
      <div className="flex flex-col gap-2">
        {ranked.map((c) => {
          const tone: Tone = c.direction === "up" ? "ok" : "error";
          const width = `${(Math.abs(c.value) / max) * 100}%`;
          return (
            <div key={c.label} className="flex items-center gap-2.5">
              <span className="text-[11.5px] text-secondary w-[38%] shrink-0 truncate" title={c.label}>
                {c.label}
              </span>
              <div className="flex-1 h-4 rounded bg-surface-grey overflow-hidden">
                <div
                  className={cx("h-full rounded", toneClass(tone, "fill"))}
                  style={{ width }}
                />
              </div>
              <span className={cx("cx-num text-[11px] font-semibold w-14 text-right", toneClass(tone, "text"))}>
                {c.direction === "up" ? "+" : "−"}
                {valueFormat ? valueFormat(Math.abs(c.value)) : Math.abs(c.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* AsOf ---------------------------------------------------------------- */

function timeOfDay(d: Date): string {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * A timestamp rendered as "as of 2:10 PM today", turning `warn` once the
 * value is older than `staleAfterHours`.
 *
 * Use it beside any figure that was computed rather than typed in just now —
 * a model score, a nightly rollup, a sync. Do not use it for something the
 * person on screen just entered themselves.
 */
export function AsOf({
  at,
  staleAfterHours = 24,
  now = new Date(),
  className,
}: {
  at: string;
  /** Hours after which the timestamp is shown as stale. */
  staleAfterHours?: number;
  /** Injectable for tests and stories. Defaults to the real clock. */
  now?: Date;
  className?: string;
}) {
  const then = new Date(at);
  const ageHours = (now.getTime() - then.getTime()) / 3600000;
  const stale = ageHours > staleAfterHours;

  const todayStr = now.toDateString();
  const thenDay = then.toDateString();
  let when: string;
  if (thenDay === todayStr) when = `today at ${timeOfDay(then)}`;
  else if (new Date(now.getTime() - 86400000).toDateString() === thenDay) when = `yesterday at ${timeOfDay(then)}`;
  else when = `${then.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${timeOfDay(then)}`;

  return (
    <span
      title={then.toLocaleString()}
      className={cx("text-[11px] font-medium", stale ? toneClass("warn", "text") : "text-muted")}
    >
      as of {when}
    </span>
  );
}
