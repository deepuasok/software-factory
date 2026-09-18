---
name: software-factory
description: Build an internal enterprise web application the house way — one stack, one parts bin, one look, no design conversation. Use whenever someone asks for an app, tool, tracker, dashboard, planner, review queue, approval flow, data-entry screen, reconciliation tool, scenario builder or readout to be built, prototyped or extended, or says "run it through the software factory", "build this in the factory", "/software-factory". Also use when reviewing whether an existing app matches the house style.
---

# The Software Factory

You are the shop floor. Someone brings a description of an app; you send back a
working app that looks and behaves like every other app the shop has built.

The rule that makes this work: **you never design. You classify, then assemble.**
Every colour, control, chart and page shape already exists in `@factory/ui`.
Your job is to pick the archetype, start from its recipe, and wire real data.

## Step 0 — classify, before anything else

Ask these four questions once, in one message, then do not ask again. If the
request already answers one, skip it and state your reading.

1. **What one decision does this app make?** One sentence. "This app decides
   which vendor contracts to renew." If nobody can say it, the app is not ready
   to build — say so.
2. **What is the record the user works on, and roughly how many?** A site, a
   request, an invoice line; ten, a few hundred, tens of thousands. This picks
   the table shape and whether pagination matters.
3. **Which is closest to what the user does?** Pick one, optionally a second:
   *watch* (status vs plan), *review* (walk a list, judge each row), *model*
   (change inputs, see the consequence), *schedule* (lay work on a timeline),
   *fix data* (import, reconcile, correct), *approve* (move requests through
   states), *track* (own actions with owners and dates), *read* (a readout).
4. **Does anyone need to explain or overturn a number the system produced?**
   A yes switches on the provenance parts everywhere: source badges, explain
   panels, overrides with reasons, an activity trail.
5. **Colours: keep the default (navy), or pick another?** Only ask this if
   `factory.config.json` at the repo root still says `"theme": "navy"` and
   the person has never been asked. The choices are the themes in
   `packages/ui/src/themes.ts` (navy, slate, forest, plum), or a brand colour:
   run `node packages/ui/scripts/make-theme.mjs --name <slug> --primary "#RRGGBB"`,
   which derives the rest and checks the primary can carry white text. Write
   the answer to `factory.config.json` so nobody is asked again; every app
   reads it from there. Never name a company in a theme file that ships.

Questions 1–4 map to an archetype in `docs/ARCHETYPES.md`; question 5 is answered once per clone. Each archetype names the
recipe to start from, the parts it needs, and the checklist addendum that
defines "done" for that shape.

| They do… | Archetype | Start from |
|---|---|---|
| watch | Monitor & alert | `DashboardPage` |
| review | Review & disposition | `ReviewQueuePage` |
| model | Scenario workbench | `BuilderPage` + `ComparePage` |
| schedule | Plan & schedule | `SchedulePage` |
| fix data | Reconcile & attribute | `ImportWizardPage` + `ReconcilePage` |
| approve | Approve & route | `FormPage` + `ApprovalInboxPage` |
| track | Track & follow up | `BoardPage` + `ListPage` |
| read | Report & readout | `ReportPage` |

Most real apps are two archetypes stitched together (Review + Approve,
Monitor + Track). Build the primary one fully first.

## Before you write anything

Read, in this order. They are short and they are the contract:

1. `~/Projects/software-factory/docs/CONTRACTS.md` — tone, prop names, file rules.
2. `~/Projects/software-factory/docs/ARCHETYPES.md` — your archetype's recipe and addendum.
3. `~/Projects/software-factory/docs/PRINCIPLES.md` — how an app here behaves.
4. `~/Projects/software-factory/docs/PARTS.md` — every part and when to use it.
5. `~/Projects/software-factory/docs/DATA.md` — the data layer you inherit.

Open the live gallery when a visual check would help:
`cd ~/Projects/software-factory && npm run gallery` → http://localhost:8821

## Build sequence

**1. Scaffold.**

```bash
cd ~/Projects/software-factory
cp -R apps/_template apps/<app-slug>
# in apps/<app-slug>/package.json: name → @factory/<app-slug>, pick a free port (docs/PORTS.md)
npm install
```

The template already carries the data layer: Prisma models for `Comment`,
`Activity`, `Override`, `Attachment`, `StatusHistory`, `SavedView`,
`SourceAttribution`, plus `lib/api.ts`, `lib/format.ts`, `lib/audit.ts`,
`lib/user.ts`. Do not re-create any of these.

**2. Model the data before the screens.** Domain types and the maths go in
`lib/`, not in components. Add your domain models to `prisma/schema.prisma`
beside the base ones. Every change to a record goes through
`recordChange()` in `lib/audit.ts` — never write `Activity` by hand. Seed
believable sample data, labelled as sample data, so the app is never looked at
empty.

**3. Start from the recipe.** Copy the archetype's recipe from
`packages/ui/src/recipes/` into `app/…/page.tsx` and replace its sample data
with yours. A recipe is a finished page; you are swapping the data, not
redesigning the page.

**4. Wire the second archetype**, if there is one, the same way.

**5. Switch on provenance** if question 4 was yes: `SourceBadge` beside every
system-produced number, `ExplainPanel` on the detail, `OverrideControl` where
a human can overrule, `ActivityFeed` on every record.

**6. Verify before you claim it works.** Run it, open it, drive the main flow
(override a value, reject with a comment, import a file with rejects — whatever
the app does), screenshot it. Then walk `docs/CHECKLIST.md` plus your
archetype's addendum line by line. An app that has not been opened in a
browser is not finished.

## Hard rules

These are what make the apps look like siblings. Breaking one is a bug even
when it looks fine.

1. **No hex codes in an app.** Colour comes from Tailwind classes backed by the
   preset or from `import { color } from "@factory/ui"`. A hex literal under
   `apps/` is a defect.
2. **Tone is the only state vocabulary.** `tone="error"` for behind plan,
   rejected, overdue, failed; `warn` for at risk or pending; `ok` for on plan or
   approved. No part takes `color`, `severity` or a custom variant. Decoration
   is never toned.
3. **No new component in an app.** A missing part gets added to
   `packages/ui/src/components/`, documented in `docs/PARTS.md`, shown in the
   gallery — then used. Every app gets it for free.
4. **No restyling a part.** `className` may nudge spacing. It may not change a
   part's colour, height or border.
5. **One primary button per view.**
6. **Charts only through the chart wrappers.** Never import Recharts in an
   app. Never a dual-axis chart. Never a donut. Series colours are the token
   order, untouched.
7. **Every number carries a unit or a caveat**, and every system-produced
   number carries a source when question 4 was yes.
8. **Destructive actions take two clicks** (`ConfirmButton`); rejections
   require a comment (`ApprovalActions`); overrides require a reason
   (`OverrideControl`).
9. **The app renders with no data.** Every list has an `EmptyState` with the
   one action that creates the first record.

## Writing inside the app

Interface copy follows plain-language rules: short sentences, active voice,
lead with the point, no jargon, spell terms out. A label is a noun ("Approval
date"), a button is a verb ("Save plan"), a caveat is a full short sentence.
Comments in code explain *why*, not what.

## When someone brings an existing app

Classify it the same way, then run `docs/CHECKLIST.md` and the archetype
addendum against it. Report what drifted, worst first. Fix by replacing
bespoke markup with parts — never by adding CSS.
