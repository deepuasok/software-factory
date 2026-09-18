/**
 * How figures are written, everywhere.
 *
 * Every number on screen goes through one of these, so a total in a tile and
 * the same total in a table never disagree about rounding, currency or the
 * word for "last week". Never call `toLocaleString` in a component.
 */

/** Money in thousands, as people say it out loud: $412k, $1.2m. */
export function money(thousands: number, currency = "$"): string {
  const abs = Math.abs(thousands);
  if (abs >= 1000) return `${currency}${(thousands / 1000).toFixed(abs >= 10000 ? 0 : 1)}m`;
  return `${currency}${Math.round(thousands)}k`;
}

/** A share, as a percentage. Pass 0.62 and get "62%". */
export function pct(share: number, places = 0): string {
  return `${(share * 100).toFixed(places)}%`;
}

/** A big count, shortened: 1,240 → 1.2k. Use it in tiles, never in a total. */
export function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(value));
}

/** How long ago, in words. "3 days ago", "just now". Never a bare timestamp. */
export function relativeTime(when: Date | string, now: Date = new Date()): string {
  const then = typeof when === "string" ? new Date(when) : when;
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  const ahead = seconds < 0;
  const s = Math.abs(seconds);
  const say = (n: number, unit: string) => {
    const word = `${n} ${unit}${n === 1 ? "" : "s"}`;
    return ahead ? `in ${word}` : `${word} ago`;
  };
  if (s < 45) return ahead ? "shortly" : "just now";
  if (s < 3600) return say(Math.round(s / 60), "minute");
  if (s < 86400) return say(Math.round(s / 3600), "hour");
  if (s < 2592000) return say(Math.round(s / 86400), "day");
  if (s < 31536000) return say(Math.round(s / 2592000), "month");
  return say(Math.round(s / 31536000), "year");
}

/** A change, with its sign kept: +6, -18, 0. Pair it with DeltaValue. */
export function delta(value: number, places = 0): string {
  const rounded = Number(value.toFixed(places));
  if (rounded === 0) return "0";
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(places)}`;
}
