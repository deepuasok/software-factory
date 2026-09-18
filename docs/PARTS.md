# The parts bin

Everything `@factory/ui` exports, and the one rule for when to reach for it.
See them live: `npm run gallery` → http://localhost:8821

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
| `Segmented` | Two to four exclusive choices that switch a view. |
| `Chip` | Filters that can be on at the same time. |
| `Tabs` | Views of the same record. Never for navigating elsewhere. |
| `SideNav` | Apps with more than three top-level sections. |
| `Breadcrumb` | Any page two or more levels deep. |

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
| `StatTile` | One number that matters. Four across is the ceiling. |
| `StatRow` | The row that holds them. |
| `Badge` | A read-only fact: status, category, count. Never clickable. |
| `RankBadge` | A ranked band — tier, risk, priority. 1 is always darkest and best. |
| `DataTable` | Any table. Click a row to open it; no chevron column. |
| `ListRow` | A selectable row in a rail: dot, name over detail, figures right. |
| `BarMeter` | Share of a total, with the value spelled out. |
| `ProgressBar` | Progress toward a target. |
| `Legend` | Under any chart or map with more than one colour. |
| `Label` | The uppercase eyebrow above a value. |
| `Spinner` | Work in flight. |

## Charts and maps

| Part | Use it when |
|---|---|
| `TrendChart` | Anything over time. Optional target line and dated markers. |
| `CategoryBars` | Magnitude across categories. `horizontal` when labels are names. |
| `Sparkline` | A trend inside a table cell. No axes, no tooltip. |
| `MilestoneRail` | Dated checkpoints under a chart. |
| `WorldMap` | Locations. Give it a city and country, or coordinates. |

Never import Recharts in an app. Never build a dual-axis chart.

## Tokens

```ts
import { color, series, sequential, diverging, rank, tokens } from "@factory/ui";
```

`color` for brand and status, `series` for categorical chart colours in fixed
order, `sequential` for magnitude on one hue, `diverging` for polarity,
`rank` for ranked bands. Everything else comes from Tailwind classes.

Adding a colour means re-running the palette validator in the `dataviz` skill
before it goes in.
