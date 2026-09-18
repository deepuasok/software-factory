import { interpolate, spring } from "remotion";

export const FPS = 30;

/** A spring from 0 to 1 that starts at `start`. 0 before it starts. */
export function rise(frame: number, start: number, opts?: { damping?: number; stiffness?: number }) {
  if (frame < start) return 0;
  return spring({
    frame: frame - start,
    fps: FPS,
    config: { damping: opts?.damping ?? 14, stiffness: opts?.stiffness ?? 120, mass: 0.8 },
  });
}

/** Linear 0..1 over [start, start+dur], clamped, eased out. */
export function reveal(frame: number, start: number, dur: number) {
  const t = interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return 1 - Math.pow(1 - t, 3);
}

/** Fade + slide up, the house entrance for anything that appears. */
export function enter(frame: number, start: number, distance = 24) {
  const s = rise(frame, start);
  return { opacity: s, transform: `translateY(${(1 - s) * distance}px)` };
}

/**
 * Fly from an offset (where the part was in the bin) to rest (where it belongs
 * on the page). Scale settles from 0.6 to 1 so it reads as picking a part up.
 */
export function fly(frame: number, start: number, from: { x: number; y: number }) {
  const s = rise(frame, start, { damping: 16, stiffness: 90 });
  return {
    opacity: Math.min(1, s * 2),
    transform: `translate(${from.x * (1 - s)}px, ${from.y * (1 - s)}px) scale(${0.6 + 0.4 * s})`,
    transformOrigin: "top left",
  };
}

/** Whole-number count-up for a stat tile. */
export function countUp(frame: number, start: number, dur: number, to: number) {
  return Math.round(reveal(frame, start, dur) * to);
}
