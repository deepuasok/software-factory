import type { Contract, Decision } from "./types";

/**
 * Sample data. Believable but invented — no real vendor, price or date here.
 *
 * Seeded so the app is never looked at empty, and deterministic so a screenshot
 * taken today matches one taken tomorrow.
 */
const RAW: Omit<Contract, "history" | "decision">[] = [
  { id: "C-101", vendor: "Meridian Labs", service: "Central lab analysis", category: "Lab", city: "Chicago", country: "United States", annualSpendK: 1840, endsOn: "2026-11-30", usage: 0.91, risk: 1 },
  { id: "C-102", vendor: "Northwind Imaging", service: "Central imaging read", category: "Imaging", city: "Boston", country: "United States", annualSpendK: 1210, endsOn: "2026-10-15", usage: 0.64, risk: 2 },
  { id: "C-103", vendor: "Halvorsen Courier", service: "Cold chain courier", category: "Logistics", city: "Copenhagen", country: "Denmark", annualSpendK: 760, endsOn: "2027-03-01", usage: 0.88, risk: 2 },
  { id: "C-104", vendor: "Solaris eClinical", service: "EDC licence", category: "Software", city: "Austin", country: "United States", annualSpendK: 2250, endsOn: "2026-12-31", usage: 0.97, risk: 1 },
  { id: "C-105", vendor: "Kestrel Monitoring", service: "Regional site monitoring", category: "Monitoring", city: "Madrid", country: "Spain", annualSpendK: 980, endsOn: "2026-10-01", usage: 0.42, risk: 3 },
  { id: "C-106", vendor: "Aoyama Bioanalysis", service: "Biomarker assay", category: "Lab", city: "Osaka", country: "Japan", annualSpendK: 640, endsOn: "2027-01-20", usage: 0.73, risk: 2 },
  { id: "C-107", vendor: "Fenwick Transport", service: "Kit distribution", category: "Logistics", city: "Manchester", country: "United Kingdom", annualSpendK: 410, endsOn: "2026-09-30", usage: 0.31, risk: 4 },
  { id: "C-108", vendor: "Beaufort Analytics", service: "Statistical programming", category: "Software", city: "Toronto", country: "Canada", annualSpendK: 1130, endsOn: "2027-02-28", usage: 0.82, risk: 1 },
  { id: "C-109", vendor: "Pallas Imaging", service: "Imaging device rental", category: "Imaging", city: "Milan", country: "Italy", annualSpendK: 520, endsOn: "2026-11-15", usage: 0.55, risk: 3 },
  { id: "C-110", vendor: "Lindqvist Labs", service: "Sample storage", category: "Lab", city: "Stockholm", country: "Sweden", annualSpendK: 330, endsOn: "2027-05-31", usage: 0.79, risk: 2 },
  { id: "C-111", vendor: "Rio Verde Clinical", service: "Site monitoring, LATAM", category: "Monitoring", city: "Sao Paulo", country: "Brazil", annualSpendK: 870, endsOn: "2026-10-31", usage: 0.38, risk: 4 },
  { id: "C-112", vendor: "Girard Logistique", service: "Comparator sourcing", category: "Logistics", city: "Lyon", country: "France", annualSpendK: 690, endsOn: "2027-04-30", usage: 0.85, risk: 1 },
  { id: "C-113", vendor: "Obsidian Trials", service: "eConsent platform", category: "Software", city: "Berlin", country: "Germany", annualSpendK: 450, endsOn: "2026-12-15", usage: 0.29, risk: 4 },
  { id: "C-114", vendor: "Tallgrass Monitoring", service: "Risk-based monitoring", category: "Monitoring", city: "Denver", country: "United States", annualSpendK: 1340, endsOn: "2027-01-31", usage: 0.68, risk: 2 },
  { id: "C-115", vendor: "Hanbit Diagnostics", service: "Local lab network", category: "Lab", city: "Seoul", country: "South Korea", annualSpendK: 580, endsOn: "2026-11-01", usage: 0.61, risk: 3 },
  { id: "C-116", vendor: "Corvus Data", service: "Data warehouse hosting", category: "Software", city: "Dublin", country: "Ireland", annualSpendK: 1620, endsOn: "2027-06-30", usage: 0.93, risk: 1 },
];

/** A stable pseudo-random walk, so every reload draws the same sparkline. */
function history(id: string, base: number): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) | 0;
  const out: number[] = [];
  let v = base / 12;
  for (let m = 0; m < 12; m++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    v = Math.max(1, v * (0.88 + ((seed >> 16) % 100) / 400));
    out.push(Math.round(v));
  }
  return out;
}

/** Below this, the contract is paying for volume nobody used. */
export const UNDERUSED = 0.6;

function defaultDecision(c: Omit<Contract, "history" | "decision">): Decision {
  if (c.usage < 0.4 || c.risk === 4) return "drop";
  if (c.usage < UNDERUSED || c.risk === 3) return "renegotiate";
  return "renew";
}

export function seedContracts(): Contract[] {
  return RAW.map((c) => ({
    ...c,
    history: history(c.id, c.annualSpendK),
    decision: defaultDecision(c),
  }));
}
