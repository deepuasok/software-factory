"use client";

import { useState } from "react";
import {
  Banner,
  Button,
  Callout,
  Card,
  ErrorState,
  Grid,
  InlineAlert,
  JumpList,
  PrintLayout,
  ProgressBar,
  Section,
  Skeleton,
  StatRow,
  StatTile,
} from "@factory/ui";

/** A part card with the one line that says when to reach for it. */
function Part({ name, when, children }: { name: string; when: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-4">
      <h3 className="text-[13px] font-bold text-secondary">{name}</h3>
      <p className="text-[11.5px] text-muted mt-1 mb-3.5 leading-relaxed">{when}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

/**
 * Page furniture and the printable report: everything that shows up around
 * the content people are actually here for, plus the parts a report is
 * assembled from.
 */
export function FurnitureSection() {
  const [bannerOn, setBannerOn] = useState(true);
  const [errorTries, setErrorTries] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <Grid cols={2}>
        <Part name="Banner" when="Use it once, above the page header, for something true right now.">
          {bannerOn ? (
            <Banner
              tone="warn"
              title="Sync fell behind"
              body="The last successful sync was 3 hours ago. Figures below may be stale."
              action={<Button variant="secondary" size="sm">Sync now</Button>}
              onDismiss={() => setBannerOn(false)}
            />
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setBannerOn(true)}>
              Show the banner again
            </Button>
          )}
        </Part>

        <Part name="InlineAlert" when="Use it inside a card, next to the thing it is about.">
          <InlineAlert tone="info" detail="Recalculated overnight from the latest supply export.">
            Figures on this page were recalculated overnight.
          </InlineAlert>
          <InlineAlert tone="error">Three fields failed validation on save.</InlineAlert>
        </Part>

        <Part name="ErrorState" when="Use it when a panel could not load and can be retried.">
          {errorTries < 2 ? (
            <ErrorState
              title="Could not load enrollment"
              body="The forecast service did not respond. This is usually temporary."
              onRetry={() => setErrorTries((n) => n + 1)}
            />
          ) : (
            <div className="cx-card px-4 py-3 text-[12px] text-ok">Loaded on retry #{errorTries}.</div>
          )}
        </Part>

        <Part name="Skeleton" when="Use it in place of a part that has not loaded yet, in its shape.">
          <Skeleton variant="text" lines={3} />
          <Skeleton variant="tile" />
        </Part>
      </Grid>

      <Part name="Skeleton — table" when="Use the table variant in place of a DataTable's rows.">
        <Skeleton variant="table" lines={4} />
      </Part>

      <Grid cols={2}>
        <Part name="StatTile — delta and sparkline" when="Use delta for the change since last time, sparkline for the trend behind it.">
          <StatTile
            label="Patients enrolled"
            value="1,772"
            tone="ok"
            delta={{ value: 8, format: (v) => `${v > 0 ? "+" : ""}${v}% vs last month` }}
            sparkline={[102, 118, 131, 127, 145, 158, 172]}
          />
        </Part>

        <Part name="ProgressBar — thresholds" when="Use thresholds to let percent-of-target pick the tone, instead of setting it yourself.">
          <div>
            <div className="text-[11px] text-muted mb-1">92% of target</div>
            <ProgressBar value={92} target={100} thresholds={{ warnBelow: 80, errorBelow: 60 }} />
          </div>
          <div>
            <div className="text-[11px] text-muted mb-1">70% of target</div>
            <ProgressBar value={70} target={100} thresholds={{ warnBelow: 80, errorBelow: 60 }} />
          </div>
          <div>
            <div className="text-[11px] text-muted mb-1">45% of target</div>
            <ProgressBar value={45} target={100} thresholds={{ warnBelow: 80, errorBelow: 60 }} />
          </div>
        </Part>
      </Grid>

      <Part name="StatRow — wideFirst" when="Use it when the first tile is the headline figure the rest support.">
        <StatRow wideFirst>
          <StatTile label="Patients enrolled" value="1,772" tone="ok" delta={{ value: 8 }} />
          <StatTile label="Sites active" value="84" />
          <StatTile label="Tier 1 sites" value="31" tone="brand" />
        </StatRow>
      </Part>

      <Grid cols={2}>
        <Part name="Callout" when="Use it once per section of a report, right after the chart it is about.">
          <Callout tone="brand">
            Tier 1 sites are enrolling 35% above the study average. Tier 2 is not worth a separate push.
          </Callout>
        </Part>

        <Part name="Section + JumpList" when="Use Section to anchor a heading, JumpList to point at every one of them.">
          <JumpList items={[{ id: "gallery-a", label: "Enrollment" }, { id: "gallery-b", label: "Risk" }]} />
          <Section id="gallery-a" title="Enrollment">
            <p className="text-[12px] text-muted">Content for the section goes here.</p>
          </Section>
        </Part>
      </Grid>

      <Card title="PrintLayout" right="A4-ish width, Print button, no app chrome on the printed page.">
        <div className="border border-edge rounded-lg overflow-hidden bg-ghost-white p-4">
          <PrintLayout title="Enrollment report — September 2026" stamp="As of Sep 17, 2026, 9:00 AM">
            <Callout tone="ok">Enrollment is 8% ahead of plan this month.</Callout>
            <Section id="gallery-print" title="Enrollment">
              <p className="text-[12px] text-muted">A report section, same parts as the page.</p>
            </Section>
          </PrintLayout>
        </div>
      </Card>
    </div>
  );
}
