// Funzione serverless Vercel: /api/tts
// Riceve { text, voice, rate } e restituisce audio MP3 generato da Azure Speech.
// La chiave NON sta mai nel client: viene letta dalle variabili d'ambiente.
//   AZURE_SPEECH_KEY    = chiave della risorsa Speech
//   AZURE_SPEECH_REGION = regione della risorsa (es. westeurope)
// Se la chiave non è configurata risponde 503 { fallback:true }: il client
// userà la voce sintetica del browser.

// Le uniche voci ammesse (2 femminili + 2 maschili). Validate per evitare
// che il client inietti voci o markup arbitrari nello SSML.
const VOICES = new Set([
  "it-IT-IsabellaNeural", // femminile
  "it-IT-ElsaNeural",     // femminile
  "it-IT-DiegoNeural",    // maschile
  "it-IT-GiuseppeNeural", // maschile
]);
const DEFAULT_VOICE = "it-IT-IsabellaNeural";

function xmlEscape(s) {
  return s.replace(/[<>&'"]/g, function (c) {
    return { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c];
  });
}

// rate 0.5..1.2  ->  "-50%".."+20%" (SSML prosody)
function ratePct(r) {
  var n = Number(r);
  if (!isFinite(n) || n <= 0) n = 0.9;
  n = Math.max(0.5, Math.min(1.5, n));
  var p = Math.round((n - 1) * 100);
  return (p >= 0 ? "+" : "") + p + "%";
}

export default async function handler(req, res) {
  var key = process.env.AZURE_SPEECH_KEY;
  var region = process.env.AZURE_SPEECH_REGION || "westeurope";

  // Health-check: il client lo usa all'avvio per sapere se il cloud è attivo.
  if (req.method === "GET") {
    res.status(200).json({ configured: !!key, region: key ? region : null, voices: [...VOICES] });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!key) {
    res.status(503).json({ error: "not_configured", fallback: true });
    return;
  }

  var body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== "object") body = {};

  var text = (body.text == null ? "" : String(body.text)).slice(0, 300).trim();
  var voice = VOICES.has(body.voice) ? body.voice : DEFAULT_VOICE;
  var rate = ratePct(body.rate);
  if (!text) { res.status(400).json({ error: "empty_text" }); return; }

  var ssml =
    '<speak version="1.0" xml:lang="it-IT">' +
    '<voice name="' + voice + '">' +
    '<prosody rate="' + rate + '">' + xmlEscape(text) + "</prosody>" +
    "</voice></speak>";

  try {
    var r = await fetch(
      "https://" + region + ".tts.speech.microsoft.com/cognitiveservices/v1",
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "allenamento-ascolto",
        },
        body: ssml,
      }
    );
    if (!r.ok) {
      var detail = await r.text().catch(function () { return ""; });
      res.status(502).json({ error: "tts_failed", status: r.status, detail: detail.slice(0, 300) });
      return;
    }
    var audio = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    // Cache CDN/browser: stesso testo+voce -> stesso audio.
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    res.status(200).send(audio);
  } catch (err) {
    res.status(502).json({ error: "tts_error", detail: String(err).slice(0, 300) });
  }
}
