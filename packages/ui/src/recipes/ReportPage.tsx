"use client";

import React from "react";
import { CategoryBars, Callout, JumpList, PrintLayout, Section, TrendChart } from "../index";

const ENROLLMENT = Array.from({ length: 10 }, (_, i) => ({
  month: `M${i + 1}`,
  planned: Math.round(120 + i * 9.5),
  actual: Math.round(115 + i * (i < 7 ? 10.5 : 6)),
}));

const SITES = [
  { name: "Northgate General", value: 62 },
  { name: "Riverside Institute", value: 48 },
  { name: "Harbour Clinic", value: 35 },
  { name: "Lakeside Partners", value: 27 },
];

const RISK = [
  { name: "Site activation", value: 4 },
  { name: "Screen failure", value: 9 },
  { name: "Consent withdrawal", value: 3 },
];

const SECTIONS = [
  { id: "enrollment", label: "Enrollment" },
  { id: "sites", label: "Site performance" },
  { id: "risk", label: "Risk" },
];

/**
 * A printable report: an executive summary, then a few sections each with a
 * chart and a Callout, and a JumpList to move between them on screen.
 *
 * Start here for something that leaves the app — a monthly update sent up the
 * chain, a PDF for a steering committee. For a page people work inside all
 * day, use DashboardPage and AppShell instead; this one is built to be read
 * once and printed.
 */
export function ReportPage({
  title = "Enrollment report — September 2026",
  stamp = "As of Sep 17, 2026, 9:00 AM",
}: {
  title?: string;
  stamp?: string;
}) {
  return (
    <PrintLayout title={title} stamp={stamp}>
      <Callout tone="brand" label="Executive summary">
        Enrollment is 8% ahead of plan this month, carried by four Tier 1 sites. One region remains
        at risk on site activation and needs a decision before the next review.
      </Callout>

      <JumpList items={SECTIONS} />

      <Section id="enrollment" title="Enrollment">
        <TrendChart
          data={ENROLLMENT}
          xKey="month"
          series={[
            { key: "planned", label: "Planned", dashed: true },
            { key: "actual", label: "Actual", area: true },
          ]}
          height={220}
        />
        <Callout tone="ok" className="mt-3">
          Actual enrollment has stayed above plan for seven straight months, closing the gap opened
          in the first quarter.
        </Callout>
      </Section>

      <Section id="sites" title="Site performance">
        <CategoryBars data={SITES} xKey="name" series={[{ key: "value", label: "Patients" }]} horizontal height={200} />
        <Callout tone="brand" className="mt-3">
          Tier 1 sites are enrolling 35% above the study average. Tier 2 sites are not worth a
          separate push — the gain there is roughly 5%.
        </Callout>
      </Section>

      <Section id="risk" title="Risk">
        <CategoryBars data={RISK} xKey="name" series={[{ key: "value", label: "Open items" }]} horizontal height={180} />
        <Callout tone="warn" className="mt-3">
          Site activation is the largest open risk. Two sites need a decision within two weeks to
          hold the committed date.
        </Callout>
      </Section>
    </PrintLayout>
  );
}
