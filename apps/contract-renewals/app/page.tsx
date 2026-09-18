"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AppShell, Badge, Button, Card, CategoryBars, Chip, DataTable, EmptyState, Grid,
  Legend, PageHeader, RankBadge, SearchInput, Segmented, Sparkline, StatRow,
  StatTile, Toolbar, TrendChart, WorldMap, color, series,
} from "@factory/ui";
import { seedContracts, UNDERUSED } from "@/lib/data";
import { byCategory, daysLeft, expiringSoon, money, releaseCurve, totals } from "@/lib/model";
import type { Contract } from "@/lib/types";

type View = "all" | "expiring" | "underused";

export default function Dashboard() {
  const [contracts] = useState<Contract[]>(seedContracts);
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<string[]>([]);

  const categories = useMemo(
    () => [...new Set(contracts.map((c) => c.category))].sort(),
    [contracts],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contracts.filter((c) => {
      if (view === "expiring" && !expiringSoon(c)) return false;
      if (view === "underused" && c.usage >= UNDERUSED) return false;
      if (cats.length && !cats.includes(c.category)) return false;
      if (q && ![c.vendor, c.service, c.city, c.country].some((f) => f.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [contracts, view, cats, query]);

  const t = totals(contracts);
  const expiringCount = contracts.filter((c) => expiringSoon(c)).length;
  const underusedCount = contracts.filter((c) => c.usage < UNDERUSED).length;

  const toggleCat = (c: string) =>
    setCats((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));

  return (
    <AppShell
      product="Contract Renewals"
      breadcrumb="All contracts"
      topBarRight={
        <Link href="/plan">
          <Button variant="primary" size="sm">Build the renewal plan</Button>
        </Link>
      }
    >
      <PageHeader
        title="Vendor contracts"
        meta={
          <>
            <Badge tone="brand">FY27 cycle</Badge>
            <Badge>{contracts.length} contracts</Badge>
            <Badge tone="warn">{expiringCount} expiring in 90 days</Badge>
            <Badge>sample data</Badge>
          </>
        }
        subtitle="Which agreements to renew, renegotiate or let lapse before the next budget lands. Figures are committed spend for the coming twelve months."
        actions={<Button>Export list</Button>}
      />

      <StatRow className="mb-4">
        <StatTile label="Committed spend" value={money(t.committed)} note="next 12 months, all contracts" />
        <StatTile label="Up for renewal" value={money(t.atRisk)} note={`${expiringCount} contracts inside 90 days`} tone="warn" />
        <StatTile label="Paying for unused volume" value={underusedCount} note={`under ${Math.round(UNDERUSED * 100)}% of contracted volume used`} tone="error" />
        <StatTile label="Saving in the draft plan" value={money(t.saved)} note={`${t.savedPct.toFixed(0)}% off committed spend`} tone="ok" />
      </StatRow>

      <Grid cols={2} className="mb-4">
        <Card title="Spend released as contracts lapse" right="cumulative, next 12 months">
          <TrendChart
            data={releaseCurve(contracts)}
            xKey="month"
            series={[
              { key: "committed", label: "If everything renews", area: true },
              { key: "planned", label: "Draft plan" },
            ]}
            height={230}
            valueFormat={(v) => money(v)}
          />
        </Card>
        <Card title="Where the money sits" right="committed spend by category">
          <CategoryBars
            data={byCategory(contracts)}
            xKey="name"
            series={[
              { key: "committed", label: "Committed" },
              { key: "after", label: "Draft plan" },
            ]}
            horizontal
            height={230}
            valueFormat={(v) => money(v)}
          />
        </Card>
      </Grid>

      <Card title="Vendor locations" right="filled = in the draft plan" className="mb-4">
        <WorldMap
          height={260}
          points={contracts.map((c) => ({
            id: c.id,
            city: c.city,
            country: c.country,
            active: c.decision !== "drop",
            label: `${c.vendor} — ${c.city}, ${c.country}`,
          }))}
        />
        <Legend
          items={[
            { color: color.primary, label: "renewing or renegotiating" },
            { color: color.white, label: "letting lapse" },
          ]}
        />
      </Card>

      <Toolbar>
        <SearchInput
          small
          className="w-64"
          placeholder="Search vendor, service, city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "all", label: "All", count: contracts.length },
            { value: "expiring", label: "Expiring", count: expiringCount },
            { value: "underused", label: "Underused", count: underusedCount },
          ]}
        />
        {categories.map((c) => (
          <Chip key={c} on={cats.includes(c)} onToggle={() => toggleCat(c)}>
            {c}
          </Chip>
        ))}
        <div className="flex-1" />
        <span className="text-[11px] text-muted">{shown.length} shown</span>
      </Toolbar>

      <Card padded={false}>
        {shown.length === 0 ? (
          <EmptyState
            title="No contracts match"
            body="Clear a filter, or widen the search."
            action={<Button onClick={() => { setQuery(""); setCats([]); setView("all"); }}>Clear filters</Button>}
          />
        ) : (
          <DataTable
            rows={shown}
            rowKey={(c) => c.id}
            columns={[
              {
                key: "vendor",
                header: "Vendor",
                render: (c) => (
                  <Link href={`/contracts/${c.id}`} className="block hover:text-primary">
                    <div className="font-medium">{c.vendor}</div>
                    <div className="text-[11px] text-muted">{c.service} · {c.city}, {c.country}</div>
                  </Link>
                ),
              },
              { key: "category", header: "Category", render: (c) => <Badge>{c.category}</Badge> },
              { key: "risk", header: "Risk", render: (c) => <RankBadge rank={c.risk} prefix="R" /> },
              { key: "spend", header: "Annual spend", align: "right", render: (c) => money(c.annualSpendK) },
              {
                key: "usage",
                header: "Volume used",
                align: "right",
                render: (c) => (
                  <span className={c.usage < UNDERUSED ? "text-error font-semibold" : undefined}>
                    {Math.round(c.usage * 100)}%
                  </span>
                ),
              },
              { key: "trend", header: "Monthly spend", align: "right", render: (c) => <Sparkline values={c.history} tone={series[0]} /> },
              {
                key: "ends",
                header: "Ends",
                align: "right",
                render: (c) => {
                  const d = daysLeft(c);
                  return (
                    <div>
                      <div>{new Date(c.endsOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                      <div className={`text-[11px] ${d <= 90 ? "text-warn font-semibold" : "text-muted"}`}>
                        {d} days left
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "decision",
                header: "Draft call",
                align: "right",
                render: (c) => (
                  <Badge tone={c.decision === "renew" ? "ok" : c.decision === "renegotiate" ? "warn" : "error"}>
                    {c.decision}
                  </Badge>
                ),
              },
            ]}
          />
        )}
      </Card>
    </AppShell>
  );
}
