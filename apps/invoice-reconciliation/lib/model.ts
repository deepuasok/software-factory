import type { Currency, InvoiceLine, SourceKey } from "./types";
import { SOURCE_LABEL } from "./types";

/**
 * Sample conversion rates, fixed for the month so a screenshot is
 * reproducible. Lines arrive in three currencies, so anything that adds
 * several lines together has to convert first — a total that quietly sums
 * pounds into dollars is worse than no total. Every figure derived through
 * these is labelled "converted at a fixed sample rate" on screen.
 */
export const FX_TO_USD: Record<Currency, number> = { USD: 1, GBP: 1.27, EUR: 1.08 };

export const FX_CAVEAT = "GBP and EUR lines converted to US dollars at a fixed sample rate";

/** One line's figure in US dollars, so cross-line totals are comparable. */
export function usd(value: number, currency: Currency): number {
  return value * FX_TO_USD[currency];
}

/** Above this, a variance line needs a second look before it is paid. */
export const VARIANCE_THRESHOLD_TOTAL = 15000;

/** The line size the "over $10k" filter chip means. */
export const LARGE_LINE = 10000;

export type SourceAmount = { source: SourceKey; label: string; value: number };

/** Every source that actually reported a figure for this line. */
export function availableSources(line: InvoiceLine): SourceAmount[] {
  const out: SourceAmount[] = [];
  if (line.amountERP !== null) out.push({ source: "erp", label: SOURCE_LABEL.erp, value: line.amountERP });
  if (line.amountSupplierInvoice !== null)
    out.push({ source: "supplierInvoice", label: SOURCE_LABEL.supplierInvoice, value: line.amountSupplierInvoice });
  if (line.amountGoodsReceipt !== null)
    out.push({ source: "goodsReceipt", label: SOURCE_LABEL.goodsReceipt, value: line.amountGoodsReceipt });
  return out;
}

/** The figure a source reported, or null when that source never reported this line. */
export function sourceValue(line: InvoiceLine, source: SourceKey): number | null {
  if (source === "erp") return line.amountERP;
  if (source === "supplierInvoice") return line.amountSupplierInvoice;
  return line.amountGoodsReceipt;
}

/** The spread between the highest and lowest source. Zero when fewer than two report. */
export function variance(line: InvoiceLine): number {
  const values = availableSources(line).map((s) => s.value);
  if (values.length < 2) return 0;
  return Math.max(...values) - Math.min(...values);
}

/**
 * The amount to pay: a manual correction first, then the trusted source, then
 * whatever source is available. Null only when nothing has ever reported it.
 */
export function payAmount(line: InvoiceLine): number | null {
  if (line.correctedAmount !== undefined) return line.correctedAmount;
  if (line.trustedSource) return sourceValue(line, line.trustedSource);
  const first = availableSources(line)[0];
  return first ? first.value : null;
}

/**
 * Variance of the pay amount against ERP, once a decision has been made.
 * Before any source is trusted, `payAmount` falls back to the first
 * available source (usually ERP itself), so this reads as zero — that is
 * correct for the readout, which bridges ERP to what the plan will actually
 * pay. It is the wrong number for flagging an unresolved line; use `erpGap`
 * for that.
 */
export function varianceVsERP(line: InvoiceLine): number {
  const pay = payAmount(line);
  if (pay === null || line.amountERP === null) return 0;
  return pay - line.amountERP;
}

/**
 * How far the other sources sit from ERP, regardless of any decision made
 * yet. This is what should flag a line and size the list's variance column —
 * a disputed line disagrees with ERP whether or not anyone has picked a
 * trusted source. Falls back to the plain spread when ERP never reported.
 */
export function erpGap(line: InvoiceLine): number {
  if (line.amountERP === null) return variance(line);
  const others = availableSources(line).filter((s) => s.source !== "erp");
  if (others.length === 0) return 0;
  return Math.max(...others.map((s) => Math.abs(s.value - line.amountERP!)));
}

export function isLarge(line: InvoiceLine): boolean {
  const pay = payAmount(line);
  return pay !== null && pay > LARGE_LINE;
}

export function readyToPay(line: InvoiceLine): boolean {
  return line.status === "approved" && payAmount(line) !== null;
}

export type LineTotals = {
  count: number;
  unmatched: number;
  disputed: number;
  varianceTotal: number;
  readyToPay: number;
  readyToPayCount: number;
};

export function totals(lines: InvoiceLine[]): LineTotals {
  return {
    count: lines.length,
    unmatched: lines.filter((l) => l.status === "unmatched").length,
    disputed: lines.filter((l) => l.status === "disputed").length,
    varianceTotal: lines.reduce((a, l) => a + usd(erpGap(l), l.currency), 0),
    readyToPay: lines.filter(readyToPay).reduce((a, l) => a + usd(payAmount(l) ?? 0, l.currency), 0),
    readyToPayCount: lines.filter(readyToPay).length,
  };
}

/**
 * Variance vs ERP in US dollars, summed by supplier, biggest absolute gap
 * first — for DivergingBars. Converted, because a supplier's lines are not
 * all in one currency.
 */
export function varianceBySupplier(lines: InvoiceLine[]) {
  const map = new Map<string, number>();
  for (const l of lines) map.set(l.supplier, (map.get(l.supplier) ?? 0) + usd(varianceVsERP(l), l.currency));
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

/**
 * How far each supplier's sources sit from ERP, in US dollars, regardless of
 * any decision made yet — the size of the work still outstanding. This is what
 * the reconcile screen ranks by; `varianceBySupplier` is the decided figure
 * and belongs on the readout.
 */
export function gapBySupplier(lines: InvoiceLine[]) {
  const map = new Map<string, number>();
  for (const l of lines) map.set(l.supplier, (map.get(l.supplier) ?? 0) + usd(erpGap(l), l.currency));
  return [...map.entries()]
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ key: label, label, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

/** Lines by status, stacked per supplier — for StackedBars on the readout. */
export function statusBySupplier(lines: InvoiceLine[]) {
  const suppliers = [...new Set(lines.map((l) => l.supplier))].sort();
  return suppliers.map((supplier) => {
    const rows = lines.filter((l) => l.supplier === supplier);
    return {
      supplier,
      unmatched: rows.filter((l) => l.status === "unmatched").length,
      matched: rows.filter((l) => l.status === "matched").length,
      corrected: rows.filter((l) => l.status === "corrected").length,
      disputed: rows.filter((l) => l.status === "disputed").length,
      approved: rows.filter((l) => l.status === "approved").length,
    };
  });
}

/**
 * ERP total bridged to what will actually be paid this month, through
 * corrections, ordinary reconciliation, sources ERP never had, and lines
 * held out entirely as disputed. Each step nets to the pay amount for the
 * lines it covers — see the derivation in the readout page's comments.
 */
export function waterfallSteps(lines: InvoiceLine[]) {
  const erpTotal = lines.reduce((a, l) => a + usd(l.amountERP ?? 0, l.currency), 0);

  const corrections = lines
    .filter((l) => l.correctedAmount !== undefined && l.status !== "disputed")
    .reduce((a, l) => a + usd(l.correctedAmount! - (l.amountERP ?? l.correctedAmount!), l.currency), 0);

  const otherReconciled = lines
    .filter((l) => l.correctedAmount === undefined && l.status !== "disputed" && l.amountERP !== null)
    .reduce((a, l) => a + usd((payAmount(l) ?? l.amountERP!) - l.amountERP!, l.currency), 0);

  const missingSourceErp = lines
    .filter((l) => l.amountERP === null && l.status !== "disputed")
    .reduce((a, l) => a + usd(payAmount(l) ?? 0, l.currency), 0);

  const disputedHeld = lines
    .filter((l) => l.status === "disputed")
    .reduce((a, l) => a - usd(l.amountERP ?? 0, l.currency), 0);

  return {
    erpTotal: Math.round(erpTotal),
    steps: [
      { label: "Corrections", value: Math.round(corrections) },
      { label: "Source reconciled", value: Math.round(otherReconciled) },
      { label: "Missing from ERP", value: Math.round(missingSourceErp) },
      { label: "Held as disputed", value: Math.round(disputedHeld) },
    ],
  };
}

export type LineExplanation = {
  summary: string;
  contributions: { label: string; value: number; direction: "up" | "down" }[];
};

/** Why a line is flagged for a reviewer, for the ExplainPanel on its detail page. */
export function explainLine(line: InvoiceLine): LineExplanation {
  const contributions: LineExplanation["contributions"] = [];
  const sources = availableSources(line);

  if (line.amountERP === null) contributions.push({ label: "ERP never recorded this line", value: sources[0]?.value ?? 0, direction: "up" });
  if (line.amountSupplierInvoice === null) contributions.push({ label: "No supplier PDF on file", value: sources[0]?.value ?? 0, direction: "up" });
  if (line.amountGoodsReceipt === null) contributions.push({ label: "No goods receipt logged", value: sources[0]?.value ?? 0, direction: "up" });

  const v = variance(line);
  if (v > 0) contributions.push({ label: "Spread between the sources that did report", value: Math.round(v), direction: "up" });

  if (line.status === "disputed") contributions.push({ label: "Held as disputed by a reviewer", value: Math.round(payAmount(line) ?? 0), direction: "down" });
  if (line.correctedAmount !== undefined) contributions.push({ label: "Corrected by a human, overriding every source", value: Math.round(line.correctedAmount), direction: "up" });

  if (contributions.length === 0) {
    contributions.push({ label: "All three sources agree", value: payAmount(line) ?? 0, direction: "down" });
  }

  const missing = sources.length < 3;
  const summary =
    line.status === "disputed"
      ? "This line is held as disputed. Its pay amount does not count toward this month's ready-to-pay total until the dispute clears."
      : missing && v > 0
        ? "This line is flagged because at least one system never reported it, and the sources that did report do not agree."
        : missing
          ? "This line is flagged only because a source is missing — the sources that did report agree with each other."
          : v > 0
            ? "This line is flagged because the three sources disagree on the amount."
            : "This line needs no attention. All three sources agree and it is ready for a decision.";

  return { summary, contributions };
}

export const money = (v: number, currency = "USD") => {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}${symbol}${(abs / 1_000_000).toFixed(2)}m`;
  if (abs >= 1000) return `${v < 0 ? "-" : ""}${symbol}${(abs / 1000).toFixed(1)}k`;
  return `${v < 0 ? "-" : ""}${symbol}${Math.round(abs)}`;
};
