# Build contracts

Read this before adding a part. It exists so that several people (or several
agents) can build in parallel and the result still reads as one system.

## 1. Tone is the only state vocabulary

```ts
export type Tone = "neutral" | "brand" | "ok" | "warn" | "error" | "info";
```

`Tone` lives in `packages/ui/src/tokens.ts`. Every part that expresses state
takes `tone?: Tone`. No part takes `color`, `variant: "danger"`, `severity`,
`status` (as a colour), or a hex. Two exceptions, and no third: `Button`'s
`variant` (a destructive button is a kind of button, not a state) and
`FindingsPanel`'s `finding.severity` (a field on the validator's data, not a
prop). Neither maps a colour itself.

The only mapping from tone to classes is `toneClass(tone, surface)` in
`packages/ui/src/tone.ts` (package A). A part that maps tone to colour on its
own is a defect.

Meaning, fixed:

| Tone | Means | Never means |
|---|---|---|
| `neutral` | a fact with no judgement | "unimportant" |
| `brand` | selected, active, primary action | good |
| `ok` | on plan, approved, healthy | finished |
| `warn` | watch this, at risk, pending | error |
| `error` | behind plan, rejected, failed, overdue | "important" |
| `info` | a note from the system | anything human-judged |

## 2. Prop names

Use these names and no synonyms:

| Prop | Type | Notes |
|---|---|---|
| `tone` | `Tone` | see above |
| `size` | `"sm" \| "md"` | never `"lg"` except `Button` |
| `label` | `string` | visible label |
| `value` / `onChange` | | controlled inputs, always this pair |
| `rows` / `columns` | | for tables and grids |
| `emptyState` | `ReactNode` | what shows when there is nothing |
| `loading` | `boolean` | |
| `disabled` | `boolean` | |
| `dense` | `boolean` | tighter row height |
| `className` | `string` | spacing nudges only — never colour, height or border |

## 3. Files

- Every part is a **named export** from `packages/ui/src/components/<family>.tsx`.
  Nothing default-exports.
- Every part has a doc comment whose first line says when to use it and when
  not to.
- A package edits **only its own family file** plus `recipes/<Name>.tsx`. It
  never edits `index.ts`, another family file, or `tokens.ts` (except package A).
- Each agent returns the list of exports it added; the judge merges `index.ts`.

## 4. Recipes

A recipe is an assembled page in `packages/ui/src/recipes/<Name>.tsx`. It
imports from `"../index"` and composes. It may contain layout `<div>`s with
spacing classes and nothing else styled. It holds no business logic — sample
data comes in as props with a default.

## 5. Charts

Recharts is imported in `components/charts.tsx` only. Series colours come
from `series` in token order and are never hand-picked. No dual-axis chart.
No donut or pie — composition is a stacked horizontal bar. New sequential or
diverging ramps are run through the palette validator before commit.

## 6. Data

Every domain record has `id`, `createdAt`, `updatedAt`, `createdBy`. Cross-
cutting models (`Comment`, `Activity`, `Override`, `Attachment`,
`StatusHistory`, `SavedView`, `SourceAttribution`) are polymorphic on
`(entityType, entityId)` and use real `Json` columns. `Activity` is
append-only and written only through `lib/audit.ts`.

## 7. Words

Labels are nouns. Buttons are verbs. Caveats are short full sentences. No
jargon in the interface; spell terms out.
