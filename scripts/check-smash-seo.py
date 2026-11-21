from pathlib import Path
import importlib.util,json,re,tempfile
from xml.etree import ElementTree as ET
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('smash_build',root/'scripts/package-smash-preview.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
config=json.loads((root/'seo/site-config.json').read_text());assert not config['ready_for_indexing'] or config['origin'].startswith('https://')
preview=mod.build();titles=[]
for f in mod.PAGES:
 s=(preview/f).read_text();titles.append(re.search(r'<title>(.*?)</title>',s)[1]);assert 'noindex,nofollow' in s
assert len(set(titles))==len(titles)
menu=(preview/'menu.html').read_text();assert menu.count('class="dish-ingredients"')==28
schema=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',menu,re.S)[1]);assert sum(len(x['hasMenuItem']) for x in schema['hasMenuSection'])==61
for section in schema['hasMenuSection']:
 for item in section['hasMenuItem']:assert item['description'];offers=item['offers'] if isinstance(item['offers'],list) else [item['offers']];assert all(o['priceCurrency']=='EUR' for o in offers)
# Prova isolata con dominio riservato: non è una versione da pubblicare.
with tempfile.TemporaryDirectory(prefix='smash-seo-check-') as d:
 test={**config,'origin':'https://smash-test.invalid','ready_for_indexing':True};prod=mod.build(True,test,d)
 tree=ET.parse(prod/'sitemap.xml');ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'};urls=[n.text for n in tree.findall('.//s:loc',ns)]
 assert len(urls)==5 and not any('/delivery' in u or '/offerte' in u for u in urls)
 for f in config['indexable_files']:
  text=(prod/f).read_text();assert 'content="index,follow"' in text and text.count('rel="canonical"')==1
  assert '<meta property="og:image"' in text
 for f in ['delivery.html','offerte.html']:assert 'content="noindex,follow"' in (prod/f).read_text()
 assert '/*\n  X-Robots-Tag' not in (prod/'_headers').read_text()
 assert 'Sitemap: https://smash-test.invalid/sitemap.xml' in (prod/'robots.txt').read_text()
 assert '/posizione.html /dove-siamo 301!' in (prod/'_redirects').read_text()
print('OK: titoli, descrizioni, HTML, link, 28 voci cibo, 33 drink, JSON-LD, anteprima noindex e generazione isolata canonical/sitemap/redirect.')
