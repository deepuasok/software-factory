"use client";

import { useState } from "react";
import {
  AutosaveChip,
  Card,
  ExportButton,
  FileDrop,
  FindingsPanel,
  Grid,
  ImportWizard,
  type AutosaveState,
  type Finding,
  type TableSpec,
} from "@factory/ui";

/** A believable site-list import spec, used live below. */
const SPEC: TableSpec = {
  columns: [
    { key: "name", aliases: ["sitename", "name", "facility"], type: "string", required: true },
    { key: "country", aliases: ["country"], type: "string" },
    { key: "tier", aliases: ["scenariospecificsitetier", "tier"], type: "number", required: true },
    { key: "psm", aliases: ["sitepredictedpsm", "predictedpsm", "psm"], type: "number" },
  ],
};

/** A small CSV, mangled the way real exports are, so the wizard has something honest to fuzzy-match. */
const SAMPLE_CSV = `Site Name,Country,Scenario Spesific Site Tier,Predicted PSM
Northgate General,United States,1,0.62
Riverside Institute,Spain,2,0.41
Harbour Clinic,Japan,3,0.28
Lakeside Partners,Canada,bad,0.55
`;

const SAMPLE_FINDINGS: Finding[] = [
  { severity: "error", message: "tier: \"bad\" is not a number", rowIndex: 3 },
  { severity: "warn", message: "psm is empty — the recipe's default will be used", rowIndex: 2 },
  { severity: "info", message: "3 of 4 rows were accepted" },
];

const EXPORT_ROWS = [
  { name: "Northgate General", tier: 1, psm: 0.62 },
  { name: "Riverside Institute", tier: 2, psm: 0.41 },
];

function Part({ name, when, children }: { name: string; when: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-4">
      <h3 className="text-[13px] font-bold text-secondary">{name}</h3>
      <p className="text-[11.5px] text-muted mt-1 mb-3.5 leading-relaxed">{when}</p>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

function csvFile(name: string, text: string): File {
  return new File([text], name, { type: "text/csv" });
}

/**
 * Everything package E ships: dropping and importing a file, reading findings
 * back, exporting rows, and the four states a save can be in.
 */
export function FilesSection() {
  const [dropped, setDropped] = useState<{ name: string; size: number } | null>(null);
  const [dropError, setDropError] = useState<string | undefined>(undefined);
  const [sampleFile] = useState(() => csvFile("sample-sites.csv", SAMPLE_CSV));

  return (
    <div className="flex flex-col gap-5">
      <Grid cols={2}>
        <Part name="FileDrop" when="Use it as the first step of any file import, or wherever one file is picked at a time.">
          <div className="w-full flex flex-col gap-3">
            <FileDrop
              accept=".csv,.xlsx"
              file={dropped}
              error={dropError}
              hint="CSV or Excel. Try dropping anything to see the filename and size land."
              onFile={(f) => {
                setDropped({ name: f.name, size: f.size });
                setDropError(f.name.endsWith(".pdf") ? "PDFs aren't a site list" : undefined);
              }}
            />
          </div>
        </Part>
        <Part name="ExportButton" when="Use it wherever rows + columns need to leave the app as a spreadsheet.">
          <ExportButton
            rows={EXPORT_ROWS}
            columns={[
              { key: "name", header: "Site" },
              { key: "tier", header: "Tier" },
              { key: "psm", header: "PSM" },
            ]}
            filename="sites.csv"
          />
        </Part>
      </Grid>

      <Part name="AutosaveChip" when="Use it beside Save on any screen with figures people nudge in place.">
        {(["saved", "saving", "unsaved", "error"] as AutosaveState[]).map((s) => (
          <AutosaveChip key={s} state={s} savedAt={new Date(Date.now() - 2 * 60 * 1000)} />
        ))}
      </Part>

      <Card
        title="FindingsPanel"
        right="Use it to summarise a validation pass, grouped by severity with counts and a jump link."
      >
        <FindingsPanel findings={SAMPLE_FINDINGS} />
      </Card>

      <Card
        title="ImportWizard, live"
        right="Loaded straight into Preview on a bundled sample CSV — one bad tier value on purpose, so Validate has something to flag."
      >
        <ImportWizard
          spec={SPEC}
          onCommit={() => undefined}
          sampleName="sample-sites.csv"
          initialFile={sampleFile}
        />
      </Card>
    </div>
  );
}
