"use client";

import React, { useMemo, useState } from "react";
import { Button, cx } from "./primitives";
import { DateInput, Field, SearchInput } from "./fields";
import { toneClass } from "../tone";

/* Form frame ------------------------------------------------------------- */

/**
 * The form element. It owns one thing people always get wrong: a second submit
 * while the first is still in flight.
 *
 * Use it around every set of fields that saves together. Do not use it for a
 * single control that takes effect immediately — that is a Toggle.
 */
export function Form({
  onSubmit,
  children,
  className,
}: {
  /** Return a promise and the whole form stays disabled until it settles. */
  onSubmit: () => void | Promise<unknown>;
  children: React.ReactNode;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const result = onSubmit();
    if (result instanceof Promise) {
      setBusy(true);
      try {
        await result;
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <form onSubmit={handle} className={className} noValidate>
      <fieldset disabled={busy} className="contents">
        {children}
      </fieldset>
    </form>
  );
}

/**
 * A named group of fields, with one line saying why the group exists.
 *
 * Use it to break a long form into three or four chunks. Do not use it for a
 * form of four fields — a heading over everything is noise.
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("cx-card p-4", className)}>
      <h2 className="text-[14px] font-semibold text-secondary">{title}</h2>
      {description && <p className="text-[12px] text-muted mt-1 max-w-[70ch]">{description}</p>}
      <div className="flex flex-col gap-3.5 mt-3.5">{children}</div>
    </section>
  );
}

/** Two fields side by side, stacked on a phone. Never three. */
export function FormRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("grid grid-cols-1 sm:grid-cols-2 gap-3.5", className)}>{children}</div>;
}

/**
 * Everything wrong with the form, in one place, above the fields.
 *
 * Use it after a failed save, so people see the whole list at once. It never
 * replaces the error on the field itself — say it in both places.
 */
export function ValidationSummary({
  items,
  title = "Fix these before saving",
  className,
}: {
  items: { field: string; message: string }[];
  title?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div
      role="alert"
      className={cx("rounded-lg px-4 py-3 border border-error", toneClass("error", "soft"), className)}
    >
      <h3 className="text-[12.5px] font-semibold">{title}</h3>
      <ul className="mt-1.5 flex flex-col gap-1">
        {items.map((i) => (
          <li key={`${i.field}-${i.message}`} className="text-[12px]">
            <span className="font-semibold">{i.field}:</span> {i.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Choosers ---------------------------------------------------------------- */

export type Option = { value: string; label: string; hint?: string };

/** A popover anchored under its control. Closes on click-away. */
function Popover({
  open,
  onClose,
  children,
  width = 260,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute left-0 top-full z-50 mt-1 p-1.5 bg-white rounded-lg border border-edge shadow-raised max-h-64 overflow-y-auto"
        style={{ width }}
      >
        {children}
      </div>
    </>
  );
}

/**
 * One choice from a long list, with a search box over it.
 *
 * Use it past about ten options. Under ten, a Select is faster and needs no
 * explanation.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Pick one",
  disabled,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const chosen = options.find((o) => o.value === value);
  const shown = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );

  return (
    <div className={cx("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          "cx-field flex items-center text-left",
          disabled && "opacity-40 cursor-not-allowed",
          !chosen && "text-muted",
        )}
      >
        <span className="flex-1 truncate">{chosen ? chosen.label : placeholder}</span>
        <span aria-hidden className="text-[8px] text-muted">
          ▼
        </span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} width={280}>
        <div className="p-1">
          <SearchInput
            small
            autoFocus
            aria-label="Search the list"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {shown.length === 0 && <div className="px-2 py-3 text-[12px] text-muted">Nothing matches.</div>}
        {shown.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              onChange(o.value);
              setQuery("");
              setOpen(false);
            }}
            className={cx(
              "w-full text-left px-2 py-1.5 rounded text-[12px] hover:bg-surface-grey",
              o.value === value ? "text-primary font-semibold" : "text-secondary",
            )}
          >
            {o.label}
            {o.hint && <span className="block text-[11px] text-muted">{o.hint}</span>}
          </button>
        ))}
      </Popover>
    </div>
  );
}

/**
 * Several choices from a fixed list, shown back as chips so people can see
 * what they picked without opening anything.
 *
 * Use it when the list is known and closed. For free text people invent as
 * they go, use TagInput.
 */
export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Pick any",
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const chosen = options.filter((o) => value.includes(o.value));

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <div className={cx("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="cx-field flex flex-wrap items-center gap-1.5 text-left h-auto min-h-[44px] py-1.5"
      >
        {chosen.length === 0 && <span className="text-muted">{placeholder}</span>}
        {chosen.map((o) => (
          <span
            key={o.value}
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              toneClass("brand", "soft"),
            )}
          >
            {o.label}
            <span
              role="button"
              aria-label={`Remove ${o.label}`}
              onClick={(e) => {
                e.stopPropagation();
                toggle(o.value);
              }}
              className="text-[12px] leading-none opacity-60 hover:opacity-100"
            >
              ×
            </span>
          </span>
        ))}
        <span className="flex-1" />
        <span aria-hidden className="text-[8px] text-muted">
          ▼
        </span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} width={280}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-secondary cursor-pointer hover:bg-surface-grey"
          >
            <input
              type="checkbox"
              checked={value.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="w-3.5 h-3.5 rounded-sm border border-border-idle accent-primary cursor-pointer"
            />
            {o.label}
          </label>
        ))}
      </Popover>
    </div>
  );
}

/**
 * Free-text labels people type as they go. Enter or comma commits one,
 * Backspace on an empty box takes the last one back.
 *
 * Use it for tags nobody governs. If the list is governed, use MultiSelect so
 * people cannot invent a fourth spelling of the same thing.
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const clean = draft.trim().replace(/,$/, "");
    if (clean && !value.includes(clean)) onChange([...value, clean]);
    setDraft("");
  }

  return (
    <div
      className={cx("cx-field flex flex-wrap items-center gap-1.5 h-auto min-h-[44px] py-1.5", className)}
    >
      {value.map((t) => (
        <span
          key={t}
          className={cx(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            toneClass("neutral", "soft"),
          )}
        >
          {t}
          <button
            type="button"
            aria-label={`Remove ${t}`}
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="text-[12px] leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        placeholder={value.length === 0 ? placeholder : ""}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        className="flex-1 min-w-[80px] bg-transparent text-[13px] text-secondary outline-none border-0"
      />
    </div>
  );
}

/**
 * Two to four exclusive choices that each need a sentence of explanation —
 * a plan, an access level, a way of counting.
 *
 * Use it when the difference between the choices is not obvious from the
 * label. When it is obvious, use Segmented or a Select and save the space.
 */
export function RadioCards<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; title: string; description: string }[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const at = { 1: "grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[columns];
  return (
    <div role="radiogroup" className={cx("grid grid-cols-1 gap-2.5", at, className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cx(
              "text-left rounded-lg border p-3 transition-colors",
              on ? "border-primary bg-selected" : "border-edge bg-white hover:border-border-idle",
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cx(
                  "w-3.5 h-3.5 rounded-full border-2 shrink-0 grid place-items-center",
                  on ? "border-primary" : "border-border-idle",
                )}
              >
                {on && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </span>
              <span className={cx("text-[12.5px] font-semibold", on ? "text-primary" : "text-secondary")}>
                {o.title}
              </span>
            </span>
            <span className="block text-[11.5px] text-muted mt-1.5 leading-relaxed">{o.description}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A number people set by feel rather than by typing — a threshold, a weight,
 * a confidence cut-off. The figure is always spelled out beside it.
 *
 * Use it when roughly right is good enough. When the exact number matters, use
 * NumberInput; a slider cannot be typed into.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v: number) => String(v),
  disabled,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full bg-surface-grey accent-primary cursor-pointer disabled:opacity-40"
      />
      <span className="w-16 text-right text-[12.5px] font-semibold cx-num text-secondary">
        {format(value)}
      </span>
    </div>
  );
}

/* Dates -------------------------------------------------------------------- */

/** A from-and-to pair of dates, as ISO days. An empty string means open-ended. */
export type DateRange = { from: string; to: string };

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** The four ranges people ask for, worked out from today. */
export function dateRangePresets(today = new Date()): { label: string; range: DateRange }[] {
  const back = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return iso(d);
  };
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  return [
    { label: "Last 30 days", range: { from: back(30), to: iso(today) } },
    { label: "Last 90 days", range: { from: back(90), to: iso(today) } },
    { label: "This quarter", range: { from: iso(quarterStart), to: iso(today) } },
    { label: "Year to date", range: { from: iso(yearStart), to: iso(today) } },
  ];
}

/**
 * The period a page is about: two dates, with the four ranges people actually
 * ask for as one-click presets.
 *
 * Use it wherever a report has a period. Do not use two loose DateInputs — the
 * presets are the whole point, and an end date before a start date is a bug
 * people will find.
 */
export function DateRangePicker({
  value,
  onChange,
  today,
  className,
}: {
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** Pass a fixed date so a demo or a test reads the same every day. */
  today?: Date;
  className?: string;
}) {
  const presets = useMemo(() => dateRangePresets(today ?? new Date()), [today]);
  const backwards = value.from !== "" && value.to !== "" && value.from > value.to;

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-end gap-2.5">
        <Field label="From" className="w-40">
          <DateInput
            small
            value={value.from}
            invalid={backwards}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </Field>
        <Field label="To" className="w-40">
          <DateInput
            small
            value={value.to}
            invalid={backwards}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
          {presets.map((p) => (
            <Button key={p.label} variant="ghost" size="sm" onClick={() => onChange(p.range)}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      {backwards && (
        <span className="text-[11px] text-error">The end date is before the start date.</span>
      )}
    </div>
  );
}
