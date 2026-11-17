# Stato · V0.3

V0.3: collisioni dello scafo ruotato con tutti gli asteroidi e frammenti; poligoni concavi, rilevamento continuo ad alta velocità, scivolamento, restituzione 0.15 e rotazione bloccata al contatto. Attive anche durante l’esplorazione interna.

Già presente: zoom spaziale fluido con rotellina, limiti 0.01×–3×, livello persistente tra le modalità e indicazione HUD; fisica libera invariata.

Aggiunti: scala fisica 1 cella = 1 m, velocità in m/s, barra metri/km, indicatore nave distante e dieci campi statici di poligoni procedurali con geometria memorizzata e culling. Nessun danno o distruzione.

Già implementati: esplorazione interna, collisioni, console interattiva, pilotaggio inerziale, frenata e rotazione, transizioni ripetibili, simulazione persistente della stessa nave, stelle procedurali stabili, HUD minimo e ridimensionamento Canvas ad alta densità.

Verificati: 26 test di simulazione, collisioni, zoom, scala, campi e rendering; controllo TypeScript e build Vite; prova Chromium di collisione ad alta velocità in modalità interna e zoom 0.01×–3×, campi visibili, indicatore centrato, persistenza tra le modalità, interni invariati, blocco dello scroll, HUD e resize, senza errori JavaScript. Il prototipo è destinato a browser desktop con tastiera; nessun supporto mobile o salvataggio. Lunghe sospensioni della scheda non vengono simulate retroattivamente.

Possibili prossimi obiettivi da approvare: regolazione dei parametri di movimento e valutazione dell'esplorazione di una seconda nave. Nessuno sviluppo successivo avviato.
