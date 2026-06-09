# Allenamento all'ascolto — strumento per portatori di impianto cocleare

Web app di pratica/allenamento uditivo, pensata anche per bambini piccoli che non
sanno ancora descrivere cosa sentono. **Non è un dispositivo medico**: è un supporto
da affiancare al lavoro di logopedista/audiologo; gli esercizi andrebbero validati da loro.

## Stack
- Progetto statico + serverless per **Vercel**:
  - `index.html` — tutta l'app (HTML + CSS + JavaScript vanilla, nessun build).
  - `api/tts.js` — funzione serverless: riceve testo+voce+velocità e restituisce
    audio MP3 da **Azure Speech**. La chiave sta SOLO lato server (env var).
- Audio:
  - **TTS cloud**: Azure Speech (voci neurali it-IT) via `/api/tts`, riprodotto con
    **Web Audio API** (decodeAudioData → BufferSource → GainNode per il volume,
    funziona anche su iOS). Cache lato client per testo+voce+velocità.
  - **Ripiego**: se la chiave Azure non è configurata (o la rete fallisce), usa
    `SpeechSynthesis` del browser. Il badge "engine" in UI mostra quale è attiva.
  - riconoscimento `SpeechRecognition` / `webkitSpeechRecognition` (modalità "Dì una parola").
- Font: Fredoka (display) + Inter (UI). Palette calma, alto contrasto.
- **localStorage**: salva liste (fonemi/parole) e impostazioni (voce, volume, velocità).

## Variabili d'ambiente (vedi `.env.example`)
- `AZURE_SPEECH_KEY` — chiave della risorsa Azure Speech (piano gratuito F0).
- `AZURE_SPEECH_REGION` — regione (es. `westeurope`).
Le 4 voci esposte: Isabella, Elsa (femminili), Diego, Giuseppe (maschili).

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
- Scelta voce (4 voci Azure quando il cloud è attivo).
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
