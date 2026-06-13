# Matty Words — percorso di allenamento uditivo per portatori di impianto cocleare

Nome pubblico dell'app: **Matty Words**. Sottotitolo: "allenamento all'ascolto".

Web app per imparare, gradino dopo gradino, a interpretare le informazioni che
arrivano al cervello dall'impianto cocleare. Pensata per **tutti** (bambini e adulti),
incluso chi è stato **attivato da poco** e sente ancora poco/nulla.
**Non è un dispositivo medico**: è un supporto da affiancare al lavoro di
logopedista/audiologo; percorso e risultati andrebbero condivisi con loro.

## Principio guida: AUTONOMIA

Chi si allena (bambino o adulto) usa l'app **da solo**: nessun esercizio richiede
una seconda persona che osservi o giudichi. Per questo NON esistono più: lo Step 0
«Mi senti?», il profilo bimbo/adulto, l'onboarding, il «Ripeti!» con adulto-giudice
e l'ascolto nel rumore. Nessuna distinzione di età: un'unica app uguale per tutti.

## Architettura: PERCORSO a tappe (scala di Erber) — TUTTE ATTIVE

L'app è una **mappa di gioco** (una sola schermata, niente scroll) con 6 tappe.
Si parte direttamente dalla mappa (niente onboarding). Tutto in localStorage.

1. **f0 — 🔔 C'è un suono!** (consapevolezza) — 6 suoni sintetici **lunghi e continui**
   (~2,6s: mucca 🐮, clacson 🚗, campanello 🔔, tamburo-rullo 🥁, uccellini 🐦, fischio 🎶
   — Web Audio, offline). Regola: la PRIMA tappa deve essere FACILE → suoni sostenuti,
   non colpi secchi; finestra per rispondere ampia (durata + 2,8s). Tocca quando senti →
   si RIVELA chi era e vinci la **figurina**. 8 prove.
2. **f1 — 🎵 Check di Ling** (detezione) — SOLO i 6 suoni di Ling (m·u·a·i·sc·s, voce
   TTS): tocca quando senti la voce. Stelle in base ai sentiti/6.
3. **f2 — ⚖️ Uguali o diversi?** (discriminazione) — due stimoli di fila, rispondi
   UGUALI/DIVERSI (pulsanti nella barra comandi). Soprasegmentali + coppie minime TTS.
   Filotto: 3+ giuste di fila → 🔥. Tocco sul palco = riascolta. 10 prove.
4. **f3 — 👉 Indicalo!** (identificazione) — 2→4 carte con figure (emoji), tocca quella
   detta. 3 volte giusta sulla stessa parola = **la carta entra nell'album**. 10 prove.
5. **f4 — ✍️ Scrivilo!** (ascolto aperto, autonomo) — la parola NON si vede: la ascolti
   e la SCRIVI. Confronto tollerante (maiuscole, accenti, 1 lettera nelle parole ≥5).
   Risposta giusta = carta **dorata**. 8 prove. (Sostituisce «Ripeti!»: niente giudice.)
6. **f5 — 🧠 Capiscilo!** (comprensione, SENZA rumore) — ordini eseguibili verificati
   dall'app: «tocca il gatto», «… e poi il sole». Difficoltà = lunghezza frase (1→3
   elementi), mai il rumore. 8 prove.

Stelle per tappa (≥85%=3⭐, ≥65%=2⭐, ≥40%=1⭐); ogni tappa con ≥2⭐ sblocca la successiva
(f0→f1→f2→f3→f4→f5). Coriandoli (confettiBurst) a fine sessione con ≥2⭐.
Mascotte: il logo Matty (SVG) che "respira" durante l'attesa.

## Gamification: l'Album di Matty (📒 sulla mappa)

Un'unica collezione attraversa l'app: **Suoni scoperti** (f0, una figurina per suono
rivelato) e **Carte delle parole** (f3 = carta normale dopo 3 risposte giuste,
f4 = carta dorata). Niente punti, monete, timer o classifiche — di proposito.
localStorage `aa.album.v1` {sounds, words, wprog}.

## Palestra (🎧 sulla mappa) — ascolto libero

Il posto calmo SENZA punteggio: scorri lettere/parole con ‹ › (o frecce) e ascolti
con tocco/Barra. Liste editabili in ⚙: fonemi `ETICHETTA | pronuncia` (es. `M | mmm`),
parole `parola | emoji` (l'emoji serve per le carte di f3/f5). Le stesse liste
alimentano f3/f4/f5. localStorage `aa.phon.v1`, `aa.words.v1`.

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
- **Tocco sul palco** o **barra spaziatrice** = "ho sentito!" (f0/f1) oppure
  "risenti" (f2/f3/f4/f5, Palestra).
- Pulsanti: ‹ Mappa · Inizia/Ancora (diventa «🔊 Risenti» durante f3/f4/f5) ·
  Uguali/Diversi (f2) · ‹ › (Palestra).

## Stack
- Statico + serverless per **Vercel**, file unico `index.html` (vanilla, no build).
  - `api/tts.js` + `lib/tts.mjs` — TTS neurale **Microsoft** gratuito via `msedge-tts`
    (motore di Edge), **nessuna chiave**. `scripts/dev-server.mjs` per il locale.
  - **PWA**: `manifest.webmanifest`, `sw.js`, `icons/`; banner d'installazione
    Android (prompt nativo) e iOS (istruzioni).
- Audio: Web Audio (GainNode = volume ok su iOS; sblocco nel gesto; su iOS "ponte"
  MediaStream→`<audio>` per scegliere l'uscita con AirPlay). Selettore uscita nel
  badge in basso (Chrome: picker nativo; Edge: tendina; iOS: AirPlay).
- **Scelta orecchio (L · L+R · R)**: toggle in basso che instrada il suono solo a
  sinistra, solo a destra o entrambi, via `StereoPannerNode` (`panNode`) inserito tra
  `masterGain` e l'uscita. «Entrambi» bypassa il panner (nessuna attenuazione); L/R
  azzerano davvero il canale opposto (verificato: pan ±1 → RMS dell'altro canale = 0).
  Utile per impianti mono/bilaterali e per allenare un orecchio per volta. Stato in
  `earSide` (localStorage); nascosto se il browser non ha `createStereoPanner`.
- **Normalizzazione (regola di tutta l'app)**: OGNI suono (toni, tamburo, fischio,
  parole TTS) è generato/decodificato come buffer, normalizzato allo stesso livello
  (`normGain`: RMS target 0.12 + tetto picco 0.97) e POI moltiplicato per il volume
  dell'app (masterGain). Nessun suono più forte o più piano di un altro. I suoni sono
  generati come buffer (`makeSine/makeDrum/makeWhistle`) e suonati con `playSound`.
- Voci TTS con nomi Dragon Ball: Goku/Vegeta (maschili), Chichi/Laura (femminili).
- **Registrazioni umane** (Lingua Libre/Wikimedia, CC-BY-SA) potranno tornare per le
  parole: il codice di ricerca/normalizzazione è in `VersioneUno`.
- localStorage: `aa.settings.v1`, `aa.progress.v1`, `aa.sessions.v1`, `aa.phon.v1`,
  `aa.words.v1`, `aa.album.v1` (il vecchio `aa.profile.v1` viene rimosso all'avvio).

## Variabili d'ambiente
Nessuna.

## Prova in locale
`node scripts/dev-server.mjs` → http://localhost:5050 (`prova-voci.html` = test voci).

## Branch
- `main` = versione 2 (percorso). - `VersioneUno` = vecchia app a 3 modalità (stabile).

## Backlog
- [x] f2 Uguali/Diversi, f3 Indicalo!, f4 Scrivilo!, f5 Capiscilo!: FATTE (tutte le tappe attive).
- [x] Palestra (ascolto libero con liste editabili) e Album figurine: FATTI.
- [x] Difficoltà adattiva (f3/f4): coda errori `aa.err.v1`, le parole sbagliate tornano
      ~50% delle volte finché non vengono recuperate (errAdd/errSub/pickTarget).
- [x] Grafico dei progressi in ⚙ → Registro: barrette per tappa, ultime 12 sessioni
      (renderRegChart; colori: ≥65% teal, ≥40% arancio).
- [x] Distrattori di f3 per somiglianza acustica (simScore: iniziale, rima, lunghezza,
      vocali): prove 1–3 distrattori dissimili, 8–10 i più simili al bersaglio.
- [ ] Modalità confronto microfono vs streaming Bluetooth (stesso esercizio, registri separati).

## Contesto
Interfaccia SOLO in italiano. Origine: un bambino con impianto Cochlear Nucleus che in
streaming Bluetooth percepisce solo suoni indistinti; ora pensata per tutti gli impiantati.
