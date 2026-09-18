"use client";

import { useMemo } from "react";
import { Badge, Callout, DataTable, JumpList, PrintLayout, Section, StackedBars, Waterfall } from "@factory/ui";
import { WorkOrderNav } from "../_nav";
import { seedWorkOrders } from "@/lib/data";
import { effectiveUrgency, HIGH_COST_THRESHOLD_K, slaByBuilding, TODAY, totals, worstSlaBuilding } from "@/lib/model";
import type { WorkOrder } from "@/lib/types";

const QUARTERLY_BUDGET_K = 250;
const COMMITTED_STATUSES: WorkOrder["status"][] = ["approved", "in progress", "done"];

const SECTIONS = [
  { id: "sla", label: "SLA performance" },
  { id: "cost", label: "Cost approved" },
  { id: "risk", label: "Top risks" },
];

export default function Readout() {
  const orders = useMemo(seedWorkOrders, []);
  const t = totals(orders);
  const sla = slaByBuilding(orders);
  const worstBuilding = worstSlaBuilding(orders);

  const spendSteps = useMemo(() => {
    const byBuilding = new Map<string, number>();
    for (const o of orders) {
      if (!COMMITTED_STATUSES.includes(o.status)) continue;
      byBuilding.set(o.building, (byBuilding.get(o.building) ?? 0) + o.estimatedCostK);
    }
    return [...byBuilding.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, k]) => ({ label, value: -k }));
  }, [orders]);
  const remainingK = QUARTERLY_BUDGET_K + spendSteps.reduce((a, s) => a + s.value, 0);

  const topRisks = useMemo(
    () =>
      [...orders]
        .filter((o) => o.status !== "done" && o.status !== "rejected")
        .sort((a, b) => effectiveUrgency(b) - effectiveUrgency(a))
        .slice(0, 8),
    [orders],
  );

  return (
    <PrintLayout
      title="Facilities work order readout"
      stamp={`As of ${TODAY.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Sample data — figures are for the proof, not a live budget.`}
      actions={<WorkOrderNav />}
    >
      <Callout tone="brand" label="Executive summary">
        {t.pastSla} work orders are past their SLA and {t.awaitingApproval} are waiting on an approval above
        ${HIGH_COST_THRESHOLD_K}k. The quarter&rsquo;s facilities budget has ${remainingK}k remaining against a
        ${QUARTERLY_BUDGET_K}k commitment.
      </Callout>

      <JumpList items={SECTIONS} />

      <Section id="sla" title="SLA performance, by building">
        <StackedBars
          data={sla}
          xKey="name"
          series={[
            { key: "onTime", label: "On time" },
            { key: "pastSla", label: "Past SLA" },
          ]}
          height={220}
        />
        <Callout tone={t.pastSla > 3 ? "error" : "warn"} className="mt-3">
          {worstBuilding ?? "No building"} carries the most past-SLA orders. Facilities should route its next
          available crew there first.
        </Callout>
      </Section>

      <Section id="cost" title="Cost approved this quarter">
        <Waterfall
          start={QUARTERLY_BUDGET_K}
          startLabel="Budget"
          steps={spendSteps}
          endLabel="Remaining"
          height={240}
          valueFormat={(v) => `$${v}k`}
        />
        <Callout tone={remainingK < 0 ? "error" : "ok"} className="mt-3">
          {remainingK < 0
            ? `Approved and completed work has run $${Math.abs(remainingK)}k over the quarter's budget.`
            : `$${remainingK}k of the $${QUARTERLY_BUDGET_K}k quarterly budget is still uncommitted.`}
        </Callout>
      </Section>

      <Section id="risk" title="Top risks">
        <DataTable
          rows={topRisks}
          rowKey={(o) => o.id}
          columns={[
            { key: "title", header: "Work order", render: (o) => o.title },
            { key: "building", header: "Building", render: (o) => o.building },
            { key: "status", header: "Status", render: (o) => <Badge>{o.status}</Badge> },
            { key: "cost", header: "Est. cost", align: "right", render: (o) => `$${o.estimatedCostK}k` },
            { key: "urgency", header: "Urgency", align: "right", render: (o) => <span className="cx-num font-semibold">{effectiveUrgency(o)}</span> },
          ]}
        />
        <Callout tone="warn" className="mt-3">
          The top {Math.min(3, topRisks.length)} rows above account for most of the past-SLA exposure. They need
          a decision this week, not next.
        </Callout>
      </Section>
    </PrintLayout>
  );
}
