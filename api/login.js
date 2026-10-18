import { sign, safeEq } from './_auth.js';
import { sb } from './_lib.js';
export default async function handler(req, res) {
  const e = process.env;
  if (req.method !== 'POST') return res.status(405).end();
  if (!e.SESSION_SECRET) return res.status(500).json({ error: 'env not set' });
  const { user = '', password = '' } = req.body || {};
  let role = null;
  try {
    const r = await sb('rpc/verify_login', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ p_user: String(user).slice(0, 64), p_pass: String(password).slice(0, 200) }) });
    if (r.ok) { const v = await r.json(); if (v === 'admin' || v === 'viewer') role = v; }
  } catch (err) { /* fall through */ }
  if (!role && e.ADMIN_USER && e.ADMIN_PASSWORD && safeEq(user, e.ADMIN_USER) && safeEq(password, e.ADMIN_PASSWORD)) role = 'admin';
  if (!role) { await new Promise(r => setTimeout(r, 500)); return res.status(401).json({ error: 'bad credentials' }); }
  res.json({ token: sign(role), role });
}
