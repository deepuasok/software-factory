"use client";

import React, { useState } from "react";
import {
  ActivityFeed,
  Badge,
  Card,
  CommentThread,
  ExplainPanel,
  PageHeader,
  SourceBadge,
  StatRow,
  StatTile,
  Tabs,
  recordChange,
  type ActivityEntry,
  type ProvenanceComment,
} from "../index";

const SAMPLE_COMMENTS: ProvenanceComment[] = [
  { id: "c1", author: "Jordan Ellis", body: "PSM moved up after the March site swap. Flagging for the study team to confirm.", at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "c2", author: "Marcus Hale", body: "Confirmed with the site team — leave as is.", at: new Date(Date.now() - 26 * 3600000).toISOString(), resolved: true },
];

const SAMPLE_ACTIVITY: ActivityEntry[] = [
  recordChange({ verb: "changed", actor: "Jordan Ellis", field: "PSM", from: "0.42", to: "0.50", at: new Date(Date.now() - 2 * 3600000).toISOString() }),
  recordChange({ verb: "changed", actor: "Forecast model", field: "Tier", from: "Tier 2", to: "Tier 1", at: new Date(Date.now() - 20 * 3600000).toISOString() }),
  recordChange({ verb: "changed", actor: "Marcus Hale", field: "Owner", from: "Unassigned", to: "Jordan Ellis", at: new Date(Date.now() - 30 * 3600000).toISOString() }),
];

/**
 * A record's detail page: header, tabs and a body that changes underneath
 * them. `DetailHeader` itself belongs to package C (its part is `PageHeader`
 * plus `Badge`s, assembled here as a placeholder) — swap it in once it ships.
 *
 * Use this shape for any record with a discussion and a history worth
 * showing next to it: a site, a study, a forecast line. Do not use it for a
 * record with no provenance to show — a plain page with `PageHeader` and a
 * `Card` is enough there.
 */
export function DetailPage({
  title = "Northgate General — Site ST-1042",
  subtitle = "Tier 1 site. Enrolment forecast recalculated overnight from the latest activation data.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [tab, setTab] = useState<"overview" | "comments" | "activity">("overview");
  const [comments, setComments] = useState<ProvenanceComment[]>(SAMPLE_COMMENTS);

  function addComment(body: string) {
    setComments((prev) => [...prev, { id: `c${prev.length + 1}`, author: "You", body, at: new Date().toISOString() }]);
  }

  function resolveComment(id: string, resolved: boolean) {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved } : c)));
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        meta={
          <>
            <Badge tone="brand">Tier 1</Badge>
            <Badge tone="ok">On plan</Badge>
            <Badge tone="neutral">Phase 3</Badge>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "comments", label: "Comments", count: comments.filter((c) => !c.resolved).length },
          { value: "activity", label: "Activity", count: SAMPLE_ACTIVITY.length },
        ]}
      />

      {tab === "overview" && (
        <div className="flex flex-col gap-4">
          <StatRow>
            <StatTile
              label="PSM"
              value="0.50"
              tone="ok"
              note={<SourceBadge sourceSystem="Forecast model" modelVersion="2.4.1" confidence={0.86} />}
            />
            <StatTile
              label="Sites activated"
              value="84"
              note={<SourceBadge sourceSystem="Site tracker" />}
            />
            <StatTile
              label="Patients enrolled"
              value="612"
              note={<SourceBadge sourceSystem="Feasibility survey" />}
            />
            <StatTile
              label="Enrolment forecast"
              value="720"
              tone="warn"
              note={<SourceBadge sourceSystem="Forecast model" modelVersion="2.4.1" confidence={0.71} />}
            />
          </StatRow>

          <Card title="Why the model says 0.50">
            <ExplainPanel
              title="PSM contributors"
              summary="PSM rose mainly because two neighbouring sites in the same network activated ahead of schedule."
              contributions={[
                { label: "Network activation rate", value: 18, direction: "up" },
                { label: "Historical enrolment at this site", value: 9, direction: "up" },
                { label: "Time since last screen failure", value: 4, direction: "up" },
                { label: "Distance to nearest competing site", value: 6, direction: "down" },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === "comments" && (
        <Card title="Comments">
          <CommentThread comments={comments} onAdd={addComment} onResolve={resolveComment} currentUser="You" />
        </Card>
      )}

      {tab === "activity" && (
        <Card title="Activity">
          <ActivityFeed entries={SAMPLE_ACTIVITY} />
        </Card>
      )}
    </div>
  );
}
