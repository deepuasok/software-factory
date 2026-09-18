"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppShell, Badge, BarMeter, Button, Card, Divider, InlineEdit, Label, ListRow,
  ProgressBar, SearchInput, Segmented, SplitPane, StatRow, StatTile, Toast,
  TrendChart,
} from "@factory/ui";
import { seedContracts } from "@/lib/data";
import { byCategory, daysLeft, money, releaseCurve, totals } from "@/lib/model";
import type { Contract, Decision } from "@/lib/types";

const NEXT: Record<Decision, Decision> = { renew: "renegotiate", renegotiate: "drop", drop: "renew" };
const TONE: Record<Decision, "ok" | "warn" | "error"> = { renew: "ok", renegotiate: "warn", drop: "error" };

/**
 * The builder screen.
 *
 * The whole point is the right-hand side moving the moment a call changes on
 * the left — nobody presses Apply to find out what a decision costs.
 */
export default function Plan() {
  const [contracts, setContracts] = useState<Contract[]>(seedContracts);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "cuts">("all");
  const [saved, setSaved] = useState("");

  const t = totals(contracts);
  const target = 8000; // Finance asked for the book to land under $8.0M.
  const shown = contracts.filter((c) => {
    if (view === "cuts" && c.decision === "renew") return false;
    const q = query.trim().toLowerCase();
    return !q || [c.vendor, c.service, c.city].some((f) => f.toLowerCase().includes(q));
  });

  function cycle(id: string) {
    setContracts((cs) => cs.map((c) => (c.id === id ? { ...c, decision: NEXT[c.decision] } : c)));
  }
  function setSpend(id: string, v: number) {
    setContracts((cs) => cs.map((c) => (c.id === id ? { ...c, annualSpendK: Math.round(v) } : c)));
  }

  const cat = byCategory(contracts);
  const worst = Math.max(...cat.map((c) => c.committed));

  return (
    <AppShell
      product="Contract Renewals"
      breadcrumb={<Link href="/" className="hover:text-white">All contracts</Link>}
      width="full"
      topBarRight={
        <>
          <Button size="sm" onClick={() => setContracts(seedContracts())}>Start over</Button>
          <Button variant="primary" size="sm" onClick={() => { setSaved("Plan saved"); setTimeout(() => setSaved(""), 2000); }}>
            Save plan
          </Button>
        </>
      }
    >
      <SplitPane
        railWidth={380}
        rail={
          <>
            <div className="p-3 flex flex-col gap-2 border-b border-edge sticky top-0 bg-white z-10">
              <SearchInput small placeholder="Search vendor, service, city" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  { value: "all", label: "All", count: contracts.length },
                  { value: "cuts", label: "Cuts only", count: contracts.filter((c) => c.decision !== "renew").length },
                ]}
              />
              <p className="text-[11px] text-muted">Click a row to cycle renew → renegotiate → drop. Click a figure to edit it.</p>
            </div>
            {shown.map((c) => (
              <ListRow
                key={c.id}
                selected={c.decision !== "drop"}
                onClick={() => cycle(c.id)}
                title={
                  <span className="flex items-center gap-2">
                    {c.vendor}
                    <Badge tone={TONE[c.decision]}>{c.decision}</Badge>
                  </span>
                }
                subtitle={`${c.service} · ${daysLeft(c)} days left`}
                right={
                  <>
                    <InlineEdit
                      value={c.annualSpendK}
                      onCommit={(v) => setSpend(c.id, v)}
                      format={(v) => money(v)}
                      step={10}
                      className="text-[12px] font-semibold"
                    />
                    <div className="text-[10px] text-muted">{Math.round(c.usage * 100)}% used</div>
                  </>
                }
              />
            ))}
          </>
        }
      >
        <StatRow className="mb-4">
          <StatTile
            label="Spend after this plan"
            value={money(t.after)}
            note={`down from ${money(t.committed)} committed`}
            tone={t.after <= target ? "ok" : "error"}
          />
          <StatTile label="Saved" value={money(t.saved)} note={`${t.savedPct.toFixed(1)}% of the book`} tone="ok" />
          <StatTile
            label="Against the target"
            value={t.after <= target ? `${money(target - t.after)} under` : `${money(t.after - target)} over`}
            note={`finance asked for ${money(target)}`}
            tone={t.after <= target ? "ok" : "error"}
          />
          <StatTile label="Calls made" value={`${t.renewed}/${t.renegotiated}/${t.dropped}`} note="renew / renegotiate / drop" />
        </StatRow>

        <Card title="Spend released as contracts lapse" right="cumulative, next 12 months" className="mb-4">
          <TrendChart
            data={releaseCurve(contracts)}
            xKey="month"
            series={[
              { key: "committed", label: "If everything renews", area: true },
              { key: "planned", label: "This plan" },
            ]}
            height={240}
            valueFormat={(v) => money(v)}
          />
        </Card>

        <Card title="Where the money still sits">
          {/* Progress is measured against the cut that is actually needed, not
              against total spend — a bar that reads 100% while the plan is
              still over budget would be a lie. */}
          <Label>
            {money(t.saved)} cut of the {money(Math.max(0, t.committed - target))} needed to reach {money(target)}
          </Label>
          <div className="mt-2 mb-4">
            <ProgressBar
              value={t.saved}
              target={Math.max(1, t.committed - target)}
              tone={t.after <= target ? "ok" : "warn"}
            />
          </div>
          <Divider className="mb-3" />
          {cat.map((c) => (
            <BarMeter key={c.name} label={c.name} value={c.after} max={worst} display={money(c.after)} />
          ))}
        </Card>
      </SplitPane>
      <Toast message={saved} />
    </AppShell>
  );
}
