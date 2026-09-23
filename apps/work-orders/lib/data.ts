import type { Status, WorkOrder } from "./types";
import { urgencyScore } from "./model";

/**
 * Sample data. Believable but invented — no real building, vendor or cost here.
 *
 * Seeded so the app is never looked at empty, and deterministic so a
 * screenshot taken today matches one taken tomorrow.
 */
type Raw = Omit<WorkOrder, "urgencyScore" | "comments" | "history">;

const RAW: Raw[] = [
  { id: "WO-001", title: "AHU-3 short-cycling", building: "Riverbend Tower", asset: "AHU-3", assetCriticality: 3, reportedSymptom: "Air handling unit cycles on and off every few minutes", openedOn: "2026-12-30", slaHours: 72, estimatedCostK: 8, status: "in progress", owner: "Marcus Cole" },
  { id: "WO-002", title: "Elevator B stuck between floors", building: "Riverbend Tower", asset: "Elevator B", assetCriticality: 4, reportedSymptom: "Elevator stuck between floors, two riders trapped briefly", openedOn: "2026-12-28", slaHours: 24, estimatedCostK: 42, status: "triaged", owner: "Dana Ruiz" },
  { id: "WO-003", title: "Backup generator won't start", building: "Harborview Labs", asset: "Generator 1", assetCriticality: 4, reportedSymptom: "No power to backup generator on weekly test", openedOn: "2026-12-15", slaHours: 48, estimatedCostK: 61, status: "triaged", owner: "Marcus Cole" },
  { id: "WO-004", title: "Chiller room leak", building: "Harborview Labs", asset: "Chiller 2", assetCriticality: 4, reportedSymptom: "Refrigerant leak near chiller 2, strong odor reported", openedOn: "2026-12-10", slaHours: 24, estimatedCostK: 35, status: "new", owner: "Priya Anand" },
  { id: "WO-005", title: "Loading dock door won't seal", building: "Westgate Distribution", asset: "Dock Door 4", assetCriticality: 2, reportedSymptom: "Dock door 4 leaves a gap, cold air intermittent in winter", openedOn: "2026-12-30", slaHours: 120, estimatedCostK: 4, status: "done", owner: "Sam Okafor" },
  { id: "WO-006", title: "Fire panel trouble light", building: "Westgate Distribution", asset: "Fire Panel A", assetCriticality: 4, reportedSymptom: "Fire alarm panel showing a trouble light, no smoke detected", openedOn: "2026-12-22", slaHours: 12, estimatedCostK: 6, status: "in progress", owner: "Priya Anand" },
  { id: "WO-007", title: "RTU-7 warm air on floor 4", building: "Riverbend Tower", asset: "RTU-7", assetCriticality: 2, reportedSymptom: "Rooftop unit blowing warm air, floor 4 running warm", openedOn: "2026-12-20", slaHours: 96, estimatedCostK: 5, status: "triaged", owner: "Dana Ruiz" },
  { id: "WO-008", title: "Sump pump not engaging", building: "Harborview Labs", asset: "Sump Pump 2", assetCriticality: 3, reportedSymptom: "Basement sump pump not engaging, minor flooding risk", openedOn: "2026-12-18", slaHours: 48, estimatedCostK: 3, status: "new", owner: "Sam Okafor" },
  { id: "WO-009", title: "Card reader offline, main entrance", building: "Cedar Grove Clinic", asset: "Access Panel 1", assetCriticality: 3, reportedSymptom: "Main entrance card reader offline, door propped open", openedOn: "2026-12-31", slaHours: 24, estimatedCostK: 2, status: "new", owner: "Priya Anand" },
  { id: "WO-010", title: "Elevator A noise on ascent", building: "Cedar Grove Clinic", asset: "Elevator A", assetCriticality: 3, reportedSymptom: "Elevator makes a grinding noise on ascent above floor 3", openedOn: "2026-12-08", slaHours: 72, estimatedCostK: 18, status: "triaged", owner: "Marcus Cole" },
  { id: "WO-011", title: "Boiler pressure fluctuating", building: "Westgate Distribution", asset: "Boiler 1", assetCriticality: 4, reportedSymptom: "Boiler pressure gauge fluctuating outside normal range", openedOn: "2026-11-28", slaHours: 48, estimatedCostK: 29, status: "approved", owner: "Sam Okafor" },
  { id: "WO-012", title: "Restroom exhaust fan dead", building: "Cedar Grove Clinic", asset: "Exhaust Fan 3", assetCriticality: 1, reportedSymptom: "Second floor restroom exhaust fan not running", openedOn: "2026-12-29", slaHours: 168, estimatedCostK: 1, status: "done", owner: "Dana Ruiz" },
  { id: "WO-013", title: "Gas smell near kitchen", building: "Harborview Labs", asset: "Gas Line B", assetCriticality: 4, reportedSymptom: "Faint gas smell reported near the break room kitchen line", openedOn: "2027-01-02", slaHours: 12, estimatedCostK: 9, status: "new", owner: "Marcus Cole" },
  { id: "WO-014", title: "Parking garage light out", building: "Riverbend Tower", asset: "Lighting Zone 2", assetCriticality: 1, reportedSymptom: "Several lights out in parking garage zone 2", openedOn: "2026-11-20", slaHours: 168, estimatedCostK: 2, status: "done", owner: "Sam Okafor" },
  { id: "WO-015", title: "AHU-1 vibration", building: "Cedar Grove Clinic", asset: "AHU-1", assetCriticality: 3, reportedSymptom: "Rooftop AHU-1 vibrating more than usual, no alarm yet", openedOn: "2026-12-12", slaHours: 96, estimatedCostK: 11, status: "triaged", owner: "Priya Anand" },
  { id: "WO-016", title: "Water heater intermittent hot water", building: "Westgate Distribution", asset: "Water Heater 2", assetCriticality: 2, reportedSymptom: "Break room water heater giving intermittent hot water", openedOn: "2026-12-24", slaHours: 120, estimatedCostK: 3, status: "new", owner: "Dana Ruiz" },
  { id: "WO-017", title: "Loading dock lift stuck", building: "Westgate Distribution", asset: "Dock Lift 2", assetCriticality: 3, reportedSymptom: "Dock lift 2 stuck at low position, blocking one bay", openedOn: "2026-12-27", slaHours: 48, estimatedCostK: 14, status: "in progress", owner: "Sam Okafor" },
  { id: "WO-018", title: "Emergency lighting battery fail", building: "Harborview Labs", asset: "EM Lighting Zone 1", assetCriticality: 3, reportedSymptom: "Emergency lighting battery test failed in zone 1", openedOn: "2026-11-25", slaHours: 72, estimatedCostK: 7, status: "done", owner: "Priya Anand" },
  { id: "WO-019", title: "Elevator C door sensor fault", building: "Riverbend Tower", asset: "Elevator C", assetCriticality: 4, reportedSymptom: "Elevator C door reopens intermittently before closing", openedOn: "2027-01-01", slaHours: 24, estimatedCostK: 27, status: "new", owner: "Marcus Cole" },
  { id: "WO-020", title: "Cold room temperature drift", building: "Harborview Labs", asset: "Cold Room 1", assetCriticality: 4, reportedSymptom: "Sample cold room running 3 degrees warm, no leak found yet", openedOn: "2026-12-29", slaHours: 24, estimatedCostK: 22, status: "triaged", owner: "Dana Ruiz" },
  { id: "WO-021", title: "Ceiling tile water stain", building: "Cedar Grove Clinic", asset: "Roof Zone C", assetCriticality: 2, reportedSymptom: "New water stain on ceiling tile, no active drip observed", openedOn: "2026-12-14", slaHours: 96, estimatedCostK: 6, status: "new", owner: "Sam Okafor" },
  { id: "WO-022", title: "RTU-2 refrigerant leak", building: "Westgate Distribution", asset: "RTU-2", assetCriticality: 3, reportedSymptom: "Rooftop unit 2 showing a small refrigerant leak on inspection", openedOn: "2026-12-19", slaHours: 72, estimatedCostK: 16, status: "triaged", owner: "Priya Anand" },
  { id: "WO-023", title: "Automatic doors slow to open", building: "Cedar Grove Clinic", asset: "Entry Doors", assetCriticality: 2, reportedSymptom: "Front automatic doors slow to open, occasional full stop", openedOn: "2026-11-15", slaHours: 120, estimatedCostK: 5, status: "done", owner: "Marcus Cole" },
  { id: "WO-024", title: "Standby pump vibration alarm", building: "Harborview Labs", asset: "Standby Pump 1", assetCriticality: 3, reportedSymptom: "Standby pump 1 tripped a vibration alarm overnight", openedOn: "2026-12-26", slaHours: 48, estimatedCostK: 19, status: "new", owner: "Dana Ruiz" },
  { id: "WO-025", title: "Roof leak over server room", building: "Riverbend Tower", asset: "Roof Zone A", assetCriticality: 4, reportedSymptom: "Active roof leak over the server room during heavy rain", openedOn: "2027-01-03", slaHours: 12, estimatedCostK: 33, status: "new", owner: "Sam Okafor" },
  { id: "WO-026", title: "Break room fridge not cooling", building: "Westgate Distribution", asset: "Fridge 3", assetCriticality: 1, reportedSymptom: "Third floor break room fridge running warm", openedOn: "2026-12-06", slaHours: 168, estimatedCostK: 1, status: "done", owner: "Priya Anand" },
  { id: "WO-027", title: "Elevator D annual inspection overdue", building: "Cedar Grove Clinic", asset: "Elevator D", assetCriticality: 4, reportedSymptom: "Annual inspection window closed, elevator still in service", openedOn: "2026-11-30", slaHours: 96, estimatedCostK: 12, status: "rejected", owner: "Marcus Cole" },
  { id: "WO-028", title: "Loading dock lighting flicker", building: "Westgate Distribution", asset: "Lighting Zone 1", assetCriticality: 1, reportedSymptom: "Dock lighting zone 1 flickering, breaker checked fine", openedOn: "2026-12-02", slaHours: 168, estimatedCostK: 2, status: "done", owner: "Dana Ruiz" },
  { id: "WO-029", title: "AHU-3 belt squeal returned", building: "Harborview Labs", asset: "AHU-3", assetCriticality: 2, reportedSymptom: "Air handler belt squealing again after last month's service", openedOn: "2026-12-21", slaHours: 96, estimatedCostK: 4, status: "new", owner: "Sam Okafor" },
  { id: "WO-030", title: "Fire door closer misaligned", building: "Riverbend Tower", asset: "Fire Door 5B", assetCriticality: 3, reportedSymptom: "Fire door 5B not latching fully, closer misaligned", openedOn: "2026-12-16", slaHours: 48, estimatedCostK: 3, status: "in progress", owner: "Priya Anand" },
  { id: "WO-031", title: "Generator load bank test failed", building: "Westgate Distribution", asset: "Generator 2", assetCriticality: 4, reportedSymptom: "Generator 2 failed its load bank test, output unstable", openedOn: "2026-12-23", slaHours: 48, estimatedCostK: 47, status: "triaged", owner: "Marcus Cole" },
  { id: "WO-032", title: "Restroom faucet leaking", building: "Cedar Grove Clinic", asset: "Plumbing Zone B", assetCriticality: 1, reportedSymptom: "Slow drip from restroom faucet, zone B", openedOn: "2026-11-22", slaHours: 168, estimatedCostK: 1, status: "done", owner: "Dana Ruiz" },
  { id: "WO-033", title: "Chiller 1 compressor noise", building: "Riverbend Tower", asset: "Chiller 1", assetCriticality: 3, reportedSymptom: "New compressor noise on chiller 1, no alarm triggered", openedOn: "2026-12-11", slaHours: 96, estimatedCostK: 21, status: "triaged", owner: "Sam Okafor" },
  { id: "WO-034", title: "Security gate motor stalling", building: "Harborview Labs", asset: "Security Gate 1", assetCriticality: 2, reportedSymptom: "Parking security gate motor stalling halfway open", openedOn: "2026-12-13", slaHours: 72, estimatedCostK: 7, status: "new", owner: "Priya Anand" },
  { id: "WO-035", title: "Elevator B annual service due", building: "Riverbend Tower", asset: "Elevator B", assetCriticality: 3, reportedSymptom: "Scheduled annual service window open for elevator B", openedOn: "2026-11-18", slaHours: 168, estimatedCostK: 9, status: "done", owner: "Marcus Cole" },
  { id: "WO-036", title: "Cold room door seal worn", building: "Harborview Labs", asset: "Cold Room 2", assetCriticality: 3, reportedSymptom: "Cold room 2 door seal visibly worn, slow temperature creep", openedOn: "2027-01-04", slaHours: 48, estimatedCostK: 6, status: "new", owner: "Dana Ruiz" },
];

/** A stable pseudo-random walk from an id, so a demo screenshot is reproducible. */
function seededHash(id: string): number {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(seed);
}

const REASON_CODES = ["data-error", "local-knowledge", "manual-adjustment"] as const;

/** Who signed off the seeded triage calls, so every disposed row names a reviewer. */
const DISPOSITION_REVIEWERS = ["Priya Anand", "Dana Ruiz", "Marcus Cole"] as const;

export function seedWorkOrders(): WorkOrder[] {
  return RAW.map((raw) => {
    const order: WorkOrder = { ...raw, urgencyScore: 0, comments: [], history: [] };
    order.urgencyScore = urgencyScore(order);

    // A closed order carries the date it closed — the crew books it out when
    // the SLA clock runs out, which is what the "done this week" tile counts.
    if (order.status === "done" || order.status === "rejected") {
      order.closedOn = new Date(new Date(order.openedOn).getTime() + order.slaHours * 3_600_000).toISOString();
    }

    // A few records already carry an override, a disposition and history, so
    // the queues, the board and ActivityFeed are never opened empty.
    const h = seededHash(order.id);
    if (h % 9 === 0 && order.status !== "done" && order.status !== "rejected") {
      order.humanUrgencyOverride = {
        value: Math.min(100, order.urgencyScore + 12),
        reasonCode: REASON_CODES[h % REASON_CODES.length]!,
        reasonText: "Facilities lead flagged this asset after a near-miss last quarter.",
        at: "2027-01-03T09:15:00",
        actor: "Priya Anand",
      };
      order.history.push({
        verb: "overrode",
        actor: "Priya Anand",
        field: "urgencyScore",
        fromValue: String(order.urgencyScore),
        toValue: String(order.humanUrgencyOverride.value),
        at: "2027-01-03T09:15:00",
      });
    }
    if (order.status === "triaged" || order.status === "in progress") {
      order.disposition = order.estimatedCostK > 20 ? "hold" : "include";
      order.dispositionReason = order.disposition === "hold" ? "Needs approval before scheduling" : undefined;
      order.dispositionBy = DISPOSITION_REVIEWERS[h % DISPOSITION_REVIEWERS.length]!;
      order.dispositionAt = "2027-01-04T14:20:00";
    }
    if (order.status === "rejected") {
      order.comments.push({
        id: `${order.id}-c1`,
        author: "Dana Ruiz",
        body: "Inspection window already reopened for next cycle. Closing this one out.",
        at: "2026-12-02T11:00:00",
      });
      order.history.push({
        verb: "rejected",
        actor: "Dana Ruiz",
        field: "status",
        fromValue: "triaged",
        toValue: "rejected",
        at: "2026-12-02T11:00:00",
      });
    }
    order.history.push({
      verb: "created",
      actor: "System",
      field: "status",
      fromValue: "—",
      toValue: "new",
      at: `${order.openedOn}T08:00:00`,
    });
    return order;
  });
}

export type { Status };
