import { getLive } from './_lib.js';
export default async function handler(req, res) {
  try { res.setHeader('Cache-Control', 's-maxage=300'); res.json(await getLive()); }
  catch (e) { res.status(502).json({ error: String(e) }); }
}
