"use client";

import React from "react";
import { cx } from "./primitives";

/* App shell ------------------------------------------------------------ */

/**
 * The navy bar across the top of every app in the shop. Optional wordmark,
 * then the product name, then the breadcrumb; actions on the right. Nothing
 * else goes here.
 */
export function TopBar({
  product,
  brand,
  breadcrumb,
  right,
}: {
  product: string;
  /** Your organisation or platform wordmark, sat left of the product name. */
  brand?: string;
  breadcrumb?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="h-topbar bg-secondary text-white flex items-center gap-3 px-5 shrink-0">
      {brand && (
        <>
          <span className="font-bold tracking-tight text-[14px]">{brand}</span>
          <span className="text-white/40">·</span>
        </>
      )}
      <span className="text-[13px] text-white/90">{product}</span>
      {breadcrumb && (
        <>
          <span className="text-white/30 ml-2">/</span>
          <span className="text-[12px] text-white/70 truncate">{breadcrumb}</span>
        </>
      )}
      <div className="flex-1" />
      {right}
    </header>
  );
}

/** Page frame: top bar plus a scrolling body. Every route starts with this. */
export function AppShell({
  product,
  brand,
  breadcrumb,
  topBarRight,
  children,
  width = "wide",
}: {
  product: string;
  /** Your organisation or platform wordmark. Omit it and only the product shows. */
  brand?: string;
  breadcrumb?: React.ReactNode;
  topBarRight?: React.ReactNode;
  children: React.ReactNode;
  /** `wide` centres at 1280px. `full` fills the viewport, for builder screens. */
  width?: "wide" | "full";
}) {
  return (
    <div className="min-h-screen flex flex-col bg-ghost-white">
      <TopBar product={product} brand={brand} breadcrumb={breadcrumb} right={topBarRight} />
      <main className={cx("flex-1", width === "wide" ? "max-w-[1280px] w-full mx-auto px-6 py-6" : "w-full")}>
        {children}
      </main>
    </div>
  );
}

/* Page furniture -------------------------------------------------------- */

/** Title, supporting line and the page's actions. One per page, at the top. */
export function PageHeader({
  title,
  subtitle,
  meta,
  actions,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  /** Small badges under the title — counts, ids, categories. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start gap-4 mb-5", className)}>
      <div className="min-w-0">
        <h1 className="text-[22px] font-bold text-secondary leading-tight">{title}</h1>
        {meta && <div className="flex flex-wrap gap-1.5 mt-2">{meta}</div>}
        {subtitle && <p className="text-[12px] text-muted mt-2 max-w-[70ch]">{subtitle}</p>}
      </div>
      <div className="flex-1" />
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/** A white surface. Optional header row with a title and right-side note. */
export function Card({
  title,
  right,
  padded = true,
  children,
  className,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  /** Turn off for tables and lists that should run edge to edge. */
  padded?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("cx-card", className)}>
      {(title || right) && (
        <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
          {typeof title === "string" ? <h2 className="cx-label">{title}</h2> : title}
          <div className="flex-1" />
          {right && <div className="text-[11px] text-muted">{right}</div>}
        </div>
      )}
      <div className={cx(padded && "px-4 pb-4", !padded && "pb-0")}>{children}</div>
    </section>
  );
}

/** A strip of controls above a list: search, filters, then actions. */
export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-2 mb-3", className)}>{children}</div>
  );
}

/** Left rail plus main area, for builder screens. Rail scrolls on its own. */
export function SplitPane({
  rail,
  children,
  railWidth = 340,
}: {
  rail: React.ReactNode;
  children: React.ReactNode;
  railWidth?: number;
}) {
  return (
    <div className="flex h-[calc(100vh-48px)]">
      <aside
        className="shrink-0 border-r border-edge bg-white overflow-y-auto"
        style={{ width: railWidth }}
      >
        {rail}
      </aside>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  );
}

/**
 * What a list shows before it has anything in it. Always says what the thing
 * is and gives the one action that creates the first one — an empty screen
 * with no way forward is a bug.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="cx-card flex flex-col items-center text-center px-6 py-12">
      <div className="w-10 h-10 rounded-lg bg-surface-grey grid place-items-center mb-3">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#56657E" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 4v16" />
        </svg>
      </div>
      <h3 className="text-[14px] font-semibold text-secondary">{title}</h3>
      {body && <p className="text-[12px] text-muted mt-1.5 max-w-[46ch]">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Evenly spaced grid of cards or tiles. Collapses to one column on phones. */
export function Grid({
  cols = 3,
  children,
  className,
}: {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}) {
  const at = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={cx("grid grid-cols-1 gap-3", at, className)}>{children}</div>;
}
