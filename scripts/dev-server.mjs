// Dev-server locale: serve i file statici E la funzione /api/tts (come su Vercel),
// così puoi provare in locale la voce neurale. Avvio:
//   node scripts/dev-server.mjs
// Nessuna chiave necessaria (voci Microsoft gratuite via Edge).

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { synthesize, VOICES } from "../lib/tts.mjs";

const ROOT = process.cwd();
const PORT = process.env.PORT || 5050;
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function readBody(req) {
  return new Promise(function (resolve) {
    let d = ""; req.on("data", function (c) { d += c; }); req.on("end", function () { resolve(d); });
  });
}

const server = http.createServer(async function (req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/tts") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ configured: true, provider: "microsoft", voices: Object.keys(VOICES) }));
      return;
    }
    if (req.method !== "POST") { res.writeHead(405); res.end(); return; }
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      const text = (body.text || "").toString().trim();
      if (!text) { res.writeHead(400); res.end(); return; }
      const audio = await synthesize({ text, voice: body.voice, rate: body.rate });
      res.writeHead(200, { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" });
      res.end(audio);
    } catch (err) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "tts_error", status: err.status || 0, detail: String(err && err.message || err).slice(0, 200) }));
    }
    return;
  }

  // file statici (con "clean URL": /prova-voci -> prova-voci.html, come su Vercel)
  let p = decodeURIComponent(url.pathname);
  if (p === "/") p = "/index.html";
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  try {
    let data;
    try {
      data = await readFile(file);
    } catch (e1) {
      if (path.extname(file)) throw e1;   // aveva già un'estensione: 404
      file = file + ".html";              // prova ad aggiungere .html
      data = await readFile(file);
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch (e) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("Not found"); }
});

server.listen(PORT, function () {
  console.log("Dev server avviato:  http://localhost:" + PORT);
  console.log("Voci neurali Microsoft (Edge): ATTIVE ✅ — nessuna chiave necessaria");
});
