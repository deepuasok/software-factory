"use client";

import React, { useState } from "react";
import { Button, Chip, cx } from "./primitives";
import { Select, TextInput } from "./fields";
import type { SortState } from "./data";
import type { Tone } from "../tokens";

/* State ----------------------------------------------------------------- */

/** The operators a filter row can use. Spelled out, because people read them. */
export type FilterOperator = "is" | "is not" | "contains" | "is more than" | "is less than" | "is empty";

export const FILTER_OPERATORS: readonly FilterOperator[] = [
  "is",
  "is not",
  "contains",
  "is more than",
  "is less than",
  "is empty",
] as const;

/** One line of the advanced filter: field, operator, value. */
export type FilterRule = { id: string; field: string; operator: FilterOperator; value: string };

/** Everything the filter bar holds: the chips that are on, and the rules. */
export type FilterState = { chips: string[]; rules: FilterRule[] };

/** A filter bar with nothing switched on. Use it as the starting value. */
export const emptyFilterState: FilterState = { chips: [], rules: [] };

/** A field people can filter on, and the values it offers. */
export type FilterField = {
  key: string;
  label: string;
  /** Offer a fixed list instead of a free-text box. */
  choices?: string[];
  operators?: FilterOperator[];
};

/** A chip on the bar: one common filter, one click. */
export type FilterChip = { key: string; label: string; count?: number; tone?: Tone };

/** A named filter and sort people can come back to. */
export type SavedView = { id: string; name: string; filters: FilterState; sort?: SortState };

let ruleSeq = 0;
function newRuleId() {
  ruleSeq += 1;
  return `rule-${ruleSeq}`;
}

/* Filter bar ------------------------------------------------------------- */

/**
 * The filters above a list: the two or three people use every day as chips,
 * and anything else behind "Add a filter".
 *
 * Use it on any list long enough that people narrow it. Do not use it as a
 * navigation bar — a filter that changes which page you are on is a tab.
 */
export function FilterBar({
  value,
  onChange,
  chips = [],
  fields = [],
  right,
  className,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** The everyday filters, always visible. Three is plenty. */
  chips?: FilterChip[];
  /** What the advanced rows can filter on. Leave empty to hide the rows. */
  fields?: FilterField[];
  /** Saved views, an export button — anything that sits at the right end. */
  right?: React.ReactNode;
  className?: string;
}) {
  const [showRules, setShowRules] = useState(value.rules.length > 0);

  function toggleChip(key: string) {
    const on = value.chips.includes(key);
    onChange({ ...value, chips: on ? value.chips.filter((k) => k !== key) : [...value.chips, key] });
  }

  function addRule() {
    const first = fields[0];
    if (!first) return;
    setShowRules(true);
    onChange({
      ...value,
      rules: [...value.rules, { id: newRuleId(), field: first.key, operator: "is", value: "" }],
    });
  }

  function editRule(id: string, patch: Partial<FilterRule>) {
    onChange({ ...value, rules: value.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }

  function removeRule(id: string) {
    onChange({ ...value, rules: value.rules.filter((r) => r.id !== id) });
  }

  const busy = value.chips.length + value.rules.length;

  return (
    <div className={cx("flex flex-col gap-2 mb-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <Chip
            key={c.key}
            on={value.chips.includes(c.key)}
            onToggle={() => toggleChip(c.key)}
            count={c.count}
            tone={c.tone}
          >
            {c.label}
          </Chip>
        ))}
        {fields.length > 0 && (
          <Button variant="ghost" size="sm" onClick={addRule}>
            Add a filter
          </Button>
        )}
        {busy > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange(emptyFilterState)}>
            Clear all
          </Button>
        )}
        <div className="flex-1" />
        {right}
      </div>

      {showRules && value.rules.length > 0 && (
        <div className="flex flex-col gap-2 cx-card p-3">
          {value.rules.map((rule) => {
            const field = fields.find((f) => f.key === rule.field) ?? fields[0];
            const operators = field?.operators ?? FILTER_OPERATORS;
            return (
              <div key={rule.id} className="flex flex-wrap items-center gap-2">
                <Select
                  small
                  aria-label="Field"
                  value={rule.field}
                  onChange={(e) => editRule(rule.id, { field: e.target.value, value: "" })}
                  className="w-44"
                >
                  {fields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </Select>
                <Select
                  small
                  aria-label="Operator"
                  value={rule.operator}
                  onChange={(e) => editRule(rule.id, { operator: e.target.value as FilterOperator })}
                  className="w-36"
                >
                  {operators.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </Select>
                {rule.operator === "is empty" ? (
                  <span className="text-[12px] text-muted">no value needed</span>
                ) : field?.choices ? (
                  <Select
                    small
                    aria-label="Value"
                    value={rule.value}
                    onChange={(e) => editRule(rule.id, { value: e.target.value })}
                    className="w-48"
                  >
                    <option value="">Pick one</option>
                    {field.choices.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <TextInput
                    small
                    aria-label="Value"
                    value={rule.value}
                    placeholder="Value"
                    onChange={(e) => editRule(rule.id, { value: e.target.value })}
                    className="w-48"
                  />
                )}
                <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Saved views ------------------------------------------------------------ */

/**
 * The named filter sets people come back to — "My studies", "Overdue".
 *
 * Use it once a list has filters worth setting twice. Do not use it to hold a
 * one-off query; that is what the filter bar is for.
 */
export function SavedViews({
  views,
  activeId,
  onSelect,
  onSave,
  onDelete,
  className,
}: {
  views: SavedView[];
  activeId?: string | null;
  onSelect: (id: string | null) => void;
  /** Called with the name people typed. The caller captures the current state. */
  onSave?: (name: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const active = views.find((v) => v.id === activeId);

  function save() {
    const clean = name.trim();
    if (!clean || !onSave) return;
    onSave(clean);
    setName("");
    setOpen(false);
  }

  return (
    <div className={cx("relative", className)}>
      <Button variant="secondary" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {active ? active.name : "All records"}
        <span aria-hidden className="text-[8px] opacity-60">
          ▼
        </span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-64 p-1.5 bg-white rounded-lg border border-edge shadow-raised">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className={cx(
                "w-full text-left px-2 h-7 rounded text-[12px] hover:bg-surface-grey",
                !activeId ? "text-primary font-semibold" : "text-secondary",
              )}
            >
              All records
            </button>
            {views.map((v) => (
              <div key={v.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(v.id);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex-1 text-left px-2 h-7 rounded text-[12px] truncate hover:bg-surface-grey",
                    v.id === activeId ? "text-primary font-semibold" : "text-secondary",
                  )}
                >
                  {v.name}
                </button>
                {onDelete && (
                  <button
                    type="button"
                    aria-label={`Delete ${v.name}`}
                    onClick={() => onDelete(v.id)}
                    className="w-6 h-6 rounded text-muted hover:bg-selected hover:text-error text-[14px] leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {onSave && (
              <div className="flex items-center gap-1.5 border-t border-edge mt-1.5 pt-2">
                <TextInput
                  small
                  aria-label="View name"
                  placeholder="Name this view"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                />
                <Button variant="secondary" size="sm" disabled={!name.trim()} onClick={save}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* Hook -------------------------------------------------------------------- */

/**
 * The state a list page keeps: sort, filters, ticked rows, and the saved view
 * people are looking at.
 *
 * Use it so every list page in the shop keeps the same things in the same
 * shape. Do not use it to hold the rows themselves — this hook knows nothing
 * about your data.
 */
export function useTableState(initial?: {
  sort?: SortState;
  filters?: FilterState;
  views?: SavedView[];
}) {
  const [sort, setSort] = useState<SortState>(initial?.sort ?? null);
  const [filters, setFilters] = useState<FilterState>(initial?.filters ?? emptyFilterState);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [views, setViews] = useState<SavedView[]>(initial?.views ?? []);
  const [activeView, setActiveView] = useState<string | null>(null);

  function selectView(id: string | null) {
    setActiveView(id);
    if (id === null) {
      setFilters(emptyFilterState);
      return;
    }
    const view = views.find((v) => v.id === id);
    if (!view) return;
    setFilters(view.filters);
    setSort(view.sort ?? null);
  }

  function saveView(name: string) {
    const view: SavedView = { id: `view-${Date.now()}`, name, filters, sort };
    setViews((v) => [...v, view]);
    setActiveView(view.id);
  }

  function deleteView(id: string) {
    setViews((v) => v.filter((x) => x.id !== id));
    setActiveView((a) => (a === id ? null : a));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  return {
    sort,
    setSort,
    filters,
    setFilters,
    selected,
    setSelected,
    clearSelection,
    views,
    activeView,
    selectView,
    saveView,
    deleteView,
  };
}
