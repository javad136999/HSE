import { verify } from './_auth.js';
import { sb } from './_lib.js';
const enc = encodeURIComponent, str = (s, n = 80) => String(s ?? '').trim().slice(0, n);
export default async function handler(req, res) {
  const u = verify(req);
  if (!u) return res.status(401).json({ error: 'unauthorized' });
  if (req.method === 'GET') {
    const r = await sb('fire_resources?select=company,site,lat,lon,category,qty&order=company,site');
    return res.status(r.status).json(await r.json());
  }
  if (u.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  if (req.method === 'DELETE') {
    const { company, site } = req.query;
    if (!company || !site) return res.status(400).end();
    const r = await sb(`fire_resources?company=eq.${enc(company)}&site=eq.${enc(site)}`, { method: 'DELETE' });
    return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
  }
  if (req.method === 'POST') {
    const { orig, items = {} } = req.body || {};
    const company = str(req.body?.company), site = str(req.body?.site), lat = Number(req.body?.lat), lon = Number(req.body?.lon);
    if (!company || !site || !(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180)) return res.status(400).json({ error: 'invalid' });
    const rows = Object.entries(items).filter(([k, q]) => /^[a-z_]{2,30}$/.test(k) && Number.isInteger(+q) && +q > 0 && +q <= 1e6)
      .map(([category, q]) => ({ company, site, lat, lon, category, qty: +q }));
    const del = async (c, s) => sb(`fire_resources?company=eq.${enc(c)}&site=eq.${enc(s)}`, { method: 'DELETE' });
    if (orig?.company && orig?.site) await del(str(orig.company), str(orig.site));
    await del(company, site);
    if (rows.length) { const r = await sb('fire_resources', { method: 'POST', body: JSON.stringify(rows) }); if (!r.ok) return res.status(500).json({ error: await r.text() }); }
    return res.json({ ok: true, saved: rows.length });
  }
  res.status(405).end();
}
