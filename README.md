# Matty Words 🎧

Web app di **pratica/allenamento uditivo** pensata per portatori di impianto
cocleare, anche bambini piccoli che non sanno ancora descrivere cosa sentono.

> ⚠️ **Non è un dispositivo medico.** È un supporto da affiancare al lavoro di
> logopedista/audiologo; gli esercizi andrebbero validati da loro.

## Cosa fa

Tre modalità, tutte con **banner di stato sempre visibile** (così, anche se non
si sente nulla, si capisce cosa sta facendo l'app) e gli stessi comandi:

- **Barra spaziatrice** o **tocco sul palco** = ascolta / risenti
- **← / →** (o i pulsanti ‹ ›) = elemento precedente / successivo

1. **Fonemi** — mostra la lettera/sillaba, premi e la senti, scorri con ← →.
2. **Parole** — premi e senti la parola, poi avanzi con →.
3. **Dì una parola** — premi 🎤, pronuncia una parola: l'app la scrive grande e la
   fa sentire. Se il microfono non è disponibile, puoi **scriverla**.

## Da dove arriva l'audio (in ordine di priorità)

1. **Parole → voce umana reale.** Le parole usano registrazioni di madrelingua da
   **Lingua Libre / Wikimedia Commons** (licenza CC-BY-SA), cercate al volo,
   **normalizzate nel volume** e riusate (gli URL trovati restano in `localStorage`).
   Speaker diversi = varietà naturale.
2. **Fonemi/sillabe e parole senza registrazione → TTS Microsoft.** Voci neurali
   italiane (qualità Azure) tramite il motore gratuito usato da "Leggi ad alta voce" di
   Edge, via la funzione serverless `/api/tts`. **Nessuna chiave, nessuna fatturazione.**
   File audio reali → le parole **non vengono troncate** e la velocità è regolabile per
   scandire. Voci: **Isabella, Elsa** (femminili), **Diego, Giuseppe** (maschili).
3. **Ultimo ripiego → voce del browser** (`SpeechSynthesis`), solo se `/api/tts` non è
   raggiungibile e non c'è registrazione. Il badge in basso indica sempre la voce in uso.

Il volume usa la **Web Audio API (GainNode)**, così funziona anche su iOS Safari.

**Uscita audio:** nelle impostazioni (⚙) si può scegliere il dispositivo di uscita
(altoparlante, cuffie, Bluetooth…) su **Chrome/Edge desktop**. Su **iPhone/iPad** il
web non può cambiarla: l'uscita si sceglie dalle impostazioni di sistema (Centro di
Controllo → AirPlay, o Bluetooth).

## Struttura del progetto

```
index.html            → l'app (HTML + CSS + JS vanilla, nessun build)
prova-voci.html       → pagina per provare/scegliere le voci e le sillabe
api/tts.js            → funzione serverless Vercel: testo+voce → MP3 (Microsoft)
lib/tts.mjs           → nucleo TTS condiviso (pacchetto msedge-tts)
scripts/dev-server.mjs→ server locale che replica /api/tts per lo sviluppo
manifest.webmanifest  → PWA: nome, icone, schermo intero
sw.js                 → service worker: cache offline (shell + font + audio umani)
icons/                → icone dell'app (192, 512, maskable, apple-touch)
```

## App installabile (PWA)

L'app è una **Progressive Web App**: si può installare sul telefono o sul PC e si
avvia a schermo intero come un'app normale, con la sua icona.

- **Android / Chrome / Edge**: apri il sito → menu → *Installa app* / *Aggiungi a schermo Home*.
- **iPhone / iPad (Safari)**: apri il sito → *Condividi* → *Aggiungi a Home*.

Il service worker tiene in cache l'interfaccia, i font e le **registrazioni umane già
ascoltate**, così l'app si apre e le parole già usate si sentono **anche offline**.
(La sintesi neurale di parole/sillabe nuove richiede la rete.)

## 1) Avvio in locale

Nessuna chiave da configurare. 🎉

```bash
npm install                 # installa msedge-tts
node scripts/dev-server.mjs # avvia su http://localhost:5050
```

Apri **http://localhost:5050** (l'app) oppure
**http://localhost:5050/prova-voci.html** (per scegliere voce e velocità).

## 2) Deploy su Vercel

1. <https://vercel.com/new> → importa il repo da GitHub.
2. Framework Preset: **Other** (nessun build, nessuna variabile d'ambiente da impostare).
3. **Deploy**. Ogni `git push` ridistribuisce automaticamente.

Via CLI: `npm i -g vercel` poi `vercel --prod`.

## Variabili d'ambiente

Nessuna: le voci Microsoft sono gratuite e non richiedono chiavi.

## Note tecniche

- **Sillabe / occlusive**: con il TTS le occlusive isolate (P, T, C, B, D, G) rendono
  meglio come sillabe (`PA | pa`). Con Google la velocità è regolabile per scandirle.
- **Crediti audio umani**: le registrazioni vengono da Lingua Libre/Commons (CC-BY-SA):
  in un deploy pubblico va aggiunta una pagina/crediti con gli autori.
- **Modalità "Dì una parola"**: `SpeechRecognition` richiede il permesso del microfono
  e funziona meglio su Chrome. C'è sempre il ripiego "scrivi la parola".
- Liste e impostazioni sono salvate in **localStorage**.
