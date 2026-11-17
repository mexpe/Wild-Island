# Design

Il personaggio è il protagonista; la nave è un'entità indipendente. Visione: sandbox spaziale originale ispirato alle possibilità di esplorazione di Wayward Terran Frontier: Zero Falls.

## Meccaniche V0.3

Esplorazione dall'alto su griglia modificabile con pareti esterne, divisori e passaggi; movimento diagonale normalizzato e collisioni cerchio/rettangolo. Interazione con il timone solo entro 57 unità locali. E funziona alla pressione, senza ripetizioni finché resta premuto.

Il pilotaggio usa accelerazione orientata, rotazione e frenata lineare fino a zero. Nessun attrito passivo e nessun limite artificiale di velocità. Ruotare non cambia il vettore di velocità. Lasciare il timone interrompe i comandi di volo, riposiziona il personaggio presso la console e preserva lo stato spaziale. Le stelle sono deterministiche in coordinate mondo.

Un solo ciclo con delta temporale e sottopassi massimi di 1/120 s. Le pause superiori a 100 ms vengono limitate: nessun recupero di lunghi periodi a scheda sospesa. L'interno resta orientato nel riferimento locale della nave; l'esterno mostra lo scafo ruotato senza gli interni. Parametri in src/state.ts, struttura in src/layout.ts. Comandi nel README.

Lo zoom spaziale è solo visivo: 1× iniziale, limiti 0.01×–3×, circa 15% per scatto, interpolazione esponenziale indipendente dal frame rate. Nave e stelle condividono scala e centro schermo; HUD e interni non cambiano. Il livello rimane memorizzato tra le modalità. Parametri in src/zoom.ts.

## Scala e campi di asteroidi

Una cella interna vale 1 m = 36 unità del codice: griglia 13 × 12 celle, scafo lungo 12 m (12.25 m con gli ugelli, fiamme escluse). Le unità e i parametri della simulazione restano invariati; conversioni in src/space.ts. Una barra a schermo mostra distanze reali; sotto 10 pixel di lunghezza la nave è sostituita da un indicatore azzurro costante.

Dieci campi statici in circa 5 × 5 km; seed 73129, primo corpo principale di 60 m a (200 m, 0). Ogni campo: corpo principale 50–100 m e 15–30 frammenti di 2–5, 5–10 e 10–20 m, senza sovrapposizione dei cerchi di ingombro; estensione 200–400 m. La dimensione dichiarata è la massima estensione della geometria orientata sugli assi. Poligoni e colori delle facce sono generati una sola volta in src/asteroids.ts; coordinate globali indipendenti da nave e zoom. Culling per campo e oggetto. A zoom lontani si disegna un sottoinsieme stabile delle stelle per limitare il lavoro; le stelle conservano le coordinate mondo.

Gli interni non mostrano asteroidi. Nessuna gravità, estrazione, danno, distruzione o movimento autonomo.

## Collisioni V0.3

Rendering e collisioni condividono la sagoma dello scafo in src/hull.ts (ugelli decorativi esclusi). La geometria riutilizzabile in src/geometry.ts triangola i poligoni semplici concavi con ear clipping. src/collisions.ts conserva i triangoli statici degli asteroidi; prima esclude i corpi distanti con un controllo del segmento percorso e dei raggi, poi calcola il primo contatto tramite SAT continuo sulle coppie di triangoli. Il cerchio non determina il contatto finale. Nessun limite di velocità aggiunto.

Nei sottopassi esistenti la rotazione avanza conservativamente usando la distanza dalle superfici e il raggio dello scafo, fermandosi prima di compenetrare; gli impatti non inducono rotazione. La traslazione arriva al contatto, corregge un piccolo margine e prosegue con la velocità aggiornata. Si modifica solo la componente entrante lungo la normale; la tangenziale resta disponibile per scivolare. Restituzione iniziale 0.15, senza rimbalzo per velocità normali inferiori a 1 unità/s per stabilizzare i contatti lenti. Parametri in collisionTuning. Un recupero geometrico gestisce pose inizialmente sovrapposte. Iterazioni limitate nei contatti multipli: se esaurite si arresta il movimento residuo del sottopasso, senza attraversare ostacoli.

Le collisioni restano attive in entrambe le modalità, in coordinate mondo, indipendenti da zoom e rendering. Gli asteroidi non vengono modificati.

## Futuro, non implementato

Navi modificabili, combattimenti, danni, riparazioni, abbordaggi, stazioni, risorse ed equipaggi sono solo possibili direzioni. Nessun sistema predisposto. Fuori V0.1 anche audio, salvataggi, mobile, multiplayer, inventario, economia e generazione di universi.
