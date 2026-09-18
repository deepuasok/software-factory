---
name: software-factory
description: Build an internal web application the house way — one stack, one parts bin, one look. Use whenever someone asks for an app, tool, tracker, dashboard, planner or internal site to be built, prototyped or extended, or says "run it through the software factory", "build this in the factory", "/software-factory". Also use when reviewing whether an existing app matches the house style.
---

# The Software Factory

You are the shop floor. Someone brings a description of an app; you send back a
working app that looks like every other app the shop has built.

The rule that makes this work: **you never design. You assemble.** Every colour,
control and layout already exists in `@factory/ui`. Your job is to choose the
right parts and wire them to real data.

## Before you write anything

Read these two files. They are short and they are the contract:

1. `~/Projects/software-factory/docs/PRINCIPLES.md` — how an app here behaves.
2. `~/Projects/software-factory/docs/PARTS.md` — every part and when to use it.

Then open the live gallery if a visual check would help:
`cd ~/Projects/software-factory && npm run gallery` → http://localhost:8821

## Build sequence

**1. Pin down the decision.** An app in this shop exists so somebody can make a
decision. Write that sentence first — "this app decides which sites go in the
plan", "this app decides which vendor contracts to renew first". If you cannot
write it, ask one question and then write it. Everything else follows from it.

**2. Scaffold.**

```bash
cd ~/Projects/software-factory
cp -R apps/_template apps/<app-slug>
# in apps/<app-slug>/package.json: set the name to @factory/<app-slug>
# and pick a free port (the shop uses 8820+; see docs/PORTS.md)
npm install
```

**3. Model the data before the screens.** Put the types and the maths in
`lib/`, not in components. If the app needs storage, use Prisma + SQLite
(`prisma/dev.db`) — the same setup as `site-workbench`, which you can copy from.
Seed it with believable sample data so the app is never looked at empty.

**4. Assemble the screens.** Import everything from `@factory/ui`. The standard
shapes:

- *List page* — `AppShell` › `PageHeader` › `Toolbar` › `Grid` of cards, or a
  `Card` holding a `DataTable`. `EmptyState` when there is nothing yet.
- *Detail page* — `AppShell` › `PageHeader` › `StatRow` of four tiles › a chart
  `Card` › supporting cards.
- *Builder page* — `AppShell width="full"` › `SplitPane`, list rail on the left,
  the consequence of the current choice on the right, updating live.

**5. Verify before you claim it works.** Run the app, open it, screenshot it.
Then walk `docs/CHECKLIST.md` line by line. An app that has not been opened in
a browser is not finished.

## Hard rules

These are the things that make the apps look like siblings. Breaking one is a
bug even when it looks fine.

1. **No hex codes, ever, in an app.** Colour comes from Tailwind classes backed
   by the preset (`bg-primary`, `text-muted`, `border-edge`) or from
   `import { color } from "@factory/ui"`. A hex literal in `apps/` is a defect.
2. **No new component in an app.** If a part is missing, add it to
   `packages/ui/src/components/`, document when to use it in `docs/PARTS.md`,
   and show it in the gallery. Then use it. Every app gets it for free.
3. **No restyling a part.** Passing `className` to nudge spacing is fine.
   Passing one to change a part's colour, height or border is not.
4. **One primary button per view.** If two actions both look primary, one of
   them is not.
5. **Charts only through the chart wrappers.** Never import Recharts in an app.
   Never build a dual-axis chart. Series colours come from the validated order
   in `tokens.ts` and are never hand-picked.
6. **Every number gets a unit or a caveat.** A tile that says `74` and nothing
   else is unfinished; `74w behind the committed date` is done.
7. **Destructive actions take two clicks** — use `ConfirmButton`.
8. **The app renders with no data.** Every list has an `EmptyState` that says
   what the thing is and offers the one button that creates the first one.

## Writing inside the app

The words in the interface follow plain-language rules: short
sentences, active voice, lead with the point, no jargon, spell terms out. A
label is a noun ("Approval date"), a button is a verb ("Save plan"), a caveat
is a full short sentence.

Comments in the code explain *why* a choice was made, not what the line does.

## When someone brings an existing app

Run the same checklist against it and report what drifted, worst first. Fix by
replacing bespoke markup with parts — never by adding CSS.
