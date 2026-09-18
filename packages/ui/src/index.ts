/**
 * @factory/ui — the parts bin.
 *
 * Everything an app in the shop is allowed to build from. If a screen needs a
 * part that is not here, the part gets added HERE first, with a comment saying
 * when to use it — it is never styled inside one app.
 *
 * Order matters in one place only: `tone` comes before the component families,
 * because every family maps state through `toneClass`.
 */

/* Foundations ------------------------------------------------------------ */

export * from "./tokens";
export { default as tokens } from "./tokens";
export { default as tailwindPreset } from "./tailwind-preset";
export * from "./themes";
export * from "./theme";
export * from "./tone";

/* Parts, by family ------------------------------------------------------- */

export * from "./components/primitives";
export * from "./components/fields";
export * from "./components/layout";
export * from "./components/data";
export * from "./components/charts";
export * from "./components/map";
export * from "./components/overlay";
export * from "./components/nav";
export * from "./components/filters";
export * from "./components/forms";
export * from "./components/provenance";
export * from "./components/workflow";
export * from "./components/furniture";
export * from "./components/timeline";
export * from "./components/files";

/* Recipes — assembled pages to start a screen from ------------------------ */

export * from "./recipes/ListPage";
export * from "./recipes/FormPage";
export * from "./recipes/DetailPage";
export * from "./recipes/ReconcilePage";
export * from "./recipes/ReviewQueuePage";
export * from "./recipes/ApprovalInboxPage";
export * from "./recipes/BoardPage";
export * from "./recipes/ComparePage";
export * from "./recipes/ImportWizardPage";
export * from "./recipes/BuilderPage";
export * from "./recipes/DashboardPage";
export * from "./recipes/ReportPage";
export * from "./recipes/SchedulePage";
export * from "./recipes/MapExplorerPage";

/* Table parsing ----------------------------------------------------------
 * `components/files` already re-exports the spec types (ColumnSpec,
 * ColumnType, ParseResult, Reject, TableSpec), so the functions are named
 * explicitly here rather than `export *` — two wildcards carrying the same
 * type name is ambiguous, and the types belong with the parts that use them.
 */

export {
  norm,
  findColumn,
  buildMapping,
  applySpec,
  readTable,
  parseTable,
  parseTableText,
  toCSV,
} from "./lib/parse";

/* Map data --------------------------------------------------------------- */

export { GEO, geoLookup, project, jitter, MAP_W, MAP_H } from "./data/geo";
export { COUNTRY_CENTROIDS, countryCentroid } from "./data/country-centroids";
