import { interpolate } from "remotion";
import { color } from "@factory/ui";

export type Stop = { frame: number; x: number; y: number; click?: boolean };

/**
 * A pointer that moves between stops and pulses a ring on a click. Position is
 * eased between consecutive stops so the hand never teleports.
 */
export function Cursor({ frame, stops }: { frame: number; stops: Stop[] }) {
  if (!stops.length || frame < stops[0].frame) return null;
  let i = 0;
  while (i < stops.length - 1 && frame >= stops[i + 1].frame) i++;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const t = a === b ? 1 : interpolate(frame, [a.frame, b.frame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = 1 - Math.pow(1 - t, 3);
  const x = a.x + (b.x - a.x) * e;
  const y = a.y + (b.y - a.y) * e;

  // A click pulses for 12 frames after arriving at a click stop.
  const clickStop = stops.filter((s) => s.click && frame >= s.frame && frame < s.frame + 14).at(-1);
  const pulse = clickStop ? (frame - clickStop.frame) / 14 : 0;
  const pressed = clickStop ? frame - clickStop.frame < 5 : false;

  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 50 }}>
      {clickStop && (
        <div
          style={{
            position: "absolute",
            left: -22 + 22 * (1 - pulse),
            top: -22 + 22 * (1 - pulse),
            width: 44 * pulse,
            height: 44 * pulse,
            borderRadius: 999,
            border: `2px solid ${color.borderFocus}`,
            opacity: 1 - pulse,
          }}
        />
      )}
      <svg width="26" height="30" viewBox="0 0 26 30" style={{ transform: `scale(${pressed ? 0.88 : 1})`, transformOrigin: "top left", filter: "drop-shadow(0 2px 3px rgba(7,29,73,.35))" }}>
        <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#fff" stroke={color.secondary} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
