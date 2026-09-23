import type { OverrideReasonCode } from "@factory/ui";

export type Currency = "USD" | "EUR" | "GBP";

/** The three systems that each report a figure for a line. */
export type SourceKey = "erp" | "supplierInvoice" | "goodsReceipt";

export const SOURCE_LABEL: Record<SourceKey, string> = {
  erp: "ERP",
  supplierInvoice: "Supplier PDF",
  goodsReceipt: "Goods receipt",
};

/**
 * Why a human amount overrides every source. The four domain codes are
 * seeded on sample data so the reasons read like a real AP narrative; the
 * `OverrideReasonCode` values are what `OverrideControl` itself produces
 * when someone overrides a line interactively. Both share one label map.
 */
export type ReasonCode =
  | "price-variance"
  | "quantity-mismatch"
  | "duplicate-charge"
  | "fx-rate"
  | "missing-source"
  | OverrideReasonCode;

export const REASON_LABEL: Record<ReasonCode, string> = {
  "price-variance": "Unit price moved between order and invoice",
  "quantity-mismatch": "Quantity received does not match the invoice",
  "duplicate-charge": "This line duplicates another invoice",
  "fx-rate": "Currency conversion explains the gap",
  "missing-source": "One system never reported a figure",
  "data-error": "The model input was wrong",
  "local-knowledge": "I know something the model does not",
  "manual-adjustment": "A manual adjustment we agreed on",
  other: "Other",
};

export type LineStatus = "unmatched" | "matched" | "corrected" | "disputed" | "approved";

export const STATUS_LABEL: Record<LineStatus, string> = {
  unmatched: "Unmatched",
  matched: "Matched",
  corrected: "Corrected",
  disputed: "Disputed",
  approved: "Approved",
};

export const STATUS_TONE: Record<LineStatus, "neutral" | "ok" | "warn" | "error" | "info"> = {
  unmatched: "warn",
  matched: "ok",
  corrected: "info",
  disputed: "error",
  approved: "ok",
};

/**
 * One line of a supplier invoice, reported by up to three systems that do
 * not always agree. `id`, `createdAt`, `updatedAt` and `createdBy` are the
 * cross-cutting fields every domain record carries — see docs/DATA.md.
 */
export type InvoiceLine = {
  id: string;
  supplier: string;
  poNumber: string;
  description: string;
  currency: Currency;
  quantity: number;
  unitPrice: number;
  /** Null when that system never reported this line. */
  amountERP: number | null;
  amountSupplierInvoice: number | null;
  amountGoodsReceipt: number | null;
  /** Null until a person picks the source they trust. */
  trustedSource: SourceKey | null;
  /** Set when a person enters a figure none of the three sources produced. */
  correctedAmount?: number;
  reasonCode?: ReasonCode;
  status: LineStatus;
  /** "2026-09" — the pay cycle this line belongs to. */
  month: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type DispositionComment = {
  id: string;
  lineId: string;
  author: string;
  body: string;
  at: string;
  resolved?: boolean;
};
