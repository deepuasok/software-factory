"use client";

import React, { useState } from "react";
import {
  Card,
  CapacityMeterGrid,
  CurveMilestones,
  Gantt,
  PageHeader,
  TargetSolveRail,
  type CapacityCell,
  type GanttRow,
} from "../index";

/** One row of the Gantt. Swap the fields; keep the shape. */
export type SchedulePageRow = GanttRow;

const SAMPLE_ROWS: SchedulePageRow[] = [
  { id: "feas", label: "Feasibility", group: "Start-up", start: "2026-01-05", end: "2026-03-20", progress: 1 },
  { id: "siteid", label: "Site identification", group: "Start-up", start: "2026-02-01", end: "2026-04-15", progress: 1 },
  { id: "reg", label: "Regulatory submission", group: "Start-up", start: "2026-03-10", end: "2026-06-01", progress: 0.9 },
  { id: "activate", label: "Site activation", group: "Start-up", start: "2026-05-01", end: "2026-08-15", progress: 0.6 },
  { id: "enroll1", label: "Enrollment — cohort 1", group: "Enrollment", start: "2026-06-15", end: "2026-12-01", tone: "ok", progress: 0.55 },
  { id: "enroll2", label: "Enrollment — cohort 2", group: "Enrollment", start: "2026-09-01", end: "2027-03-01", tone: "warn", progress: 0.15 },
  { id: "lastvisit", label: "Last patient visit", group: "Close-out", start: "2027-03-01", end: "2027-05-15" },
  { id: "dbclose", label: "Database lock", group: "Close-out", start: "2027-05-01", end: "2027-06-10" },
];

const SAMPLE_CURVE = Array.from({ length: 13 }, (_, i) => {
  const month = i;
  const value = Math.round(320 / (1 + Math.exp(-0.55 * (month - 6))));
  return { date: `2026-${String(6 + Math.min(month, 11)).padStart(2, "0")}-01`, value };
});

const SAMPLE_PERIODS = [
  { id: "q3-26", label: "Q3 2026" },
  { id: "q4-26", label: "Q4 2026" },
  { id: "q1-27", label: "Q1 2027" },
];

const SAMPLE_RESOURCES = [
  { id: "csa", label: "Clinical Site Associates" },
  { id: "monitors", label: "Monitors" },
  { id: "coord", label: "Study Coordinators" },
];

const SAMPLE_CELLS: Record<string, CapacityCell> = {
  "csa:q3-26": { demand: 18, capacity: 22 },
  "csa:q4-26": { demand: 24, capacity: 22 },
  "csa:q1-27": { demand: 20, capacity: 22 },
  "monitors:q3-26": { demand: 9, capacity: 12 },
  "monitors:q4-26": { demand: 14, capacity: 12 },
  "monitors:q1-27": { demand: 11, capacity: 12 },
  "coord:q3-26": { demand: 30, capacity: 36 },
  "coord:q4-26": { demand: 33, capacity: 36 },
  "coord:q1-27": { demand: 27, capacity: 36 },
};

/**
 * The schedule page: the committed date under pressure, the Gantt that shows
 * why, the curve's own checkpoints, and the resourcing behind it.
 *
 * Start here for a study or program timeline that stakeholders argue about.
 * Do not start here for a single date with nothing to compare it against —
 * that is a `StatTile`, not a schedule.
 */
export function SchedulePage({
  rows = SAMPLE_ROWS,
  committedDate = "2027-05-15",
  curve = SAMPLE_CURVE,
  curveTarget = 320,
  periods = SAMPLE_PERIODS,
  resources = SAMPLE_RESOURCES,
  cells = SAMPLE_CELLS,
}: {
  rows?: SchedulePageRow[];
  committedDate?: string;
  curve?: { date: string; value: number }[];
  curveTarget?: number;
  periods?: { id: string; label: string }[];
  resources?: { id: string; label: string }[];
  cells?: Record<string, CapacityCell>;
}) {
  const [target, setTarget] = useState("2027-05-15");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="ST-1042 Atlas — study schedule"
        subtitle="Start-up through database lock, against the committed last-patient-visit date."
      />

      <TargetSolveRail
        total={curveTarget}
        remaining={curveTarget - curve[curve.length - 1].value}
        start="2026-09-17"
        target={target}
        onTargetChange={setTarget}
        maxRate={28}
      />

      <Card title="Study timeline" right="Scroll to zoom, drag to pan.">
        <Gantt
          rows={rows}
          referenceLines={[{ date: committedDate, label: "Committed LPV", tone: "error" }]}
        />
      </Card>

      <Card title="Enrollment curve — computed checkpoints">
        <CurveMilestones curve={curve} target={curveTarget} />
      </Card>

      <Card title="Site-support capacity" right="Demand vs. capacity, by resource and quarter.">
        <CapacityMeterGrid periods={periods} resources={resources} cells={cells} />
      </Card>
    </div>
  );
}
