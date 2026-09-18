/**
 * The one place tone becomes colour.
 *
 * Use `toneClass` wherever a part needs to show state. Do not write a local
 * `{ ok: "bg-ok", ... }` map inside a component — that is how two apps built
 * months apart end up with two different ambers. If a part needs a surface
 * this file does not have, add the surface HERE.
 *
 * The class names are written out in full on purpose: Tailwind only keeps a
 * class it can literally see in the source, so a template string would get the
 * styles stripped at build time.
 */

import { color, type Tone } from "./tokens";

/**
 * Which face of the colour a part needs.
 *
 * - `text` — the figure or label itself carries the meaning.
 * - `bg` — a solid block of the tone, with white text on it.
 * - `border` — the rule around a control or card.
 * - `fill` — a bar, dot or swatch. Background only, no text.
 * - `soft` — a light tint behind dark text. Badges, pills, chips.
 */
export type ToneSurface = "text" | "bg" | "border" | "fill" | "soft" | "ring";

const TEXT: Record<Tone, string> = {
  neutral: "text-secondary",
  brand: "text-primary",
  ok: "text-ok",
  warn: "text-warn",
  error: "text-error",
  info: "text-info",
};

const BG: Record<Tone, string> = {
  neutral: "bg-muted text-white",
  brand: "bg-primary text-white",
  ok: "bg-ok text-white",
  warn: "bg-warn text-white",
  error: "bg-error text-white",
  info: "bg-info text-white",
};

const BORDER: Record<Tone, string> = {
  neutral: "border-border-idle",
  brand: "border-primary",
  ok: "border-ok",
  warn: "border-warn",
  error: "border-error",
  info: "border-info",
};

const FILL: Record<Tone, string> = {
  neutral: "bg-border-idle",
  brand: "bg-primary",
  ok: "bg-ok",
  warn: "bg-warn",
  error: "bg-error",
  info: "bg-info",
};

const SOFT: Record<Tone, string> = {
  neutral: "bg-surface-grey text-muted",
  brand: "bg-selected text-primary",
  ok: "bg-ok/10 text-ok",
  warn: "bg-warn/10 text-warn",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

/** Focus / selection rings — Avatar tone ring, selected card. */
const RING: Record<Tone, string> = {
  neutral: "ring-border-idle",
  brand: "ring-primary",
  ok: "ring-ok",
  warn: "ring-warn",
  error: "ring-error",
  info: "ring-info",
};

const SURFACES: Record<ToneSurface, Record<Tone, string>> = {
  text: TEXT,
  bg: BG,
  border: BORDER,
  fill: FILL,
  soft: SOFT,
  ring: RING,
};

/**
 * Turn a tone into Tailwind classes. The only tone-to-colour mapping allowed.
 *
 * Reach for it in any part that shows state. Do not reach for it to decorate
 * something — a tone on a thing that carries no judgement is a defect.
 */
export function toneClass(tone: Tone, surface: ToneSurface): string {
  return SURFACES[surface][tone];
}

type Palette = { muted: string; primary: string; ok: string; warn: string; error: string; info: string };

/**
 * The raw token value for a tone, for the places a class cannot reach — an
 * SVG `fill`, a chart marker, a map dot.
 *
 * Pass `useTheme().color` from inside a component so a themed app gets its
 * own primary. Without it, navy.
 *
 * Use it only inside `packages/ui`. An app that needs a colour is asking for a
 * part that does not exist yet.
 */
export function toneHex(tone: Tone, c: Palette = color): string {
  const HEX: Record<Tone, string> = {
    neutral: c.muted,
    brand: c.primary,
    ok: c.ok,
    warn: c.warn,
    error: c.error,
    info: c.info,
  };
  return HEX[tone];
}
