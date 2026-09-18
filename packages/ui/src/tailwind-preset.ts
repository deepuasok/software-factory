import type { Config } from "tailwindcss";
import { color, rank, series } from "./tokens";

/**
 * Drop this into an app's tailwind.config.ts as a preset and the whole
 * token set is available as utility classes: bg-primary, text-muted,
 * border-edge, rounded-lg, h-control, and so on.
 */
const preset: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        primary: color.primary,
        secondary: color.secondary,
        "ghost-white": color.ghostWhite,
        "surface-grey": color.surfaceGrey,
        selected: color.selected,
        "border-idle": color.borderIdle,
        "border-focus": color.borderFocus,
        edge: color.edge,
        muted: color.muted,
        error: color.error,
        warn: color.warn,
        ok: color.ok,
        info: color.info,
        "rank-1": rank[1],
        "rank-2": rank[2],
        "rank-3": rank[3],
        "rank-4": rank[4],
        "series-1": series[0],
        "series-2": series[1],
        "series-3": series[2],
        "series-4": series[3],
        "series-5": series[4],
        "series-6": series[5],
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"],
      },
      borderRadius: { sm: "4px", md: "6px", lg: "8px" },
      height: { controlsm: "30px", control: "32px", field: "44px", topbar: "48px" },
      boxShadow: {
        card: "0 1px 2px rgba(7, 29, 73, 0.05)",
        raised: "0 4px 12px rgba(7, 29, 73, 0.10)",
        overlay: "0 16px 40px rgba(7, 29, 73, 0.22)",
      },
      fontSize: {
        label: ["10px", { lineHeight: "1.4", letterSpacing: "0.12em", fontWeight: "600" }],
        small: ["12px", { lineHeight: "1.45" }],
        body: ["13px", { lineHeight: "1.5" }],
        heading: ["14px", { lineHeight: "1.35", fontWeight: "600" }],
        title: ["18px", { lineHeight: "1.25", fontWeight: "600" }],
        display: ["28px", { lineHeight: "1.15", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default preset;
