# Matty Words — allenamento all'ascolto per portatori di impianto cocleare

Nome pubblico dell'app: **Matty Words**. Sottotitolo/descrizione: "allenamento all'ascolto".

Web app di pratica/allenamento uditivo, pensata anche per bambini piccoli che non
sanno ancora descrivere cosa sentono. **Non è un dispositivo medico**: è un supporto
da affiancare al lavoro di logopedista/audiologo; gli esercizi andrebbero validati da loro.

## Stack
- Progetto statico + serverless per **Vercel**:
  - `index.html` — tutta l'app (HTML + CSS + JavaScript vanilla, nessun build).
  - `api/tts.js` — funzione serverless: testo+voce+velocità → audio MP3 dalle voci
    neurali **Microsoft** (qualità Azure) tramite il motore gratuito di Edge.
    **NESSUNA chiave**, nessuna fatturazione.
  - `lib/tts.mjs` — nucleo TTS condiviso (Vercel + dev-server), usa il pacchetto `msedge-tts`.
  - `scripts/dev-server.mjs` — server locale che replica `/api/tts` (con "clean URL").
  - **PWA**: `manifest.webmanifest`, `sw.js` (service worker), `icons/`. Installabile,
    avvio a schermo intero; il SW mette in cache la shell + font + audio umani (offline).
- Audio, in ordine di priorità:
  - **PAROLE**: registrazioni **umane reali** da **Lingua Libre/Wikimedia Commons**
    (Q652 = italiano), cercate al volo, **normalizzate in volume** (RMS + tetto picco)
    e riusate. URL salvati in localStorage. Speaker diversi = varietà (apprezzata).
  - **FONEMI/SILLABE e parole senza registrazione**: **TTS Microsoft** (voci Isabella/
    Elsa/Diego/Giuseppe) via `/api/tts`. File audio → niente troncamenti, velocità regolabile.
  - **Ultimo ripiego** (se `/api/tts` non raggiungibile e nessuna registrazione):
    `SpeechSynthesis` del browser (con fix per il taglio di fine parola). Il badge
    "engine" mostra quale voce è in uso: umana / cloud / dispositivo.
  - Riproduzione con **Web Audio API** (decode → BufferSource → GainNode, ok su iOS).
  - Riconoscimento `SpeechRecognition` / `webkitSpeechRecognition` (modalità "Dì una parola").
- Font: Fredoka (display) + Inter (UI). Palette calma, alto contrasto.
- **localStorage**: liste (fonemi/parole), impostazioni (voce, volume, velocità), URL audio umani.

## Variabili d'ambiente
Nessuna. Le voci Microsoft sono gratuite e senza chiave (anche su Vercel).
Le 4 voci esposte: Isabella, Elsa (femminili), Diego, Giuseppe (maschili).

## Prova in locale
`node scripts/dev-server.mjs` → http://localhost:5050
- `index.html` = app. `prova-voci.html` = pagina per scegliere voce/velocità e sentire le sillabe.

## Regola di design fondamentale (non rimuovere)
In **ogni** modalità deve essere SEMPRE visibile a schermo cosa sta facendo l'app,
tramite un banner di stato colorato con icona + testo:
👆 premi · 🔊 sto suonando · ✓ premi per risentire · ⏳ aspetta che ripeta · 🎤 in ascolto · ⚠️ errore.
Serve perché se l'utente non sente, deve comunque capire lo stato (suono sì / suono no / attesa).

## Comandi (identici in tutte le modalità)
- **Barra spaziatrice** o **tocco sul palco** = ascolta / risenti. Ogni pressione rifà sentire.
- **← / →** (o pulsanti ‹ ›) = elemento precedente / successivo.

## Le 3 modalità
1. **Fonemi** — mostra a schermo la lettera/le lettere; premi e la senti; scorri con ← →.
   Lista editabile (formato `ETICHETTA | come pronunciarlo`, es. `M | mmm`).
2. **Parole** — premi e senti la parola; dopo l'app entra in stato "⏳ aspetta che ripeta",
   poi si avanza con →. Lista parole editabile.
3. **Dì una parola** — l'adulto preme 🎤 e pronuncia una parola; l'app la **scrive** grande
   a schermo e poi **la fa sentire** (sintesi). La barra la fa risentire.
   Fallback: se il microfono non è disponibile/autorizzato, compare un campo per **scrivere**
   la parola (che viene comunque mostrata e pronunciata).

## Impostazioni (icona ⚙)
- Scelta voce dei fonemi (4 voci neurali Microsoft con nomi "Dragon Ball": Goku/Vegeta=
  maschili, Chichi/Laura=femminili — solo etichette, non i veri doppiatori). Le PAROLE
  usano una rosa casuale (umane Lingua Libre + le 4 voci TTS), senza ripetere la precedente;
  in basso è mostrata la voce che sta parlando.
- **Uscita audio**: scelta del dispositivo via `AudioContext.setSinkId` (Chrome/Edge
  desktop; `selectAudioOutput()` se c'è). Metodi sperimentali per iOS: "Prova A" (clip via
  elemento `<audio>`) e "Prova B" (ponte Web Audio→MediaStream→`<audio>`), con pulsante
  AirPlay (`webkitShowPlaybackTargetPicker`). Su iOS lo standard non può scegliere l'uscita.
- Volume (Web Audio GainNode) e velocità della voce (rate, default 0.9).
- Editor liste fonemi e parole. Tutto salvato in localStorage.

## Stato attuale
App pubblicabile su Vercel con le 3 modalità, comandi tastiera+tocco, banner di stato,
TTS cloud Azure con ripiego sulla voce del browser, volume Web Audio, scelta voce,
persistenza localStorage, fallback testo per la modalità 3.

## Limitazioni note
- **Fonemi con voce sintetica**: vocali e consonanti continue (M, S, F, V, R, L) suonano bene;
  le occlusive (P, T, C, B, D, G) isolate sono quasi mute → inserirle come sillabe (`PA | pa`).
  Per qualità clinica andrebbero sostituite con **registrazioni reali**.
- **Modalità 3**: `SpeechRecognition` richiede permesso microfono e funziona meglio su Chrome.

## Prossimi passi / backlog
- [x] Salvare liste e impostazioni in modo persistente (localStorage).
- [x] TTS cloud di qualità (Azure) con scelta voce, volume, ripiego browser.
- [ ] **Registro dei progressi esportabile** (es. CSV/Excel) da portare al logopedista.
- [ ] Possibilità di caricare/registrare audio reali al posto della sintesi.
- [ ] Altre modalità dalla scaletta: discriminazione "uguale/diverso", soprasegmentali
      (lungo/corto, acuto/grave, ritmo), suoni ambientali, coppie minime, ascolto nel rumore,
      "chi parla?", e una modalità di confronto microfono vs streaming Bluetooth.
- [ ] Modalità bambino vs adulto/terapista.

## Contesto utente
Interfaccia in **italiano**. Origine: un bambino con impianto Cochlear Nucleus che in
streaming Bluetooth percepisce solo suoni indistinti; da qui l'idea dello strumento.
