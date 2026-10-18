import crypto from 'crypto';
const mac = p => crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update(p).digest('base64url');
export function sign(role) {
  const p = Buffer.from(JSON.stringify({ role, exp: Date.now() + 12 * 3600e3 })).toString('base64url');
  return p + '.' + mac(p);
}
export function verify(req) {
  if (!process.env.SESSION_SECRET) return null;
  const [p, s] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
  if (!p || !s) return null;
  const a = Buffer.from(s), b = Buffer.from(mac(p));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url')); return d.exp > Date.now() ? d : null; } catch { return null; }
}
export const safeEq = (a, b) => crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(), crypto.createHash('sha256').update(String(b)).digest());
