# Making it your skin

## The short way: pick a theme

Four ship with the factory — **navy (default)**, slate, forest and plum. The
default needs no action. To use another, set it once in `factory.config.json`
at the repo root:

```json
{ "theme": "forest", "brand": "ACME" }
```

Every app reads that file through its `layout.tsx`, so one line repaints all
of them. The gallery has a dropdown in its top bar to preview any theme
against every part before you commit.

To make a theme from your own brand colour:

```bash
node packages/ui/scripts/make-theme.mjs --name yourco --primary "#0000C9" --label "YourCo blue"
```

It derives the dark ink, the selection tint, the focus ring and the rank
bands, refuses a primary too light to carry white text, and registers the
theme so the dropdown and the config both know it.

A theme changes only the brand chips. Neutrals, the status colours (red, amber,
green) and the chart series are the same in every theme — that is deliberate,
so "behind plan" is the same red for every company.

## The long way: change the tokens

The whole look lives in two files. Change them and every app built here
changes with them — no app touches colour on its own.

## 1. The tokens

`packages/ui/src/tokens.ts` holds every colour, size and weight the shop is
allowed to use. Swap the values, keep the names.

```ts
export const color = {
  primary:   "#1B3975",  // your brand, used for primary actions and the top bar
  secondary: "#071D49",  // your darkest ink, for body text and hover
  ghostWhite:"#F9F9F9",  // the page behind the cards — never pure white
  ...
};
```

Rules that keep it coherent:

- **`primary` should be dark enough to carry white text.** The top bar and the
  primary button both fill with it.
- **Keep the page background off-white and cards white.** Flip that and cards
  stop reading as surfaces.
- **Status colours mean status.** Do not recruit your warn amber as a chart
  colour; the chart series list is separate for exactly that reason.

## 2. The series palette

`series` in the same file is the categorical chart order. It is validated, not
chosen by eye. Six colours, checked for lightness banding, chroma floor,
contrast against the surface, and separation under deuteranopia, protanopia and
tritanopia.

If you change one, re-run the check before you commit:

```bash
node <path-to>/dataviz/scripts/validate_palette.js \
  "#2F5AA8,#0E9488,#7C3AED,#B83280,#5B8DEF,#8C6D1F" --mode light
```

Any FAIL means two of your series look the same to somebody. Re-step the
offending colour rather than arguing with the result.

Two things that catch people out:

- **Your brand navy may be too dark to sit in the series list.** Ours is — the
  charts use a lighter step of the same hue instead, and the brand navy stays
  for chrome and actions.
- **Nine series is not a palette problem.** Fold the tail into "Other", or use
  small multiples.

## 3. Type and shape

Also in `tokens.ts`:

- `font.sans` — one family, loaded in `packages/ui/src/styles.css`.
- `text` — the six sizes that exist. Adding a seventh is how drift starts.
- `radius`, `size`, `elevation` — corner rounding, control heights, shadows.

`size.control` (32px) and `size.field` (44px) are the two heights on the whole
system. If a new control does not fit one of them, it is the wrong shape.

## 4. Your wordmark

`AppShell` and `TopBar` take an optional `brand`:

```tsx
<AppShell brand="ACME" product="Contract Renewals" />
```

Leave it out and only the product name shows.

## 5. Check your work

```bash
npm run gallery     # http://localhost:8821
```

The gallery renders every part against your tokens. If something looks wrong
there, it is wrong everywhere — which is the point.
