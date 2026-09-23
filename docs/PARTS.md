# The parts bin

Everything `@factory/ui` exports, and the one rule for when to reach for it.
See them live: `npm run gallery` → http://localhost:8821

**113 parts and 14 recipes.** The first section is the ground floor — those
parts are in every app whatever it does. The eight sections after it are the
[archetypes](ARCHETYPES.md): pick the shape of work first, and the parts it
needs are the list under its heading. A part is listed once, under the
archetype it mainly serves; plenty of them get used elsewhere too.

---

# Foundations (every app)

## Frame

| Part | Use it when |
|---|---|
| `AppShell` | Every route. `width="wide"` for pages, `width="full"` for builder screens. `brand` is your wordmark — the demos use `ACME`. |
| `TopBar` | Comes with AppShell. Product name, breadcrumb, at most two actions. |
| `PageHeader` | Top of a page: title, badges, one supporting line, the page actions. |
| `Card` | Any white surface. `padded={false}` when it holds a table or list. |
| `Grid` | 2, 3 or 4 equal columns that collapse to one on a phone. |
| `SplitPane` | A list rail beside the consequence of the current selection. |
| `Toolbar` | Search, filters, then actions — in that order, above a list. |
| `EmptyState` | Any list, chart or panel that can be empty. Always with an action. |
| `Divider` | A break inside a card. Never stacked margins pretending to be one. |

## Controls

| Part | Use it when |
|---|---|
| `Button` | `primary` = the one action the page wants. `secondary` = everything else. `ghost` = toolbar and row actions. `danger` = destructive, always with a confirm. |
| `ConfirmButton` | Any delete or discard. Two clicks, second one says what happens. |
| `Toggle` | A setting that takes effect **immediately**. |
| `Checkbox` | A setting that applies **on Save**. That is the only difference. |
| `Radio` | One choice out of a set whose options cannot sit next to each other — a "trusted" marker under each of three columns. When they can sit together, use `Segmented` or `RadioCards`. |
| `Segmented` | Two to four exclusive choices that switch a view. |
| `Chip` | Filters that can be on at the same time. Takes a `tone`. |
| `Tabs` | Views of the same record. Never for navigating elsewhere. |
| `SideNav` | Apps with more than three top-level sections. |
| `Breadcrumb` | Any page two or more levels deep. |
| `Label` | The uppercase eyebrow above a value. |
| `Spinner` | Work in flight. |
| `cx` | Joining class names inside a part. `cx("px-2", on && "bg-selected")` drops anything falsy. A convenience, not a styling escape hatch. |
| `ButtonVariant` / `ButtonSize` | `Button`'s own prop types. `size="lg"` exists on `Button` and nowhere else. |

## Fields

| Part | Use it when |
|---|---|
| `Field` | Wraps **every** input. Owns the label, hint and error. |
| `TextInput` / `NumberInput` / `DateInput` / `TextArea` / `Select` | The obvious one. Never a bare `<input>`. |
| `SearchInput` | Filtering a list. Distinct shape so people find it. |
| `InlineEdit` | A figure people nudge repeatedly. Click, type, Enter. |
| `Modal` | Creating a record, or confirming. Never for information. |
| `Toast` | A short confirmation. Never for an error needing action. |

## Facts and figures

| Part | Use it when |
|---|---|
| `StatTile` | One number that matters. Four across is the ceiling. Takes an optional `delta`, `sparkline` and `asOf` — a Monitor & alert dashboard wants `asOf` on every tile. |
| `StatRow` | The row that holds them. `wideFirst` gives the headline figure a double column. |
| `Badge` | A read-only fact: status, category, count. Never clickable. |
| `RankBadge` | A ranked band — tier, risk, priority. 1 is always darkest and best. |
| `StatusPill` | The one status column a table has. For a category or a count, use `Badge`. |
| `RagStatus` | The state is judged — on plan, at risk, behind. A dot on an unjudged fact implies a judgement nobody made. |
| `DeltaValue` | A figure moved and you want the direction. Say which way is good with `higherIsBetter`. |
| `HeatCell` | Every row of a column is the same measure on the same scale. Never on mixed units. |
| `BulkActionBar` | An action only makes sense on several rows at once. A single row's actions live in the row. |
| `ListRow` | A selectable row in a rail: dot, name over detail, figures right. |
| `BarMeter` | Share of a total, with the value spelled out. |
| `ProgressBar` | Progress toward a target. `thresholds` tone it as it fills. |
| `Legend` | Under any chart or map with more than one colour. |

## The table

| Part | Use it when |
|---|---|
| `DataTable` | Any table. Everything past the plain table is opt-in — turn nothing on unless people do that job here. |
| `DataTable emptyState` | Every list needs one. Pass an `EmptyState` with the one action that creates the first row. (`empty` still takes a plain string, and still just centres it.) |
| `DataTable sortable` | People compare down a column. Set `sortable` and `sortValue` on that column; the header cycles ascending, descending, off. |
| `DataTable selectable` | People act on several rows at once. Pair it with `bulkActions`. |
| `DataTable renderExpanded` | A row has detail worth a sentence but not a page. For a whole record, open the record. |
| `DataTable columnChooser` | The table has columns only some people need. Mark those `hideable`. |
| `DataTable stickyHeader` | The list runs past a screen. It applies a `maxHeight` (520 by default) because a sticky header needs something to stick inside. |
| `DataTable freezeFirstColumn` | The table scrolls sideways and the name column is what people track by. |
| `DataTable rowActions` | A row has two or three verbs. They gather into one ⋯ menu, never a row of buttons. |
| `DataTable dense` | A table people scan rather than read. |
| `Column` / `SortState` | The column and sort types. `Column.sortValue` is for a sortable column that renders something other than its own sort key. |

## Filters

| Part | Use it when |
|---|---|
| `FilterBar` | Any list long enough that people narrow it. Everyday filters as chips, everything else behind "Add a filter". |
| `SavedViews` | People set the same filters twice. Not for a one-off query — that is the filter bar. |
| `useTableState` | A list page needs sort, filters, ticked rows and the current view in one place. It knows nothing about your data. |
| `emptyFilterState` | The starting value for a filter bar, and what "Clear all" goes back to. |
| `FILTER_OPERATORS` | Building your own operator select. The six operators, in order. |
| `FilterRule` / `FilterState` / `FilterField` / `FilterChip` / `SavedView` / `FilterOperator` | The filter types. |

## Forms

| Part | Use it when |
|---|---|
| `Form` | Any set of fields that saves together. It blocks the second submit while the first is in flight. |
| `FormSection` | A form long enough that people lose their place. Not for four fields. |
| `FormRow` | Two fields belong side by side. Never three. |
| `ValidationSummary` | A save failed. It never replaces the error on the field — say it in both places. |
| `Combobox` | One choice from more than about ten options. Under ten, a `Select` is faster. |
| `MultiSelect` | Several choices from a list somebody governs. |
| `TagInput` | Free-text labels nobody governs. If the list is governed, use `MultiSelect`. |
| `RadioCards` | Two to four exclusive choices that each need a sentence to tell apart. |
| `Slider` | Roughly right is good enough. When the exact number matters, use `NumberInput`. |
| `DateRangePicker` | A report has a period. The presets are the point; two loose `DateInput`s are not the same part. |
| `dateRangePresets` | You are building your own preset row and want the same four ranges. |
| `Option` / `DateRange` | The option and range types. |

## Tone

| Part | Use it when |
|---|---|
| `Tone` | The type every part that shows state takes. Six values, fixed meanings — see [TONE.md](TONE.md). |
| `TONES` | You need all six in order: a legend, a gallery row, a test that walks every tone. |
| `toneClass(tone, surface)` | A part inside `packages/ui` needs classes for a tone. The only mapping there is. `surface` is `text`, `bg`, `border`, `fill` or `soft`. |
| `toneHex(tone)` | A class cannot reach it — an SVG `fill`, a chart marker, a map dot. Inside `packages/ui` only. |
| `ToneSurface` | The surface type, when you are writing a part that takes one. |
| `BadgeTone` | An alias of `Tone`, kept so older call sites still compile. New code says `Tone`. |

---

# Monitor & alert

The ten-second answer to whether anything needs attention today.
[Archetype notes →](ARCHETYPES.md#monitor--alert)

| Part | Use it when |
|---|---|
| `TrendChart` | Anything over time. Optional target line and dated markers. `referenceDots` and `referenceAreas` call out a date or a span; `brush` scrubs a long series; `seriesToggle` makes the legend hide and show lines; `highlightKey` dims everything but one. |
| `CategoryBars` | Magnitude across categories. `horizontal` when labels are names. |
| `Sparkline` | A trend inside a table cell. No axes, no tooltip. |
| `geocode()` | Turn whatever a dataset calls a place into a position, offline, with a precision (city, region, country). Used by `WorldMap`; call it yourself for tables and audits. |
| `WorldMap` | Locations. Give it a city and country, or coordinates. `sizeKey="value"` sizes dots by a number, `tone` per point colours by state, `graticule` adds faint reference lines. Ctrl or cmd plus scroll zooms, drag pans once zoomed, both clamped to the frame. |
| `Choropleth` | One number per country, ten or fewer. Not a true filled-polygon map — it draws a coloured, sized centroid circle per country, and says so on screen. |
| `GeoFilterRail` | A rail of region or country chips with counts, for narrowing a map or table by geography. Controlled. |
| `Banner` | Once, above the page header, for something true right now — a sync failure, a maintenance window, a deadline moved. |
| `InlineAlert` | One line of state inside a card, next to the thing it is about. For a message that needs its own row above the whole page, use `Banner`. |
| `ErrorState` | A panel that could not load and can be retried. For a list that loaded fine and simply has nothing in it, use `EmptyState`. |
| `Skeleton` | A placeholder for a part that has not loaded yet, in its shape — `text`, `tile` or `table`. Swap it for the real content the moment data arrives. |
| `MapPoint` / `ChoroplethPoint` / `GeoFilterOption` | The map data types. |
| `COUNTRY_CENTROIDS` / `countryCentroid` | A country's centroid, for placing something on the map without a full geometry. |

---

# Review & disposition

A list worked one record at a time, with the same call made on each.
[Archetype notes →](ARCHETYPES.md#review--disposition)

| Part | Use it when |
|---|---|
| `Queue` | Working a list one record at a time — a review queue, an approval inbox. j/k or the arrow keys move the selection, Enter opens it. For a table people scan rather than work through, use `DataTable` in a `SplitPane`. |
| `useRowKeys` | The hook behind `Queue`'s keyboard navigation. Reach for it directly only when building a custom rail that is not `Queue`. |
| `ReviewProgress` | "42 of 180 reviewed" over a bar, at the head of any queue worked one item at a time. |
| `DispositionControl` | An Include / Exclude / Hold call on one item. The reason select becomes required the moment the call is not Include. |
| `Drawer` | Opening one record from a list without losing the page behind it. Escape or the backdrop closes it. Not for creating a record — that is `Modal`. |
| `DetailHeader` | The top of a record opened for review: title, status, owner and the key facts. Not a general page header — that is `PageHeader`. |
| `StickyActionBar` | The decision at the end of a queue or a detail page, pinned to the bottom of the pane so it is always reachable. Not for row-level actions. |
| `Disposition` | The three-way call's type. |

---

# Scenario workbench

An assumption changed, the consequence redrawn, the versions compared.
[Archetype notes →](ARCHETYPES.md#scenario-workbench)

| Part | Use it when |
|---|---|
| `ScenarioCompare` | Metrics down the side, scenarios across the top, each cell toned against the baseline. |
| `DivergingBars` | Values split above and below a baseline, toned by whether up or down is good. |
| `RankedBars` | One entity picked out against the rest of the field — the top or bottom of a ranking. |
| `Waterfall` | How a number moved from a start to an end through a sequence of ups and downs. |
| `SmallMultiples` | The same trend across several groups, sharing one y-axis so heights are honest. |
| `StackedBars` | A whole made of parts, compared across categories. Horizontal by default. Never a donut. |
| `Histogram` | Where raw values cluster — a distribution, not a single average. |
| `Scatter` | Two numeric measures against each other, optionally sized by a third. `highlightKey` picks one point out of the cloud. |
| `Heatmap` | Magnitude across a rows-by-columns grid — one sequential hue, never a rainbow. |
| `Funnel` | Where a count shrinks stage by stage, with the conversion rate between each. |
| `useLinkedHighlight` | Not a rendered part — a hook that shares one hovered key between a table row and a chart's `highlightKey`. |
| `AutosaveChip` | Beside Save on any screen with figures people nudge in place. |
| `SeriesSpec` / `MarkerSpec` / `ReferenceDotSpec` / `ReferenceAreaSpec` / `ScatterPoint` / `HeatmapCell` / `WaterfallStep` / `FunnelStage` / `SmallMultiplePanel` / `RankedBarDatum` / `DivergingBarDatum` / `ScenarioMetric` | The chart data types. |

Never import Recharts in an app. Never build a dual-axis chart.

---

# Plan & schedule

Dated work on a timeline, and whether the date still holds.
[Archetype notes →](ARCHETYPES.md#plan--schedule)

| Part | Use it when |
|---|---|
| `Gantt` | Concurrent spans people compare side by side — cohorts, workstreams, site activation. Zoom with the wheel, pan by dragging, or use the range slider. |
| `CurveMilestones` | Dated checkpoints computed from a cumulative curve against a target, for the cases where the dates are a model's output rather than a fixed plan. |
| `MilestoneRail` | Dated checkpoints under a chart, when the dates are typed in rather than computed. |
| `CapacityMeterGrid` | A periods-by-resources grid where every cell shows demand against capacity, with row and column totals, to catch one resource overloaded in one period. |
| `TargetSolveRail` | A target date tested against a total — "requires N per month from &lt;date&gt;" — with the readout turning to `error` when the date is not achievable against a known ceiling. |
| `GanttRow` / `GanttReferenceLine` / `CurvePoint` / `CapacityPeriod` / `CapacityResource` / `CapacityCell` | The timeline data types. |

---

# Reconcile & attribute

Two systems, one number, and a record of which one was believed.
[Archetype notes →](ARCHETYPES.md#reconcile--attribute)

| Part | Use it when |
|---|---|
| `SourceBadge` | Next to a number that did not come straight from a form. |
| `OverrideControl` | A model produces a field and a human sometimes knows better. Pass `reasonCodes` for a domain's own reasons. |
| `ExplainPanel` | Next to a model-produced figure people are being asked to trust or override. Pass `valueFormat` whenever the contributions carry a unit — money, days, hours. |
| `ActivityFeed` | You need to answer "what happened here" without a diff view. |
| `recordChange` | Building an `ActivityEntry` in a call site that thinks in `{ from, to }`. It maps them to the stored `fromValue` / `toValue`. |
| `AsOf` | Beside a figure that was computed rather than typed in just now. |
| `FileDrop` | Picking a single file — a drag-and-drop zone that is also click-to-browse. |
| `ImportWizard` | Bringing in a spreadsheet or CSV: Drop → Preview → Map columns → Validate → Commit. |
| `FindingsPanel` | Summarising a validation pass, grouped by severity with counts and a jump link. |
| `ExportButton` | Rows and columns need to leave the app as a spreadsheet. |
| `ActivityEntry` / `OverrideReasonCode` / `Contribution` / `Finding` / `AutosaveState` | The provenance and import types. |

---

# Approve & route

Somebody else's work, approved, sent back, or stopped.
[Archetype notes →](ARCHETYPES.md#approve--route)

| Part | Use it when |
|---|---|
| `ApprovalActions` | The final Approve / Request changes / Reject on a record. The two negative paths require an inline comment before they fire. |
| `StatusStepper` | A record's fixed lifecycle — done steps behind, the current one marked, the rest ahead, with an optional date under each. |
| `ApprovalDecision` | The decision type. |

---

# Track & follow up

Open work, who has it, and when it was due.
[Archetype notes →](ARCHETYPES.md#track--follow-up)

| Part | Use it when |
|---|---|
| `KanbanBoard` | Work genuinely tracked by which bucket it sits in. Drag a card between columns, or focus a card and press the left or right arrow key. For a list only ever sorted or filtered, use `DataTable`. |
| `Checklist` | A fixed set of steps a person ticks off on one record. For a to-do list people add to freely, this is the wrong part. |
| `DueDateBadge` | A due date anywhere in a row or a header. "due in 3d" or "2d overdue", toned by how close it is — overdue is `error`, within two days is `warn`, otherwise `neutral`. Never colour a raw date by hand elsewhere. |
| `PriorityBadge` | A work item's priority, P1 through P4. P1 is always the darkest and the most urgent. Group anything past P4 as P4. |
| `AssigneePicker` | A record needs an owner or a reviewer. |
| `Avatar` | Anywhere a name needs a face and there is no photo. |
| `CommentThread` | A record needs a discussion, one thread per record. Leave `onAdd` out for a read-only trail; leave `onResolve` out and nothing can be resolved here. |
| `ProvenanceUser` / `ProvenanceComment` | The person and comment types. |

---

# Report & readout

The printed sheet, not the tool around it.
[Archetype notes →](ARCHETYPES.md#report--readout)

| Part | Use it when |
|---|---|
| `PrintLayout` | The whole point of the screen is the printed sheet, not the working tool around it. The Print button and the app's own chrome disappear from the printed page. |
| `Section` | An anchored heading for a long page, for a `JumpList` to point at. |
| `JumpList` | The in-page table of contents for a page built from Sections. |
| `Callout` | The one insight a report section is making, called out so it survives skimming. Once per section, one or two sentences, right after the chart it is about. |

---

# Recipes

A recipe is a whole page, already assembled, with sample data built in. Copy
the file, pass your own rows, delete what the screen does not need. Every one
of them renders live in the gallery's **Recipes** tab.

| Recipe | Use it when |
|---|---|
| `ListPage` | People scan, narrow and act on rows in bulk. Header, filters, saved views, table, empty state. |
| `FormPage` | People create or edit one record. Two sections, errors on top, Save pinned to the bottom. |
| `DetailPage` | One record opened to be understood: the facts, where each came from, and what has happened to it. |
| `DashboardPage` | The ten-second answer to whether anything needs attention today. |
| `ReviewQueuePage` | A list worked one record at a time, with the same call made on each. |
| `ApprovalInboxPage` | Somebody else's work, read and then approved, sent back, or stopped. |
| `BoardPage` | Open work tracked by which bucket it sits in, dragged between columns. |
| `ComparePage` | Two or more named scenarios for the same thing, compared metric by metric against a baseline. |
| `ReconcilePage` | The same figure from two systems, with a source picked per field and an override written when a human knows better. |
| `ImportWizardPage` | A spreadsheet coming in: Drop, Preview, Map columns, Validate, Commit. |
| `SchedulePage` | Dated work on a timeline, with the committed date drawn and capacity checked period by period. |
| `MapExplorerPage` | A table and a map of the same records, linked. |
| `ReportPage` | The printed sheet. Sections, jump list, a takeaway under every chart. |
| `BuilderPage` | An assumption nudged in place while the totals and the curve redraw. Owns its own full-width shell. |

Their row and value types — `ListPageRow`, `FormPageValues`, `ReviewQueueRow`,
`ApprovalInboxRow`, `BoardCard`, `BuilderItem`, `DashboardTopItem`,
`SchedulePageRow`, `MapExplorerPageRow` — are exported alongside them.

---

# Reading a table file

`ImportWizard` uses these; an app rarely calls them directly.

| Helper | Use it when |
|---|---|
| `parseTable(file, spec)` | One shot: file in, typed rows and rejects out. |
| `readTable(file)` | You need the raw headers and rows before a spec is applied — a preview step. |
| `buildMapping(headers, spec)` | Fuzzy-matching a file's headers to your fields, so a person can correct the match. |
| `applySpec(headers, rows, mapping, spec)` | Turning raw rows into typed rows once the mapping is settled. |
| `parseTableText(text, spec)` | The same, from a CSV or TSV string you already have. |
| `toCSV(rows, columns)` | Getting rows back out. `ExportButton` uses it. |
| `findColumn` / `norm` | Writing your own matcher. `norm` is the header normaliser everything else agrees on. |
| `ColumnSpec` / `ColumnType` / `TableSpec` / `ParseResult` / `Reject` | The spec and result types, re-exported from `components/files` so an app never imports `lib/parse` directly. |

Excel is an optional dynamic import. Without the `xlsx` package installed, a
`.xlsx` file throws "xlsx support needs the xlsx package" and CSV and TSV keep
working.

---

# Tokens

```ts
import { color, series, sequential, diverging, rank, tokens } from "@factory/ui";
```

`color` for brand and status, `series` for categorical chart colours in fixed
order, `sequential` for magnitude on one hue, `diverging` for polarity,
`rank` for ranked bands. `font`, `text`, `space`, `radius`, `size`,
`elevation` and `motion` are there for the parts themselves; an app takes them
through Tailwind classes, not by reading the object.

Adding a colour means re-running the palette validator in the `dataviz` skill
before it goes in. `series` passes every check as it stands.

`GEO`, `geoLookup`, `project`, `jitter`, `MAP_W` and `MAP_H` are the map
projection helpers `WorldMap` is built on. `tailwindPreset` is what an app's
`tailwind.config.ts` extends.
