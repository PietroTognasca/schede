# Schede Coach Builder

Web app React + Vite per creare schede di allenamento personalizzate per amici, con approccio pratico da personal trainer.

## Funzionalita principali

- Creazione schede su misura in base a obiettivo, livello e disponibilita settimanale.
- Scelta del contesto allenamento: palestra, casa o ibrido.
- Filtro esercizi in base all attrezzatura disponibile.
- Linee guida settimanali automatiche (volume, recuperi, progressione).
- Archivio locale delle schede generate (salvataggio in localStorage).
- Copia rapida in testo per condividere il programma.

## Stack

- React 19
- TypeScript
- Vite
- GitHub Actions + GitHub Pages per deploy gratuito

## Sviluppo locale

1. Installa dipendenze:

   npm ci

2. Avvia ambiente di sviluppo:

   npm run dev

3. Build di produzione:

   npm run build

4. Anteprima build:

   npm run preview

## Deploy online su GitHub Pages

La repository include il workflow [Deploy To GitHub Pages](.github/workflows/deploy-pages.yml).

Per pubblicare:

1. Pusha il progetto sul branch main.
2. Vai nelle impostazioni della repository, sezione Pages.
3. Imposta Source su GitHub Actions.
4. Attendi il completamento della pipeline Actions.
5. Il sito sara disponibile su:

   https://<tuo-username>.github.io/<nome-repository>/

Nota: il file Vite config usa automaticamente il nome repository come base path quando builda su GitHub Actions.

## Struttura essenziale

- src/App.tsx: interfaccia e gestione stato applicazione.
- src/lib/planGenerator.ts: logica da personal trainer per generazione schede.
- .github/workflows/deploy-pages.yml: pipeline CI/CD per pubblicazione su GitHub Pages.
