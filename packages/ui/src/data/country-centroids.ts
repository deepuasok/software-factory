/**
 * ISO country name to an approximate [lat, lon] centroid, hand-curated for
 * the ~60 countries that turn up most often in international operational
 * data. This is a point, not a shape — see the doc comment on `Choropleth`
 * in `components/map.tsx` for why a filled-country map draws a sized circle
 * here instead of a filled polygon.
 *
 * Keys are the common English country name, matched case-insensitively.
 */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  "United States": [39.8, -98.6],
  Canada: [56.1, -106.3],
  Mexico: [23.6, -102.6],
  Brazil: [-14.2, -51.9],
  Argentina: [-38.4, -63.6],
  Chile: [-35.7, -71.5],
  Peru: [-9.2, -75.0],
  Colombia: [4.6, -74.3],
  "United Kingdom": [54.0, -2.9],
  Ireland: [53.4, -8.2],
  France: [46.6, 2.2],
  Germany: [51.2, 10.5],
  Spain: [40.5, -3.7],
  Portugal: [39.6, -8.2],
  Italy: [42.8, 12.6],
  Netherlands: [52.1, 5.3],
  Belgium: [50.5, 4.5],
  Switzerland: [46.8, 8.2],
  Austria: [47.5, 14.6],
  Poland: [51.9, 19.1],
  "Czech Republic": [49.8, 15.5],
  Sweden: [60.1, 18.6],
  Norway: [60.5, 8.5],
  Denmark: [56.3, 9.5],
  Finland: [61.9, 25.7],
  Greece: [39.1, 21.8],
  Romania: [45.9, 24.9],
  Hungary: [47.2, 19.5],
  Ukraine: [48.4, 31.2],
  Russia: [61.5, 105.3],
  Turkey: [38.9, 35.2],
  Israel: [31.0, 34.8],
  "Saudi Arabia": [23.9, 45.1],
  "United Arab Emirates": [23.4, 53.8],
  Egypt: [26.8, 30.8],
  "South Africa": [-30.6, 22.9],
  Nigeria: [9.1, 8.7],
  Kenya: [-0.0, 37.9],
  Morocco: [31.8, -7.1],
  India: [20.6, 79.0],
  Pakistan: [30.4, 69.3],
  Bangladesh: [23.7, 90.4],
  China: [35.9, 104.2],
  Japan: [36.2, 138.3],
  "South Korea": [35.9, 127.8],
  Taiwan: [23.7, 121.0],
  Vietnam: [14.1, 108.3],
  Thailand: [15.9, 101.0],
  Philippines: [12.9, 121.8],
  Indonesia: [-0.8, 113.9],
  Malaysia: [4.2, 101.9],
  Singapore: [1.4, 103.8],
  Australia: [-25.3, 133.8],
  "New Zealand": [-40.9, 174.9],
  "Puerto Rico": [18.2, -66.6],
  Guatemala: [15.8, -90.2],
  "Costa Rica": [9.7, -83.8],
  Ecuador: [-1.8, -78.2],
  Venezuela: [6.4, -66.6],
  Uruguay: [-32.5, -55.8],
  Bulgaria: [42.7, 25.5],
  Serbia: [44.0, 21.0],
};

/** Look up a centroid by common country name, tolerant of case. */
export function countryCentroid(name: string): [number, number] | null {
  if (!name) return null;
  const hit = COUNTRY_CENTROIDS[name];
  if (hit) return hit;
  const lower = name.trim().toLowerCase();
  for (const [k, v] of Object.entries(COUNTRY_CENTROIDS)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}
