"use client";

import React from "react";
import { Button, cx } from "./primitives";
import { toneClass } from "../tone";
import { motion, type Tone } from "../tokens";

/* Banner ----------------------------------------------------------------- */

/**
 * A page-level message that needs attention before people work the page.
 *
 * Use it once, above the page header, for something true right now — a sync
 * failure, a maintenance window, a deadline moved. For a message that lives
 * inside one card next to the thing it is about, use InlineAlert instead.
 */
export function Banner({
  tone = "info",
  title,
  body,
  action,
  onDismiss,
  className,
}: {
  tone?: Tone;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  /** Pass this to show the dismiss control. Leave it out and the banner stays put. */
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cx(
        "flex items-start gap-3 rounded-lg border px-4 py-3",
        toneClass(tone, "soft"),
        toneClass(tone, "border"),
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{title}</div>
        {body && <div className="text-[12px] mt-0.5 opacity-90">{body}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="shrink-0 w-5 h-5 grid place-items-center rounded hover:bg-black/5 text-[13px] leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

/* InlineAlert -------------------------------------------------------------- */

/**
 * One line of state inside a card, with an optional second line of detail.
 *
 * Use it next to the thing it is about — a stale figure, a field that failed
 * validation on the server, a note about how a number was derived. For a
 * message that needs its own row above the whole page, use Banner instead.
 */
export function InlineAlert({
  tone = "info",
  children,
  detail,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  detail?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-start gap-2 rounded-md px-3 py-2 text-[12px]",
        toneClass(tone, "soft"),
        className,
      )}
    >
      <span className={cx("w-1.5 h-1.5 rounded-full mt-1 shrink-0", toneClass(tone, "fill"))} />
      <div className="min-w-0">
        <div className="font-medium">{children}</div>
        {detail && <div className="opacity-80 mt-0.5">{detail}</div>}
      </div>
    </div>
  );
}

/* ErrorState --------------------------------------------------------------- */

/**
 * What a panel shows when it could not load, instead of pretending it is
 * merely empty.
 *
 * Use it for a fetch or a calculation that failed and can be retried. For a
 * list, chart or panel that loaded fine and simply has nothing in it, use
 * EmptyState — that one names the thing and offers to create the first one,
 * which is the wrong offer here.
 */
export function ErrorState({
  title,
  body,
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div className={cx("cx-card flex flex-col items-center text-center px-6 py-12", className)}>
      <div className={cx("w-10 h-10 rounded-lg grid place-items-center mb-3", toneClass("error", "soft"))}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v6M12 16.5h.01" />
        </svg>
      </div>
      <h3 className="text-[14px] font-semibold text-secondary">{title}</h3>
      {body && <p className="text-[12px] text-muted mt-1.5 max-w-[46ch]">{body}</p>}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/* Skeleton ------------------------------------------------------------------ */

const SHIMMER_EASE = motion.fast.split(" ")[1] ?? "ease";

/**
 * Written out once, not per instance, so several skeletons on a page share the
 * same `<style>` rather than fighting Tailwind's "only keep what it can see"
 * rule with an inline animation string.
 */
const SHIMMER_KEYFRAMES = `@keyframes cx-shimmer { 0% { background-position: 160% 0; } 100% { background-position: -60% 0; } }`;

function shimmerStyle(): React.CSSProperties {
  return {
    backgroundImage:
      "linear-gradient(90deg, rgba(7,29,73,0.06) 25%, rgba(7,29,73,0.12) 37%, rgba(7,29,73,0.06) 63%)",
    backgroundSize: "400% 100%",
    animation: `cx-shimmer 1600ms ${SHIMMER_EASE} infinite`,
  };
}

/**
 * A placeholder for a part that has not loaded yet, in its shape.
 *
 * Use `"text"` in place of a paragraph or a stat's caveat line, `"tile"` in
 * place of a StatTile, `"table"` in place of a DataTable's rows. Swap it for
 * the real content the moment data arrives — it never stands in for
 * ErrorState or EmptyState, which are both known outcomes, not a wait.
 */
export function Skeleton({
  variant = "text",
  lines = 3,
  className,
}: {
  variant?: "text" | "tile" | "table";
  /** Line count for `"text"`, row count for `"table"`. Ignored by `"tile"`. */
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cx("select-none", className)} aria-hidden>
      <style>{SHIMMER_KEYFRAMES}</style>
      {variant === "text" && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded"
              style={{ ...shimmerStyle(), width: i === lines - 1 ? "60%" : "100%" }}
            />
          ))}
        </div>
      )}
      {variant === "tile" && <div className="cx-card h-[84px] rounded-lg" style={shimmerStyle()} />}
      {variant === "table" && (
        <div className="cx-card overflow-hidden">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cx("h-9 px-3 flex items-center", i < lines - 1 && "border-b border-edge")}
            >
              <div className="h-2.5 rounded w-full" style={shimmerStyle()} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Callout -------------------------------------------------------------------- */

/**
 * The one insight a report is making, called out so it survives skimming.
 *
 * Use it once per section of a report, right after the chart it is about,
 * with one or two full sentences — not a repeat of the chart's numbers. It is
 * never a place to park a caveat; that belongs under the figure it qualifies.
 */
export function Callout({
  tone = "brand",
  label = "Takeaway",
  children,
  className,
}: {
  tone?: Tone;
  /** The eyebrow above the sentence. "Takeaway" is the default and the usual choice. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-lg border-l-4 px-4 py-3",
        toneClass(tone, "border"),
        toneClass(tone, "soft"),
        className,
      )}
    >
      <div className="cx-label mb-1">{label}</div>
      <p className="text-[12.5px] leading-relaxed">{children}</p>
    </div>
  );
}

/* Section / JumpList ---------------------------------------------------------- */

/**
 * An anchored heading for a long page, with room for a right-side slot.
 *
 * Use it to break a report or a builder screen into named parts a JumpList
 * can point at. For an ordinary page with one thing on it, use PageHeader —
 * a page does not need an anchor to itself.
 */
export function Section({
  id,
  title,
  right,
  children,
  className,
}: {
  /** The anchor JumpList jumps to. Must be unique on the page. */
  id: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cx("scroll-mt-16", className)}>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[16px] font-bold text-secondary">{title}</h2>
        <div className="flex-1" />
        {right}
      </div>
      {children}
    </section>
  );
}

/**
 * The in-page table of contents for a page built from Sections.
 *
 * Use it once, near the top of a long page, pointing at every Section's id.
 * It is navigation within one page — for navigating to another page or
 * record, that is Breadcrumb or a row click, not this.
 */
export function JumpList({
  items,
  className,
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Jump to section"
      className={cx("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]", className)}
    >
      {items.map((it) => (
        <a key={it.id} href={`#${it.id}`} className="font-medium text-muted hover:text-primary">
          {it.label}
        </a>
      ))}
    </nav>
  );
}

/* PrintLayout ------------------------------------------------------------------ */

/**
 * An A4-ish page for something meant to be printed or saved as a PDF: a
 * report, a summary sent up the chain.
 *
 * Use it instead of AppShell when the whole point of the screen is the
 * printed sheet, not the working tool around it — the Print button and the
 * app's own chrome (top bar, wide max-width) disappear from the printed page
 * automatically. For a page people work in on screen, use AppShell.
 */
export function PrintLayout({
  title,
  stamp,
  actions,
  children,
  className,
}: {
  title: string;
  /** A short "As of ..." line saying when the figures were pulled. */
  stamp?: React.ReactNode;
  /** Extra buttons beside Print — never a substitute for it. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("cx-print-layout mx-auto bg-white px-8 py-8", className)} style={{ maxWidth: "820px" }}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-secondary leading-tight">{title}</h1>
          {stamp && <div className="text-[11px] text-muted mt-1">{stamp}</div>}
        </div>
        <div className="cx-print-hide flex items-center gap-2 shrink-0">
          {actions}
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-7">{children}</div>
    </div>
  );
}
