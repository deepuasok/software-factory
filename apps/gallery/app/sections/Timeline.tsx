"use client";

import { useState } from "react";
import {
  Card,
  CapacityMeterGrid,
  CurveMilestones,
  Gantt,
  Grid,
  TargetSolveRail,
  type CapacityCell,
  type GanttRow,
} from "@factory/ui";

/* Sample data — three groups, so the legend and the pan/zoom have something
   to earn their keep. */
const ROWS: GanttRow[] = [
  { id: "feas", label: "Feasibility", group: "Start-up", start: "2026-01-05", end: "2026-03-20", progress: 1 },
  { id: "siteid", label: "Site identification", group: "Start-up", start: "2026-02-01", end: "2026-04-15", progress: 1 },
  { id: "reg", label: "Regulatory submission", group: "Start-up", start: "2026-03-10", end: "2026-06-01", progress: 0.9 },
  { id: "activate", label: "Site activation", group: "Start-up", start: "2026-05-01", end: "2026-08-15", progress: 0.6 },
  { id: "enroll1", label: "Enrollment — cohort 1", group: "Enrollment", start: "2026-06-15", end: "2026-12-01", tone: "ok", progress: 0.55 },
  { id: "enroll2", label: "Enrollment — cohort 2", group: "Enrollment", start: "2026-09-01", end: "2027-03-01", tone: "warn", progress: 0.15 },
  { id: "lastvisit", label: "Last patient visit", group: "Close-out", start: "2027-03-01", end: "2027-05-15" },
  { id: "dbclose", label: "Database lock", group: "Close-out", start: "2027-05-01", end: "2027-06-10" },
];

const CURVE = Array.from({ length: 13 }, (_, i) => {
  // June 2026 to June 2027, an S-curve that reaches the target on the last point.
  const d = new Date(2026, 5 + i, 1);
  const value = i === 12 ? 320 : Math.round(320 / (1 + Math.exp(-0.7 * (i - 6))));
  return { date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`, value };
});

const PERIODS = [
  { id: "q3-26", label: "Q3 2026" },
  { id: "q4-26", label: "Q4 2026" },
  { id: "q1-27", label: "Q1 2027" },
];
const RESOURCES = [
  { id: "csa", label: "Clinical Site Associates" },
  { id: "monitors", label: "Monitors" },
  { id: "coord", label: "Study Coordinators" },
];
/** Monitors run over capacity in Q4 — the cell the grid exists to surface. */
const CELLS: Record<string, CapacityCell> = {
  "csa:q3-26": { demand: 18, capacity: 22 },
  "csa:q4-26": { demand: 24, capacity: 22 },
  "csa:q1-27": { demand: 20, capacity: 22 },
  "monitors:q3-26": { demand: 9, capacity: 12 },
  "monitors:q4-26": { demand: 15, capacity: 12 },
  "monitors:q1-27": { demand: 11, capacity: 12 },
  "coord:q3-26": { demand: 30, capacity: 36 },
  "coord:q4-26": { demand: 33, capacity: 36 },
  "coord:q1-27": { demand: 27, capacity: 36 },
};

function Part({ name, when, children }: { name: string; when: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-4">
      <h3 className="text-[13px] font-bold text-secondary">{name}</h3>
      <p className="text-[11.5px] text-muted mt-1 mb-3.5 leading-relaxed">{when}</p>
      {children}
    </div>
  );
}

/**
 * Timeline and planning parts: `Gantt`, `CurveMilestones`, `CapacityMeterGrid`
 * and `TargetSolveRail`, each with sample data and a caption.
 */
export function TimelineSection() {
  const [feasibleTarget, setFeasibleTarget] = useState("2027-05-15");
  const [infeasibleTarget, setInfeasibleTarget] = useState("2026-11-01");

  return (
    <div className="flex flex-col gap-5">
      <Part
        name="Gantt"
        when="Use it for concurrent spans people compare side by side — cohorts, workstreams, site activation. Scroll to zoom, drag to pan; the window is clamped to the data range."
      >
        <Card padded={false}>
          <div className="p-4">
            <Gantt
              rows={ROWS}
              referenceLines={[{ date: "2027-05-15", label: "Committed LPV", tone: "error" }]}
            />
          </div>
        </Card>
      </Part>

      <Grid cols={2}>
        <Part
          name="CurveMilestones"
          when="Use it when the milestone dates come out of a model, not a fixed plan — the dates here are read off the curve, never typed in."
        >
          <Card>
            <CurveMilestones curve={CURVE} target={320} />
          </Card>
        </Part>

        <Part
          name="CapacityMeterGrid"
          when="Use it to catch one resource overloaded in one period. Monitors run over capacity in Q4 2026 below."
        >
          <Card padded={false}>
            <div className="p-2">
              <CapacityMeterGrid periods={PERIODS} resources={RESOURCES} cells={CELLS} />
            </div>
          </Card>
        </Part>
      </Grid>

      <Grid cols={2}>
        <Part
          name="TargetSolveRail — feasible"
          when="Use it wherever someone tests a target date against a total. Below the ceiling, the readout stays brand."
        >
          <TargetSolveRail
            total={320}
            remaining={185}
            start="2026-09-17"
            target={feasibleTarget}
            onTargetChange={setFeasibleTarget}
            maxRate={28}
          />
        </Part>

        <Part
          name="TargetSolveRail — infeasible"
          when="Pass `maxRate` and a date past it turns the readout error, with the reason spelled out underneath."
        >
          <TargetSolveRail
            total={320}
            remaining={185}
            start="2026-09-17"
            target={infeasibleTarget}
            onTargetChange={setInfeasibleTarget}
            maxRate={28}
          />
        </Part>
      </Grid>
    </div>
  );
}
