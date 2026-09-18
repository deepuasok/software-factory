/**
 * The paint chips.
 *
 * Every colour, size and weight the shop is allowed to use. One restrained
 * navy-and-grey set, chosen so that dense working tools stay readable and so
 * that two apps built months apart still look related.
 *
 * Rule for app authors: never hard-code a hex, a px radius or a font size in
 * an app. If a value you need is missing, add it HERE and say why.
 */

export const color = {
  /** Brand navy. Primary actions, active states, the top bar. */
  primary: "#1B3975",
  /** Deepest navy. Body text, hover state of primary. */
  secondary: "#071D49",

  /** Page background. Never pure white — white is for surfaces. */
  ghostWhite: "#F9F9F9",
  /** A quieter panel inside a white surface. */
  surfaceGrey: "#F3F4F6",
  /** The wash behind a selected row or an active chip. */
  selected: "#EAEEF5",
  white: "#FFFFFF",

  /** Resting border on an input or control. */
  borderIdle: "#AEB8C6",
  /** Focus ring / active border. The only bright blue in the system. */
  borderFocus: "#1187C9",
  /** Hairline between rows, cards and sections. */
  edge: "#E5E7EB",

  /** Secondary text, labels, units. */
  muted: "#56657E",

  /** Status. Use for meaning, never for decoration. */
  error: "#C93623",
  warn: "#B46A00",
  ok: "#1B7F4B",
  info: "#1187C9",
} as const;

/**
 * Categorical series colours, in fixed order.
 *
 * Take them in sequence and never cycle: a series keeps its colour when a
 * filter removes its neighbours. A seventh series is not a new hue — group
 * the tail into "Other" or use small multiples.
 *
 * Validated with the dataviz palette checker (light surface): lightness band,
 * chroma floor, colour-blind separation, normal-vision separation and contrast
 * all pass. Do not edit a value without re-running that check. Brand navy
 * #1B3975 is deliberately NOT in here — it is too dark to sit beside the
 * others as data, so charts use the lighter #2F5AA8 step instead.
 */
export const series = [
  "#2F5AA8",
  "#0E9488",
  "#7C3AED",
  "#B83280",
  "#5B8DEF",
  "#8C6D1F",
] as const;

/** Magnitude on one hue, light to dark. Never a rainbow. */
export const sequential = ["#E4EAF4", "#B9C7E0", "#8AA1CA", "#5B7BB3", "#3A5C98", "#1B3975"] as const;

/** Polarity: two poles around a neutral middle. Ahead of plan vs behind it. */
export const diverging = { negative: "#C93623", mid: "#E5E7EB", positive: "#1B7F4B" } as const;

/** Ranked bands (site tiers, risk levels, priority). Darkest = best/highest. */
export const rank = {
  1: "#1B3975",
  2: "#2563EB",
  3: "#56657E",
  4: "#AEB8C6",
} as const;

export const font = {
  sans: "'Roboto', system-ui, -apple-system, sans-serif",
  /** Only for figures that must line up in a column. */
  mono: "'Roboto Mono', ui-monospace, monospace",
} as const;

/** Type scale. Small and dense on purpose — these are working tools. */
export const text = {
  display: { size: "28px", weight: 700, leading: "1.15" },
  title: { size: "18px", weight: 600, leading: "1.25" },
  heading: { size: "14px", weight: 600, leading: "1.35" },
  body: { size: "13px", weight: 400, leading: "1.5" },
  small: { size: "12px", weight: 400, leading: "1.45" },
  label: { size: "10px", weight: 600, leading: "1.4", tracking: "0.12em" },
} as const;

/** 4px base. Only these steps exist. */
export const space = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const radius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  pill: "999px",
} as const;

/** Control heights. A page must not invent a third button height. */
export const size = {
  controlSm: "30px",
  control: "32px",
  field: "44px",
  topBar: "48px",
} as const;

export const elevation = {
  /** Cards rest on the page. They do not float. */
  card: "0 1px 2px rgba(7, 29, 73, 0.05)",
  raised: "0 4px 12px rgba(7, 29, 73, 0.10)",
  overlay: "0 16px 40px rgba(7, 29, 73, 0.22)",
} as const;

export const motion = {
  /** One duration. Interfaces here do not perform. */
  fast: "120ms ease",
} as const;

export const tokens = { color, series, sequential, diverging, rank, font, text, space, radius, size, elevation, motion };
export default tokens;
