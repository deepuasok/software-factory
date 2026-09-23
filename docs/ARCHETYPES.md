# The eight archetypes

Almost every internal tool is one of eight shapes of work, or a short sequence
of them. Naming the shape first is what stops an app being invented from
scratch: pick the archetype, start from its recipe, swap the sample data for
yours, then walk the checklist plus that archetype's addendum.

See them live: `npm run gallery` → http://localhost:8821, one tab per
archetype.

| Archetype | The person is | Start from |
|---|---|---|
| [Monitor & alert](#monitor--alert) | checking whether anything needs them today | `DashboardPage` |
| [Review & disposition](#review--disposition) | working a list one record at a time | `ReviewQueuePage` |
| [Scenario workbench](#scenario-workbench) | changing an assumption and watching it redraw | `ComparePage`, `BuilderPage` |
| [Plan & schedule](#plan--schedule) | putting dated work on a timeline | `SchedulePage` |
| [Reconcile & attribute](#reconcile--attribute) | choosing which system to believe | `ReconcilePage`, `ImportWizardPage` |
| [Approve & route](#approve--route) | holding the pen on somebody else's work | `ApprovalInboxPage` |
| [Track & follow up](#track--follow-up) | keeping a pile of open work moving | `BoardPage` |
| [Report & readout](#report--readout) | reading the sheet, not using the tool | `ReportPage` |

Pick one. If an app looks like three of them at once, it is three screens, not
one screen with three modes.

---

## Monitor & alert

**What the user does.** Comes in cold, usually in the morning, and wants to
know in ten seconds whether anything needs them today and where it is. They
are not analysing. They are triaging, and most days the answer is "nothing".

**Start from.** `DashboardPage`. Add `MapExplorerPage` when the estate is
geographic.

**Parts it needs.** `StatRow` and `StatTile` for the four figures that matter,
`DeltaValue` and `Sparkline` inside them for direction, `TrendChart` for the
one series worth a chart, `Banner` for something true right now, `InlineAlert`
for one line of state inside a card, `RagStatus` for a judged row, `AsOf` on
every computed figure, `WorldMap` / `Choropleth` / `GeoFilterRail` when the
question is "where", `ErrorState` and `Skeleton` for the panels that have not
loaded yet.

**Checklist addendum.**
- [ ] Every tile has an as-of stamp.
- [ ] Every alert names an owner.

A figure with no date is a rumour. An alert nobody owns is noise that people
learn to scroll past, which is worse than no alert at all.

---

## Review & disposition

**What the user does.** Works through a list one record at a time and makes
the same small call on each: in, out, or hold. The volume is the problem — two
hundred records, six seconds each — so the screen is judged on how little it
costs to make one decision and move on.

**Start from.** `ReviewQueuePage`.

**Parts it needs.** `Queue` with `useRowKeys` for j/k navigation, `ReviewProgress`
at the head so people can see the end, `DispositionControl` for the call
itself, `Drawer` and `DetailHeader` to open one record without losing the
list, `StickyActionBar` so the decision is always reachable, `DataTable` inside
a `SplitPane` when people scan rather than work through.

**Checklist addendum.**
- [ ] Every row shows its disposition, the reason, the reviewer and the timestamp.

A call with no reason cannot be defended a month later, and the person who has
to defend it is rarely the person who made it.

---

## Scenario workbench

**What the user does.** Changes an assumption and watches the consequence
redraw, then does it again, then compares the versions side by side and argues
about which one to commit to. Nothing is saved until the argument is over.

**Start from.** `ComparePage` for the comparison, `BuilderPage` for the
nudging.

**Parts it needs.** `ScenarioCompare` for metrics down the side and scenarios
across the top, `DivergingBars` for values either side of a baseline,
`RankedBars` to pull one entity out of the field, `Waterfall` for how a number
moved, `SmallMultiples` for the same trend across groups, `Histogram` and
`Scatter` for the raw shape of the data, `Slider` and `InlineEdit` for the
assumptions, `AutosaveChip` beside Save, `useLinkedHighlight` to tie a table
row to a chart mark.

**Checklist addendum.**
- [ ] Scenarios are named, not numbered.
- [ ] Every diff column is toned against the baseline.

"Scenario 3" is forgotten by Friday. "Two extra sites in Spain" is not.

---

## Plan & schedule

**What the user does.** Puts dated work on a timeline, finds where it
collides, and argues about whether the committed date still holds.

**Start from.** `SchedulePage`.

**Parts it needs.** `Gantt` for concurrent spans, `CurveMilestones` when the
checkpoint dates are computed from a curve, `MilestoneRail` when they are
typed in, `CapacityMeterGrid` to catch one resource overloaded in one period,
`TargetSolveRail` to test a date against a total, `ProgressBar` against the
target, `DateRangePicker` for the window.

**Checklist addendum.**
- [ ] The committed date is drawn on the chart.
- [ ] Slip is stated in weeks.

A plan that quietly redraws around the new date is a plan nobody can be held
to. Draw the original line and put the number of weeks next to it.

---

## Reconcile & attribute

**What the user does.** Has the same number from two systems, picks the one to
trust, and leaves a record of why — or brings a spreadsheet in and finds out
what is wrong with it before it lands.

**Start from.** `ReconcilePage` for the choosing, `ImportWizardPage` for the
arriving.

**Parts it needs.** `SourceBadge` next to every figure that did not come
straight from a form, `OverrideControl` where a human sometimes knows better
than the model, `ExplainPanel` beside a figure people are being asked to
trust, `ActivityFeed` and `AsOf` for what happened and when, `FileDrop` and
`ImportWizard` for the spreadsheet, `FindingsPanel` for what the validation
pass found, `ExportButton` for getting it back out.

**Checklist addendum.**
- [ ] Every field shows its source.
- [ ] Every correction writes an `Override` with a reason code.

A silent fix is indistinguishable from a bug. Six months later nobody can tell
whether the number was corrected or corrupted.

---

## Approve & route

**What the user does.** Holds the pen. Reads what somebody else prepared, then
approves it, sends it back with a note, or stops it. They did not do the work
and will not redo it — they are deciding whether it moves.

**Start from.** `ApprovalInboxPage`.

**Parts it needs.** `ApprovalActions` for the three-way call, `StatusStepper`
for where the record is in its lifecycle, `Queue` and `Drawer` for working the
inbox, `StickyActionBar` to keep the decision reachable, `AssigneePicker` for
routing it onward, `CommentThread` and `ActivityFeed` for the trail.

**Checklist addendum.**
- [ ] Reject requires a comment.
- [ ] State history is visible on the record.

An approval with no trail gets relitigated, usually by somebody who was not in
the room.

---

## Track & follow up

**What the user does.** Owns a pile of open work and keeps it moving. Who has
it, when it is due, what is stuck. They are chasing, not deciding.

**Start from.** `BoardPage`.

**Parts it needs.** `KanbanBoard` when the bucket is the state, `Checklist`
for a fixed set of steps on one record, `DueDateBadge` and `PriorityBadge` on
every card and row, `AssigneePicker` and `Avatar` for who has it,
`CommentThread` for the chase itself, `BulkActionBar` for reassigning several
at once.

**Checklist addendum.**
- [ ] Every item shows an owner and a due date.
- [ ] Overdue is toned `error`.

Work with no owner and no date is not tracked. It is remembered, and then it
is not.

---

## Report & readout

**What the user does.** Is not using the tool at all. They are reading the
sheet it printed, on a phone in a corridor or on paper in a meeting, and they
will never click anything.

**Start from.** `ReportPage`.

**Parts it needs.** `PrintLayout` instead of `AppShell`, `Section` and
`JumpList` to break up a long page, `Callout` under every chart for the one
sentence it is making, `StatRow` for the headline figures, `TrendChart` and
`CategoryBars` for the evidence, `AsOf` for when the figures were pulled.

**Checklist addendum.**
- [ ] It prints on one page.
- [ ] Every chart has a takeaway caption.

A chart with no sentence under it is a picture. The reader supplies their own
conclusion, and it is rarely the one the data supports.
