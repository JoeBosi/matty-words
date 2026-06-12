# Matty Words — percorso di allenamento uditivo per portatori di impianto cocleare

Nome pubblico dell'app: **Matty Words**. Sottotitolo: "allenamento all'ascolto".

Web app per imparare, gradino dopo gradino, a interpretare le informazioni che
arrivano al cervello dall'impianto cocleare. Pensata per **tutti** (bambini e adulti),
incluso chi è stato **attivato da poco** e sente ancora poco/nulla.
**Non è un dispositivo medico**: è un supporto da affiancare al lavoro di
logopedista/audiologo; percorso e risultati andrebbero condivisi con loro.

## Architettura: PERCORSO a tappe (scala di Erber)

L'app è una **mappa di gioco** (una sola schermata, niente scroll) con 6 tappe.
Profilo iniziale al primo avvio: bimbo/adulto + da quanto è attivo l'impianto
(decide la tappa di partenza). Tutto salvato in localStorage.

1. **f0 — 🔔 C'è un suono!** (consapevolezza) — suoni sintetici salienti (tamburo,
   fischio, tono basso, generati con Web Audio: funzionano offline). Tocca quando senti.
   8 prove. ATTIVA.
2. **f1 — 🎵 Lo senti?** (detezione fine) — toni brevi/deboli a 250–4000 Hz,
   20% prove "trabocchetto" (silenzio: successo = non toccare). 10 prove.
   Include il **Check di Ling** (m·u·a·i·sc·s pronunciati dalla voce TTS; registra
   quali frequenze sono percepite). ATTIVA.
3. **f2 — ⚖️ Uguali o diversi?** (discriminazione) — coppie minime e soprasegmentali. IN ARRIVO.
4. **f3 — 👉 Indicalo!** (identificazione) — 2–4 carte con figure (emoji), tocca quella giusta. IN ARRIVO.
5. **f4 — 🗣️ Ripeti!** (produzione) — normale (parola a schermo) e difficile (solo audio,
   open-set); il microfono trascrive ma **l'adulto è il giudice** (✓/✗). IN ARRIVO.
6. **f5 — 🧠 Capiscilo!** (comprensione) — ordini eseguibili, ascolto nel rumore. IN ARRIVO.

Stelle per tappa (≥85%=3⭐, ≥65%=2⭐, ≥40%=1⭐); f0 con ≥2⭐ sblocca f1.
Mascotte: il logo Matty (SVG) che "respira" durante l'attesa; emoji per i feedback
(🎉 sentito · 🙈 falso allarme · 💤 mancato · 🤫 trabocchetto superato · 🏆 traguardo).

## Registro e "termometro" (etica)

Ogni sessione salva: data, fase, prove, riuscite, falsi allarmi, dettaglio
(es. Ling per suono), **uscita audio usata** e voce. Visibile in ⚙ → Registro,
**export CSV** per la logopedista. Se le ultime 3 sessioni di detezione hanno 0
riuscite → nota CALMA che suggerisce di mostrare i dati al centro impianti.
L'app **non diagnostica mai** ("l'impianto non funziona" è vietato): suggerisce solo
di parlarne coi professionisti. I dati sono confrontabili solo a parità di
dispositivo/volume/uscita (avviso nel librino).

## Regola di design fondamentale (aggiornata)

Banner di stato SEMPRE visibile (icona+testo) — chi non sente deve capire lo stato.
**Eccezione voluta (detezione)**: durante le prove di f0/f1/Ling lo stato NON dice
"sto suonando" e niente barre animate — un indizio visivo svuoterebbe l'esercizio.
Lo stato resta neutro («🎧 tocca appena senti») e il riscontro arriva DOPO la risposta.

## Comandi
- **Tocco sul palco** o **barra spaziatrice** = "ho sentito!" durante le prove.
- Pulsanti: ‹ Mappa · Inizia/Ancora · Check di Ling (solo f1).

## Stack
- Statico + serverless per **Vercel**, file unico `index.html` (vanilla, no build).
  - `api/tts.js` + `lib/tts.mjs` — TTS neurale **Microsoft** gratuito via `msedge-tts`
    (motore di Edge), **nessuna chiave**. `scripts/dev-server.mjs` per il locale.
  - **PWA**: `manifest.webmanifest`, `sw.js`, `icons/`; banner d'installazione
    Android (prompt nativo) e iOS (istruzioni).
- Audio: Web Audio (GainNode = volume ok su iOS; sblocco nel gesto; su iOS "ponte"
  MediaStream→`<audio>` per scegliere l'uscita con AirPlay). Selettore uscita nel
  badge in basso (Chrome: picker nativo; Edge: tendina; iOS: AirPlay).
- **Normalizzazione (regola di tutta l'app)**: OGNI suono (toni, tamburo, fischio,
  parole TTS) è generato/decodificato come buffer, normalizzato allo stesso livello
  (`normGain`: RMS target 0.12 + tetto picco 0.97) e POI moltiplicato per il volume
  dell'app (masterGain). Nessun suono più forte o più piano di un altro. I suoni sono
  generati come buffer (`makeSine/makeDrum/makeWhistle`) e suonati con `playSound`.
- Voci TTS con nomi Dragon Ball: Goku/Vegeta (maschili), Chichi/Laura (femminili).
- **Registrazioni umane** (Lingua Libre/Wikimedia, CC-BY-SA) torneranno nelle fasi
  f2–f4 per le parole: il codice di ricerca/normalizzazione è in `VersioneUno`.
- localStorage: `aa.settings.v1`, `aa.profile.v1`, `aa.progress.v1`, `aa.sessions.v1`.

## Variabili d'ambiente
Nessuna.

## Prova in locale
`node scripts/dev-server.mjs` → http://localhost:5050 (`prova-voci.html` = test voci).

## Branch
- `main` = versione 2 (percorso). - `VersioneUno` = vecchia app a 3 modalità (stabile).

## Backlog
- [ ] f2 Uguali/Diversi (coppie minime per contrasto, soprasegmentali).
- [ ] f3 Indicalo! (carte emoji, 2→4 alternative, somiglianza acustica crescente).
- [ ] f4 Ripeti! (mic + adulto-giudice). f5 Capiscilo! (ordini, rumore graduale).
- [ ] Difficoltà adattiva (ripeti gli errori, sali sopra l'80%).
- [ ] Grafico dei progressi nel registro (oltre al CSV).
- [ ] Modalità confronto microfono vs streaming Bluetooth (stesso esercizio, registri separati).

## Contesto
Interfaccia SOLO in italiano. Origine: un bambino con impianto Cochlear Nucleus che in
streaming Bluetooth percepisce solo suoni indistinti; ora pensata per tutti gli impiantati.
