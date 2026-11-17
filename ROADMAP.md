# Stato · V0.2

V0.2: zoom spaziale fluido con rotellina, limiti 0.25×–3×, livello persistente tra le modalità e indicazione HUD; nessuna modifica alla fisica.

Già implementati: esplorazione interna, collisioni, console interattiva, pilotaggio inerziale, frenata e rotazione, transizioni ripetibili, simulazione persistente della stessa nave, stelle procedurali stabili, HUD minimo e ridimensionamento Canvas ad alta densità.

Verificati: 10 test di simulazione, zoom e rendering; build TypeScript/Vite; prova Chromium di zoom in/out, limiti, persistenza tra le modalità, interni invariati, blocco dello scroll, HUD e resize, senza errori JavaScript. Il prototipo è destinato a browser desktop con tastiera; nessun supporto mobile o salvataggio. Lunghe sospensioni della scheda non vengono simulate retroattivamente.

Possibili prossimi obiettivi da approvare: regolazione dei parametri di movimento e valutazione dell'esplorazione di una seconda nave. Nessuno sviluppo successivo avviato.
