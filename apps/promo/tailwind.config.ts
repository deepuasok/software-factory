import type { Config } from "tailwindcss";
import preset from "@factory/ui/tailwind-preset";

const config: Config = {
  presets: [preset as any],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};
export default config;
