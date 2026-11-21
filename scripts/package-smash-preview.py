from pathlib import Path
import re,shutil,zipfile,hashlib,json,argparse
from html.parser import HTMLParser
from urllib.parse import urlsplit
from datetime import datetime,timezone
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
PAGES=['index.html','menu.html','dentro-il-morso.html','posizione.html','delivery.html','offerte.html','faq.html','privacy.html','cookie.html','404.html']
PATHS={'index.html':'/','posizione.html':'/dove-siamo',**{f:'/'+f[:-5] for f in PAGES if f not in ['index.html','posizione.html']}}
def build(production=False, config_override=None, output_root=None):
 import runpy
 runpy.run_path(str(ROOT/"scripts/build-desktop-tour.py"))
 config=config_override or json.loads((ROOT/'seo/site-config.json').read_text());origin=config.get('origin')
 if production:
  if not origin or not config.get('ready_for_indexing'):raise SystemExit('Produzione non generata: confermare dominio HTTPS e ready_for_indexing in seo/site-config.json dopo i controlli di lancio.')
  u=urlsplit(origin)
  if u.scheme!='https' or not u.netloc or u.path not in ('','/') or u.query or u.fragment:raise SystemExit('Il dominio deve essere una origin HTTPS, senza percorso o parametri.')
  origin=origin.rstrip('/')
 name='smash-netlify-definitivo' if production else 'smash-netlify-anteprima';dst=(Path(output_root) if output_root else ROOT/'output')/name
 if dst.exists():shutil.rmtree(dst)
 dst.mkdir(parents=True)
 files=PAGES+['styles.css','script.js'];texts='\n'.join((ROOT/f).read_text() for f in files)
 assets=[p for p in (ROOT/'assets/smash').rglob('*') if p.is_file() and (p.relative_to(ROOT).as_posix() in texts or (p.parent.name=='fonts' and p.suffix=='.txt'))]
 tokens={p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()[:12] for p in assets}
 for p in assets:
  rel=p.relative_to(ROOT);(dst/rel).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dst/rel)
 for f in files:
  s=(ROOT/f).read_text()
  if production and f.endswith('.html'):
   indexable=f in config['indexable_files'];s=s.replace('content="noindex,nofollow"','content="index,follow"' if indexable else 'content="noindex,follow"')
   url=origin+PATHS[f]
   extra=f'<link rel="canonical" href="{url}"><meta property="og:url" content="{url}"><meta property="og:image" content="{origin}/assets/smash/selected/hero-wide.webp"><meta property="og:image:alt" content="Smash burger di Smash Lab a Rimini">'
   if f!='404.html':s=s.replace('</head>',extra+'</head>')
   for src,target in PATHS.items():s=s.replace('href="'+src+'"','href="'+target+'"')
   def schema(m):
    data=json.loads(m[1])
    if data.get('@type')=='Restaurant':data.update({'@id':origin+'/#locale','url':origin+'/','image':[origin+'/assets/smash/selected/hero-wide.webp'],'logo':origin+'/assets/smash/brand/wordmark.svg','hasMenu':origin+'/menu','menu':origin+'/menu'})
    elif data.get('@type')=='Menu':data.update({'@id':origin+'/menu#menu','url':origin+'/menu','provider':{'@id':origin+'/#locale'}})
    return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False)+'</script>'
   s=re.sub(r'<script type="application/ld\+json">(.*?)</script>',schema,s,flags=re.S)
   if f not in ['index.html','404.html']:
    title=re.search(r'<title>(.*?)</title>',s)[1];breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':origin+'/'},{'@type':'ListItem','position':2,'name':title.split('|')[0].strip(),'item':url}]}
    s=s.replace('</head>','<script type="application/ld+json">'+json.dumps(breadcrumb,ensure_ascii=False)+'</script></head>')
  for asset,token in sorted(tokens.items(),key=lambda x:len(x[0]),reverse=True):s=s.replace(asset,asset+'?v='+token)
  (dst/f).write_text(s)
 # Version CSS and JavaScript by their generated content, including asset URLs.
 for resource in ['styles.css','script.js']:
  digest=hashlib.sha256((dst/resource).read_bytes()).hexdigest()[:12]
  for page in PAGES:
   path=dst/page;text=path.read_text();text=re.sub(re.escape(resource)+r'(?:\?v=[^"\s]+)?',resource+'?v='+digest,text);path.write_text(text)
 headers=(ROOT/'seo/security-headers.txt').read_text()
 if production:
  headers=headers.replace('  X-Robots-Tag: noindex, nofollow\n','')
  for f in ['delivery.html','offerte.html','404.html']:headers+='\n'+PATHS[f]+'\n  X-Robots-Tag: noindex, follow\n'
 (dst/'_headers').write_text(headers)
 redirects=['/cosa-facciamo /dentro-il-morso'+('' if production else '.html')+' 301','/cosa-facciamo.html /dentro-il-morso'+('' if production else '.html')+' 301']
 if production:
  redirects+=['/index.html / 301!','/posizione /dove-siamo 301!','/posizione.html /dove-siamo 301!']
  for f,path in PATHS.items():
   if f not in ['index.html','posizione.html','404.html']:redirects.append('/'+f+' '+path+' 301!')
   if f!='index.html':redirects.append(path+' /'+f+' 200')
 (dst/'_redirects').write_text('\n'.join(redirects)+'\n')
 (dst/'robots.txt').write_text('User-agent: *\nAllow: /\n'+('Sitemap: '+origin+'/sitemap.xml\n' if production else ''))
 if production:
  ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9');tree=ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
  for f in config['indexable_files']:
   node=ET.SubElement(tree,'url');ET.SubElement(node,'loc').text=origin+PATHS[f];ET.SubElement(node,'lastmod').text=datetime.fromtimestamp((ROOT/f).stat().st_mtime,timezone.utc).isoformat(timespec='seconds')
  (dst/'sitemap.xml').write_bytes(ET.tostring(tree,encoding='utf-8',xml_declaration=True))
 validate(dst,production,origin)
 archive=dst.with_suffix('.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
  for p in dst.rglob('*'):
   if p.is_file():z.write(p,p.relative_to(dst))
 print('Pacchetto verificato:',dst,'ZIP',round(archive.stat().st_size/1024/1024,2),'MB')
 return dst
class Page(HTMLParser):
 def __init__(self):super().__init__();self.urls=[];self.ids=[];self.h1=0;self.title=0;self.desc=0
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='h1':self.h1+=1
  if t=='title':self.title+=1
  if a.get('id'):self.ids.append(a['id'])
  if t=='meta' and a.get('name')=='description':self.desc+=1
  for k in ['src','href']:
   if a.get(k):self.urls.append(a[k])
  if a.get('srcset'):self.urls.extend(part.strip().split()[0] for part in a['srcset'].split(','))
def validate(dst,production=False,origin=None):
 parsed={}
 for f in PAGES:
  s=(dst/f).read_text();p=Page();p.feed(s);assert(p.h1,p.title,p.desc)==(1,1,1),(f,p.h1,p.title,p.desc);assert len(p.ids)==len(set(p.ids)),f
  for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):json.loads(raw)
  parsed[f]=p
 for f,p in parsed.items():
  for link in p.urls:
   u=urlsplit(link)
   if u.scheme or u.netloc:continue
   target=u.path or f
   if production and target.startswith('/'):target=next((k for k,v in PATHS.items() if v==target),target.lstrip('/'))
   assert (dst/target).is_file(),(f,link,target)
   if u.fragment and target in parsed:assert u.fragment in parsed[target].ids,(f,link)
 if not production:
  assert all('noindex,nofollow' in (dst/f).read_text() for f in PAGES)
  assert not (dst/'sitemap.xml').exists()
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--production',action='store_true');args=ap.parse_args();build(args.production)
