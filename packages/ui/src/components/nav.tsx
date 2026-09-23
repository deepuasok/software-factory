"use client";

import React from "react";
import { cx } from "./primitives";

/** Tabs switch between views of the same record. They never navigate away. */
export function Tabs<T extends string>({
  value,
  tabs,
  onChange,
  className,
}: {
  value: T;
  tabs: { value: T; label: string; count?: number }[];
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center gap-1 border-b border-edge", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          aria-selected={value === t.value}
          className={cx(
            "px-3 h-9 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors",
            value === t.value
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-secondary",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="cx-num opacity-60"> {t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Where am I, and how do I get back. Last crumb is the current page. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-muted">
      {items.map((i, n) => (
        <React.Fragment key={i.label}>
          {n > 0 && <span className="text-border-idle">/</span>}
          {i.href ? (
            <a href={i.href} className="hover:text-primary">
              {i.label}
            </a>
          ) : (
            <span className="text-secondary font-medium">{i.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/** A left nav for apps with more than three top-level sections. */
export function SideNav({
  items,
  active,
  onSelect,
}: {
  items: { value: string; label: string; count?: number }[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {items.map((i) => (
        <button
          key={i.value}
          type="button"
          onClick={() => onSelect(i.value)}
          className={cx(
            "flex items-center gap-2 h-8 px-3 rounded-md text-[12.5px] font-medium text-left transition-colors",
            active === i.value ? "bg-selected text-primary" : "text-muted hover:bg-surface-grey",
          )}
        >
          <span className="flex-1 truncate">{i.label}</span>
          {i.count !== undefined && <span className="cx-num text-[11px] opacity-70">{i.count}</span>}
        </button>
      ))}
    </nav>
  );
}
