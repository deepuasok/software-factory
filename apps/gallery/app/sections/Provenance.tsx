"use client";

import { useState } from "react";
import {
  ActivityFeed,
  AsOf,
  AssigneePicker,
  Avatar,
  Card,
  CommentThread,
  ExplainPanel,
  Grid,
  OverrideControl,
  SourceBadge,
  StatTile,
  recordChange,
  type ActivityEntry,
  type ProvenanceComment,
  type ProvenanceUser,
} from "@factory/ui";

const USERS: ProvenanceUser[] = [
  { id: "moyo", name: "Moyo Shobowale", hint: "Senior Associate, CATALYST" },
  { id: "derek", name: "Derek Wang", hint: "Director, CPI" },
  { id: "manu", name: "Manorathan Murugesan", hint: "Staff DS" },
];

const SAMPLE_COMMENTS: ProvenanceComment[] = [
  { id: "c1", author: "Moyo Shobowale", body: "Network activation pushed this up two points this week.", at: new Date(Date.now() - 5 * 3600000).toISOString() },
];

/** A part with the one line that says when to reach for it. */
function Part({ name, when, children }: { name: string; when: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-4">
      <h3 className="text-[13px] font-bold text-secondary">{name}</h3>
      <p className="text-[11.5px] text-muted mt-1 mb-3.5 leading-relaxed">{when}</p>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

/**
 * Provenance and collaboration, side by side with a single number: first
 * unexplained, then with the badge, the panel, the override control and the
 * activity entry it produces.
 *
 * Use this section to see what "actualized proof" looks like as UI — a number
 * nobody can argue with because its source, its reasoning and its history are
 * all one click away.
 */
export function ProvenanceSection() {
  const [assignee, setAssignee] = useState<string | null>("moyo");
  const [comments, setComments] = useState<ProvenanceComment[]>(SAMPLE_COMMENTS);
  const [activity, setActivity] = useState<ActivityEntry[]>([
    recordChange({ verb: "changed", actor: "Moyo Shobowale", field: "PSM", from: "0.42", to: "0.50", at: new Date(Date.now() - 3 * 3600000).toISOString() }),
  ]);

  function handleOverride(o: { field: string; modelValue: string; humanValue: string; reasonCode: string; reasonText: string }) {
    setActivity((prev) => [
      recordChange({ verb: "overrode", actor: "You", field: o.field, from: o.modelValue, to: o.humanValue, at: new Date().toISOString() }),
      ...prev,
    ]);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="The same number, unexplained then explained"
        right="Provenance turns a figure nobody can argue with into one nobody has to."
      >
        <Grid cols={2}>
          <div className="flex flex-col gap-2">
            <div className="cx-label">Before — no provenance</div>
            <StatTile label="PSM" value="0.50" tone="ok" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="cx-label">After — sourced, explained, overridable</div>
            <StatTile
              label="PSM"
              value="0.50"
              tone="ok"
              note={
                <div className="flex items-center gap-1.5 flex-wrap">
                  <SourceBadge sourceSystem="CATALYST model" modelVersion="2.4.1" confidence={0.86} />
                  <AsOf at={new Date(Date.now() - 3 * 3600000).toISOString()} />
                </div>
              }
            />
          </div>
        </Grid>
      </Card>

      <Grid cols={2}>
        <Part name="Avatar" when="Use it anywhere a name needs a face and there is no photo.">
          <Avatar name="Moyo Shobowale" size="sm" />
          <Avatar name="Derek Wang" size="md" />
          <Avatar name="Manorathan Murugesan" size="md" tone="ok" />
        </Part>

        <Part name="AssigneePicker" when="Use it wherever a record needs an owner or a reviewer.">
          <div className="w-56">
            <AssigneePicker value={assignee} onChange={setAssignee} users={USERS} />
          </div>
        </Part>

        <Part name="AsOf" when="Use it beside a computed figure — a model score, a nightly rollup, a sync.">
          <AsOf at={new Date(Date.now() - 3 * 3600000).toISOString()} />
          <AsOf at={new Date(Date.now() - 30 * 3600000).toISOString()} staleAfterHours={24} />
        </Part>

        <Part name="SourceBadge" when="Use it next to every number that did not come straight from a form.">
          <SourceBadge sourceSystem="CATALYST model" modelVersion="2.4.1" confidence={0.86} />
          <SourceBadge sourceSystem="ECSA" />
          <SourceBadge sourceSystem="TESLA" />
        </Part>
      </Grid>

      <Card title="ExplainPanel" right="Why the model says 0.50">
        <ExplainPanel
          title="PSM contributors"
          summary="PSM rose mainly because two neighbouring sites in the same network activated ahead of schedule."
          contributions={[
            { label: "Network activation rate", value: 18, direction: "up" },
            { label: "Historical enrolment at this site", value: 9, direction: "up" },
            { label: "Distance to nearest competing site", value: 6, direction: "down" },
          ]}
        />
      </Card>

      <Grid cols={2}>
        <Card title="OverrideControl" right="Save stays off until a reason is given.">
          <OverrideControl field="PSM" modelValue="0.50" onOverride={handleOverride} />
        </Card>

        <Card title="ActivityFeed" right="Every override lands here.">
          <ActivityFeed entries={activity} />
        </Card>
      </Grid>

      <Card title="CommentThread" right="One thread per record, with reply and resolve.">
        <CommentThread
          comments={comments}
          currentUser="You"
          onAdd={(body) => setComments((prev) => [...prev, { id: `c${prev.length + 1}`, author: "You", body, at: new Date().toISOString() }])}
          onResolve={(id, resolved) => setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved } : c)))}
        />
      </Card>
    </div>
  );
}
