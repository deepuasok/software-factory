/**
 * @factory/ui — the parts bin.
 *
 * Everything an app in the shop is allowed to build from. If a screen needs a
 * part that is not here, the part gets added HERE first, with a comment saying
 * when to use it — it is never styled inside one app.
 */

export * from "./tokens";
export { default as tokens } from "./tokens";
export { default as tailwindPreset } from "./tailwind-preset";

export * from "./components/primitives";
export * from "./components/fields";
export * from "./components/layout";
export * from "./components/data";
export * from "./components/charts";
export * from "./components/map";
export * from "./components/overlay";
export * from "./components/nav";

export { GEO, geoLookup, project, jitter, MAP_W, MAP_H } from "./data/geo";
