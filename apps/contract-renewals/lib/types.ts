export type Decision = "renew" | "renegotiate" | "drop";

export type Contract = {
  id: string;
  vendor: string;
  service: string;
  category: "Lab" | "Imaging" | "Logistics" | "Software" | "Monitoring";
  city: string;
  country: string;
  /** Committed spend for the next 12 months, in thousands of dollars. */
  annualSpendK: number;
  /** ISO date the current agreement lapses. */
  endsOn: string;
  /** Share of the contracted volume actually used last year, 0 to 1. */
  usage: number;
  /** 1 is the safest vendor to keep, 4 is the one to worry about. */
  risk: 1 | 2 | 3 | 4;
  /** Monthly spend over the last 12 months, for the sparkline. */
  history: number[];
  decision: Decision;
};
