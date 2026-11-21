# Smash Lab — codice sorgente

Sito statico HTML, CSS e JavaScript. Include le risorse effettivamente utilizzate e le licenze dei font. Non richiede npm o servizi esterni per funzionare.

## Anteprima locale
Dalla cartella estratta eseguire:

    python3 -m http.server 4174

Aprire http://localhost:4174/ nel browser.

## Modifiche
- Le pagine HTML contengono i testi e il menù.
- styles.css contiene lo stile; script.js contiene le interazioni.
- assets/smash contiene immagini, loghi e font.
- La home desktop include copie delle sezioni delle altre pagine. Dopo averle modificate eseguire `python3 scripts/build-desktop-tour.py` per sincronizzarle. Non modificare direttamente il template desktop generato.
- Aggiornando il menù, mantenere coerenti i dati JSON-LD nella pagina menu.html.

## Pacchetto Netlify e controlli

    python3 scripts/check-smash-seo.py

Questo comando controlla il sito e genera output/smash-netlify-anteprima e il relativo ZIP. Il test della produzione usa un dominio riservato in una cartella temporanea che viene rimossa.

Per generare soltanto l’anteprima:

    python3 scripts/package-smash-preview.py

L’anteprima è volutamente noindex. Per il lancio definitivo occorre inserire il dominio HTTPS reale in seo/site-config.json e impostare ready_for_indexing a true dopo aver completato i controlli; quindi eseguire:

    python3 scripts/package-smash-preview.py --production

Il pacchetto generato contiene intestazioni di sicurezza, redirect e, in produzione, canonical e sitemap. Caricare il contenuto del pacchetto generato su Netlify. Il sorgente da solo non applica le regole dell’hosting.

Privacy e Cookie descrivono il sito vetrina attuale. Aggiornarle prima di attivare ordini, pagamenti o tracciamenti. Il dominio definitivo non è ancora configurato.
