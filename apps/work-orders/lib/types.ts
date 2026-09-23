export type Status = "new" | "triaged" | "approved" | "in progress" | "done" | "rejected";

export type Disposition = "include" | "exclude" | "hold";

export type HistoryEntry = {
  verb: string;
  actor: string;
  field: string;
  fromValue: string;
  toValue: string;
  at: string;
};

export type Comment = {
  id: string;
  author: string;
  body: string;
  at: string;
  resolved?: boolean;
};

/**
 * A facilities work order: something broken or worn that a building's asset
 * needs done, ranked by an explainable urgency formula (lib/model.ts) and
 * carried through triage, approval and a status board.
 */
export type WorkOrder = {
  id: string;
  title: string;
  building: string;
  asset: string;
  /** 1 is a minor asset, 4 is a critical asset whose failure stops operations. */
  assetCriticality: 1 | 2 | 3 | 4;
  reportedSymptom: string;
  /** ISO date the order was opened. */
  openedOn: string;
  /** ISO date the order was closed. Only set once the status is done or rejected. */
  closedOn?: string;
  /** Hours allowed by the service-level agreement before the order is overdue. */
  slaHours: number;
  estimatedCostK: number;
  status: Status;
  owner: string;
  /** 0–100, produced by the urgency model in lib/model.ts. */
  urgencyScore: number;
  /** Set once a person overrules the model's score. */
  humanUrgencyOverride?: { value: number; reasonCode: string; reasonText: string; at: string; actor: string };
  /** Set once a person dispositions this order in triage. */
  disposition?: Disposition;
  dispositionReason?: string;
  /** Who made the call and when — a disposition nobody owns cannot be defended later. */
  dispositionBy?: string;
  dispositionAt?: string;
  comments: Comment[];
  history: HistoryEntry[];
};
