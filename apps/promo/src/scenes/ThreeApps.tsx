import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { color } from "@factory/ui";
import { enter, rise } from "../anim";

const APPS = [
  { file: "work-orders-dashboard.png", label: "Work orders", sub: "Monitor & alert" },
  { file: "work-orders-triage.png", label: "Review queue", sub: "Review & disposition" },
  { file: "invoices-reconcile.png", label: "Invoice reconciliation", sub: "Reconcile & attribute" },
];

/** Three real screens from two unrelated apps. Same shop, same look. */
export const ThreeApps = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "60px 120px" }}>
      <div style={enter(f, 0)}>
        <div className="cx-label" style={{ fontSize: 14 }}>The proof</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: color.secondary, marginTop: 6 }}>Three apps. Two domains. One shop.</div>
        <div style={{ fontSize: 22, color: color.muted, marginTop: 8 }}>Built from the bin by following the brief. No CSS was written for any of them.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginTop: 48 }}>
        {APPS.map((a, i) => {
          const s = rise(f, 14 + i * 12, { damping: 15, stiffness: 100 });
          return (
            <div key={a.file} style={{ opacity: s, transform: `translateY(${(1 - s) * 60}px)` }}>
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `1px solid ${color.edge}`,
                  boxShadow: "0 18px 44px rgba(7,29,73,.16)",
                  background: "#fff",
                  aspectRatio: "1473 / 812",
                }}
              >
                <Img src={staticFile(a.file)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
              </div>
              <div style={{ marginTop: 14, fontSize: 22, fontWeight: 700, color: color.secondary }}>{a.label}</div>
              <div style={{ fontSize: 16, color: color.muted, marginTop: 2 }}>{a.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
