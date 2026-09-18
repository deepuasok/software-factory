"use client";

import React from "react";
import { toneClass } from "../tone";
import { color, type Tone } from "../tokens";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* Button -------------------------------------------------------------- */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Written out in full on purpose. Tailwind only keeps a component class it can
 * literally see in the source, so a template string like `cx-btn-${variant}`
 * gets the styles stripped at build time and the button renders as bare text.
 */
const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: "cx-btn-primary",
  secondary: "cx-btn-secondary",
  ghost: "cx-btn-ghost",
  danger: "cx-btn-danger",
};
const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "cx-btn-sm",
  md: "",
  lg: "cx-btn-lg",
};

/**
 * The button. There is one.
 *
 * `primary` is the single action the page wants you to take — at most one per
 * view. `secondary` is everything else. `ghost` is for toolbar and row-level
 * actions that should not compete. `danger` is for destructive actions and is
 * always paired with a confirm step.
 */
export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "cx-btn",
        BTN_VARIANT[variant],
        BTN_SIZE[size],
        className,
      )}
    />
  );
}

/* Badge --------------------------------------------------------------- */

/** Kept so older callers keep compiling. `Tone` is the name to use. */
export type BadgeTone = Tone;

/** A read-only fact about a row: status, category, count. Never clickable. */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        toneClass(tone, "soft"),
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * A ranked band — site tier, risk level, priority. Rank 1 is always the
 * darkest and always the best, so the eye learns one rule across every app.
 */
export function RankBadge({ rank, prefix = "T" }: { rank: 1 | 2 | 3 | 4; prefix?: string }) {
  const bg = { 1: "bg-rank-1", 2: "bg-rank-2", 3: "bg-rank-3", 4: "bg-rank-4" }[rank];
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded text-[10px] font-bold text-white px-1.5 py-0.5 min-w-[22px]",
        bg,
      )}
    >
      {prefix}
      {rank}
    </span>
  );
}

/* Chip ---------------------------------------------------------------- */

/**
 * A filter you can switch on and off. Chips are for narrowing a list; if the
 * choices are exclusive and few, use Segmented instead.
 *
 * `tone` colours the switched-on state — use it when the chip filters by
 * status, so the chip matches the badge in the rows it keeps. Leave it alone
 * for an ordinary filter.
 */
export function Chip({
  on = false,
  onToggle,
  count,
  tone = "brand",
  children,
  className,
}: {
  on?: boolean;
  onToggle?: () => void;
  count?: number;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const toned = tone !== "brand";
  return (
    <button
      type="button"
      data-on={toned ? undefined : on}
      onClick={onToggle}
      className={cx(
        "cx-chip",
        toned && on && toneClass(tone, "bg"),
        toned && on && toneClass(tone, "border"),
        toned && on && "hover:text-white hover:border-current",
        className,
      )}
    >
      {children}
      {count !== undefined && <span className="cx-num opacity-70">· {count}</span>}
    </button>
  );
}

/* Misc ---------------------------------------------------------------- */

/** An eyebrow label above a value. Uppercase, tracked, muted, always small. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("cx-label", className)}>{children}</div>;
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color.edge} strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke={color.primary} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A hairline. Use instead of stacking margins to imply a break. */
export function Divider({ className }: { className?: string }) {
  return <div className={cx("border-t border-edge", className)} />;
}

export { cx };
