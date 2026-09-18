"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityFeed, AppShell, Badge, Button, Card, CommentThread, EmptyState,
  ExplainPanel, PageHeader, SourceBadge, StatRow, StatTile, Tabs,
} from "@factory/ui";
import { useStore, addComment, resolveComment } from "@/lib/store";
import { activityFor, commentsFor } from "@/lib/store";
import { explainLine, money, payAmount, variance } from "@/lib/model";
import { SOURCE_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/types";

export default function LineDetail({ params }: { params: { id: string } }) {
  const { lines, activity, comments } = useStore();
  const [tab, setTab] = useState<"overview" | "comments" | "activity">("overview");
  const line = lines.find((l) => l.id === params.id);

  if (!line) {
    return (
      <AppShell brand="ACME" product="Invoice Reconciliation" breadcrumb="Not found">
        <EmptyState
          title="No such invoice line"
          body="This id is not in the sample data."
          action={<Link href="/"><Button>Back to all invoices</Button></Link>}
        />
      </AppShell>
    );
  }

  const lineComments = commentsFor(comments, line.id);
  const lineActivity = activityFor(activity, line.id);
  const explanation = explainLine(line);
  const pay = payAmount(line);
  const v = variance(line);

  return (
    <AppShell
      brand="ACME"
      product="Invoice Reconciliation"
      breadcrumb={<Link href="/" className="hover:text-white">All invoices</Link>}
      topBarRight={<Link href="/reconcile"><Button variant="primary" size="sm">Reconcile this line</Button></Link>}
    >
      <PageHeader
        title={`${line.supplier} — ${line.description}`}
        meta={
          <>
            <Badge>{line.id}</Badge>
            <Badge>{line.poNumber || "no PO on file"}</Badge>
            <Badge tone={STATUS_TONE[line.status]}>{STATUS_LABEL[line.status]}</Badge>
            <Badge>sample data</Badge>
          </>
        }
        subtitle={`Quantity ${line.quantity} at ${money(line.unitPrice, line.currency)} each. Pay cycle: September 2026.`}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "comments", label: "Comments", count: lineComments.filter((c) => !c.resolved).length },
          { value: "activity", label: "Activity", count: lineActivity.length },
        ]}
        className="mb-4"
      />

      {tab === "overview" && (
        <div className="flex flex-col gap-4">
          <StatRow>
            <StatTile
              label="ERP amount"
              value={line.amountERP === null ? "not reported" : money(line.amountERP, line.currency)}
              tone={line.amountERP === null ? "warn" : "neutral"}
              note={<SourceBadge sourceSystem={SOURCE_LABEL.erp} />}
            />
            <StatTile
              label="Supplier PDF amount"
              value={line.amountSupplierInvoice === null ? "not reported" : money(line.amountSupplierInvoice, line.currency)}
              tone={line.amountSupplierInvoice === null ? "warn" : "neutral"}
              note={<SourceBadge sourceSystem={SOURCE_LABEL.supplierInvoice} />}
            />
            <StatTile
              label="Goods receipt amount"
              value={line.amountGoodsReceipt === null ? "not reported" : money(line.amountGoodsReceipt, line.currency)}
              tone={line.amountGoodsReceipt === null ? "warn" : "neutral"}
              note={<SourceBadge sourceSystem={SOURCE_LABEL.goodsReceipt} />}
            />
            <StatTile
              label="Pay amount"
              value={pay === null ? "no source yet" : money(pay, line.currency)}
              tone={pay === null ? "warn" : line.status === "disputed" ? "error" : "ok"}
              note={
                line.correctedAmount !== undefined
                  ? "human override, overrides every source"
                  : line.trustedSource
                    ? <SourceBadge sourceSystem={`${SOURCE_LABEL[line.trustedSource]} — trusted`} />
                    : "no trusted source chosen yet"
              }
            />
          </StatRow>

          <StatRow>
            <StatTile
              label="Spread between sources"
              value={v === 0 ? "none" : money(v, line.currency)}
              tone={v === 0 ? "ok" : "error"}
              note="highest minus lowest, across whichever sources reported"
            />
          </StatRow>

          <Card title="Why this line is flagged">
            <ExplainPanel
              title="What drove the flag"
              summary={explanation.summary}
              contributions={explanation.contributions}
              valueFormat={(v) => money(v, line.currency)}
            />
          </Card>
        </div>
      )}

      {tab === "comments" && (
        <Card title="Comments">
          <CommentThread
            comments={lineComments}
            onAdd={(body) => addComment(line.id, body)}
            onResolve={resolveComment}
            currentUser="You"
          />
        </Card>
      )}

      {tab === "activity" && (
        <Card title="Activity">
          <ActivityFeed entries={lineActivity} emptyState="Nothing has changed on this line yet." />
        </Card>
      )}
    </AppShell>
  );
}
