# Allenamento all'ascolto 🎧

Web app di **pratica/allenamento uditivo** pensata per portatori di impianto
cocleare, anche bambini piccoli che non sanno ancora descrivere cosa sentono.

> ⚠️ **Non è un dispositivo medico.** È un supporto da affiancare al lavoro di
> logopedista/audiologo; gli esercizi andrebbero validati da loro.

## Cosa fa

Tre modalità, tutte con **banner di stato sempre visibile** (così, anche se non
si sente nulla, si capisce cosa sta facendo l'app) e gli stessi comandi:

- **Barra spaziatrice** o **tocco sul palco** = ascolta / risenti
- **← / →** (o i pulsanti ‹ ›) = elemento precedente / successivo

1. **Fonemi** — mostra la lettera, premi e la senti, scorri con ← →.
2. **Parole** — premi e senti la parola, poi avanzi con →.
3. **Dì una parola** — premi 🎤, pronuncia una parola: l'app la scrive grande e la
   fa sentire. Se il microfono non è disponibile, puoi **scriverla**.

## Voce: cloud (alta qualità) o ripiego

- **Con chiave Azure configurata**: usa le voci neurali italiane di **Azure Speech**
  (alta qualità), selezionabili dalle impostazioni: **Isabella** ed **Elsa**
  (femminili), **Diego** e **Giuseppe** (maschili). La chiave **non sta mai nel
  client**: viene letta da una funzione serverless `/api/tts`.
- **Senza chiave**: l'app ripiega automaticamente sulla **voce sintetica del
  browser**, così funziona comunque. Il badge in basso e le impostazioni mostrano
  sempre quale voce è attiva.

L'audio scaricato viene messo in **cache lato client** (per testo + voce + velocità)
per non riscaricarlo: meno latenza e meno consumo. Il volume usa la **Web Audio API
(GainNode)** così funziona anche su iOS Safari.

## Struttura del progetto

```
index.html        → tutta l'app (HTML + CSS + JS vanilla, nessun build)
api/tts.js        → funzione serverless Vercel: testo+voce → audio MP3 (Azure)
.env.example      → variabili d'ambiente da copiare
package.json      → metadati (Node ≥ 18, ESM)
```

## 1) Ottenere la chiave Azure (gratis)

Il piano **Free F0** di Azure Speech dà **500.000 caratteri/mese gratis**: per
questo uso (fonemi e parole brevi, con cache) il costo previsto è **€0**.

1. Vai su <https://portal.azure.com> → **Crea risorsa** → cerca **Speech**.
2. Crea la risorsa scegliendo il **piano gratuito F0** e una regione (es.
   *West Europe*).
3. Apri la risorsa → **Keys and Endpoint**: copia una **chiave** e la **regione**.

## 2) Avvio in locale

Serve la [Vercel CLI](https://vercel.com/docs/cli) per eseguire anche la funzione
`/api/tts` in locale:

```bash
npm i -g vercel        # installa la CLI (una volta sola)
cp .env.example .env    # poi inserisci AZURE_SPEECH_KEY e AZURE_SPEECH_REGION
vercel dev              # avvia su http://localhost:3000
```

> Senza chiave puoi comunque aprire `index.html` direttamente nel browser: l'app
> userà la voce del dispositivo (la funzione `/api/tts` non sarà disponibile).

## 3) Deploy su Vercel

**Via dashboard (consigliato):**

1. Vai su <https://vercel.com> → **Add New… → Project** → importa questo repo da GitHub.
2. Framework Preset: **Other** (nessun build necessario).
3. **Settings → Environment Variables**: aggiungi
   - `AZURE_SPEECH_KEY` = la tua chiave
   - `AZURE_SPEECH_REGION` = la tua regione (es. `westeurope`)
4. **Deploy**. Ad ogni `git push` Vercel ridistribuisce automaticamente.

**Via CLI:**

```bash
vercel                                   # primo deploy (collega il progetto)
vercel env add AZURE_SPEECH_KEY          # incolla la chiave
vercel env add AZURE_SPEECH_REGION       # es. westeurope
vercel --prod                            # deploy in produzione
```

## Variabili d'ambiente

| Nome | Esempio | Descrizione |
|------|---------|-------------|
| `AZURE_SPEECH_KEY` | `a1b2c3…` | Chiave della risorsa Azure Speech |
| `AZURE_SPEECH_REGION` | `westeurope` | Regione della risorsa |

Se non sono impostate, `/api/tts` risponde `503` e l'app usa la voce del browser.

## Note tecniche

- **Fonemi con voce sintetica**: vocali e consonanti continue (M, S, F, V, R, L)
  suonano bene; le occlusive (P, T, C, B, D, G) isolate sono quasi mute → meglio
  inserirle come sillabe (`PA | pa`). Per qualità clinica servirebbero registrazioni reali.
- **Modalità "Dì una parola"**: il riconoscimento (`SpeechRecognition`) richiede il
  permesso del microfono e funziona meglio su Chrome. C'è sempre il ripiego "scrivi la parola".
- Liste (fonemi/parole) e impostazioni (voce, volume, velocità) sono salvate in
  **localStorage** del browser.
