# Before you say it is done

Open the app in a browser first. Then answer every line.

**Look**
- [ ] No hex colour anywhere under `apps/` — `grep -rn "#[0-9a-fA-F]\{6\}" apps/<app>/` is empty.
- [ ] No component defined in the app that duplicates one in `@factory/ui`.
- [ ] Exactly one primary button per view.
- [ ] Every number has a unit, suffix or caveat.
- [ ] Numbers in a column use `cx-num` and line up.

**Behave**
- [ ] The decision the app exists for is the biggest thing on the screen.
- [ ] Changing an input updates the consequence with no Apply step.
- [ ] Destructive actions take two clicks (`ConfirmButton`).
- [ ] Every list has an `EmptyState` with an action.
- [ ] The app runs with the database empty and does not throw.

**Charts**
- [ ] Charts come from `TrendChart` / `CategoryBars` / `Sparkline` only.
- [ ] One y-axis. No dual-axis chart anywhere.
- [ ] Two or more series carry a legend.
- [ ] Series colours are the token order, untouched.

**Ship**
- [ ] `npx tsc --noEmit -p apps/<app>/tsconfig.json` is clean.
- [ ] The app was opened in a browser and screenshotted.
- [ ] Sample data is seeded and labelled as sample data.
- [ ] `README.md` in the app says what decision it makes, and how to run it.
