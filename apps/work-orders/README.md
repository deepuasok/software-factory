# Work Order Triage

## The decision

Which open facilities work orders get done first this week, and which
high-cost jobs (over $25k) get approved before they can be scheduled.

## Archetypes

- **Monitor & alert** (primary) — `/` — the dashboard: is anything overdue
  today, and where.
- **Review & disposition** — `/triage` — work new and triaged orders one at a
  time: explain the urgency score, override it with a reason, decide
  Include/Exclude/Hold, discuss.
- **Approve & route** — `/approvals` — sign off on triaged orders estimated
  above $25k; reject or send back requires a comment.
- **Track & follow up** — `/board` — every order on a status board, dragged
  between columns, reassigned in place.
- **Report & readout** — `/readout` — the printable sheet for a steering
  update: SLA performance, cost approved against the quarter's budget, top
  risks.

Provenance is on throughout (question 4 = yes): every system-produced number
carries a `SourceBadge`, the urgency score has an `ExplainPanel`, overrides
require a reason, and every status change is written to an `ActivityFeed`.

## How to run

```bash
cd /Users/deepuasok/Projects/software-factory
npm run dev --workspace @factory/work-orders   # http://localhost:8824
```

Typecheck: `npx tsc --noEmit -p apps/work-orders/tsconfig.json`.

## Data

`lib/data.ts` seeds 36 invented work orders across four fictional buildings,
labelled `sample data` on the dashboard. `lib/model.ts` holds the maths: the
urgency score is an explainable, weighted formula — 50 points for how far
past the SLA clock the order is, 30 for the asset's criticality, 20 for the
reported symptom's severity — with the three contributions exposed to
`ExplainPanel`.

This is a **client-state app**, like `contract-renewals`: each page seeds its
own copy of the data and holds it in React state. There is no live database
behind it, so `prisma/schema.prisma` is left exactly as the template ships it
(the seven cross-cutting models, no domain model added).

### Where the activity trail is written

`lib/audit.ts`'s `recordChange` is the **server** half of the trail: it calls
Prisma and cannot run in a `"use client"` page. The client half already ships
in the parts bin — `recordChange` from `@factory/ui` — and that is what every
override, disposition, approval decision, board move and reassignment here
calls, appending the entry to the page's in-memory activity list so
`ActivityFeed` always shows real entries. Wiring a real database later means
posting to a route that calls `lib/audit.ts`'s `recordChange` as well; the
call sites do not change.
