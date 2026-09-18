"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AppShell, Badge, Button, Card, EmptyState, ExportButton, FilterBar, HeatCell,
  PageHeader, SavedViews, StatRow, StatTile, StatusPill, DataTable, Toolbar,
  useTableState, type Column, type FilterChip,
} from "@factory/ui";
import { useStore, setStatus } from "@/lib/store";
import { MONTH } from "@/lib/data";
import { FX_CAVEAT, VARIANCE_THRESHOLD_TOTAL, erpGap, isLarge, money, payAmount, totals } from "@/lib/model";
import { STATUS_LABEL, STATUS_TONE, type InvoiceLine } from "@/lib/types";

const CHIPS: FilterChip[] = [
  { key: "unmatched", label: "Unmatched", tone: "warn" },
  { key: "disputed", label: "Disputed", tone: "error" },
  { key: "large", label: "Over $10k" },
];

export default function InvoiceList() {
  const { lines } = useStore();
  const table = useTableState();

  const monthLines = useMemo(() => lines.filter((l) => l.month === MONTH), [lines]);

  const shown = useMemo(() => {
    return monthLines.filter((l) => {
      if (table.filters.chips.includes("unmatched") && l.status !== "unmatched") return false;
      if (table.filters.chips.includes("disputed") && l.status !== "disputed") return false;
      if (table.filters.chips.includes("large") && !isLarge(l)) return false;
      return true;
    });
  }, [monthLines, table.filters]);

  const t = totals(monthLines);
  const varMax = Math.max(1, ...shown.map(erpGap));

  const selectedIds = [...table.selected];

  const columns: Column<InvoiceLine>[] = [
    {
      key: "line",
      header: "Invoice line",
      sortable: true,
      sortValue: (l) => l.supplier,
      render: (l) => (
        <Link href={`/lines/${l.id}`} className="block hover:text-primary">
          <div className="font-medium">{l.supplier}</div>
          <div className="text-[11px] text-muted">
            {l.id} · {l.poNumber || "no PO on file"} · {l.description}
          </div>
        </Link>
      ),
    },
    {
      key: "pay",
      header: "Pay amount",
      align: "right",
      sortable: true,
      sortValue: (l) => payAmount(l) ?? -1,
      render: (l) => {
        const amt = payAmount(l);
        return amt === null ? (
          <span className="text-[12px] text-warn font-semibold">no source yet</span>
        ) : (
          <span>{money(amt, l.currency)}</span>
        );
      },
    },
    {
      key: "variance",
      header: "Gap to ERP",
      align: "right",
      sortable: true,
      sortValue: (l) => erpGap(l),
      render: (l) => {
        const v = erpGap(l);
        if (v === 0) return <span className="text-[12px] text-muted">no gap</span>;
        return <HeatCell value={v} min={0} max={varMax} format={(x) => money(x, l.currency)} />;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (l) => <StatusPill label={STATUS_LABEL[l.status]} tone={STATUS_TONE[l.status]} />,
    },
  ];

  return (
    <AppShell
      brand="ACME"
      product="Invoice Reconciliation"
      breadcrumb="September 2026"
      topBarRight={
        <>
          <Link href="/readout"><Button variant="ghost" size="sm">Readout</Button></Link>
          <Link href="/import"><Button variant="secondary" size="sm">Import invoices</Button></Link>
          <Link href="/reconcile"><Button variant="primary" size="sm">Reconcile lines</Button></Link>
        </>
      }
    >
      <PageHeader
        title="Supplier invoices"
        meta={
          <>
            <Badge tone="brand">September 2026</Badge>
            <Badge>{monthLines.length} lines</Badge>
            <Badge>sample data</Badge>
          </>
        }
        subtitle="Which invoice lines to pay this month, at what amount, and from which system's figure. Every figure below carries the source it came from."
        actions={<ExportButton rows={shown} columns={[
          { key: "id", header: "Line" },
          { key: "supplier", header: "Supplier" },
          { key: "poNumber", header: "PO" },
          { key: "status", header: "Status" },
        ]} filename="invoice-lines-sep-2026.csv" />}
      />

      <StatRow className="mb-4">
        <StatTile label="Lines this month" value={t.count} note="all sources combined" />
        <StatTile label="Unmatched" value={t.unmatched} note="missing a PO, amount or source" tone={t.unmatched > 0 ? "warn" : "ok"} />
        <StatTile
          label="Largest gaps to ERP, totalled"
          value={money(t.varianceTotal)}
          note={`widest gap between ERP and another source, summed across ${monthLines.length} lines · ${FX_CAVEAT}`}
          tone={t.varianceTotal > VARIANCE_THRESHOLD_TOTAL ? "error" : "ok"}
        />
        <StatTile
          label="Ready to pay"
          value={money(t.readyToPay)}
          note={`${t.readyToPayCount} approved lines · ${FX_CAVEAT}`}
          tone="ok"
        />
      </StatRow>

      <FilterBar
        value={table.filters}
        onChange={table.setFilters}
        chips={CHIPS}
        right={
          <SavedViews
            views={table.views}
            activeId={table.activeView}
            onSelect={table.selectView}
            onSave={table.saveView}
            onDelete={table.deleteView}
          />
        }
      />

      {shown.length === 0 ? (
        <EmptyState
          title="No lines match these filters"
          body={monthLines.length === 0 ? "No invoice lines have been imported for this cycle yet." : "Clear a filter to see the rest of the month."}
          action={
            monthLines.length === 0 ? (
              <Link href="/import"><Button>Import invoices</Button></Link>
            ) : (
              <Button onClick={() => table.setFilters({ chips: [], rules: [] })}>Clear filters</Button>
            )
          }
        />
      ) : (
        <Card padded={false}>
          <DataTable
            rows={shown}
            columns={columns}
            rowKey={(l) => l.id}
            sort={table.sort}
            onSortChange={table.setSort}
            selectable
            selected={table.selected}
            onSelectionChange={table.setSelected}
            bulkActions={
              <>
                <Button variant="secondary" size="sm" onClick={() => { setStatus(selectedIds, "matched"); table.clearSelection(); }}>
                  Mark matched
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { setStatus(selectedIds, "disputed"); table.clearSelection(); }}>
                  Dispute
                </Button>
              </>
            }
          />
        </Card>
      )}

      <Toolbar className="mt-3">
        <span className="text-[11px] text-muted">{shown.length} of {monthLines.length} lines shown</span>
      </Toolbar>
    </AppShell>
  );
}
