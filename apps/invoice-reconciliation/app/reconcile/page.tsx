"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ActivityFeed, AppShell, Badge, Button, Card, DataTable, EmptyState, OverrideControl,
  PageHeader, Radio, RankedBars, SourceBadge, type Column,
} from "@factory/ui";
import { useStore, setTrustedSource, submitOverride } from "@/lib/store";
import { MONTH } from "@/lib/data";
import { FX_CAVEAT, gapBySupplier, money, payAmount, variance } from "@/lib/model";
import { REASON_LABEL, SOURCE_LABEL, type InvoiceLine, type SourceKey } from "@/lib/types";

function SourceCell({
  line,
  source,
}: {
  line: InvoiceLine;
  source: SourceKey;
}) {
  const value = source === "erp" ? line.amountERP : source === "supplierInvoice" ? line.amountSupplierInvoice : line.amountGoodsReceipt;
  if (value === null) {
    return <span className="text-[12px] text-muted italic">not reported</span>;
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="cx-num font-semibold text-secondary">{money(value, line.currency)}</span>
      <div className="flex items-center gap-1.5">
        <SourceBadge sourceSystem={SOURCE_LABEL[source]} />
        <Radio
          name={`trusted-${line.id}`}
          label="Trusted"
          checked={line.trustedSource === source}
          onChange={() => setTrustedSource(line.id, source)}
        />
      </div>
    </div>
  );
}

export default function ReconcilePage() {
  const { lines, activity } = useStore();
  const monthLines = useMemo(() => lines.filter((l) => l.month === MONTH), [lines]);
  const needsAttention = useMemo(
    () => monthLines.filter((l) => variance(l) > 0 || l.status === "unmatched" || l.status === "disputed"),
    [monthLines],
  );
  const bySupplier = gapBySupplier(monthLines).slice(0, 8);

  const columns: Column<InvoiceLine>[] = [
    {
      key: "line",
      header: "Line",
      render: (l) => (
        <div>
          <div className="font-medium">{l.supplier}</div>
          <div className="text-[11px] text-muted">{l.id} · {l.poNumber || "no PO"}</div>
        </div>
      ),
    },
    { key: "erp", header: "ERP", render: (l) => <SourceCell line={l} source="erp" /> },
    { key: "supplierInvoice", header: "Supplier PDF", render: (l) => <SourceCell line={l} source="supplierInvoice" /> },
    { key: "goodsReceipt", header: "Goods receipt", render: (l) => <SourceCell line={l} source="goodsReceipt" /> },
    {
      key: "pay",
      header: "Pay amount",
      align: "right",
      render: (l) => {
        const amount = payAmount(l);
        if (amount === null) return <span className="text-[12px] text-warn font-semibold">no source yet</span>;
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="cx-num font-semibold text-secondary">{money(amount, l.currency)}</span>
            {l.correctedAmount !== undefined ? (
              <SourceBadge sourceSystem={`Corrected by hand — ${REASON_LABEL[l.reasonCode ?? "other"]}`} />
            ) : l.trustedSource ? (
              <SourceBadge sourceSystem={`${SOURCE_LABEL[l.trustedSource]} — trusted`} />
            ) : (
              <span className="text-[10px] text-muted">no source chosen yet</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppShell
      brand="ACME"
      product="Invoice Reconciliation"
      breadcrumb={<Link href="/" className="hover:text-white">All invoices</Link>}
      topBarRight={<Link href="/readout"><Button variant="secondary" size="sm">Open the readout</Button></Link>}
    >
      <div>
        <PageHeader
          title="Reconcile September invoices"
          meta={<Badge>sample data</Badge>}
          subtitle="Pick the source you trust per line, or override every source with a figure of your own and a reason. Every choice is written to the activity trail on the right."
        />

        <Card
          title="Where the sources disagree, by supplier"
          right={`top 8 suppliers · widest gap to ERP on each line, summed · ${FX_CAVEAT}`}
          className="mb-4"
        >
          {bySupplier.length === 0 ? (
            <EmptyState
              title="Every source agrees"
              body="No supplier has a line where ERP and another system report a different figure."
              action={<Link href="/import"><Button size="sm">Import invoices</Button></Link>}
            />
          ) : (
            <RankedBars data={bySupplier} valueFormat={(v) => money(v)} height={Math.max(160, bySupplier.length * 34)} />
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          {needsAttention.length === 0 ? (
            <Card>
              <EmptyState
                title="Nothing left to reconcile"
                body="Every line this month has a trusted source and no open variance."
                action={<Link href="/"><Button>Back to the list</Button></Link>}
              />
            </Card>
          ) : (
            <Card padded={false} title={`${needsAttention.length} lines need a call`}>
              <DataTable
                rows={needsAttention}
                columns={columns}
                rowKey={(l) => l.id}
                dense
                renderExpanded={(l) => (
                  <OverrideControl
                    field={`${l.id} pay amount`}
                    modelValue={payAmount(l) === null ? "no figure" : money(payAmount(l)!, l.currency)}
                    onOverride={(o) => {
                      const amount = Number(o.humanValue.replace(/[^0-9.-]/g, ""));
                      if (!Number.isFinite(amount)) return;
                      submitOverride(l.id, amount, o.reasonCode, o.reasonText);
                    }}
                  />
                )}
              />
            </Card>
          )}

          <Card title="Activity">
            <ActivityFeed entries={activity} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
