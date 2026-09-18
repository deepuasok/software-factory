"use client";

import React, { useState } from "react";
import {
  ActivityFeed,
  Card,
  DataTable,
  OverrideControl,
  PageHeader,
  SourceBadge,
  recordChange,
  type ActivityEntry,
  type Column,
} from "../index";

type SourceValue = { sourceSystem: string; value: string; modelVersion?: string; confidence?: number };

type ReconcileRow = {
  field: string;
  trusted: "catalyst" | "ecsa" | "aiEnrollmentModeler";
  catalyst: SourceValue;
  ecsa: SourceValue;
  aiEnrollmentModeler: SourceValue;
};

const SAMPLE_ROWS: ReconcileRow[] = [
  {
    field: "Enrolment forecast (patients)",
    trusted: "catalyst",
    catalyst: { sourceSystem: "CATALYST model", value: "720", modelVersion: "2.4.1", confidence: 0.82 },
    ecsa: { sourceSystem: "ECSA", value: "640" },
    aiEnrollmentModeler: { sourceSystem: "AI Enrollment Modeler", value: "705", modelVersion: "1.9", confidence: 0.6 },
  },
  {
    field: "Sites needed",
    trusted: "catalyst",
    catalyst: { sourceSystem: "CATALYST model", value: "84", modelVersion: "2.4.1", confidence: 0.9 },
    ecsa: { sourceSystem: "ECSA", value: "90" },
    aiEnrollmentModeler: { sourceSystem: "AI Enrollment Modeler", value: "88", modelVersion: "1.9", confidence: 0.55 },
  },
  {
    field: "Time to last patient in",
    trusted: "ecsa",
    catalyst: { sourceSystem: "CATALYST model", value: "38 weeks", modelVersion: "2.4.1", confidence: 0.64 },
    ecsa: { sourceSystem: "ECSA", value: "41 weeks" },
    aiEnrollmentModeler: { sourceSystem: "AI Enrollment Modeler", value: "36 weeks", modelVersion: "1.9", confidence: 0.48 },
  },
];

const SOURCE_LABEL: Record<ReconcileRow["trusted"], string> = {
  catalyst: "CATALYST",
  ecsa: "ECSA",
  aiEnrollmentModeler: "AI Enrollment Modeler",
};

/**
 * A reconciliation page: the same field reported by three sources side by
 * side, a "trusted" choice per row, and an inline `OverrideControl` for
 * anyone who disagrees with all three. Every override lands in the
 * `ActivityFeed` on the right.
 *
 * Use it wherever CATALYST, ECSA and the AI Enrollment Modeler disagree on a
 * number and someone has to pick one on the record. Do not use it for a
 * field only one system produces — there is nothing to reconcile.
 */
export function ReconcilePage({
  title = "Reconcile enrolment figures — M26-092",
  subtitle = "Sample data. Pick the source you trust per field, or override with a reason.",
  rows = SAMPLE_ROWS,
}: {
  title?: string;
  subtitle?: string;
  rows?: ReconcileRow[];
}) {
  const [trusted, setTrusted] = useState<Record<string, ReconcileRow["trusted"]>>(
    Object.fromEntries(rows.map((r) => [r.field, r.trusted])),
  );
  const [activity, setActivity] = useState<ActivityEntry[]>([
    recordChange({ verb: "changed", actor: "Moyo Shobowale", field: "Sites needed", from: "90 (ECSA)", to: "84 (CATALYST)", at: new Date(Date.now() - 3600000).toISOString() }),
  ]);

  function setRowTrusted(field: string, source: ReconcileRow["trusted"]) {
    const row = rows.find((r) => r.field === field);
    if (!row) return;
    const from = SOURCE_LABEL[trusted[field]] ?? SOURCE_LABEL[row.trusted];
    setTrusted((prev) => ({ ...prev, [field]: source }));
    setActivity((prev) => [
      recordChange({ verb: "chose", actor: "You", field, from: `${row[trusted[field]].value} (${from})`, to: `${row[source].value} (${SOURCE_LABEL[source]})`, at: new Date().toISOString() }),
      ...prev,
    ]);
  }

  function handleOverride(field: string, opts: { humanValue: string; reasonCode: string; reasonText: string; modelValue: string }) {
    setActivity((prev) => [
      recordChange({ verb: "overrode", actor: "You", field, from: opts.modelValue, to: `${opts.humanValue} (${opts.reasonCode})`, at: new Date().toISOString() }),
      ...prev,
    ]);
  }

  function renderSourceCell(v: SourceValue, field: string, source: ReconcileRow["trusted"]) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="cx-num font-semibold text-secondary">{v.value}</span>
        <div className="flex items-center gap-1.5">
          <SourceBadge sourceSystem={v.sourceSystem} modelVersion={v.modelVersion} confidence={v.confidence} />
          <label className="inline-flex items-center gap-1 text-[10px] text-muted cursor-pointer">
            <input
              type="radio"
              name={`trusted-${field}`}
              checked={trusted[field] === source}
              onChange={() => setRowTrusted(field, source)}
              className="w-3 h-3 accent-primary cursor-pointer"
            />
            Trusted
          </label>
        </div>
      </div>
    );
  }

  const columns: Column<ReconcileRow>[] = [
    { key: "field", header: "Field", render: (r) => <span className="font-medium">{r.field}</span> },
    { key: "catalyst", header: "CATALYST", render: (r) => renderSourceCell(r.catalyst, r.field, "catalyst") },
    { key: "ecsa", header: "ECSA", render: (r) => renderSourceCell(r.ecsa, r.field, "ecsa") },
    { key: "aiEnrollmentModeler", header: "AI Enrollment Modeler", render: (r) => renderSourceCell(r.aiEnrollmentModeler, r.field, "aiEnrollmentModeler") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <Card padded={false}>
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.field}
            dense
            renderExpanded={(r) => (
              <OverrideControl
                field={r.field}
                modelValue={r[trusted[r.field]].value}
                onOverride={(o) => handleOverride(r.field, o)}
              />
            )}
          />
        </Card>

        <Card title="Activity">
          <ActivityFeed entries={activity} />
        </Card>
      </div>
    </div>
  );
}
