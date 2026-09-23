"use client";

import { useState } from "react";
import { Card, ImportWizard, PageHeader, Toast, type TableSpec } from "../index";

/** A believable site-list import spec, modelled on a real-world export. */
const SAMPLE_SPEC: TableSpec = {
  columns: [
    { key: "name", aliases: ["sitename", "name", "facility"], type: "string", required: true },
    { key: "country", aliases: ["country"], type: "string" },
    { key: "city", aliases: ["sitecity", "city"], type: "string" },
    { key: "tier", aliases: ["scenariospecificsitetier", "tier"], type: "number", required: true },
    { key: "psm", aliases: ["sitepredictedpsm", "predictedpsm", "psm"], type: "number" },
    { key: "recommended", aliases: ["siterecommendedbymodel", "recommended"], type: "boolean" },
  ],
};

/**
 * A whole page around `ImportWizard`: a heading, then the wizard, then a
 * toast confirming what landed.
 *
 * Start here for any "bring in a spreadsheet" screen. For a page that also
 * needs a live rail of the records being edited, see `BuilderPage`.
 */
export function ImportWizardPage({
  title = "Import site list",
  subtitle = "Sample data. Drop a CSV or Excel export and the wizard fuzzy-matches its headers to the fields below.",
  spec = SAMPLE_SPEC,
}: {
  title?: string;
  subtitle?: string;
  spec?: TableSpec;
}) {
  const [toast, setToast] = useState("");

  function handleCommit(rows: Record<string, unknown>[]) {
    setToast(`Imported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <ImportWizard spec={spec} onCommit={handleCommit} sampleName="site-list.csv" />
      </Card>
      <Toast message={toast} />
    </div>
  );
}
