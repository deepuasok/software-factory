import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color, series } from "@factory/ui";
import { enter, rise } from "../anim";

/** Navy card, the wordmark, one line. The same top bar every app wears. */
export const Title = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: color.secondary, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 28, ...enter(f, 0) }}>
        {series.map((c, i) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: 4, background: c, transform: `scale(${rise(f, 4 + i * 3)})` }} />
        ))}
      </div>
      <div style={{ color: "#fff", fontSize: 92, fontWeight: 700, letterSpacing: -2, ...enter(f, 8) }}>Software Factory</div>
      <div style={{ color: "rgba(255,255,255,.72)", fontSize: 30, marginTop: 14, ...enter(f, 22) }}>
        One parts bin. One look. Every app.
      </div>
    </AbsoluteFill>
  );
};
