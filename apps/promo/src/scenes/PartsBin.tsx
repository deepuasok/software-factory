import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Badge, Button, CategoryBars, Chip, RankBadge, Segmented, Sparkline, StatTile, Toggle,
  ProgressBar, StatusPill, DateInput, color,
} from "@factory/ui";
import { enter, rise } from "../anim";

const PARTS: { label: string; node: React.ReactNode; wide?: boolean }[] = [
  { label: "Button", node: <div className="flex gap-2"><Button variant="primary">Save plan</Button><Button>Export</Button></div> },
  { label: "Toggle", node: <Toggle checked onChange={() => {}} label="Live filter" /> },
  { label: "Chip", node: <div className="flex gap-2"><Chip on>Rank 1 · 7</Chip><Chip>Europe · 11</Chip></div> },
  { label: "Segmented", node: <Segmented value="all" onChange={() => {}} options={[{ value: "all", label: "All", count: 30 }, { value: "t1", label: "Rank 1", count: 7 }]} /> },
  { label: "Badge", node: <div className="flex gap-2"><Badge tone="ok">On plan</Badge><Badge tone="warn">At risk</Badge><Badge tone="error">Behind</Badge></div> },
  { label: "Rank", node: <div className="flex gap-2"><RankBadge rank={1} /><RankBadge rank={2} /><RankBadge rank={3} /></div> },
  { label: "Status pill", node: <div className="flex gap-2"><StatusPill label="Approved" tone="ok" /><StatusPill label="Pending" tone="warn" /></div> },
  { label: "Date field", node: <div style={{ width: 200 }}><DateInput small defaultValue="2026-06-01" /></div> },
  { label: "Progress", node: <div style={{ width: 220 }}><ProgressBar value={132} target={180} /></div> },
  { label: "Sparkline", node: <Sparkline values={[3, 5, 4, 8, 11, 9, 14, 16]} width={120} height={28} /> },
  { label: "Stat tile", node: <div style={{ width: 230 }}><StatTile label="Predicted finish" value="Nov 1, 2029" note="41 months from approval" /></div> },
  { label: "Category bars", wide: true, node: (
    <div style={{ width: 360 }}>
      <CategoryBars data={[{ n: "Chicago", v: 42 }, { n: "Madrid", v: 35 }, { n: "Osaka", v: 28 }]} xKey="n" series={[{ key: "v", label: "Patients" }]} horizontal height={120} />
    </div>
  )},
];

/** The tray: every part laid out with its name, popping in one at a time. */
export const PartsBin = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "72px 120px" }}>
      <div style={{ ...enter(f, 0) }}>
        <div className="cx-label" style={{ fontSize: 14 }}>The parts bin</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: color.secondary, marginTop: 6 }}>Every part, built once.</div>
        <div style={{ fontSize: 22, color: color.muted, marginTop: 8 }}>The same button, the same toggle, the same chart — in every app the shop ships.</div>
      </div>

      <div
        className="cx-card"
        style={{ marginTop: 40, padding: 28, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22, ...enter(f, 10) }}
      >
        {PARTS.map((p, i) => {
          const s = rise(f, 26 + i * 9);
          return (
            <div
              key={p.label}
              style={{
                gridColumn: p.wide ? "span 2" : undefined,
                background: color.ghostWhite,
                border: `1px solid ${color.edge}`,
                borderRadius: 8,
                padding: 18,
                minHeight: 110,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                opacity: s,
                transform: `scale(${0.7 + 0.3 * s})`,
              }}
            >
              <div style={{ transform: "scale(1.25)", transformOrigin: "top left" }}>{p.node}</div>
              <div className="cx-label">{p.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
