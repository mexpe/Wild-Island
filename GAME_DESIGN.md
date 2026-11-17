# Design

Il personaggio è il protagonista; la nave è un'entità indipendente. Visione: sandbox spaziale originale ispirato alle possibilità di esplorazione di Wayward Terran Frontier: Zero Falls.

## Meccaniche V0.1

Esplorazione dall'alto su griglia modificabile con pareti esterne, divisori e passaggi; movimento diagonale normalizzato e collisioni cerchio/rettangolo. Interazione con il timone solo entro 57 unità locali. E funziona alla pressione, senza ripetizioni finché resta premuto.

Il pilotaggio usa accelerazione orientata, rotazione e frenata lineare fino a zero. Nessun attrito passivo e nessun limite artificiale di velocità. Ruotare non cambia il vettore di velocità. Lasciare il timone interrompe i comandi di volo, riposiziona il personaggio presso la console e preserva lo stato spaziale. Le stelle sono deterministiche in coordinate mondo.

Un solo ciclo con delta temporale e sottopassi massimi di 1/120 s. Le pause superiori a 100 ms vengono limitate: nessun recupero di lunghi periodi a scheda sospesa. L'interno resta orientato nel riferimento locale della nave; l'esterno mostra lo scafo ruotato senza gli interni. Parametri in src/state.ts, struttura in src/layout.ts. Comandi nel README.

## Futuro, non implementato

Navi modificabili, combattimenti, danni, riparazioni, abbordaggi, stazioni, risorse ed equipaggi sono solo possibili direzioni. Nessun sistema predisposto. Fuori V0.1 anche audio, salvataggi, mobile, multiplayer, inventario, economia e generazione di universi.
