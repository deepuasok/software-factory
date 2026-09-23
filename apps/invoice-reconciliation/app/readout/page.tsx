"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Button, Callout, JumpList, PrintLayout, Section, StackedBars, Waterfall, DivergingBars,
} from "@factory/ui";
import { useStore } from "@/lib/store";
import { MONTH } from "@/lib/data";
import { FX_CAVEAT, money, statusBySupplier, totals, varianceBySupplier, waterfallSteps } from "@/lib/model";

const SECTIONS = [
  { id: "bridge", label: "ERP to pay amount" },
  { id: "status", label: "Status by supplier" },
  { id: "variance", label: "Variance by supplier" },
];

export default function ReadoutPage() {
  const { lines } = useStore();
  const monthLines = useMemo(() => lines.filter((l) => l.month === MONTH), [lines]);
  const t = totals(monthLines);
  const { erpTotal, steps } = waterfallSteps(monthLines);
  const endTotal = erpTotal + steps.reduce((a, s) => a + s.value, 0);
  const heldAsDisputed = Math.abs(steps.find((s) => s.label === "Held as disputed")?.value ?? 0);
  // Capped at eight so the sheet stays one page on paper — the archetype's
  // whole point is that nobody scrolls a readout.
  const byStatus = statusBySupplier(monthLines).slice(0, 8);
  const bySupplier = varianceBySupplier(monthLines)
    .filter((s) => s.value !== 0)
    .slice(0, 8);

  return (
    <PrintLayout
      title="Invoice reconciliation readout — September 2026"
      stamp={`As of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Sample data. ${FX_CAVEAT}.`}
      actions={<Link href="/"><Button variant="ghost" size="sm">Back to invoices</Button></Link>}
    >
      <Callout tone="brand" label="Executive summary">
        {t.readyToPayCount} of {monthLines.length} lines are approved and ready to pay, totaling{" "}
        {money(t.readyToPay)}. A further {t.disputed} lines, worth {money(heldAsDisputed)} in the books, are
        held as disputed and are excluded from this total until they clear.
      </Callout>

      <JumpList items={SECTIONS} />

      <Section id="bridge" title="ERP to pay amount">
        <Waterfall
          start={erpTotal}
          startLabel="ERP total"
          steps={steps}
          endLabel="Agreed to pay"
          height={260}
          valueFormat={(v) => money(v)}
        />
        <Callout tone={endTotal < erpTotal ? "warn" : "ok"} className="mt-3">
          The ERP books {money(erpTotal)} for this cycle. After corrections, source reconciliation, lines ERP never
          saw and disputes held back, {money(endTotal)} is what the plan actually pays.
        </Callout>
      </Section>

      <Section id="status" title="Status by supplier, top 8">
        <StackedBars
          data={byStatus}
          xKey="supplier"
          series={[
            { key: "unmatched", label: "Unmatched" },
            { key: "matched", label: "Matched" },
            { key: "corrected", label: "Corrected" },
            { key: "disputed", label: "Disputed" },
            { key: "approved", label: "Approved" },
          ]}
          height={Math.max(200, byStatus.length * 34)}
        />
        <Callout tone="brand" className="mt-3">
          {t.unmatched} lines across the book still have no trusted source. Those need a reconcile pass before
          they can move to approved.
        </Callout>
      </Section>

      <Section id="variance" title="Variance by supplier, where a decision moved the figure">
        <DivergingBars
          data={bySupplier}
          higherIsBetter={false}
          valueFormat={(v) => money(v)}
          height={Math.max(120, bySupplier.length * 34)}
        />
        <Callout tone="warn" className="mt-3">
          {bySupplier[0]
            ? `${bySupplier[0].label} carries the largest gap to ERP this month, at ${money(Math.abs(bySupplier[0].value))}. Suppliers whose lines still sit at the ERP figure are left out.`
            : "No decision has moved a figure away from ERP yet this month."}
        </Callout>
      </Section>
    </PrintLayout>
  );
}
