import { CITIES, COUNTRIES, REGIONS } from "./data/gazetteer";

/**
 * Offline geocoding that never gives up.
 *
 * Give it whatever a dataset has — "Sao Paulo", "SÃO PAULO", "Koeln", "NYC",
 * "Bavaria", "UK", a misspelling — and it returns a position plus how sure it
 * is: the city if we know it, the region if we know that, the country at
 * worst. `precision: "none"` only happens when not even the country can be
 * read, and the caller is expected to show those rows, not hide them.
 *
 * No network, no key. Data is GeoNames (CC BY 4.0), see data/gazetteer.ts.
 */

export type Precision = "exact" | "city" | "region" | "country" | "none";

export type GeoResult = {
  lat: number;
  lon: number;
  precision: Precision;
  /** What the resolver matched on, for a tooltip or an audit line. */
  matched: string;
  countryIso?: string;
};

/* Normalisation ----------------------------------------------------------- */

export function normalizePlace(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bst\.?\s/g, "saint ")
    .replace(/\bft\.?\s/g, "fort ")
    .replace(/\bmt\.?\s/g, "mount ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Country names and codes people actually type. */
const COUNTRY_ALIASES: Record<string, string> = {
  "usa": "US", "u s a": "US", "us": "US", "united states": "US", "united states of america": "US", "america": "US",
  "uk": "GB", "u k": "GB", "united kingdom": "GB", "great britain": "GB", "britain": "GB", "england": "GB", "scotland": "GB", "wales": "GB", "northern ireland": "GB",
  "south korea": "KR", "korea": "KR", "republic of korea": "KR", "korea republic of": "KR", "korea south": "KR",
  "north korea": "KP", "russia": "RU", "russian federation": "RU",
  "czech republic": "CZ", "czechia": "CZ", "holland": "NL", "the netherlands": "NL", "netherlands": "NL",
  "taiwan": "TW", "hong kong": "HK", "macau": "MO", "vietnam": "VN", "viet nam": "VN", "laos": "LA",
  "iran": "IR", "syria": "SY", "bolivia": "BO", "venezuela": "VE", "tanzania": "TZ", "moldova": "MD",
  "uae": "AE", "united arab emirates": "AE", "emirates": "AE", "ivory coast": "CI", "cote d ivoire": "CI",
  "turkey": "TR", "turkiye": "TR", "brunei": "BN", "swaziland": "SZ", "eswatini": "SZ", "burma": "MM", "myanmar": "MM",
  "drc": "CD", "dr congo": "CD", "congo kinshasa": "CD", "congo brazzaville": "CG", "cape verde": "CV", "cabo verde": "CV",
  "palestine": "PS", "vatican": "VA", "macedonia": "MK", "north macedonia": "MK", "slovak republic": "SK",
};

/** Abbreviations no gazetteer carries. Maps to the asciiName in CITIES. */
const CITY_ALIASES: Record<string, string> = {
  "nyc": "New York City", "new york": "New York City", "la": "Los Angeles", "sf": "San Francisco",
  "dc": "Washington", "washington dc": "Washington", "philly": "Philadelphia", "vegas": "Las Vegas",
  "bombay": "Mumbai", "calcutta": "Kolkata", "madras": "Chennai", "bangalore": "Bengaluru",
  "peking": "Beijing", "canton": "Guangzhou", "saigon": "Ho Chi Minh City", "rangoon": "Yangon",
  "kiev": "Kyiv", "st petersburg": "Saint Petersburg", "leningrad": "Saint Petersburg",
  "zurich": "Zuerich", "geneva": "Geneve", "cologne": "Koeln", "munich": "Munich", "vienna": "Vienna",
  "brussels": "Brussels", "the hague": "The Hague", "lisbon": "Lisbon", "milan": "Milan", "rome": "Rome",
  "copenhagen": "Copenhagen", "gothenburg": "Goeteborg", "malmo": "Malmoe",
};

/* Indexes built once ------------------------------------------------------ */

type CityRow = (typeof CITIES)[number];

let built = false;
const cityByName = new Map<string, CityRow[]>();
const cityByNameCountry = new Map<string, CityRow>();
const regionByName = new Map<string, (typeof REGIONS)[number][]>();
const countryByIso = new Map<string, (typeof COUNTRIES)[number]>();
const countryByName = new Map<string, (typeof COUNTRIES)[number]>();
let cityNames: string[] = [];

function push<K, V>(m: Map<K, V[]>, k: K, v: V) {
  const a = m.get(k);
  if (a) a.push(v);
  else m.set(k, [v]);
}

function build() {
  if (built) return;
  built = true;
  for (const c of COUNTRIES) {
    countryByIso.set(c[1], c);
    countryByName.set(normalizePlace(c[0]), c);
    countryByName.set(c[1].toLowerCase(), c);
    countryByName.set(c[2].toLowerCase(), c);
  }
  for (const [alias, iso] of Object.entries(COUNTRY_ALIASES)) {
    const c = countryByIso.get(iso);
    if (c) countryByName.set(alias, c);
  }
  for (const r of REGIONS) push(regionByName, normalizePlace(r[0]), r);
  for (const c of CITIES) {
    const n = normalizePlace(c[0]);
    push(cityByName, n, c);
    if (!cityByNameCountry.has(`${n}|${c[1]}`)) cityByNameCountry.set(`${n}|${c[1]}`, c);
    for (const a of c[6]) {
      const an = normalizePlace(a);
      push(cityByName, an, c);
      if (!cityByNameCountry.has(`${an}|${c[1]}`)) cityByNameCountry.set(`${an}|${c[1]}`, c);
    }
  }
  for (const [alias, target] of Object.entries(CITY_ALIASES)) {
    const rows = cityByName.get(normalizePlace(target));
    if (rows && !cityByName.has(alias)) cityByName.set(alias, [...rows]);
  }
  cityNames = [...cityByName.keys()];
}

/** "new york" → "new york city": a name that begins with the query, biggest first. */
function prefixCity(n: string, countryIso?: string): CityRow | null {
  if (n.length < 4) return null;
  let best: CityRow | null = null;
  for (const name of cityNames) {
    if (!name.startsWith(n + " ")) continue;
    for (const c of cityByName.get(name)!) {
      if (countryIso && c[1] !== countryIso) continue;
      if (!best || c[5] > best[5]) best = c;
    }
  }
  return best;
}

/* Fuzzy ------------------------------------------------------------------- */

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev.splice(0, prev.length, ...cur);
  }
  return prev[b.length];
}

function fuzzyCity(n: string, countryIso?: string): CityRow | null {
  if (n.length < 4) return null;
  const max = n.length >= 8 ? 2 : 1;
  let best: CityRow | null = null;
  let bestScore = Infinity;
  for (const name of cityNames) {
    if (name[0] !== n[0]) continue; // a typo rarely changes the first letter; keeps this fast
    const d = editDistance(n, name, max);
    if (d > max) continue;
    for (const c of cityByName.get(name)!) {
      if (countryIso && c[1] !== countryIso) continue;
      // prefer fewer edits, then the bigger city
      const score = d * 1e9 - c[5];
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
  }
  return best;
}

/* Public ------------------------------------------------------------------ */

export function resolveCountry(input?: string): (typeof COUNTRIES)[number] | undefined {
  if (!input) return undefined;
  build();
  const n = normalizePlace(input);
  return countryByName.get(n) ?? countryByIso.get(input.trim().toUpperCase());
}

/**
 * Place a record. Pass what you have; every argument is optional.
 *
 * Order of trust: explicit coordinates → city in that country → city
 * anywhere (largest wins) → alias → typo-tolerant city → region → country.
 */
export function geocode(input: {
  lat?: number | null;
  lon?: number | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
}): GeoResult {
  if (typeof input.lat === "number" && typeof input.lon === "number" && !Number.isNaN(input.lat) && !Number.isNaN(input.lon)) {
    return { lat: input.lat, lon: input.lon, precision: "exact", matched: "coordinates" };
  }
  build();
  const country = resolveCountry(input.country ?? undefined);
  const iso = country?.[1];

  const cityText = input.city?.trim();
  if (cityText) {
    // "Cambridge, MA" / "Paris, France" — take the first part as the city
    const first = normalizePlace(cityText.split(/[,/|]/)[0]);
    const hit = (iso && cityByNameCountry.get(`${first}|${iso}`)) || cityByName.get(first)?.[0];
    if (hit) return { lat: hit[3], lon: hit[4], precision: "city", matched: `${hit[0]}, ${hit[1]}`, countryIso: hit[1] };
    const pref = prefixCity(first, iso);
    if (pref) return { lat: pref[3], lon: pref[4], precision: "city", matched: `${pref[0]}, ${pref[1]}`, countryIso: pref[1] };
    const fuzzy = fuzzyCity(first, iso) ?? (iso ? fuzzyCity(first) : null);
    if (fuzzy) return { lat: fuzzy[3], lon: fuzzy[4], precision: "city", matched: `${fuzzy[0]}, ${fuzzy[1]} (closest spelling)`, countryIso: fuzzy[1] };
    // maybe the "city" is really a region or a country
    const asRegion = regionByName.get(first)?.find((r) => !iso || r[1] === iso);
    if (asRegion) return { lat: asRegion[3], lon: asRegion[4], precision: "region", matched: `${asRegion[0]}, ${asRegion[1]}`, countryIso: asRegion[1] };
    const asCountry = countryByName.get(first);
    if (asCountry && !iso) return { lat: asCountry[3], lon: asCountry[4], precision: "country", matched: asCountry[0], countryIso: asCountry[1] };
  }

  const regionText = input.region?.trim();
  if (regionText) {
    const rn = normalizePlace(regionText);
    const r = regionByName.get(rn)?.find((x) => !iso || x[1] === iso);
    if (r) return { lat: r[3], lon: r[4], precision: "region", matched: `${r[0]}, ${r[1]}`, countryIso: r[1] };
    const asCity = (iso && cityByNameCountry.get(`${rn}|${iso}`)) || cityByName.get(rn)?.[0];
    if (asCity) return { lat: asCity[3], lon: asCity[4], precision: "city", matched: `${asCity[0]}, ${asCity[1]}`, countryIso: asCity[1] };
  }

  if (country) return { lat: country[3], lon: country[4], precision: "country", matched: country[0], countryIso: country[1] };
  return { lat: 0, lon: 0, precision: "none", matched: "nothing recognised" };
}

/** The share of rows placed at each precision — for a legend or a caveat. */
export function summarizePrecision(results: GeoResult[]) {
  const out: Record<Precision, number> = { exact: 0, city: 0, region: 0, country: 0, none: 0 };
  for (const r of results) out[r.precision]++;
  return out;
}
