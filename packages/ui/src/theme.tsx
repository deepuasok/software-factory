"use client";

import React, { createContext, useContext, useMemo } from "react";
import { NAVY, THEMES, resolveColors, resolveRank, themeCssVars, type Theme } from "./themes";

type ThemeValue = {
  theme: Theme;
  color: ReturnType<typeof resolveColors>;
  rank: ReturnType<typeof resolveRank>;
};

const ThemeContext = createContext<ThemeValue>({
  theme: NAVY,
  color: resolveColors(NAVY),
  rank: resolveRank(NAVY),
});

/**
 * Wrap an app (or a page, or one card in the gallery) to paint everything
 * inside it in a theme. Tailwind classes pick the theme up through CSS
 * variables; charts and maps pick it up through `useTheme()`.
 *
 * Without a provider everything is navy. That is the default, and nobody has
 * to opt in to it.
 */
export function ThemeProvider({
  theme = "navy",
  children,
  className,
}: {
  /** A theme name from `THEMES`, or a Theme object of your own. */
  theme?: string | Theme;
  children: React.ReactNode;
  className?: string;
}) {
  const t = typeof theme === "string" ? THEMES[theme] ?? NAVY : theme;
  const value = useMemo(() => ({ theme: t, color: resolveColors(t), rank: resolveRank(t) }), [t]);
  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={t.name} className={className} style={themeCssVars(t) as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** The current theme's colours, for the places a class cannot reach. */
export function useTheme() {
  return useContext(ThemeContext);
}
