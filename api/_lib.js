export const LAT = 27.4735, LON = 52.6075;
const SUB = { pm25:'us_aqi_pm2_5', pm10:'us_aqi_pm10', no2:'us_aqi_nitrogen_dioxide', o3:'us_aqi_ozone', so2:'us_aqi_sulphur_dioxide', co:'us_aqi_carbon_monoxide' };
export async function getLive() {
  const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&timezone=Asia%2FTehran&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,${Object.values(SUB).join(',')}`;
  const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&timezone=Asia%2FTehran&wind_speed_unit=kmh&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,surface_pressure`;
  const [a, w] = await Promise.all([fetch(aUrl).then(r => r.json()), fetch(wUrl).then(r => r.json())]);
  const c = a.current, k = w.current;
  let dominant = null, max = -1;
  for (const [n, f] of Object.entries(SUB)) if ((c[f] ?? -1) > max) { max = c[f]; dominant = n; }
  return {
    ts: new Date().toISOString(),
    aqi: c.us_aqi, dominant,
    pm25: c.pm2_5, pm10: c.pm10, o3: c.ozone, no2: c.nitrogen_dioxide, so2: c.sulphur_dioxide, co: c.carbon_monoxide,
    sub: Object.fromEntries(Object.entries(SUB).map(([n, f]) => [n, c[f]])),
    wind_speed: k.wind_speed_10m, wind_dir: k.wind_direction_10m, gust: k.wind_gusts_10m,
    temp: k.temperature_2m, humidity: k.relative_humidity_2m, pressure: k.surface_pressure, code: k.weather_code
  };
}
export const sb = (path, opt = {}) => fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
  ...opt, headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal', ...(opt.headers || {}) }
});

export const RETENTION_DAYS = 45;
export function monthRange(m) {
  const [y, mo] = m.split('-').map(Number);
  return [new Date(Date.UTC(y, mo - 1, 1)).toISOString(), new Date(Date.UTC(y, mo, 1)).toISOString()];
}
export function computeReport(rows, m) {
  const days = {};
  for (const r of rows) {
    const d = new Date(new Date(r.ts).getTime() + 12600000).toISOString().slice(0, 10); // Tehran time
    (days[d] ||= []).push(r);
  }
  const daily = Object.entries(days).map(([date, a]) => ({ date, avg: Math.round(a.reduce((s, x) => s + x.aqi, 0) / a.length), max: Math.max(...a.map(x => x.aqi)) }));
  const all = rows.map(r => r.aqi), dom = {};
  rows.filter(r => r.aqi > 100).forEach(r => dom[r.dominant] = (dom[r.dominant] || 0) + 1);
  return { month: m, count: rows.length, avg: all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null, max: all.length ? Math.max(...all) : null, exceedHours: all.filter(x => x > 100).length, dominantExceed: dom, daily };
}
