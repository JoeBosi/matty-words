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

1. **f0 — 🔔 C'è un suono!** (consapevolezza) — 6 suoni **REALI** (registrazioni vere
   CC da Wikimedia, ~2–3s in `sounds/*.mp3`: mucca 🐮, clacson 🚗, campanello 🔔,
   tamburo 🥁, uccellini 🐦, fischio 😗; crediti in `sounds/CREDITS.md`). Le emoji
   "tornano col suono" (icona = sorgente). Decodificati e normalizzati nella STESSA
   pipeline degli altri suoni; sintetici (make*) come fallback se il file non è ancora
   in cache. Caricati in cache PWA + preload all'avvio sessione.
   **Varietà** (`f0PickVaried`): si pesca da un "sacchetto" mescolato → un giro completo
   di tutti i suoni prima di ripetere, mai due volte di fila lo stesso. Regola: la PRIMA
   tappa deve essere FACILE → suoni sostenuti, non colpi secchi; finestra per rispondere
   ampia (durata + 2,2s). Tocca quando senti → si RIVELA chi era e vinci la **figurina**. 8 prove.
2. **f1 — 🎵 Check di Ling** (identificazione) — 6 icone sempre visibili (M·U·A·I·SC·S);
   i 6 suoni di Ling (voce TTS) **girano di continuo** (gap brevi) e si tocca la lettera
   corrispondente. Pick giusto = chip verde; sbagliato = rosso + si rivela quello giusto.
   Tocco sul palco = risenti. Stelle in base ai riconosciuti/6.
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

Stelle per tappa (≥85%=3⭐, ≥65%=2⭐, ≥40%=1⭐) come **traccia dei progressi**.
**Tutte le tappe sono SEMPRE accessibili** (nessun lucchetto): chi si allena sceglie da
dove partire (`isUnlocked` ritorna sempre vero). Coriandoli (confettiBurst) a fine sessione con ≥2⭐.
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

## Registro e "termometro"

Ogni sessione salva: data, fase, prove, riuscite, falsi allarmi, dettaglio
(es. Ling per suono), **uscita audio usata** e voce. Visibile in ⚙ → «Le tue sessioni»,
con **export** (CSV sotto il cofano, pulsante «⬇️ Salva lo storico»). Se le ultime 3
sessioni di detezione hanno 0 riuscite → nota CALMA, **non clinica**: suggerisce di
alzare il volume / usare le cuffie / cambiare uscita (niente «mostra alla logopedista»).
L'app **non diagnostica mai**.

**Niente gergo clinico nell'interfaccia (regola).** Su richiesta dell'utente l'app NON
si presenta come strumento medico: nei testi utente niente «tecnico/logopedista/
audiologo/audiogramma/spettro/Erber/dispositivo medico». Il librino è «📖 Come funziona»
(spiegazione da gioco, con un **grafico della voce nelle frequenze**). La vecchia prova
«Profilo per banda» è ora **«🎚️ Tutti i suoni»** (dai gravi agli acuti) — stessa logica,
zero gergo; evidenzia la fascia 250 Hz–4 kHz come «dove sta la voce» (`.specbar.voice` +
`#speechCap`). (Il contesto clinico resta solo qui nel CLAUDE/README per noi sviluppatori.)

## Regola di design fondamentale (aggiornata)

Banner di stato SEMPRE visibile (icona+testo) — chi non sente deve capire lo stato.
**Eccezione voluta (detezione f0)**: durante le prove di f0 lo stato NON dice
"sto suonando" e niente barre animate — un indizio visivo svuoterebbe l'esercizio.
In f1 (identificazione) le 6 icone sono visibili ma lo stato non rivela MAI quale suono
sta partendo. Lo stato resta neutro e il riscontro arriva DOPO la risposta.

## Comandi
- **Tocco sul palco** o **barra spaziatrice** = "ho sentito!" (f0) / "risenti" (f1 e
  f2/f3/f4/f5, Palestra).
- Barra comandi: ‹ Mappa · Inizia/Ancora (diventa «🔊 Risenti» durante f3/f4/f5) ·
  Uguali/Diversi (f2). **Frecce ‹ ›** della Palestra: minimal, ai due lati del palco.
- **Riga unica in basso** (compatta): chip **voce** (tocco = cicla le 4 voci) · chip
  **uscita audio** · chip **orecchio** (mostra solo lo stato attivo; tocco = cicla
  L+R → L → R). Niente etichette lunghe: solo icone + stato.

## Stack
- Statico + serverless per **Vercel**, file unico `index.html` (vanilla, no build).
  - `api/tts.js` + `lib/tts.mjs` — TTS neurale **Microsoft** gratuito via `msedge-tts`
    (motore di Edge), **nessuna chiave**. `scripts/dev-server.mjs` per il locale.
  - **PWA**: `manifest.webmanifest`, `sw.js`, `icons/`. Installazione: **campo in cima
    a ⚙ Impostazioni** (`installField`/`setupInstallUI`) con prompt nativo a un clic
    (`beforeinstallprompt` salvato in `pwaDeferred`: Chrome/Edge/Android) o istruzioni
    native su iOS («Condividi → Aggiungi a Home»). Resta anche il banner in basso.
- Audio: Web Audio (GainNode = volume ok su iOS; sblocco nel gesto; su iOS "ponte"
  MediaStream→`<audio>` per scegliere l'uscita con AirPlay). Selettore uscita nel
  badge in basso (Chrome: picker nativo; Edge: tendina; iOS: AirPlay).
- **Scelta orecchio (L · L+R · R)**: **un solo chip** in basso (`earChip`) che mostra
  SOLO lo stato attivo; ogni tocco cicla L+R → L → R (`cycleEar`). Instrada il suono via
  `StereoPannerNode` (`panNode`) tra `masterGain` e l'uscita. «Entrambi» bypassa il panner
  (nessuna attenuazione); L/R azzerano davvero il canale opposto (verificato: pan ±1 → RMS
  dell'altro canale = 0). Stato in `earSide` (localStorage); il chip è nascosto se il
  browser non ha `createStereoPanner`. Voce, uscita audio e orecchio stanno in **un'unica
  riga** in basso (`.botbar`/`.bchip`).
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
