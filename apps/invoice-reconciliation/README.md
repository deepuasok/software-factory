# Invoice Reconciliation

**The decision:** which supplier invoice lines to pay this month, at what
amount, and from which system's figure — ERP, the supplier's PDF, or the
goods receipt.

Built entirely from `@factory/ui`. No CSS, no hex, no component defined in
this app, no Recharts import.

```bash
cd ~/Projects/software-factory
npm install
npm run dev --workspace @factory/invoice-reconciliation   # → http://localhost:8825
```

## Archetypes

- **Reconcile & attribute** (primary) — `/reconcile` and `/import`. The same
  figure reported by up to three systems, a trusted source picked per line,
  and a human override with a reason when nobody trusts any of the three.
- **Report & readout** — `/readout`. The printed sheet: a waterfall bridging
  the ERP total to what the plan actually pays, status by supplier, and
  variance by supplier, each with a takeaway.

## Routes

- **`/`** — the book of invoice lines for September 2026: `StatRow` (lines,
  unmatched, variance total, ready to pay), `FilterBar` with chips
  (unmatched, disputed, over $10k) and `SavedViews`, a `DataTable` with
  sorting, row selection and a `BulkActionBar` ("Mark matched", "Dispute"),
  `HeatCell` on the variance column, `StatusPill`, and an `ExportButton`.
  Filtering to a combination with nothing in it (e.g. Unmatched + Disputed)
  reaches the `EmptyState`.
- **`/import`** — `ImportWizard` loads a bundled September AP export (a CSV
  string in `lib/import-spec.ts`) with three deliberately bad rows: a blank
  supplier, a missing PO, and a non-numeric amount. The wizard fuzzy-matches
  its headers to the app's fields, the `FindingsPanel` lists the three
  problems, and committing adds the seven accepted rows — the three bad ones
  are held back — to the shared list and writes an activity entry.
- **`/reconcile`** — every line that still needs a call: the three source
  amounts side by side with `SourceBadge`, a `Radio` marking the trusted
  source, an
  `OverrideControl` for a figure none of the three sources produced,
  `DivergingBars` showing variance vs ERP by supplier (redraws as sources are
  picked), and an `ActivityFeed` of every choice made this session.
- **`/lines/[id]`** — `Tabs` for Overview / Comments / Activity. Overview
  shows every amount with its `SourceBadge`, the pay amount, the spread
  across sources, and an `ExplainPanel` for why the line is flagged.
  Comments use `CommentThread`; Activity is this line's slice of the feed.
- **`/readout`** — `PrintLayout` with an executive `Callout`, a `JumpList`,
  and three sections (ERP → pay amount `Waterfall`, `StackedBars` of status
  by supplier, `DivergingBars` of variance by supplier), each followed by its
  own takeaway `Callout`.

## Currencies

Lines arrive in dollars, pounds and euros. Any figure that adds several lines
together (the stat tiles, the waterfall, variance by supplier) is converted
to US dollars first at a fixed sample rate in `lib/model.ts`, and says so on
screen. A per-line figure is always shown in its own currency.

## Data and state

Client-state only, seeded from `lib/data.ts` — 37 sample invoice lines across
10 invented suppliers, labelled as sample data, some missing a source and
some disagreeing on purpose. `lib/store.ts` is a small `useSyncExternalStore`
module shared by every route (so a change on `/reconcile` shows up on `/` and
`/lines/[id]` without a reload); every mutation goes through `recordChange`
(the same `@factory/ui` helper `lib/audit.ts` and the ReconcilePage recipe
use) so the `ActivityFeed` on every screen is built from real entries, never
sample ones. This is the one deliberate departure from `apps/_template`'s
Prisma-backed pattern: there is no live database, so `lib/audit.ts`,
`lib/db.ts`, `lib/user.ts` and `prisma/schema.prisma` are left in place
untouched, exactly as the template ships them, ready to wire up when a real
API arrives.

Because state lives in a JS module, it resets on a full page reload (a fresh
tab, or typing the URL) but persists across in-app navigation (clicking a
link) within one browser tab. That is a property of the proof, not a bug —
see "What I could not do" below.

## Verify

- `npx tsc --noEmit -p apps/invoice-reconciliation/tsconfig.json` — clean.
- All five routes return 200 with no compile errors and no "Application
  error" / "Unhandled" in the served HTML.
- Driven end to end in a browser: picked a trusted source on `/reconcile`
  (DivergingBars and the ActivityFeed updated live), submitted an override
  with a reason, left a comment on a line's detail page, ran the import
  wizard to commit the seven good rows out of ten, and ran a bulk "Mark
  matched" from the list.
- `grep -rn "#[0-9a-fA-F]\{6\}"` under `app/` and `lib/` is empty. No
  Recharts import anywhere in the app.

## What I could not do / found awkward

- **`ImportWizard` used to commit rows with required-field violations. Fixed
  in the part, not here.** `FindingsPanel` listed "Row 3: supplier — Required
  field is empty", the wizard said "10 of 10 rows accepted", and `onCommit`
  received the bad rows anyway. `applySpec` in
  `packages/ui/src/lib/parse.ts` now keeps a row out of `rows` when that row
  produced any reject, so the count is honest and the import is clean. Every
  caller keeps working; a row that passes is unaffected.
- **No source-of-truth check for provenance-adjacent business logic in the
  parts bin.** `SourceBadge` and `OverrideControl` are generic enough for any
  domain, which is the point, but `OverrideControl`'s reason codes are fixed
  (`data-error` / `local-knowledge` / `manual-adjustment` / `other`) and
  can't be swapped for domain vocabulary (`price-variance`,
  `duplicate-charge`, `fx-rate`, …). I worked around this by seeding sample
  "corrected" lines with domain-specific reason text directly (`lib/types.ts`
  `ReasonCode` is a superset of `OverrideReasonCode`), but a person using the
  live `OverrideControl` can only ever pick from the four generic reasons.
  That's fine for a proof; a real AP tool would want the four generic codes
  extended, which today means either accepting the mismatch or exporting a
  new component under a different name — the contract has no story for
  "same part, different closed enum."
- **Real bug I found and fixed in my own code, worth flagging because it is
  an easy trap with this pattern:** `useSyncExternalStore`'s `getSnapshot`
  must return a new value when data changes. My first draft mutated a module
  singleton in place and returned that same object from `getSnapshot` — the
  mutation worked, `emit()` fired, but React never re-rendered because
  `Object.is(old, new)` was always true. Fixed by rebuilding a `snapshot`
  object on every mutation (see `lib/store.ts`). Any other app in the shop
  that reaches for a hand-rolled external store instead of component state
  will hit the same thing; might be worth a line in `docs/DATA.md` about it,
  since apps that go client-state-only (no Prisma/API routes) don't have
  `lib/api.ts`'s `useOptimistic` to fall back on.
