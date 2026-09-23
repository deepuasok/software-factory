# Software Factory — build plan

- [x] 1. Repo skeleton + npm workspaces
- [x] 2. Tokens (paint chips) — colours, type, spacing, radius, elevation
- [x] 3. Tailwind preset + base stylesheet
- [x] 4. Component library — 44 parts across shell, controls, fields, data, charts, map, overlays, nav
- [x] 5. Kitchen-sink gallery (apps/gallery, port 8821)
- [x] 6. App template (apps/_template, port 8820)
- [x] 7. Skill `software-factory`, linked into the agent's skills folder
- [x] 8. Proof app: Contract Renewals (port 8822) — unrelated domain, parts only
- [x] 9. Verified: typecheck clean, both apps opened and screenshotted, no hex in apps

## Lessons

- Tailwind strips a component class it cannot literally see. A template string
  like `cx-btn-${variant}` renders a bare text button. Map variants to literal
  class names.
- Recharts marks can fail to paint on first render under React 18. All marks
  ship with `isAnimationActive={false}`.
- The package owns the whole CSS pipeline (Tailwind directives included) so an
  app's globals.css is a single import with nowhere to sneak an override in.
- Axis ticks need the same unit formatter as the tooltip, or a chart shows
  `16000` where the tile says `$15.6M`.
