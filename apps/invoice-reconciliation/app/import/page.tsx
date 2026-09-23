"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell, Button, Card, ImportWizard, PageHeader, Toast } from "@factory/ui";
import { IMPORT_SPEC, SAMPLE_CSV } from "@/lib/import-spec";
import { MONTH } from "@/lib/data";
import { commitImportedLines } from "@/lib/store";
import type { Currency, InvoiceLine } from "@/lib/types";

function toLine(row: Record<string, unknown>, i: number): InvoiceLine {
  const now = new Date().toISOString();
  const erp = row.amountERP as number | undefined;
  return {
    id: `INV-IMP-${Date.now()}-${i}`,
    supplier: String(row.supplier ?? ""),
    poNumber: String(row.poNumber ?? ""),
    description: String(row.description ?? "Imported line"),
    currency: (row.currency as Currency) ?? "USD",
    quantity: (row.quantity as number) ?? 1,
    unitPrice: (row.unitPrice as number) ?? 0,
    amountERP: erp ?? null,
    amountSupplierInvoice: (row.amountSupplierInvoice as number) ?? null,
    amountGoodsReceipt: (row.amountGoodsReceipt as number) ?? null,
    trustedSource: null,
    status: "unmatched",
    month: MONTH,
    createdAt: now,
    updatedAt: now,
    createdBy: "Import wizard",
  };
}

export default function ImportPage() {
  const [toast, setToast] = useState("");
  const sampleFile = useMemo(
    () => new File([SAMPLE_CSV], "ap-export-september.csv", { type: "text/csv" }),
    [],
  );

  function handleCommit(rows: Record<string, unknown>[]) {
    const lines = rows.map(toLine);
    commitImportedLines(lines);
    setToast(`Imported ${lines.length} line${lines.length === 1 ? "" : "s"} into September 2026`);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <AppShell
      brand="ACME"
      product="Invoice Reconciliation"
      breadcrumb={<Link href="/" className="hover:text-white">All invoices</Link>}
      topBarRight={<Link href="/"><Button variant="secondary" size="sm">Back to the list</Button></Link>}
    >
      <PageHeader
        title="Import supplier invoices"
        subtitle="Sample data. A bundled September AP export loads automatically — drop your own CSV or Excel file instead if you have one. The wizard matches its headers to the fields below, and any row that fails a check is listed and left out of the import."
      />
      <Card>
        <ImportWizard spec={IMPORT_SPEC} onCommit={handleCommit} sampleName="ap-export-september.csv" initialFile={sampleFile} />
      </Card>
      <Toast message={toast} />
    </AppShell>
  );
}
