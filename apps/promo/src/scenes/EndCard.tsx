import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color, series } from "@factory/ui";
import { enter, rise } from "../anim";

export const EndCard = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: color.secondary, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#fff", fontSize: 64, fontWeight: 700, letterSpacing: -1, textAlign: "center", ...enter(f, 0) }}>
        Describe the app.<br />Get the app.
      </div>
      <div style={{ color: "rgba(255,255,255,.72)", fontSize: 26, marginTop: 26, ...enter(f, 14) }}>
        github.com/deepuasok/software-factory
      </div>
      <div style={{ position: "absolute", bottom: 36, color: "rgba(255,255,255,.45)", fontSize: 15, ...enter(f, 30) }}>
        Music: "Pamgaea" by Kevin MacLeod (incompetech.com), CC BY 4.0
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 44 }}>
        {series.map((c, i) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 4, background: c, transform: `scale(${rise(f, 24 + i * 3)})` }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
