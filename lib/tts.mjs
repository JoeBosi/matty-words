// Nucleo TTS condiviso — voci neurali Microsoft (qualità Azure) tramite il motore
// gratuito usato da "Leggi ad alta voce" di Edge. NESSUNA chiave, nessuna fatturazione.
// Usato sia dalla funzione serverless Vercel (api/tts.js) sia dal dev-server locale.

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// 4 voci italiane: 2 femminili + 2 maschili (verificate dall'endpoint).
export const VOICES = {
  "it-IT-IsabellaNeural":             { gender: "f", label: "Isabella — femminile" },
  "it-IT-ElsaNeural":                 { gender: "f", label: "Elsa — femminile" },
  "it-IT-DiegoNeural":                { gender: "m", label: "Diego — maschile" },
  "it-IT-GiuseppeMultilingualNeural": { gender: "m", label: "Giuseppe — maschile" },
};
export const DEFAULT_VOICE = "it-IT-IsabellaNeural";

function clampRate(r) {
  let n = Number(r);
  if (!isFinite(n) || n <= 0) n = 0.9;
  return Math.max(0.5, Math.min(1.5, n));
}

// Un MP3 valido inizia con un tag ID3 ("ID3") o con il frame-sync MPEG (0xFF Ex/Fx).
// Serve a scartare i flussi corrotti/troncati che msedge-tts a volte restituisce.
function looksLikeMp3(buf) {
  if (!buf || buf.length < 800) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true; // "ID3"
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return true;            // frame sync
  return false;
}

// Una singola sintesi -> Buffer (può tornare vuoto/corrotto: lo valida chi chiama).
async function synthOnce(name, clean, rate) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(clean, { rate: clampRate(rate) });

  const chunks = [];
  await new Promise(function (resolve, reject) {
    const timer = setTimeout(function () { reject(Object.assign(new Error("tts_timeout"), { status: 504 })); }, 15000);
    audioStream.on("data", function (c) { chunks.push(c); });
    audioStream.on("end", function () { clearTimeout(timer); resolve(); });
    audioStream.on("error", function (e) { clearTimeout(timer); reject(Object.assign(e || new Error("tts_stream_error"), { status: 502 })); });
  });
  return Buffer.concat(chunks);
}

// Sintetizza testo -> Buffer MP3. Lancia un Error con .status in caso di problema.
// Se il primo risultato non è un MP3 valido (corrotto/troncato), riprova UNA volta.
export async function synthesize({ text, voice, rate }) {
  const name = VOICES[voice] ? voice : DEFAULT_VOICE;
  const clean = String(text == null ? "" : text).slice(0, 300);

  let buf = await synthOnce(name, clean, rate);
  if (!looksLikeMp3(buf)) {
    buf = await synthOnce(name, clean, rate); // secondo tentativo
  }
  if (!buf || !buf.length) throw Object.assign(new Error("empty_audio"), { status: 502 });
  if (!looksLikeMp3(buf)) throw Object.assign(new Error("bad_audio"), { status: 502 });
  return buf;
}
