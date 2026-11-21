const toggle=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('#mobile-nav');
function closeMenu(){if(!toggle||!mobileNav)return;toggle.setAttribute('aria-expanded','false');mobileNav.hidden=true;document.body.classList.remove('menu-open');document.querySelectorAll('main,.mobile-dock,.site-footer').forEach(el=>el.removeAttribute('inert'))}
toggle?.addEventListener('click',()=>{const opening=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(opening));mobileNav.hidden=!opening;document.body.classList.toggle('menu-open',opening);document.querySelectorAll('main,.mobile-dock,.site-footer').forEach(el=>el.toggleAttribute('inert',opening));if(opening)mobileNav.querySelector('a')?.focus()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus()}});
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
window.matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches)closeMenu()});
const categoryLinks=[...document.querySelectorAll('.category-nav a')];
function updateCategory(){let active=categoryLinks[0];for(const link of categoryLinks){const section=document.querySelector(link.getAttribute('href'));if(section&&section.getBoundingClientRect().top<200)active=link}categoryLinks.forEach(link=>{if(link===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}
if(categoryLinks.length){window.addEventListener('scroll',updateCategory,{passive:true});updateCategory()}
// La stessa struttura scorre in orizzontale su desktop e in verticale su mobile.
const main=document.querySelector('main');
const footer=document.querySelector('.site-footer');
function routeKey(link){const u=new URL(link.href,location.href);if(u.origin!==location.origin)return '';const path=u.pathname.replace(/\/$/,'');if(!path||path==='/index.html')return 'index.html';if(path==='/dove-siamo')return 'posizione.html';const name=path.slice(path.lastIndexOf('/')+1);return name.endsWith('.html')?name:name+'.html'}
const desktopQuery=matchMedia('(min-width:1001px), (min-width:601px) and (hover:hover) and (pointer:fine)');
const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
if(main&&footer&&!document.body.classList.contains('policy-page')){
 const tour=document.querySelector('#desktop-tour');
 const unified=!!tour&&desktopQuery.matches;
 if(unified){
  document.body.classList.add('desktop-unified');
  [...tour.content.children].forEach(group=>{
   const key=group.dataset.tour;
   [...group.children].forEach((section,i)=>{const copy=section.cloneNode(true);copy.dataset.tour=key;if(i===0)copy.id='desktop-'+key;main.append(copy)});
  });
 }
 if(!unified)main.append(footer);main.classList.add('horizontal-deck');document.body.classList.add('horizontal-ready');main.setAttribute('tabindex','0');
 [...main.children].forEach(el=>el.classList.add('horizontal-panel'));
 const categoryNav=main.querySelector('.category-nav');
 if(categoryNav){categoryNav.classList.add('desktop-menu-nav');document.body.classList.add('menu-page')}
 const controls=document.createElement('nav');controls.className='desktop-scroll';controls.setAttribute('aria-label','Scorrimento laterale della pagina');
 controls.innerHTML='<span class="scroll-hint">Scorri lateralmente →</span><span class="scroll-counter" aria-live="polite"></span><button type="button" aria-label="Sezione precedente">←</button><button type="button" aria-label="Sezione successiva">→</button>';
 document.body.append(controls);
 const previous=controls.querySelector('[aria-label="Sezione precedente"]'),next=controls.querySelector('[aria-label="Sezione successiva"]'),counter=controls.querySelector('.scroll-counter');
 const targets=[...main.children].flatMap(el=>el.matches('.menu-layout')?[...el.querySelector('.menu-categories').children]:el.matches('.ticker,.category-nav')?[]:[el]);
 if(unified){
  const routes={'index.html':main.firstElementChild,'menu.html':main.querySelector('#desktop-menu'),'dentro-il-morso.html':main.querySelector('#desktop-foto'),'posizione.html':main.querySelector('#desktop-posizione'),'delivery.html':main.querySelector('#desktop-delivery'),'offerte.html':main.querySelector('#desktop-offerte')};
  document.querySelectorAll('.desktop-nav a,.header-menu,main a[href]').forEach(a=>a.addEventListener('click',event=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hash)return;const section=routes[routeKey(a)];if(section){event.preventDefault();move(targets.indexOf(section));}}));
 }
 function position(el){return el.getBoundingClientRect().left-main.getBoundingClientRect().left+main.scrollLeft}
 let targetPositions=[];
 function refreshPositions(){targetPositions=targets.map(position);sync()}
 function activeIndex(){let best=0,dist=Infinity;targets.forEach((el,i)=>{let d=Math.abs((targetPositions[i]??0)-main.scrollLeft);if(d<dist){dist=d;best=i}});return best}
 let requestedIndex=null;
 function move(index){if(!desktopQuery.matches)return;requestedIndex=Math.max(0,Math.min(targets.length-1,index));main.scrollTo({left:Math.min(position(targets[requestedIndex]),main.scrollWidth-main.clientWidth),behavior:reduceMotion.matches?'auto':'smooth'})}
 function sync(){if(!desktopQuery.matches)return;const atEnd=main.scrollLeft>=main.scrollWidth-main.clientWidth-8;const index=atEnd?targets.length-1:activeIndex();const label=String(index+1).padStart(2,'0')+' / '+String(targets.length).padStart(2,'0');if(counter.textContent!==label)counter.textContent=label;previous.disabled=main.scrollLeft<8;next.disabled=atEnd;if(unified){const page=targets[index]?.dataset.tour||'home';const keys={'index.html':'home','menu.html':'menu','dentro-il-morso.html':'foto','posizione.html':'posizione','delivery.html':'delivery','offerte.html':'offerte'};document.querySelectorAll('.desktop-nav a').forEach(a=>{if(keys[routeKey(a)]===page)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}categoryNav?.querySelectorAll('a').forEach(a=>{const el=document.querySelector(a.hash);if(el===targets[index])a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
 previous.addEventListener('click',()=>move((requestedIndex??activeIndex())-1));next.addEventListener('click',()=>move((requestedIndex??activeIndex())+1));
 // Ogni gesto conserva il proprio asse: niente passaggi dal menù al sito.
 let wheelAxis=null,lastWheelAt=0;
 main.addEventListener('wheel',event=>{
  if(!desktopQuery.matches||event.ctrlKey)return;
  requestedIndex=null;
  const dx=event.deltaX,dy=event.deltaY;
  if(!dx&&!dy)return;
  if(event.timeStamp-lastWheelAt>180)wheelAxis=null;
  lastWheelAt=event.timeStamp;
  if(!wheelAxis)wheelAxis=Math.abs(dx)>Math.abs(dy)?'x':'y';
  const factor=event.deltaMode===1?18:event.deltaMode===2?main.clientWidth:1;
  event.preventDefault();
  if(wheelAxis==='x'){
   main.scrollBy({left:dx*factor,behavior:'instant'});
   return;
  }
  // Lo scorrimento verticale resta nel riquadro anche ai suoi limiti.
  let el=event.target instanceof Element?event.target:null;
  while(el&&el!==main){
   const style=getComputedStyle(el);
   if(/auto|scroll/.test(style.overflowY)&&el.scrollHeight>el.clientHeight+1){
    el.scrollBy({top:dy*factor,behavior:'instant'});
    break;
   }
   el=el.parentElement;
  }
 },{passive:false});
 main.addEventListener('keydown',event=>{if(!desktopQuery.matches||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('a,button,summary,input,select,textarea,[contenteditable]'))return;if(event.key==='ArrowRight'){event.preventDefault();move(activeIndex()+1)}if(event.key==='ArrowLeft'){event.preventDefault();move(activeIndex()-1)}});
 let pending=false;main.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{sync();pending=false})}},{passive:true});
 desktopQuery.addEventListener('change',()=>{if(tour){location.reload();return}main.scrollLeft=0;requestAnimationFrame(refreshPositions)});window.addEventListener('resize',()=>{if(!desktopQuery.matches)return;const keep=requestedIndex??activeIndex();requestAnimationFrame(()=>{refreshPositions();main.scrollTo({left:Math.min(position(targets[keep]),main.scrollWidth-main.clientWidth),behavior:'instant'});requestedIndex=null;sync()})});window.addEventListener('load',refreshPositions,{once:true});main.querySelectorAll('img').forEach(img=>img.addEventListener('load',refreshPositions,{once:true}));
 categoryNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',event=>{if(desktopQuery.matches){event.preventDefault();const target=document.querySelector(a.hash);if(target)move(targets.indexOf(target));history.replaceState(null,'',a.hash)}}));
 // Un link diretto a una categoria apre il pannello corretto e scorre il suo riquadro.
 function revealHash(){if(!location.hash||!desktopQuery.matches)return;let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}const el=document.getElementById(id);if(!el||!main.contains(el))return;const panel=targets.find(target=>target===el||target.contains(el));if(!panel)return;main.scrollTo({left:Math.min(position(panel),main.scrollWidth-main.clientWidth),behavior:'instant'});const board=el.closest('.menu-board,.gallery-board');if(board)board.scrollTo({top:el.getBoundingClientRect().top-board.getBoundingClientRect().top+board.scrollTop-20,behavior:'instant'});sync()}
 if(location.hash)requestAnimationFrame(revealHash);
 window.addEventListener('hashchange',()=>requestAnimationFrame(revealHash));
 refreshPositions();
}

// Mantiene il focus nel menu aperto senza cambiare il suo aspetto.
document.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||toggle?.getAttribute('aria-expanded')!=='true')return;
 const focusable=[toggle,...mobileNav.querySelectorAll('a[href]')];
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});

// Interazione originale del menù: mouse, tocco e tastiera.
const legacyButtons=[...document.querySelectorAll('.legacy-menu .menu-list summary')];
const legacyInfo=document.querySelector('.legacy-menu .menu-info span');
function selectLegacyDish(button){
 legacyButtons.forEach(item=>{const selected=item===button;item.classList.toggle('is-active',selected)});
 if(legacyInfo)legacyInfo.textContent=button.dataset.info+' / '+button.dataset.price+' EUR';
}
legacyButtons.forEach(button=>{button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')selectLegacyDish(button)});button.addEventListener('focus',()=>selectLegacyDish(button));button.addEventListener('click',()=>selectLegacyDish(button))});

// Le scorciatoie restano nel riquadro desktop, senza spostare gli altri pannelli.
document.querySelectorAll('.menu-shortcuts a').forEach(a=>a.addEventListener('click',event=>{
 if(!desktopQuery.matches)return;
 const board=a.closest('.menu-board'),target=document.getElementById(a.hash.slice(1));
 if(board&&target){event.preventDefault();board.scrollTo({top:target.getBoundingClientRect().top-board.getBoundingClientRect().top+board.scrollTop-20,behavior:reduceMotion.matches?'auto':'smooth'})}
}));

// Carosello locale: nessun widget o richiesta a Google fino al click sul link.
document.querySelectorAll('.reviews-strip').forEach(section=>{
 const carousel=section.querySelector('.reviews-carousel'),cards=[...carousel.children],pause=section.querySelector('[data-reviews="pause"]');
 let index=0,timer=null,paused=reduceMotion.matches,hovered=false,focused=false,visible=false;
 function moveReview(step){const max=carousel.scrollWidth-carousel.clientWidth;const positions=[...new Set(cards.map(card=>Math.min(card.offsetLeft-cards[0].offsetLeft,max)))];index=positions.reduce((best,pos,i)=>Math.abs(pos-carousel.scrollLeft)<Math.abs(positions[best]-carousel.scrollLeft)?i:best,0);index=(index+step+positions.length)%positions.length;carousel.scrollTo({left:positions[index],behavior:reduceMotion.matches?'auto':'smooth'})}
 function restart(){clearInterval(timer);timer=null;if(!paused&&!hovered&&!focused&&visible&&!document.hidden)timer=setInterval(()=>moveReview(1),18000)}
 function syncPause(){pause.textContent=paused?'Riprendi':'Pausa';pause.setAttribute('aria-pressed',String(paused));restart()}
 section.querySelector('[data-reviews="prev"]').addEventListener('click',()=>{moveReview(-1);restart()});
 section.querySelector('[data-reviews="next"]').addEventListener('click',()=>{moveReview(1);restart()});
 pause.addEventListener('click',()=>{paused=!paused;syncPause()});
 section.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;restart()}});section.addEventListener('pointerleave',()=>{hovered=false;restart()});
 section.addEventListener('focusin',()=>{focused=true;restart()});section.addEventListener('focusout',event=>{focused=section.contains(event.relatedTarget);restart()});
 carousel.addEventListener('pointerdown',()=>{paused=true;syncPause()});carousel.addEventListener('keydown',()=>{paused=true;syncPause()});
 document.addEventListener('visibilitychange',restart);reduceMotion.addEventListener('change',event=>{paused=event.matches;syncPause()});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart()},{threshold:.25});observer.observe(section);syncPause();
});
