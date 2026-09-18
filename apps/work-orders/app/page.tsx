"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AppShell, Badge, Banner, Button, Card, DataTable, DueDateBadge, EmptyState, Grid,
  PageHeader, RankedBars, SourceBadge, StatRow, StatTile, TrendChart,
} from "@factory/ui";
import { WorkOrderNav } from "./_nav";
import { seedWorkOrders } from "@/lib/data";
import {
  dueDateFromSla, effectiveUrgency, freezeReferenceArea, isPastSla, pastSlaByBuilding,
  HIGH_COST_THRESHOLD_K, pastSlaOwner, TODAY, totals, weekOverWeekDeltas, weeklyTrend,
} from "@/lib/model";
import type { WorkOrder } from "@/lib/types";

export default function Dashboard() {
  const [orders] = useState<WorkOrder[]>(seedWorkOrders);

  const t = totals(orders);
  const deltas = weekOverWeekDeltas(orders);
  const trend = useMemo(() => weeklyTrend(orders), [orders]);
  const freeze = useMemo(() => freezeReferenceArea(), []);
  const buildings = useMemo(() => pastSlaByBuilding(orders), [orders]);
  const mostUrgent = useMemo(
    () => [...orders].sort((a, b) => effectiveUrgency(b) - effectiveUrgency(a)).slice(0, 10),
    [orders],
  );
  const asOf = TODAY.toISOString();
  const worstOwner = useMemo(() => pastSlaOwner(orders), [orders]);

  return (
    <AppShell
      brand="ACME"
      product="Work Order Triage"
      topBarRight={
        <>
          <WorkOrderNav />
          <Link href="/triage"><Button variant="primary" size="sm">Start triage</Button></Link>
        </>
      }
    >
      <PageHeader
        title="Facilities work order triage"
        meta={
          <>
            <Badge tone="brand">{orders.length} open and closed work orders</Badge>
            <Badge>sample data</Badge>
          </>
        }
        subtitle="Which open work orders get done first this week, and which high-cost jobs get approved. Urgency is a scored, explainable estimate — not a guarantee."
      />

      {t.pastSla > 0 && (
        <Banner
          tone="error"
          title={t.pastSla === 1 ? "1 work order is past its SLA" : `${t.pastSla} work orders are past their SLA`}
          body={
            worstOwner
              ? `${worstOwner.owner} owns the most of them (${worstOwner.count} of ${t.pastSla}) and is accountable for getting them scheduled this week.`
              : "Nobody owns these yet. Assign each one on the board before Friday."
          }
          action={<Link href="/triage"><Button size="sm">Work the queue</Button></Link>}
          className="mb-4"
        />
      )}

      <StatRow wideFirst className="mb-4">
        <StatTile
          label="Open work orders"
          value={t.open}
          note="new, triaged, approved or in progress"
          asOf={asOf}
          delta={{ value: deltas.open, format: (v) => `${v > 0 ? "+" : ""}${v} net this week`, higherIsBetter: false }}
        />
        <StatTile
          label="Past SLA"
          value={t.pastSla}
          tone="error"
          note="hours open already exceed the SLA clock"
          asOf={asOf}
          delta={{ value: deltas.pastSla, higherIsBetter: false }}
        />
        <StatTile
          label="Awaiting approval"
          value={t.awaitingApproval}
          tone="warn"
          note={`triaged, over $${HIGH_COST_THRESHOLD_K}k estimated`}
          asOf={asOf}
          delta={{ value: deltas.awaitingApproval, format: (v) => `+${v} new this week`, higherIsBetter: false }}
        />
        <StatTile
          label="Done this week"
          value={t.doneThisWeek}
          tone="ok"
          note="closed in the last 7 days"
          asOf={asOf}
          delta={{ value: deltas.doneThisWeek }}
        />
      </StatRow>

      <Grid cols={2} className="mb-4 mt-4">
        <Card title="Open vs closed, by week" right="last 8 weeks">
          <TrendChart
            data={trend}
            xKey="week"
            series={[
              { key: "open", label: "Opened" },
              { key: "closed", label: "Closed" },
            ]}
            referenceAreas={[{ x1: freeze.x1, x2: freeze.x2, label: freeze.label, tone: "warn" }]}
            height={230}
          />
        </Card>
        <Card title="Buildings by past-SLA count" right="worst first">
          {buildings.length === 0 ? (
            <EmptyState
              title="No building is past its SLA"
              body="Nothing has run past its service-level agreement clock today."
              action={<Link href="/board"><Button size="sm">See what is open</Button></Link>}
            />
          ) : (
            <RankedBars data={buildings} height={230} valueFormat={(v) => `${v} past SLA`} />
          )}
        </Card>
      </Grid>

      <Card title="Most urgent right now" right="top 10 by urgency score" padded={false}>
        <DataTable
          rows={mostUrgent}
          rowKey={(o) => o.id}
          emptyState={
            <EmptyState
              title="No open work orders"
              body="Nothing is waiting on facilities. New reports land in the triage queue."
              action={<Link href="/triage"><Button size="sm">Open the triage queue</Button></Link>}
            />
          }
          columns={[
            {
              key: "title",
              header: "Work order",
              render: (o) => (
                <div>
                  <div className="font-medium">{o.title}</div>
                  <div className="text-[11px] text-muted">{o.building} · {o.asset}</div>
                </div>
              ),
            },
            { key: "status", header: "Status", render: (o) => <Badge tone={isPastSla(o) ? "error" : "neutral"}>{o.status}</Badge> },
            { key: "owner", header: "Owner", render: (o) => o.owner },
            { key: "cost", header: "Est. cost", align: "right", render: (o) => `$${o.estimatedCostK}k` },
            {
              key: "due",
              header: "Due by SLA",
              align: "right",
              render: (o) => <DueDateBadge date={dueDateFromSla(o)} now={TODAY} />,
            },
            {
              key: "urgency",
              header: "Urgency",
              align: "right",
              render: (o) => (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="cx-num font-semibold">{effectiveUrgency(o)}</span>
                  <SourceBadge
                    sourceSystem={o.humanUrgencyOverride ? "Facilities lead" : "Urgency model"}
                    modelVersion={o.humanUrgencyOverride ? undefined : "v1.2"}
                    confidence={o.humanUrgencyOverride ? undefined : 0.82}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </AppShell>
  );
}
