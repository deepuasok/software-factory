"use client";

import React, { useEffect, useRef, useState } from "react";
import { cx } from "./primitives";

/* Field wrapper -------------------------------------------------------- */

/**
 * Every input in the shop is wrapped in this. It owns the label, the hint and
 * the error line, so spacing and error styling never drift between forms.
 */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[12px] font-semibold text-secondary">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-muted">{hint}</span>
      ) : null}
    </div>
  );
}

/* Inputs --------------------------------------------------------------- */

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { small?: boolean; invalid?: boolean };

export function TextInput({ small, invalid, className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cx("cx-field", small && "cx-field-sm", className)}
    />
  );
}

export function NumberInput(props: InputProps) {
  return <TextInput type="number" {...props} />;
}

export function DateInput(props: InputProps) {
  return <TextInput type="date" {...props} />;
}

export function TextArea({
  rows = 3,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      {...rest}
      className={cx("cx-field", className)}
      style={{ height: "auto", padding: "10px 12px", lineHeight: 1.5, ...rest.style }}
    />
  );
}

export function Select({
  small,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { small?: boolean }) {
  return (
    <select {...rest} className={cx("cx-field", small && "cx-field-sm", className)}>
      {children}
    </select>
  );
}

/** Search is a distinct shape — magnifier inside, never a bare text box. */
export function SearchInput({
  small,
  className,
  ...rest
}: InputProps) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none"
        stroke="#56657E"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        {...rest}
        className={cx("cx-field pl-9", small && "cx-field-sm pl-8", className)}
      />
    </div>
  );
}

/* Choice controls ------------------------------------------------------ */

/**
 * A switch for a setting that takes effect immediately. If the change only
 * applies after a Save, use Checkbox instead — that distinction is the whole
 * reason both exist.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "inline-flex items-center gap-2 text-[12px]",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <span
        className={cx(
          "relative inline-block w-9 h-5 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border-idle",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
      {label && <span className="text-secondary">{label}</span>}
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={cx("inline-flex items-center gap-2 text-[12px]", disabled ? "opacity-40" : "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded-sm border border-border-idle accent-primary cursor-pointer"
      />
      {label && <span className="text-secondary">{label}</span>}
    </label>
  );
}

/**
 * Two to four exclusive choices that switch a view. More than four, or choices
 * that are not exclusive, belong in Chips or a Select.
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={cx("inline-flex rounded-lg border border-border-idle bg-white p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx(
            "h-7 px-3 rounded text-[11px] font-semibold transition-colors whitespace-nowrap",
            value === o.value ? "bg-primary text-white" : "text-muted hover:text-primary",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="cx-num opacity-70"> · {o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* Inline edit ---------------------------------------------------------- */

/**
 * A number that becomes an input when clicked. Commit on Enter or blur,
 * abandon on Escape.
 *
 * Use it wherever a figure gets nudged repeatedly while people argue over a
 * plan — making that cost a dialog is what kills these tools.
 */
export function InlineEdit({
  value,
  onCommit,
  format,
  step = 1,
  min = 0,
  suffix = "",
  title,
  className,
}: {
  value: number;
  onCommit: (next: number) => void;
  format: (v: number) => string;
  step?: number;
  min?: number;
  suffix?: string;
  title?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  function commit() {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= min && n !== value) onCommit(n);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        min={min}
        step={step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        onClick={(e) => e.stopPropagation()}
        className={cx("cx-field cx-field-sm cx-num w-16 text-right", className)}
      />
    );
  }

  return (
    <button
      type="button"
      title={title ?? "Click to edit"}
      onClick={(e) => {
        e.stopPropagation();
        setDraft(String(value));
        setEditing(true);
      }}
      className={cx(
        "cx-num rounded px-1 -mx-1 hover:bg-selected hover:text-primary transition-colors cursor-text",
        className,
      )}
    >
      {format(value)}
      {suffix}
    </button>
  );
}
