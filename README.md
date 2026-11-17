# Wild Island · V0.1

Prototipo spaziale 2D per browser: esplora una nave a piedi e raggiungi il timone per pilotarla. TypeScript, Canvas 2D, HTML/CSS e Vite; nessun backend, account o asset esterno.

Richiede Node.js 22.18+ (oppure 24 LTS) e npm.

```sh
npm ci
npm run dev
```

Apri l'indirizzo indicato da Vite nel browser desktop. Il gioco parte direttamente a bordo; percorri il corridoio centrale verso l'alto fino alla console azzurra.

- Interni: **WASD** per camminare; **E** vicino alla console per pilotare.
- Spazio: **W** accelera, **S** frena, **A/D** ruotano, **E** lascia il timone.
- La nave mantiene l'inerzia anche mentre cammini al suo interno.

```sh
npm test          # test mirati della simulazione
npm run check    # controllo TypeScript
npm run build    # controllo TypeScript e build statica in dist/
npm run preview  # prova della build
```

Su ambienti con home non scrivibile, aggiungi `--cache /tmp/wild-island-npm-cache` a `npm ci`. Build con percorsi relativi, compatibile con hosting statico sotto directory (incluso GitHub Pages); pubblicazione non configurata.
