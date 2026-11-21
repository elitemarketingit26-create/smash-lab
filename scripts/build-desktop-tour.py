from pathlib import Path
import re
r=Path(__file__).resolve().parents[1];p=r/'index.html';s=p.read_text();s=re.sub(r'<template id="desktop-tour">.*?</template>','',s,flags=re.S)
parts=[]
for name,key in [('menu.html','menu'),('dentro-il-morso.html','foto'),('posizione.html','posizione'),('delivery.html','delivery'),('offerte.html','offerte')]:
 text=(r/name).read_text();content=re.search(r'<main id="main">(.*?)</main>',text,re.S)[1]
 if key=='foto':
  figures=''.join(re.findall(r'<figure class="bite-frame.*?</figure>',content,re.S))
  content='<section class="tour-gallery"><div class="gallery-board" tabindex="0" role="region" aria-label="Galleria fotografica"><header class="gallery-board-heading"><p class="eyebrow">Smash Lab Rimini · In immagini</p><h2>Dentro il morso.</h2><p>Cinque scatti. Scorri in basso per guardarli tutti.</p></header><div class="gallery-board-grid">'+figures+'</div></div></section>'
 content=content.replace('<h1','<h2').replace('</h1>','</h2>')
 # I link del sito restano validi; gli ID dei contenuti sono univoci.
 content=re.sub(r'id="([^"]+)"',lambda m:'id="tour-'+m[1]+'"',content)
 content=re.sub(r'href="#([^"]+)"',lambda m:'href="#tour-'+m[1]+'"',content)
 parts.append('<div class="tour-group" data-tour="'+key+'">'+content+'</div>')
s=s.replace('</main>','</main><template id="desktop-tour">'+''.join(parts)+'</template>')
p.write_text(s)
