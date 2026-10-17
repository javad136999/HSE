import { sb, monthRange, computeReport } from './_lib.js';
export default async function handler(req, res) {
  const m = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : new Date().toISOString().slice(0, 7);
  const [from, to] = monthRange(m);
  const rows = await (await sb(`aqi_readings?select=ts,aqi,dominant&ts=gte.${from}&ts=lt.${to}&order=ts`)).json();
  if (!rows.length) { // raw data purged → use the saved monthly summary
    const s = await (await sb(`aqi_monthly?select=data&month=eq.${m}`)).json();
    if (s.length) return res.json(s[0].data);
  }
  res.json(computeReport(rows, m));
}
