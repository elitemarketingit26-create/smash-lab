# Smash Lab Rimini

Sito vetrina statico HTML/CSS/JavaScript. Foto, loghi e font locali. Nessuna dipendenza npm.

## Lavorare sul codice

1. Clonare il repository e creare un branch per le modifiche.
2. Avviare `python3 -m http.server 4174` e aprire http://localhost:4174/.
3. Modificare i file HTML, styles.css e script.js. I contenuti e i prezzi del menù sono in menu.html; mantenere coerente il JSON-LD.
4. Eseguire `python3 scripts/build-desktop-tour.py`: sincronizza il percorso desktop della home con le singole pagine. Non modificare a mano il template desktop in index.html.
5. Eseguire `python3 scripts/check-smash-seo.py` prima di proporre la modifica.
6. Aprire una pull request verso main per la revisione.

## Collegare il progetto Netlify esistente

Aprire il progetto polite-tiramisu-28f4f0 su Netlify. In Project configuration > Developer settings > Continuous deployment > Repository, collegare il repository GitHub. Selezionare main come branch di produzione.

Il file netlify.toml imposta già:
- Build command: `python3 scripts/build-netlify.py`
- Publish directory: `dist`
- Base directory: vuota (radice del repository)

L’accesso di Netlify al repository privato va autorizzato dall’account proprietario. Il collegamento avvia un deploy; controllare l’anteprima di build prima di considerarlo concluso. Ogni merge su main aggiorna il sito. I branch e le pull request permettono di discutere le modifiche prima del merge; verificare nel pannello Netlify l’attivazione dei Deploy Preview e gli eventuali limiti del piano.

## Dominio e indicizzazione

Per ora seo/site-config.json mantiene origin null e ready_for_indexing false: la versione online resta noindex. Al lancio impostare il dominio HTTPS reale in origin e ready_for_indexing true. Lo stesso comando genera canonical, sitemap e redirect definitivi automaticamente, sempre nella cartella dist.

Non attivare l’indicizzazione su questo indirizzo temporaneo. Non inserire credenziali, token o file .env nel repository.

## Stato e limiti

28 voci cibo e 33 drink. Offerte e delivery sono intenzionalmente prossimamente. Privacy e Cookie riguardano il sito vetrina; aggiornare testi e gestione del consenso prima di integrare ordini, pagamenti o analytics. L’account hosting e la configurazione effettiva del provider restano da verificare.

Per collaboratori: Settings > Collaborators > Add people su GitHub. Invitare l’account della persona, senza condividere password o token.

Font Anton e Archivo Black: licenze OFL in assets/smash/fonts/.
