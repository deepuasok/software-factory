
/**
 * City to [lat, lon], hand-curated. Covers the cities that turn up most often
 * in international operational data; extend it as you need.
 *
 * A few city names are ambiguous across countries (Cordoba is in both Spain
 * and Argentina), so a key may be qualified as "City|country" in lowercase.
 * Qualified keys are checked first.
 */
export const GEO: Record<string, [number, number]> = {
  // North America
  'Boston': [42.36,-71.06], 'New York': [40.71,-74.01], 'Philadelphia': [39.95,-75.17],
  'Chicago': [41.88,-87.63], 'Minneapolis': [44.98,-93.27], 'Denver': [39.74,-104.99],
  'Houston': [29.76,-95.37], 'Dallas': [32.78,-96.80], 'Atlanta': [33.75,-84.39],
  'Nashville': [36.16,-86.78], 'Miami': [25.76,-80.19], 'Tampa': [27.95,-82.46],
  'Charlotte': [35.23,-80.84], 'Phoenix': [33.45,-112.07], 'San Antonio': [29.42,-98.49],
  'San Diego': [32.72,-117.16], 'Seattle': [47.61,-122.33], 'San Francisco': [37.77,-122.42],
  'Los Angeles': [34.05,-118.24], 'Toronto': [43.65,-79.38], 'Montreal': [45.50,-73.57],
  'Vancouver': [49.28,-123.12], 'Mexico City': [19.43,-99.13], 'Guadalajara': [20.66,-103.35],
  'Monterrey': [25.69,-100.32], 'Merida': [20.97,-89.62], 'San Juan': [18.47,-66.11],
  'Guatemala City': [14.63,-90.51],
  // South America
  'Sao Paulo': [-23.55,-46.63], 'Rio De Janeiro': [-22.91,-43.17], 'Porto Alegre': [-30.03,-51.23],
  'Buenos Aires': [-34.60,-58.38], 'Cordoba|argentina': [-31.42,-64.18], 'Cordoba': [37.89,-4.78],
  'San Miguel de Tucuman': [-26.82,-65.22], 'Santiago': [-33.45,-70.67], 'Talca': [-35.43,-71.65],
  'Lima': [-12.05,-77.04], 'Bogota': [4.71,-74.07],
  // Europe
  'London': [51.51,-0.13], 'Manchester': [53.48,-2.24], 'Madrid': [40.42,-3.70],
  'Barcelona': [41.39,2.17], 'Lisbon': [38.72,-9.14], 'Paris': [48.86,2.35],
  'Lyon': [45.76,4.84], 'Brussels': [50.85,4.35], 'Amsterdam': [52.37,4.90],
  'Berlin': [52.52,13.40], 'Hamburg': [53.55,9.99], 'Munich': [48.14,11.58],
  'Frankfurt': [50.11,8.68], 'Zurich': [47.37,8.54], 'Milan': [45.46,9.19],
  'Rome': [41.90,12.50], 'Vienna': [48.21,16.37], 'Prague': [50.08,14.44],
  'Brno': [49.20,16.61], 'Bratislava': [48.15,17.11], 'Budapest': [47.50,19.04],
  'Warsaw': [52.23,21.01], 'Krakow': [50.06,19.94], 'Wroclaw': [51.11,17.03],
  'Lodz': [51.76,19.46], 'Poznan': [52.41,16.93], 'Katowice': [50.26,19.02],
  'Bialystok': [53.13,23.16], 'Bydgoszcz': [53.12,18.00], 'Elblag': [54.16,19.40],
  'Gdansk': [54.35,18.65], 'Lublin': [51.25,22.57],
  'Stockholm': [59.33,18.07], 'Copenhagen': [55.68,12.57], 'Oslo': [59.91,10.75],
  'Helsinki': [60.17,24.94], 'Riga': [56.95,24.11], 'Vilnius': [54.69,25.28],
  'Tallinn': [59.44,24.75], 'Kyiv': [50.45,30.52], 'Kharkiv': [49.99,36.23],
  'Vinnytsia': [49.23,28.47], 'Minsk': [53.90,27.57], 'Moscow': [55.76,37.62],
  'Saint Petersburg': [59.93,30.34], 'Novosibirsk': [55.03,82.92], 'Yaroslavl': [57.63,39.87],
  'Bucharest': [44.43,26.10], 'Sofia': [42.70,23.32], 'Plovdiv': [42.14,24.75],
  'Athens': [37.98,23.73], 'Zagreb': [45.81,15.98], 'Ljubljana': [46.06,14.51],
  'Sarajevo': [43.86,18.41], 'Belgrade': [44.79,20.45], 'Skopje': [41.99,21.43],
  'Istanbul': [41.01,28.98], 'Ankara': [39.93,32.86],
  // Middle East & Africa
  'Tel Aviv': [32.08,34.78], 'Cairo': [30.04,31.24], 'Riyadh': [24.71,46.68],
  'Dubai': [25.20,55.27], 'Casablanca': [33.57,-7.59], 'Lagos': [6.52,3.38],
  'Nairobi': [-1.29,36.82], 'Johannesburg': [-26.20,28.05], 'Cape Town': [-33.92,18.42],
  // Asia
  'Karachi': [24.86,67.00], 'Lahore': [31.55,74.34], 'Delhi': [28.61,77.21],
  'Mumbai': [19.08,72.88], 'Pune': [18.52,73.86], 'Ahmedabad': [23.02,72.57],
  'Hyderabad': [17.39,78.49], 'Bangalore': [12.97,77.59], 'Chennai': [13.08,80.27],
  'Kolkata': [22.57,88.36], 'Bangkok': [13.76,100.50], 'Ho Chi Minh': [10.82,106.63],
  'Kuala Lumpur': [3.14,101.69], 'Singapore': [1.35,103.82], 'Jakarta': [-6.21,106.85],
  'Manila': [14.60,120.98], 'Hong Kong': [22.32,114.17], 'Shenzhen': [22.54,114.06],
  'Guangzhou': [23.13,113.26], 'Taipei': [25.03,121.57], 'Wuhan': [30.59,114.31],
  'Chengdu': [30.57,104.07], 'Shanghai': [31.23,121.47], 'Beijing': [39.90,116.41],
  'Seoul': [37.57,126.98], 'Tokyo': [35.68,139.69], 'Yokohama': [35.44,139.64],
  'Nagoya': [35.18,136.91], 'Osaka': [34.69,135.50], 'Sapporo': [43.06,141.35],
  // Oceania
  'Sydney': [-33.87,151.21], 'Melbourne': [-37.81,144.96], 'Brisbane': [-27.47,153.03],
};

/**
 * Equirectangular projection onto the 1000x394 map frame. The constants mirror
 * build-world-map.py, which pre-projected the land outlines in
 * `world-land.ts` — change one and the dots stop landing on the coastlines.
 */
export const MAP_W = 1000;
export const MAP_H = 394;
export const MAP_LAT_TOP = 84;
export const MAP_LAT_BOT = -58;

export function project(lat: number, lon: number): { x: number; y: number } {
  const clat = Math.max(Math.min(lat, MAP_LAT_TOP), MAP_LAT_BOT);
  return {
    x: ((lon + 180) / 360) * MAP_W,
    y: ((MAP_LAT_TOP - clat) / (MAP_LAT_TOP - MAP_LAT_BOT)) * MAP_H,
  };
}

function deburr(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Find a city. Tries the country-qualified key, then the plain city name, then
 * a prefix match in either direction so "Sao Paulo SP" still finds "Sao Paulo".
 */
export function geoLookup(city: string, country: string): [number, number] | null {
  if (!city) return null;
  const key = deburr(city.trim().replace(/\s+/g, " "));
  const qualified = country ? `${key}|${String(country).trim().toLowerCase()}` : null;
  if (qualified && GEO[qualified]) return GEO[qualified];
  if (GEO[key]) return GEO[key];
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(GEO)) {
    if (k.includes("|")) continue;
    const kl = k.toLowerCase();
    if (kl.startsWith(lower) || lower.startsWith(kl)) return v;
  }
  return null;
}

/**
 * Deterministic few-pixel jitter so co-located points do not stack into one
 * dot. Derived from a stable key, never Math.random, so a server render and a
 * client render agree.
 */
export function jitter(key: string): { dx: number; dy: number } {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return { dx: ((h % 7) - 3) * 1.4, dy: (((h >> 3) % 7) - 3) * 1.4 };
}
