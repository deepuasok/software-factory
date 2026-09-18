"use client";

import React from "react";

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

export type BadgeTone = "neutral" | "brand" | "ok" | "warn" | "error" | "info";

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "border border-border-idle text-muted bg-white",
  brand: "bg-selected text-primary",
  ok: "bg-[#E6F3EC] text-ok",
  warn: "bg-[#FBF0DF] text-warn",
  error: "bg-[#FBE9E6] text-error",
  info: "bg-[#E4F2FA] text-info",
};

/** A read-only fact about a row: status, category, count. Never clickable. */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        BADGE_TONE[tone],
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
 */
export function Chip({
  on = false,
  onToggle,
  count,
  children,
  className,
}: {
  on?: boolean;
  onToggle?: () => void;
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" data-on={on} onClick={onToggle} className={cx("cx-chip", className)}>
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
      <circle cx="12" cy="12" r="9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="#1B3975" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A hairline. Use instead of stacking margins to imply a break. */
export function Divider({ className }: { className?: string }) {
  return <div className={cx("border-t border-edge", className)} />;
}

export { cx };
