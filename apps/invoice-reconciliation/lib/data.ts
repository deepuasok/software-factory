import type { InvoiceLine } from "./types";

/**
 * Sample data. Believable but invented — no real supplier, PO or price here.
 *
 * 34 lines across 10 suppliers for the September 2026 pay cycle. Some lines
 * are missing a source on purpose (a goods receipt never logged, a supplier
 * PDF not yet parsed); some disagree between systems on purpose, so the
 * reconcile screen always has something to do.
 */
export const MONTH = "2026-09";

type RawLine = Omit<InvoiceLine, "createdAt" | "updatedAt" | "createdBy" | "month">;

const RAW: RawLine[] = [
  // Anchor Fabrication — mostly clean, one real disagreement
  { id: "INV-1001", supplier: "Anchor Fabrication", poNumber: "PO-2026-4410", description: "Structural steel brackets, 200 units", currency: "USD", quantity: 200, unitPrice: 42, amountERP: 8400, amountSupplierInvoice: 8400, amountGoodsReceipt: 8400, trustedSource: "erp", status: "approved" },
  { id: "INV-1002", supplier: "Anchor Fabrication", poNumber: "PO-2026-4411", description: "Custom weld fixtures, batch 3", currency: "USD", quantity: 12, unitPrice: 1150, amountERP: 13800, amountSupplierInvoice: 14950, amountGoodsReceipt: 13800, trustedSource: null, status: "disputed" },
  { id: "INV-1003", supplier: "Anchor Fabrication", poNumber: "PO-2026-4412", description: "Powder coating, exterior panels", currency: "USD", quantity: 80, unitPrice: 26.5, amountERP: 2120, amountSupplierInvoice: 2120, amountGoodsReceipt: null, trustedSource: "erp", status: "matched" },

  // BrightPath Logistics — freight, currency mix, one missing goods receipt
  { id: "INV-1010", supplier: "BrightPath Logistics", poNumber: "PO-2026-2201", description: "Cross-dock freight, Chicago–Dallas lane", currency: "USD", quantity: 1, unitPrice: 6400, amountERP: 6400, amountSupplierInvoice: 6400, amountGoodsReceipt: 6400, trustedSource: "erp", status: "approved" },
  { id: "INV-1011", supplier: "BrightPath Logistics", poNumber: "PO-2026-2202", description: "Fuel surcharge, September lanes", currency: "USD", quantity: 1, unitPrice: 1180, amountERP: 1180, amountSupplierInvoice: 1340, amountGoodsReceipt: null, trustedSource: null, status: "unmatched" },
  { id: "INV-1012", supplier: "BrightPath Logistics", poNumber: "PO-2026-2203", description: "Pallet return handling, Q3", currency: "USD", quantity: 1, unitPrice: 640, amountERP: 640, amountSupplierInvoice: 640, amountGoodsReceipt: 640, trustedSource: "erp", status: "matched" },
  { id: "INV-1013", supplier: "BrightPath Logistics", poNumber: "PO-2026-2204", description: "Detention charges, port delay", currency: "USD", quantity: 1, unitPrice: 2450, amountERP: null, amountSupplierInvoice: 2450, amountGoodsReceipt: 2450, trustedSource: "supplierInvoice", status: "corrected", correctedAmount: 2450, reasonCode: "missing-source" },

  // Cascade Office Supply — small, low-risk lines
  { id: "INV-1020", supplier: "Cascade Office Supply", poNumber: "PO-2026-3301", description: "Quarterly stationery order", currency: "USD", quantity: 1, unitPrice: 890, amountERP: 890, amountSupplierInvoice: 890, amountGoodsReceipt: 890, trustedSource: "erp", status: "approved" },
  { id: "INV-1021", supplier: "Cascade Office Supply", poNumber: "PO-2026-3302", description: "Standing desks, floor 4 refresh", currency: "USD", quantity: 6, unitPrice: 415, amountERP: 2490, amountSupplierInvoice: 2490, amountGoodsReceipt: 2075, trustedSource: null, status: "disputed" },
  { id: "INV-1022", supplier: "Cascade Office Supply", poNumber: "PO-2026-3303", description: "Break room supplies, September", currency: "USD", quantity: 1, unitPrice: 210, amountERP: 210, amountSupplierInvoice: 210, amountGoodsReceipt: 210, trustedSource: "erp", status: "approved" },

  // Delta Freight Co — GBP invoices, one large disagreement
  { id: "INV-1030", supplier: "Delta Freight Co", poNumber: "PO-2026-5501", description: "UK regional distribution, week 36", currency: "GBP", quantity: 1, unitPrice: 4200, amountERP: 4200, amountSupplierInvoice: 4200, amountGoodsReceipt: 4200, trustedSource: "erp", status: "approved" },
  { id: "INV-1031", supplier: "Delta Freight Co", poNumber: "PO-2026-5502", description: "Warehouse handling, Bristol depot", currency: "GBP", quantity: 1, unitPrice: 11800, amountERP: 11800, amountSupplierInvoice: 13950, amountGoodsReceipt: 11950, trustedSource: null, status: "disputed" },
  { id: "INV-1032", supplier: "Delta Freight Co", poNumber: "PO-2026-5503", description: "Reverse logistics, returned stock", currency: "GBP", quantity: 1, unitPrice: 1620, amountERP: 1620, amountSupplierInvoice: null, amountGoodsReceipt: 1620, trustedSource: "erp", status: "matched" },
  { id: "INV-1033", supplier: "Delta Freight Co", poNumber: "PO-2026-5504", description: "Cold storage surcharge, August", currency: "GBP", quantity: 1, unitPrice: 980, amountERP: null, amountSupplierInvoice: 980, amountGoodsReceipt: null, trustedSource: null, status: "unmatched" },

  // Ember Packaging — currency mix, correction example
  { id: "INV-1040", supplier: "Ember Packaging", poNumber: "PO-2026-6601", description: "Corrugate boxes, size B, 5000 units", currency: "USD", quantity: 5000, unitPrice: 0.62, amountERP: 3100, amountSupplierInvoice: 3100, amountGoodsReceipt: 3100, trustedSource: "erp", status: "approved" },
  { id: "INV-1041", supplier: "Ember Packaging", poNumber: "PO-2026-6602", description: "Custom mailers, branded run", currency: "USD", quantity: 12000, unitPrice: 0.41, amountERP: 4920, amountSupplierInvoice: 5904, amountGoodsReceipt: 4920, trustedSource: "erp", status: "corrected", correctedAmount: 4920, reasonCode: "price-variance" },
  { id: "INV-1042", supplier: "Ember Packaging", poNumber: "PO-2026-6603", description: "Void fill, biodegradable", currency: "USD", quantity: 400, unitPrice: 3.1, amountERP: 1240, amountSupplierInvoice: 1240, amountGoodsReceipt: 1116, trustedSource: null, status: "disputed" },
  { id: "INV-1043", supplier: "Ember Packaging", poNumber: "PO-2026-6604", description: "Pallet wrap, industrial grade", currency: "USD", quantity: 60, unitPrice: 38, amountERP: 2280, amountSupplierInvoice: 2280, amountGoodsReceipt: 2280, trustedSource: "erp", status: "approved" },

  // Fjord Components — EUR, a duplicate-charge case
  { id: "INV-1050", supplier: "Fjord Components", poNumber: "PO-2026-7701", description: "Precision bearings, batch 12", currency: "EUR", quantity: 500, unitPrice: 9.4, amountERP: 4700, amountSupplierInvoice: 4700, amountGoodsReceipt: 4700, trustedSource: "erp", status: "approved" },
  { id: "INV-1051", supplier: "Fjord Components", poNumber: "PO-2026-7701", description: "Precision bearings, batch 12 (resubmission)", currency: "EUR", quantity: 500, unitPrice: 9.4, amountERP: 4700, amountSupplierInvoice: 4700, amountGoodsReceipt: null, trustedSource: "erp", status: "corrected", correctedAmount: 0, reasonCode: "duplicate-charge" },
  { id: "INV-1052", supplier: "Fjord Components", poNumber: "PO-2026-7702", description: "Sensor housings, revision C", currency: "EUR", quantity: 300, unitPrice: 14.2, amountERP: 4260, amountSupplierInvoice: 4260, amountGoodsReceipt: 4260, trustedSource: "erp", status: "matched" },
  { id: "INV-1053", supplier: "Fjord Components", poNumber: "PO-2026-7703", description: "Gasket sets, marine grade", currency: "EUR", quantity: 150, unitPrice: 22, amountERP: 3300, amountSupplierInvoice: 3960, amountGoodsReceipt: 3300, trustedSource: null, status: "disputed" },

  // Granite Industrial — large lines, missing ERP entries
  { id: "INV-1060", supplier: "Granite Industrial", poNumber: "PO-2026-8801", description: "Conveyor belt replacement, line 2", currency: "USD", quantity: 1, unitPrice: 18400, amountERP: 18400, amountSupplierInvoice: 18400, amountGoodsReceipt: 18400, trustedSource: "erp", status: "approved" },
  { id: "INV-1061", supplier: "Granite Industrial", poNumber: "PO-2026-8802", description: "Hydraulic press service, annual contract", currency: "USD", quantity: 1, unitPrice: 12600, amountERP: null, amountSupplierInvoice: 12600, amountGoodsReceipt: 12600, trustedSource: "goodsReceipt", status: "matched" },
  { id: "INV-1062", supplier: "Granite Industrial", poNumber: "PO-2026-8803", description: "Emergency motor replacement, line 5", currency: "USD", quantity: 1, unitPrice: 21500, amountERP: 21500, amountSupplierInvoice: 24800, amountGoodsReceipt: 21500, trustedSource: null, status: "disputed" },
  { id: "INV-1063", supplier: "Granite Industrial", poNumber: "PO-2026-8804", description: "Safety guard fabrication", currency: "USD", quantity: 4, unitPrice: 2650, amountERP: 10600, amountSupplierInvoice: 10600, amountGoodsReceipt: 10600, trustedSource: "erp", status: "approved" },

  // Harlow Print & Design — small, unmatched PO issue
  { id: "INV-1070", supplier: "Harlow Print & Design", poNumber: "", description: "Trade show signage, no PO on file", currency: "USD", quantity: 1, unitPrice: 3400, amountERP: null, amountSupplierInvoice: 3400, amountGoodsReceipt: null, trustedSource: null, status: "unmatched" },
  { id: "INV-1071", supplier: "Harlow Print & Design", poNumber: "PO-2026-9901", description: "Annual report print run", currency: "USD", quantity: 800, unitPrice: 4.25, amountERP: 3400, amountSupplierInvoice: 3400, amountGoodsReceipt: 3400, trustedSource: "erp", status: "approved" },
  { id: "INV-1072", supplier: "Harlow Print & Design", poNumber: "PO-2026-9902", description: "Business card reorder, three teams", currency: "USD", quantity: 1, unitPrice: 220, amountERP: 220, amountSupplierInvoice: 220, amountGoodsReceipt: 220, trustedSource: "erp", status: "matched" },

  // Ionic Electrical — mixed currency, FX explains one gap
  { id: "INV-1080", supplier: "Ionic Electrical", poNumber: "PO-2026-1101", description: "Panel upgrade, building C", currency: "EUR", quantity: 1, unitPrice: 15800, amountERP: 15800, amountSupplierInvoice: 16750, amountGoodsReceipt: 15800, trustedSource: "erp", status: "corrected", correctedAmount: 15800, reasonCode: "fx-rate" },
  { id: "INV-1081", supplier: "Ionic Electrical", poNumber: "PO-2026-1102", description: "Emergency lighting inspection", currency: "USD", quantity: 1, unitPrice: 980, amountERP: 980, amountSupplierInvoice: 980, amountGoodsReceipt: 980, trustedSource: "erp", status: "approved" },
  { id: "INV-1082", supplier: "Ionic Electrical", poNumber: "PO-2026-1103", description: "Cable tray install, server room", currency: "USD", quantity: 1, unitPrice: 5400, amountERP: 5400, amountSupplierInvoice: 5400, amountGoodsReceipt: null, trustedSource: "erp", status: "matched" },

  // Juniper Facilities — recurring services, one dispute
  { id: "INV-1090", supplier: "Juniper Facilities", poNumber: "PO-2026-1201", description: "HVAC maintenance, September", currency: "USD", quantity: 1, unitPrice: 2850, amountERP: 2850, amountSupplierInvoice: 2850, amountGoodsReceipt: 2850, trustedSource: "erp", status: "approved" },
  { id: "INV-1091", supplier: "Juniper Facilities", poNumber: "PO-2026-1202", description: "Landscaping, quarterly contract", currency: "USD", quantity: 1, unitPrice: 1450, amountERP: 1450, amountSupplierInvoice: 1450, amountGoodsReceipt: 1450, trustedSource: "erp", status: "matched" },
  { id: "INV-1092", supplier: "Juniper Facilities", poNumber: "PO-2026-1203", description: "Roof leak repair, warehouse 2", currency: "USD", quantity: 1, unitPrice: 6200, amountERP: 6200, amountSupplierInvoice: 7450, amountGoodsReceipt: 6200, trustedSource: null, status: "disputed" },

  // Kestrel Cleaning Services — smallest supplier, clean lines
  { id: "INV-1100", supplier: "Kestrel Cleaning Services", poNumber: "PO-2026-1301", description: "Nightly cleaning, HQ, September", currency: "USD", quantity: 1, unitPrice: 4100, amountERP: 4100, amountSupplierInvoice: 4100, amountGoodsReceipt: 4100, trustedSource: "erp", status: "approved" },
  { id: "INV-1101", supplier: "Kestrel Cleaning Services", poNumber: "PO-2026-1302", description: "Deep clean, distribution center", currency: "USD", quantity: 1, unitPrice: 1890, amountERP: 1890, amountSupplierInvoice: 1890, amountGoodsReceipt: null, trustedSource: "erp", status: "matched" },
];

/** A stable per-line day offset, so seeded timestamps never drift between reloads. */
function dayOffset(id: string): number {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(seed) % 14;
}

export function seedLines(): InvoiceLine[] {
  return RAW.map((r) => {
    const created = new Date(2026, 8, 1 + dayOffset(r.id), 9, 0, 0);
    const updated = new Date(created.getTime() + (r.status === "unmatched" ? 0 : 2 + dayOffset(r.id)) * 3_600_000);
    return {
      ...r,
      month: MONTH,
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
      createdBy: "AP import — sample data",
    };
  });
}
