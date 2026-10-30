// Source DOM and CSS cascade contracts. This is deliberately not a browser render.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{JSDOM}=require('jsdom'),postcss=require('postcss');
const root=path.resolve(__dirname,'..'),web=path.join(root,'design-premium-preview');
const contracts=JSON.parse(fs.readFileSync(path.join(__dirname,'preservation.json'),'utf8'));
const normalize=s=>s.replace(/\s+/g,' ').trim();
const href=(x,route)=>new URL(x,'https://filofino.es'+route).href.replace(/#$/,'');
const reports=[];
for(const page of contracts.pages){
 const d=new JSDOM(fs.readFileSync(path.join(web,page.file),'utf8')).window.document;
 // Copy is owner-authorized for this phase; route metadata and service facts have
 // dedicated gates. Preserve the accepted visual/interaction contracts below.
 const route=JSON.parse(fs.readFileSync(path.join(root,'seo/routes.json'),'utf8')).pages.find(p=>p.path===page.route);
 assert.equal(d.title,route.title);assert.equal(d.querySelector('meta[name="description"]').content,route.description);
 assert.ok(normalize(d.querySelector('h1').textContent).includes(route.h1Contains));
 const links=new Set([...d.querySelectorAll('a')].map(a=>href(a.getAttribute('href'),page.route)));for(const target of page.links)assert.ok(links.has(target),target);
 assert.equal(d.querySelectorAll('.hero>.hero-photo img').length,1);
 assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('meta[name="robots"]').content,'noindex, nofollow');
 const sheets=[...d.querySelectorAll('link[rel="stylesheet"]')].map(el=>postcss.parse(fs.readFileSync(path.resolve(web,path.dirname(page.file),el.getAttribute('href').split('?')[0]),'utf8')));
 function style(el,width,reduced=false){const out={};for(const ast of sheets)ast.walkRules(rule=>{let active=true;for(let a=rule.parent;a&&a.type!=='root';a=a.parent){if(a.type!=='atrule')continue;if(a.name==='keyframes'){active=false;break}if(a.name==='media'){for(const [,min]of a.params.matchAll(/min-width:\s*(\d+)px/g))if(width<+min)active=false;for(const [,max]of a.params.matchAll(/max-width:\s*(\d+)px/g))if(width>+max)active=false;if(a.params.includes('prefers-reduced-motion')&&!reduced)active=false;if(a.params.includes('hover:hover')||a.params.includes('pointer:fine'))active=false;}}
 if(!active)return;for(const selector of rule.selector.split(',')){let matches=false;try{matches=el.matches(selector.trim())}catch{}if(!matches)continue;const score=(selector.match(/[.#\[]/g)||[]).length+(selector.match(/:(?!:)/g)||[]).length;rule.walkDecls(decl=>{const old=out[decl.prop];if(!old||decl.important&&!old.important||!!decl.important===old.important&&score>=old.score)out[decl.prop]={value:decl.value,score,important:!!decl.important}})}});return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.value]));}
 const widths=[320,360,390,425,430,768,1440];
 for(const width of widths){
  const actions=style(d.querySelector('.hero-actions'),width);assert.equal(actions.display,'grid');assert.ok(page.route==='/servicios/afilado-cuchillos-valencia/'?actions['grid-template-columns']==='1fr':actions['grid-template-columns'].includes('minmax(0,1.65fr)'));
  const header=style(d.querySelector('.site-header'),width);assert.equal(header.height,'var(--header-height)');assert.equal(style(d.documentElement,width)['--header-height'],width<=767?'72px':'92px');assert.equal(header.position,'sticky');assert.equal(header.top,'0');
  const photo=style(d.querySelector('.hero-photo'),width);assert.equal(photo.position,'absolute');
  if(page.route!=='/'){
   const jump=style(d.querySelector('.knife-jump'),width);assert.equal(jump.display,'grid');assert.ok(jump['grid-template-columns'].includes(width<=767?'repeat(2,':'repeat(3,'));
   if(width<=767)assert.equal(style(d.querySelector('.knife-jump a'),width)['grid-column'],'1/-1');
   for(const card of d.querySelectorAll('.knife-jump a')){assert.equal(style(card,width).display,'flex');assert.equal(style(card,width)['flex-wrap'],'nowrap');assert.equal(style(card,width)['align-items'],'center');assert.equal(style(card.querySelector('svg'),width).flex,'0 0 16px')}
   if(width<=767){assert.equal(style(d.querySelector('.knife-jump a'),width)['min-height'],'48px');assert.equal(style(d.querySelectorAll('.knife-jump a')[1],width)['min-height'],'56px');assert.equal(style(d.querySelectorAll('.knife-jump a')[2],width)['min-height'],'56px')}
  }else{
   const shortcuts=style(d.querySelector('.hero-shortcuts'),width);assert.equal(shortcuts.display,'grid');assert.equal(shortcuts['grid-template-columns'],'repeat(2,minmax(0,1fr))');assert.equal(style(d.querySelector('.hero-shortcuts a'),width)['grid-column'],'1/-1');
   for(const link of d.querySelectorAll('.hero-shortcuts a'))assert.equal(style(link,width)['align-items'],'center');
  }
 }
 if(page.route==='/'){
  assert.equal(d.querySelectorAll('.touch-hand,.touch-ring,#servicios details').length,0);
  assert.equal(d.querySelectorAll('#servicios .service-link').length,3);
  for(const card of d.querySelectorAll('#servicios .service-link')){assert.equal(card.querySelectorAll('.service-cta').length,1);assert.equal(card.querySelector('.service-cta>span').textContent,'Ver servicio y precios');assert.equal(card.querySelectorAll('a,button,details').length,0);}
  for(const width of [320,360,390,430]){const composition=style(d.querySelector('.service-composition'),width);assert.equal(composition['grid-template-columns'],width<380?'minmax(0,1fr)':'repeat(2,minmax(0,1fr))');assert.equal(style(d.querySelector('.service-knives'),width)['grid-column'],width<380?'auto':'1/-1');}
  assert.equal(style(d.querySelector('.service-knives'),1440)['grid-row'],'1/3');

 }
 reports.push({page:page.route,widths,method:'DOM and stylesheet cascade contracts; not rendered layout',status:'PASS'});
}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify({status:'PASS',checks:reports,renderedBrowser:false,Safari:false,Lighthouse:false},null,2)+'\n');
console.log('PASS: shared header/footer source check, registry metadata and retained links, integrated heroes, CTA and 1+2 grid CSS contracts at 320/360/390/425/430/768/1440; single-action cards, adaptive asymmetric mobile and desktop grid. NOT a rendered-browser test.');
