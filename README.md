# Wild Island · V0.2

Prototipo spaziale 2D per browser: esplora una nave a piedi e raggiungi il timone per pilotarla. TypeScript, Canvas 2D, HTML/CSS e Vite; nessun backend, account o asset esterno.

Richiede Node.js 22.18+ (oppure 24 LTS) e npm.

```sh
npm ci
npm run dev
```

Apri l'indirizzo indicato da Vite nel browser desktop. Il gioco parte direttamente a bordo; percorri il corridoio centrale verso l'alto fino alla console azzurra.

- Interni: **WASD** per camminare; **E** vicino alla console per pilotare.
- Spazio: **W** accelera, **S** frena, **A/D** ruotano, **E** lascia il timone; **rotellina su/giù** per zoom in/out (0.01×–3×).
- Scala: una cella interna = **1 m**; scafo lungo **12 m**. Velocità in m/s e barra della scala in metri/chilometri.
- Dieci campi di asteroidi immobili, generati con seed fisso in circa 5 × 5 km. Il primo è a **200 m sulla destra** della partenza: riduci lo zoom a circa 0.1× per vederlo. È intenzionalmente possibile attraversarli. A grande distanza un indicatore azzurro segnala la nave.
- La nave mantiene l'inerzia anche mentre cammini al suo interno.

```sh
npm test          # test mirati di simulazione, zoom e rendering
npm run check    # controllo TypeScript
npm run build    # controllo TypeScript e build statica in dist/
npm run preview  # prova della build
```

Su ambienti con home non scrivibile, aggiungi `--cache /tmp/wild-island-npm-cache` a `npm ci`. La build usa percorsi relativi (`base: './'` in Vite), compatibili con la sottodirectory di GitHub Pages.

## Pubblicazione su GitHub Pages

In **Settings → Pages → Build and deployment**, seleziona **GitHub Actions** come sorgente (una sola volta). Dopo il merge, ogni push su `main` esegue il workflow **Deploy GitHub Pages**: Node.js 24 LTS, `npm ci`, `npm run build` e pubblicazione di `dist/` tramite le Actions ufficiali. Per avviarlo manualmente: **Actions → Deploy GitHub Pages → Run workflow**, selezionando `main`. L’URL pubblicato è visibile nel deployment `github-pages` e in Settings → Pages.
