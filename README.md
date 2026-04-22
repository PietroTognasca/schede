# Schede Coach Builder

Web app React + Vite pensata per personal trainer che vogliono:

- creare manualmente schede allenamento
- condividerle con i propri amici senza login e senza database
- pubblicare tutto online con GitHub Pages

## Come funziona il flusso

1. Landing pubblica:
   - mostra l elenco delle schede disponibili
   - ogni amico clicca il proprio nome e vede la scheda completa

2. Area Personal Trainer:
   - crei e modifichi le schede manualmente
   - organizzi i giorni
   - aggiungi esercizi da libreria con immagini e dettagli

3. Condivisione senza backend:
   - clic su `Copia Link Pubblico`
   - viene generato un URL unico con le schede codificate
   - invii quel link ai tuoi amici

## Libreria esercizi

La libreria usa un dataset open con centinaia di esercizi e immagini:

- source: free-exercise-db (GitHub)
- caricamento automatico lato client
- filtri per ricerca, muscolo, attrezzatura e livello

Se la connessione non e disponibile, l app usa una libreria locale ridotta di fallback.

## Stack

- React 19
- TypeScript
- Vite
- lz-string (per comprimere i piani nel link condivisibile)
- GitHub Actions + GitHub Pages

## Comandi locali

1. Installazione dipendenze

   npm ci

2. Avvio sviluppo

   npm run dev

3. Build produzione

   npm run build

4. Preview build

   npm run preview

## Deploy su GitHub Pages

Workflow incluso: [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)

Passaggi:

1. Push sul branch `main` (o `master`).
2. In repository settings, sezione Pages, imposta Source su `GitHub Actions`.
3. Attendi il completamento del workflow.
4. URL finale:

   https://<tuo-username>.github.io/<nome-repository>/

## Struttura file principale

- [src/App.tsx](src/App.tsx): landing pubblica + area trainer + gestione schede.
- [src/lib/exerciseLibrary.ts](src/lib/exerciseLibrary.ts): caricamento e mapping libreria esercizi con immagini.
- [src/lib/manualPlan.ts](src/lib/manualPlan.ts): modelli schede, serializzazione e condivisione link.
- [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml): build e deploy automatico.
