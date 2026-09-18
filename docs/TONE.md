# Tone

Six words. They are the whole state vocabulary of the shop, and they mean the
same thing in every app, on every part, forever.

```ts
export type Tone = "neutral" | "brand" | "ok" | "warn" | "error" | "info";
```

`Tone` lives in `packages/ui/src/tokens.ts`. The only mapping from a tone to a
colour is `toneClass(tone, surface)` in `packages/ui/src/tone.ts`. A part that
maps tone to colour on its own is a defect, not a preference.

No part takes `color`, `variant: "danger"`, `severity`, `status` as a colour,
or a hex.

Two things look like exceptions and are not. `Button` takes
`variant="danger"`, because a destructive button is a kind of button rather
than a state a record is in. `FindingsPanel` reads `finding.severity`, which
is a field on the data an import validator produced, not a prop anybody
passes. Neither of them maps a colour itself — both go through `toneClass`.

## What each one means

| Tone | Means | Never means |
|---|---|---|
| `neutral` | a fact with no judgement | "unimportant" |
| `brand` | selected, active, primary action | good |
| `ok` | on plan, approved, healthy | finished |
| `warn` | watch this, at risk, pending | error |
| `error` | behind plan, rejected, failed, overdue | "important" |
| `info` | a note from the system | anything human-judged |

## What each one looks like on screen

One real example per tone, so the meaning is not an abstraction.

**neutral** — A contracts table. The Category column reads `Imaging`,
`Laboratory`, `Consulting` in grey badges. Nobody is being told that Imaging is
good or bad; the column is there so people can filter. Grey is the answer to
"what kind is it", not "how is it doing".

**brand** — The same table with one row open. That row sits on the pale navy
selected wash, its name in navy, and the page beside it shows that contract.
The "Add a contract" button at the top right is solid navy — the one action the
page wants. Nothing else on the page is navy, because nothing else is the
choice being made.

**ok** — A study readout. The tile reads `92` under "Sites on plan", in green,
with `+11 on last month` under it. The status pill in the row below says
`On plan` in soft green. Green here means the thing is tracking, not that it is
over: the study is still running, and will be for two more years.

**warn** — A renewals list. One row has an amber `At risk` pill and the caveat
line "Four sites have not activated. The date holds if two of them open by
March." Amber is a request to look, not a failure. The row is still on the
normal white background — it has not earned red, and dressing it in red would
spend the colour people need for the row below.

**error** — The next row down: a red `Behind plan` pill, and the largest figure
on the page reading `74 weeks behind the committed date` in red. Red appears
twice on this screen and nowhere else. That is the point of red. It is not
"important" — it is "this has already gone wrong".

**info** — Under a recalculated figure, a small blue note: `Recalculated
overnight`. A blue dot sits beside it. The system is telling people where the
number came from. Nobody has judged the number; when somebody does, the note
becomes `ok`, `warn` or `error` and the blue goes away.

## The five surfaces

`toneClass(tone, surface)` gives you one of five faces of the colour.

| Surface | What it is | Used by |
|---|---|---|
| `text` | the figure or label itself carries the meaning | `StatTile`, `DeltaValue` |
| `bg` | a solid block of the tone, white text on it | `Chip` when it is on |
| `border` | the rule around a control or card | `ValidationSummary` |
| `fill` | a bar, dot or swatch — background only, no text | `ProgressBar`, `BarMeter`, `RagStatus`, `ListRow` |
| `soft` | a light tint behind dark text | `Badge`, `StatusPill` |

For an SVG `fill` — a chart marker, a map dot — use `toneHex(tone)`. It is for
code inside `packages/ui` only. An app that needs a raw colour is asking for a
part that does not exist yet.
