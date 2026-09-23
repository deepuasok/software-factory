import type { Contract, Decision } from "./types";

/** Today, fixed, so the "days left" figures do not drift mid-demo. */
export const TODAY = new Date("2026-09-17");

/** What a renegotiation is assumed to claw back. Stated, not hidden. */
export const RENEGOTIATION_SAVING = 0.15;

export function daysLeft(c: Contract): number {
  return Math.round((new Date(c.endsOn).getTime() - TODAY.getTime()) / 86_400_000);
}

export function expiringSoon(c: Contract, withinDays = 90): boolean {
  const d = daysLeft(c);
  return d >= 0 && d <= withinDays;
}

/** What each decision costs next year, in thousands. */
export function spendAfter(c: Contract): number {
  if (c.decision === "drop") return 0;
  if (c.decision === "renegotiate") return Math.round(c.annualSpendK * (1 - RENEGOTIATION_SAVING));
  return c.annualSpendK;
}

export type PlanTotals = {
  committed: number;
  after: number;
  saved: number;
  savedPct: number;
  dropped: number;
  renegotiated: number;
  renewed: number;
  atRisk: number;
};

export function totals(contracts: Contract[]): PlanTotals {
  const committed = contracts.reduce((a, c) => a + c.annualSpendK, 0);
  const after = contracts.reduce((a, c) => a + spendAfter(c), 0);
  const count = (d: Decision) => contracts.filter((c) => c.decision === d).length;
  return {
    committed,
    after,
    saved: committed - after,
    savedPct: committed ? ((committed - after) / committed) * 100 : 0,
    dropped: count("drop"),
    renegotiated: count("renegotiate"),
    renewed: count("renew"),
    atRisk: contracts.filter((c) => expiringSoon(c)).reduce((a, c) => a + c.annualSpendK, 0),
  };
}

/** Spend by category, biggest first — the shape CategoryBars wants. */
export function byCategory(contracts: Contract[]) {
  const map = new Map<string, { name: string; committed: number; after: number }>();
  for (const c of contracts) {
    const row = map.get(c.category) ?? { name: c.category, committed: 0, after: 0 };
    row.committed += c.annualSpendK;
    row.after += spendAfter(c);
    map.set(c.category, row);
  }
  return [...map.values()].sort((a, b) => b.committed - a.committed);
}

/** Cumulative spend released month by month as contracts lapse. */
export function releaseCurve(contracts: Contract[]) {
  const months: { month: string; committed: number; planned: number }[] = [];
  let cumCommitted = 0;
  let cumPlanned = 0;
  for (let m = 0; m < 12; m++) {
    const d = new Date(TODAY);
    d.setMonth(d.getMonth() + m);
    for (const c of contracts) {
      const end = new Date(c.endsOn);
      if (end.getFullYear() === d.getFullYear() && end.getMonth() === d.getMonth()) {
        cumCommitted += c.annualSpendK;
        cumPlanned += spendAfter(c);
      }
    }
    months.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      committed: cumCommitted,
      planned: cumPlanned,
    });
  }
  return months;
}

export const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${k}k`);
