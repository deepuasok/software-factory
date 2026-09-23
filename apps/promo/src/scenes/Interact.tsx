import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color } from "@factory/ui";
import { countUp, enter, reveal } from "../anim";
import { Cursor, Stop } from "../Cursor";
import { Dashboard, REST } from "./Dashboard";

/*
 * The page stands still; a hand works it. Each click changes one thing and
 * the page answers: tiles count, a second line draws, bars fill, the banner
 * turns from red to green. Coordinates are in film space; the dashboard sits
 * at (240,130) at scale 1, so a page point (px,py) maps to (240+px, 130+py).
 */
const P = (px: number, py: number) => ({ x: 240 + px, y: 130 + py });

const CLICK_SEG = 70;    // "Past SLA" segment
const CLICK_TOGGLE = 140; // "Show closed"
const CLICK_CHIP = 210;  // "Harborview Labs"
const CLICK_BANNER = 262; // "Work the queue"

const STOPS: Stop[] = [
  { frame: 0, ...P(900, 700) },
  { frame: CLICK_SEG - 18, ...P(392, 372) },
  { frame: CLICK_SEG, ...P(392, 372), click: true },
  { frame: CLICK_TOGGLE - 22, ...P(1368, 372) },
  { frame: CLICK_TOGGLE, ...P(1368, 372), click: true },
  { frame: CLICK_CHIP - 22, ...P(560, 372) },
  { frame: CLICK_CHIP, ...P(560, 372), click: true },
  { frame: CLICK_BANNER - 26, ...P(1340, 176) },
  { frame: CLICK_BANNER, ...P(1340, 176), click: true },
  { frame: 300, ...P(1340, 176) },
];

export const Interact = () => {
  const f = useCurrentFrame();

  const st = {
    ...REST,
    // Tiles count up as the scene opens, then the "Past SLA" click narrows them.
    tiles: {
      open: f < CLICK_SEG ? countUp(f, 6, 40, 26) : countUp(f, CLICK_SEG, 18, 25),
      past: countUp(f, 10, 40, 25),
      approve: countUp(f, 14, 40, 3),
      done: countUp(f, 18, 40, 2),
    },
    view: f >= CLICK_SEG + 3 ? ("past" as const) : ("all" as const),
    toggle: f >= CLICK_TOGGLE + 3,
    closedLine: f >= CLICK_TOGGLE + 3,
    trend: f < CLICK_TOGGLE + 3 ? 1 : reveal(f, CLICK_TOGGLE + 3, 34),
    chipOn: f >= CLICK_CHIP + 3,
    bars: f < CLICK_CHIP + 3 ? 1 : reveal(f, CLICK_CHIP + 3, 30),
    bannerTone: f >= CLICK_BANNER + 4 ? ("ok" as const) : ("error" as const),
  };

  const caption =
    f < CLICK_SEG ? "Every number has a unit and a caveat." :
    f < CLICK_TOGGLE ? "Flip a filter — the tiles answer." :
    f < CLICK_CHIP ? "Flip a toggle — the chart draws the second line." :
    f < CLICK_BANNER ? "Flip a chip — the bars refill." :
    "Colour means something. Red is a problem. Green is on plan.";

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 40, ...enter(f, 0) }}>
        <div className="cx-label" style={{ fontSize: 14 }}>It works</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: color.secondary, marginTop: 4 }} key={caption}>
          {caption}
        </div>
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
        <Dashboard st={st} />
      </div>

      <Cursor frame={f} stops={STOPS} />
    </AbsoluteFill>
  );
};
