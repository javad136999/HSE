import { getLive, sb, monthRange, computeReport, RETENTION_DAYS } from './_lib.js';
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();
  const d = await getLive();
  const row = { aqi: d.aqi, dominant: d.dominant, pm25: d.pm25, pm10: d.pm10, o3: d.o3, no2: d.no2, so2: d.so2, co: d.co, wind_speed: d.wind_speed, wind_dir: d.wind_dir, temp: d.temp };
  const r = await sb('aqi_readings', { method: 'POST', body: JSON.stringify(row) });

  // 1) save last month's summary once (before raw data is purged)
  const p = new Date(); p.setUTCDate(1); p.setUTCMonth(p.getUTCMonth() - 1);
  const pm = p.toISOString().slice(0, 7);
  const have = await (await sb(`aqi_monthly?select=month&month=eq.${pm}`)).json();
  if (!have.length) {
    const [from, to] = monthRange(pm);
    const rows = await (await sb(`aqi_readings?select=ts,aqi,dominant&ts=gte.${from}&ts=lt.${to}&order=ts`)).json();
    if (rows.length) await sb('aqi_monthly', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ month: pm, data: computeReport(rows, pm) }) });
  }
  // 2) purge raw rows older than RETENTION_DAYS
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 864e5).toISOString();
  await sb(`aqi_readings?ts=lt.${cutoff}`, { method: 'DELETE' });
  res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
