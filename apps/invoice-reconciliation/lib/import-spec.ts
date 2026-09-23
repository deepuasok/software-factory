import type { TableSpec } from "@factory/ui";

/**
 * The September AP export, in the shape a finance system actually produces —
 * header names never match our field names exactly, which is what the fuzzy
 * matcher in step 3 is for.
 */
export const IMPORT_SPEC: TableSpec = {
  columns: [
    { key: "supplier", label: "Supplier", aliases: ["vendor", "suppliername", "supplier"], type: "string", required: true },
    { key: "poNumber", label: "Purchase order", aliases: ["ponumber", "purchaseorder", "po"], type: "string", required: true },
    { key: "description", label: "Description", aliases: ["item", "linedescription", "description"], type: "string" },
    { key: "currency", label: "Currency", aliases: ["currency", "ccy"], type: "string" },
    { key: "quantity", label: "Quantity", aliases: ["qty", "quantity"], type: "number" },
    { key: "unitPrice", label: "Unit price", aliases: ["unitprice", "price"], type: "number" },
    { key: "amountERP", label: "ERP amount", aliases: ["erpamount", "erp"], type: "number", required: true },
    { key: "amountSupplierInvoice", label: "Supplier invoice amount", aliases: ["supplierinvoiceamount", "invoiceamount"], type: "number" },
    { key: "amountGoodsReceipt", label: "Goods receipt amount", aliases: ["goodsreceiptamount", "grn amount", "grn"], type: "number" },
  ],
};

/**
 * A believable September AP export with three deliberately bad rows, so the
 * FindingsPanel always has something to show on a fresh load: a missing PO,
 * a non-numeric amount, and a blank (unidentifiable) supplier.
 */
export const SAMPLE_CSV = `Vendor,PO Number,Item,Currency,Qty,Unit Price,ERP Amount,Supplier Invoice Amount,GRN Amount
Meridian Hardware,PO-2026-2101,Rack-mount enclosures,USD,40,145,5800,5800,5800
Vantage Print Group,PO-2026-2102,Folder printing run,USD,2000,0.85,1700,1700,1700
,PO-2026-2103,Bulk labels,USD,5000,0.12,600,600,600
Solstice Freight,,LTL shipment - week 37,USD,1,1240,1240,1240,1240
Northline Electrical,PO-2026-2104,Breaker panel install,USD,1,3200,3200,3200,3200
Harbor Cleaning Co,PO-2026-2105,October contract prepay,USD,1,N/A,2100,2100,2100
Vantage Print Group,PO-2026-2106,Banner stands,USD,6,180,1080,1080,1080
Meridian Hardware,PO-2026-2107,Cable management kits,USD,90,12.5,1125,1125,1125
Northline Electrical,PO-2026-2108,Generator service,USD,1,4400,4400,4950,4400
Solstice Freight,PO-2026-2109,"Cross-dock, week 38",USD,1,2650,2650,2650,2650
`;
