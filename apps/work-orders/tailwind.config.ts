import type { Config } from "tailwindcss";
import preset from "@factory/ui/tailwind-preset";

/**
 * Every app uses the shop preset and adds nothing to the theme. If a colour or
 * size is missing, it gets added to the preset in packages/ui, not here.
 */
const config: Config = {
  presets: [preset as any],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
