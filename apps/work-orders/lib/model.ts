import type { Contribution } from "@factory/ui";
import type { Status, WorkOrder } from "./types";

/** Today, fixed, so "hours open" and "days left" do not drift mid-demo. */
export const TODAY = new Date("2027-01-05T08:00:00");

export const HIGH_COST_THRESHOLD_K = 25;

/** Keyword severity read off the reported symptom. Explainable, not a model. */
function symptomSeverity(symptom: string): 1 | 2 | 3 {
  const s = symptom.toLowerCase();
  if (/(leak|fire|smoke|no power|trapped|stuck between floors|flood|gas)/.test(s)) return 3;
  if (/(noise|warm|slow|intermittent|vibrat|dim)/.test(s)) return 1;
  return 2;
}

export function hoursOpen(o: WorkOrder, now: Date = TODAY): number {
  return Math.max(0, Math.round((now.getTime() - new Date(o.openedOn).getTime()) / 3_600_000));
}

export function isPastSla(o: WorkOrder, now: Date = TODAY): boolean {
  return hoursOpen(o, now) > o.slaHours && !["done", "rejected"].includes(o.status);
}

export function slaRatio(o: WorkOrder, now: Date = TODAY): number {
  return hoursOpen(o, now) / o.slaHours;
}

/** Age scores its full 50 points at four times the SLA clock, not at one. */
export const AGE_SATURATES_AT = 4;

/**
 * The urgency contributions, weighted to sum to 100 at their worst: 50 points
 * for age against the SLA clock, 30 for asset criticality, 20 for symptom
 * severity. `ExplainPanel` renders these directly.
 *
 * Age is measured against four times the SLA clock, not one. Scoring the full
 * 50 the moment an order goes one hour late made two thirds of the book score
 * 100, and a ranking where everything ties does not rank anything.
 */
export function urgencyContributions(o: WorkOrder, now: Date = TODAY): Contribution[] {
  const ratio = slaRatio(o, now);
  const ageValue = Math.round(Math.min(50, (ratio / AGE_SATURATES_AT) * 50));
  const criticalityValue = Math.round((o.assetCriticality / 4) * 30);
  const severityValue = Math.round((symptomSeverity(o.reportedSymptom) / 3) * 20);
  return [
    { label: `${hoursOpen(o, now)}h open vs ${o.slaHours}h SLA`, value: ageValue, direction: "up" },
    { label: `Asset criticality ${o.assetCriticality}/4`, value: criticalityValue, direction: "up" },
    { label: "Symptom severity", value: severityValue, direction: "up" },
  ];
}

/** The system-produced urgency score, 0–100. Explainable via `urgencyContributions`. */
export function urgencyScore(o: WorkOrder, now: Date = TODAY): number {
  const total = urgencyContributions(o, now).reduce((a, c) => a + c.value, 0);
  return Math.max(0, Math.min(100, total));
}

/** The score actually used on screen: the human override when one was made, otherwise the model's. */
export function effectiveUrgency(o: WorkOrder): number {
  return o.humanUrgencyOverride?.value ?? o.urgencyScore;
}

export function dueDateFromSla(o: WorkOrder): string {
  const due = new Date(new Date(o.openedOn).getTime() + o.slaHours * 3_600_000);
  return due.toISOString();
}

export type DashboardTotals = {
  open: number;
  pastSla: number;
  awaitingApproval: number;
  doneThisWeek: number;
};

const OPEN_STATUSES: Status[] = ["new", "triaged", "approved", "in progress"];

export function totals(orders: WorkOrder[], now: Date = TODAY): DashboardTotals {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  return {
    open: orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    pastSla: orders.filter((o) => isPastSla(o, now)).length,
    awaitingApproval: orders.filter((o) => o.status === "triaged" && o.estimatedCostK > HIGH_COST_THRESHOLD_K).length,
    doneThisWeek: orders.filter((o) => o.status === "done" && o.closedOn !== undefined && new Date(o.closedOn) >= weekAgo).length,
  };
}

/** The 8 weekly windows the trend chart and the freeze band both key off. */
function trendWeeks(now: Date = TODAY) {
  const weeks: { label: string; start: Date; end: Date }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = new Date(now.getTime() - w * 7 * 86_400_000);
    const end = new Date(start.getTime() + 7 * 86_400_000);
    weeks.push({ label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }), start, end });
  }
  return weeks;
}

/** Open vs closed counts per week, 8 weeks back, for the trend chart. */
export function weeklyTrend(orders: WorkOrder[], now: Date = TODAY) {
  return trendWeeks(now).map(({ label, start, end }) => ({
    week: label,
    open: orders.filter((o) => {
      const opened = new Date(o.openedOn);
      return opened >= start && opened < end;
    }).length,
    closed: orders.filter((o) => {
      if (o.status !== "done" || !o.closedOn) return false;
      const closed = new Date(o.closedOn);
      return closed >= start && closed < end;
    }).length,
  }));
}

/**
 * The holiday freeze: facilities crews ran skeleton staffing Dec 22–Jan 2, so
 * almost nothing closed. Resolved to whichever weeks in the trend window
 * contain those dates, so the shaded band always lines up with the chart.
 */
export function freezeReferenceArea(now: Date = TODAY) {
  const weeks = trendWeeks(now);
  const dec22 = new Date(now.getFullYear() - (now.getMonth() < 6 ? 1 : 0), 11, 22);
  const jan2 = new Date(dec22.getFullYear() + 1, 0, 2);
  const first = weeks.find((w) => dec22 >= w.start && dec22 < w.end) ?? weeks[0]!;
  const last = weeks.find((w) => jan2 >= w.start && jan2 < w.end) ?? first;
  return { x1: first.label, x2: last.label, label: "Holiday freeze" };
}

/** The building carrying the most past-SLA orders, for the readout's takeaway. */
export function worstSlaBuilding(orders: WorkOrder[], now: Date = TODAY): string | null {
  const ranked = pastSlaByBuilding(orders, now).sort((a, b) => b.value - a.value);
  return ranked[0]?.label ?? null;
}

/** Buildings ranked by how many of their orders are past SLA, worst first. */
export function pastSlaByBuilding(orders: WorkOrder[], now: Date = TODAY) {
  const map = new Map<string, number>();
  for (const o of orders) {
    if (!isPastSla(o, now)) continue;
    map.set(o.building, (map.get(o.building) ?? 0) + 1);
  }
  return [...map.entries()].map(([key, value]) => ({ key, label: key, value }));
}

/**
 * The owner carrying the most past-SLA orders. The dashboard's alert names
 * them, because an alert nobody owns is noise people learn to scroll past.
 */
export function pastSlaOwner(orders: WorkOrder[], now: Date = TODAY): { owner: string; count: number } | null {
  const map = new Map<string, number>();
  for (const o of orders) {
    if (!isPastSla(o, now)) continue;
    map.set(o.owner, (map.get(o.owner) ?? 0) + 1);
  }
  const ranked = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return ranked[0] ? { owner: ranked[0][0], count: ranked[0][1] } : null;
}

/** Spend by building, biggest first — the shape StackedBars wants for SLA performance. */
export function slaByBuilding(orders: WorkOrder[], now: Date = TODAY) {
  const map = new Map<string, { name: string; onTime: number; pastSla: number }>();
  for (const o of orders) {
    const row = map.get(o.building) ?? { name: o.building, onTime: 0, pastSla: 0 };
    if (isPastSla(o, now)) row.pastSla += 1;
    else row.onTime += 1;
    map.set(o.building, row);
  }
  return [...map.values()].sort((a, b) => b.pastSla + b.onTime - (a.pastSla + a.onTime));
}

/**
 * Week-over-week deltas for the dashboard's StatRow, derived from the seeded
 * dates rather than hand-picked — "new since last week" for the queue
 * figures, and the real change in past-SLA count when the clock is wound
 * back seven days.
 */
export function weekOverWeekDeltas(orders: WorkOrder[], now: Date = TODAY) {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);
  const openedLast7 = orders.filter((o) => new Date(o.openedOn) >= weekAgo && new Date(o.openedOn) <= now).length;
  const closedLast7 = orders.filter(
    (o) => o.status === "done" && o.closedOn !== undefined && new Date(o.closedOn) >= weekAgo && new Date(o.closedOn) <= now,
  ).length;
  const doneThisWeek = totals(orders, now).doneThisWeek;
  const doneWeekBefore = orders.filter(
    (o) => o.status === "done" && o.closedOn !== undefined && new Date(o.closedOn) >= twoWeeksAgo && new Date(o.closedOn) < weekAgo,
  ).length;
  const awaitingNew7 = orders.filter(
    (o) => o.status === "triaged" && o.estimatedCostK > HIGH_COST_THRESHOLD_K && new Date(o.openedOn) >= weekAgo,
  ).length;
  return {
    open: openedLast7 - closedLast7,
    pastSla: totals(orders, now).pastSla - totals(orders, weekAgo).pastSla,
    awaitingApproval: awaitingNew7,
    doneThisWeek: doneThisWeek - doneWeekBefore,
  };
}

export const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${k}k`);
