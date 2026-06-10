// Funzione serverless Vercel: /api/tts
// Riceve { text, voice, rate } e restituisce audio MP3 da voci neurali Microsoft
// (qualità Azure) tramite il motore gratuito di Edge. NON serve alcuna chiave.

import { synthesize, VOICES } from "../lib/tts.mjs";

export default async function handler(req, res) {
  // Health-check: il client lo usa all'avvio. Nessuna chiave necessaria.
  if (req.method === "GET") {
    res.status(200).json({ configured: true, provider: "microsoft", voices: Object.keys(VOICES) });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== "object") body = {};

  const text = (body.text == null ? "" : String(body.text)).trim();
  if (!text) { res.status(400).json({ error: "empty_text" }); return; }

  try {
    const audio = await synthesize({ text, voice: body.voice, rate: body.rate });
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    res.status(200).send(audio);
  } catch (err) {
    res.status(502).json({ error: "tts_error", status: err.status || 0, detail: String(err && err.message || err).slice(0, 200) });
  }
}
