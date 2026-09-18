"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AppShell, Badge, Button, Card, CategoryBars, EmptyState, Grid, MilestoneRail,
  PageHeader, RankBadge, Segmented, StatRow, StatTile, Tabs, TrendChart,
  WorldMap,
} from "@factory/ui";
import { seedContracts, UNDERUSED } from "@/lib/data";
import { daysLeft, money, RENEGOTIATION_SAVING, spendAfter } from "@/lib/model";
import type { Decision } from "@/lib/types";

export default function ContractDetail({ params }: { params: { id: string } }) {
  const [contracts, setContracts] = useState(seedContracts);
  const [tab, setTab] = useState("spend");
  const contract = contracts.find((c) => c.id === params.id);

  if (!contract) {
    return (
      <AppShell brand="ACME" product="Contract Renewals" breadcrumb="Not found">
        <EmptyState
          title="No such contract"
          body="This id is not in the sample data."
          action={<Link href="/"><Button variant="primary">Back to all contracts</Button></Link>}
        />
      </AppShell>
    );
  }

  const setDecision = (d: Decision) =>
    setContracts((cs) => cs.map((c) => (c.id === contract.id ? { ...c, decision: d } : c)));

  const monthly = contract.history.map((v, i) => ({
    month: new Date(2025, 8 + i, 1).toLocaleDateString("en-US", { month: "short" }),
    spend: v,
  }));
  const end = new Date(contract.endsOn);

  return (
    <AppShell
      brand="ACME"
      product="Contract Renewals"
      breadcrumb={<Link href="/" className="hover:text-white">All contracts</Link>}
      topBarRight={<Link href="/plan"><Button variant="primary" size="sm">Build the renewal plan</Button></Link>}
    >
      <PageHeader
        title={contract.vendor}
        meta={
          <>
            <Badge tone="brand">{contract.category}</Badge>
            <Badge>{contract.id}</Badge>
            <RankBadge rank={contract.risk} prefix="R" />
            {contract.usage < UNDERUSED && <Badge tone="error">underused</Badge>}
          </>
        }
        subtitle={`${contract.service} · ${contract.city}, ${contract.country}`}
        actions={
          <Segmented
            value={contract.decision}
            onChange={(d) => setDecision(d as Decision)}
            options={[
              { value: "renew", label: "Renew" },
              { value: "renegotiate", label: "Renegotiate" },
              { value: "drop", label: "Drop" },
            ]}
          />
        }
      />

      <StatRow className="mb-4">
        <StatTile label="Committed spend" value={money(contract.annualSpendK)} note="next 12 months" />
        <StatTile
          label="Cost of this call"
          value={money(spendAfter(contract))}
          note={
            contract.decision === "renegotiate"
              ? `assumes ${Math.round(RENEGOTIATION_SAVING * 100)}% clawed back`
              : contract.decision === "drop"
                ? "nothing carried forward"
                : "unchanged"
          }
          tone={contract.decision === "drop" ? "ok" : contract.decision === "renegotiate" ? "warn" : "default"}
        />
        <StatTile
          label="Volume used"
          value={`${Math.round(contract.usage * 100)}%`}
          note={contract.usage < UNDERUSED ? "paying for volume nobody used" : "in line with the contract"}
          tone={contract.usage < UNDERUSED ? "error" : "ok"}
        />
        <StatTile
          label="Time left"
          value={`${daysLeft(contract)}d`}
          note={`ends ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
          tone={daysLeft(contract) <= 90 ? "warn" : "default"}
        />
      </StatRow>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[{ value: "spend", label: "Spend" }, { value: "where", label: "Where" }]}
        className="mb-4"
      />

      {tab === "spend" ? (
        <Grid cols={2}>
          <Card title="Monthly spend, last 12 months">
            <TrendChart data={monthly} xKey="month" series={[{ key: "spend", label: "Spend", area: true }]} height={230} valueFormat={(v) => money(v)} />
          </Card>
          <Card title="What each call costs next year">
            <CategoryBars
              data={[
                { name: "Renew", value: contract.annualSpendK },
                { name: "Renegotiate", value: Math.round(contract.annualSpendK * (1 - RENEGOTIATION_SAVING)) },
                { name: "Drop", value: 0 },
              ]}
              xKey="name"
              series={[{ key: "value", label: "Next 12 months" }]}
              horizontal
              height={230}
              valueFormat={(v) => money(v)}
            />
          </Card>
          <Card title="Renewal runway" className="lg:col-span-2">
            <MilestoneRail
              items={[
                { label: "Notice window opens", date: end.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
                { label: "Decision due", date: new Date(end.getTime() - 60 * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
                { label: "Paperwork", date: new Date(end.getTime() - 30 * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
                { label: "Contract ends", date: end.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
              ]}
            />
          </Card>
        </Grid>
      ) : (
        <Card title="Vendor location">
          <WorldMap
            height={300}
            points={[{ id: contract.id, city: contract.city, country: contract.country, active: true, label: contract.vendor }]}
          />
        </Card>
      )}
    </AppShell>
  );
}
