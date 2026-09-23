import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color } from "@factory/ui";
import { enter, fly, reveal } from "../anim";
import { Dashboard, REST } from "./Dashboard";

/**
 * Parts leave the bin (off to the left) and land in their slots, one beat
 * apart, until a whole dashboard stands there. Nothing is drawn for the film
 * that an app would not draw for itself.
 */
export const Assemble = () => {
  const f = useCurrentFrame();
  const from = { x: -900, y: 120 };

  const s = {
    topbar: fly(f, 10, { x: 0, y: -80 }),
    header: fly(f, 30, from),
    banner: fly(f, 52, from),
    tile1: fly(f, 74, from),
    tile2: fly(f, 84, from),
    tile3: fly(f, 94, from),
    tile4: fly(f, 104, from),
    toolbar: fly(f, 126, from),
    chart: fly(f, 146, from),
    bars: fly(f, 162, from),
    table: fly(f, 184, from),
  };

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 40, ...enter(f, 0) }}>
        <div className="cx-label" style={{ fontSize: 14 }}>Assembly</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: color.secondary, marginTop: 4 }}>Pick the parts. Snap them in.</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 240,
          top: 130,
          width: 1440,
          transform: "scale(1)",
          transformOrigin: "top left",
          boxShadow: "0 24px 60px rgba(7,29,73,.18)",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${color.edge}`,
        }}
      >
        <Dashboard st={{ ...REST, s, trend: reveal(f, 150, 40), bars: reveal(f, 166, 36) }} />
      </div>

      <div style={{ position: "absolute", right: 120, top: 56, fontSize: 20, color: color.muted, ...enter(f, 200) }}>
        A dashboard, from the bin, in one pass.
      </div>
    </AbsoluteFill>
  );
};
