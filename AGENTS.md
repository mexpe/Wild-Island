# Istruzioni operative

- Privilegiare soluzioni semplici e affidabili. Contenere il consumo di token senza compromettere il corretto funzionamento.
- Consultare soltanto i file pertinenti; evitare analisi complete e ripetute della repository quando non necessarie.
- Riutilizzare codice e componenti esistenti; apportare modifiche circoscritte, evitando riscritture e refactoring non necessari.
- Non anticipare funzionalità future; non creare file, classi o sistemi inutilizzati; evitare dipendenze superflue.
- TypeScript rigoroso, Canvas 2D nativo e Vite. Mantenere separati simulazione e rendering: il renderer legge lo stato, un solo ciclo aggiorna la nave in entrambe le modalità.
- Coordinate del personaggio locali; coordinate della nave nel mondo. Non ricreare o azzerare la nave nei cambi di modalità. Griglia in src/layout.ts, parametri in src/state.ts.
- Mantenere la documentazione sintetica e aggiornata; eseguire verifiche proporzionate: npm test e npm run build per modifiche alla logica, prova browser per input/rendering.
- Fornire resoconti finali sintetici. Non utilizzare servizi a pagamento senza autorizzazione.
- Richiedere conferma prima di operazioni distruttive o modifiche sostanziali alle meccaniche approvate.
- Usare il checkout esistente: ogni task cloud è isolato; non creare worktree salvo richiesta esplicita. Lavorare su branch dedicati, senza merge automatici su main.
- Fermarsi alla versione richiesta. Nessun motore esterno, asset esterno, backend o sistema futuro parzialmente implementato nella V0.1.
