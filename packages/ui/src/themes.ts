import { color as base } from "./tokens";

/**
 * Themes.
 *
 * A theme changes only the brand-dependent chips: the primary, its dark ink,
 * the selection tint, the focus ring and the top two rank bands. Neutrals,
 * status colours and the chart series stay the same in every theme — that is
 * what keeps "behind plan" the same red for every company.
 *
 * The default is `navy`. Nobody is asked to pick unless they want to.
 */
export type ThemeColors = {
  primary: string;
  secondary: string;
  selected: string;
  borderFocus: string;
  info: string;
  rank1: string;
  rank2: string;
};

export type Theme = {
  name: string;
  label: string;
  /** One line a person can read in a dropdown. */
  note: string;
  colors: ThemeColors;
};

export const NAVY: Theme = {
  name: "navy",
  label: "Navy (default)",
  note: "Deep navy and slate grey. The house look.",
  colors: {
    primary: "#1B3975",
    secondary: "#071D49",
    selected: "#EAEEF5",
    borderFocus: "#1187C9",
    info: "#1187C9",
    rank1: "#1B3975",
    rank2: "#2563EB",
  },
};

export const SLATE: Theme = {
  name: "slate",
  label: "Slate",
  note: "Charcoal and steel. Quiet, for tools that sit open all day.",
  colors: {
    primary: "#334155",
    secondary: "#0F172A",
    selected: "#E9EDF3",
    borderFocus: "#2563EB",
    info: "#2563EB",
    rank1: "#334155",
    rank2: "#64748B",
  },
};

export const FOREST: Theme = {
  name: "forest",
  label: "Forest",
  note: "Deep green and moss. Warmer than navy, still serious.",
  colors: {
    primary: "#1F5F45",
    secondary: "#0B2E22",
    selected: "#E6F1EC",
    borderFocus: "#0E9488",
    info: "#0E9488",
    rank1: "#1F5F45",
    rank2: "#2F8F6B",
  },
};

export const PLUM: Theme = {
  name: "plum",
  label: "Plum",
  note: "Aubergine and violet. For a product that wants to feel a little newer.",
  colors: {
    primary: "#5B2A86",
    secondary: "#2A1240",
    selected: "#F0E9F7",
    borderFocus: "#7C3AED",
    info: "#7C3AED",
    rank1: "#5B2A86",
    rank2: "#8B5CF6",
  },
};

export const THEMES: Record<string, Theme> = { navy: NAVY, slate: SLATE, forest: FOREST, plum: PLUM };

/** The full colour set for a theme: brand chips over the shared neutrals. */
export function resolveColors(theme: Theme = NAVY) {
  return {
    ...base,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    selected: theme.colors.selected,
    borderFocus: theme.colors.borderFocus,
    info: theme.colors.info,
  };
}

export function resolveRank(theme: Theme = NAVY) {
  return { 1: theme.colors.rank1, 2: theme.colors.rank2, 3: "#56657E", 4: "#AEB8C6" } as const;
}

function triplet(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");
}

/**
 * CSS variables for a theme, as RGB triplets so Tailwind's opacity modifiers
 * (`bg-primary/10`) keep working. Set them on any ancestor; every class
 * inside picks them up.
 */
export function themeCssVars(theme: Theme = NAVY): Record<string, string> {
  const c = theme.colors;
  return {
    "--cx-primary-rgb": triplet(c.primary),
    "--cx-secondary-rgb": triplet(c.secondary),
    "--cx-selected-rgb": triplet(c.selected),
    "--cx-border-focus-rgb": triplet(c.borderFocus),
    "--cx-info-rgb": triplet(c.info),
    "--cx-rank-1-rgb": triplet(c.rank1),
    "--cx-rank-2-rgb": triplet(c.rank2),
    "--cx-primary": c.primary,
    "--cx-secondary": c.secondary,
    "--cx-selected": c.selected,
    "--cx-border-focus": c.borderFocus,
  };
}
