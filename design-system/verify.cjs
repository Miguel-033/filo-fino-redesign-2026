// Source DOM and CSS cascade contracts. This is deliberately not a browser render.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{JSDOM}=require('jsdom'),postcss=require('postcss');
const root=path.resolve(__dirname,'..'),web=path.join(root,'design-premium-preview');
const contracts=JSON.parse(fs.readFileSync(path.join(__dirname,'preservation.json'),'utf8'));
const normalize=s=>s.replace(/\s+/g,' ').trim();
const href=(x,route)=>new URL(x,'https://filofino.es'+route).href.replace(/#$/,'');
const reports=[];
for(const page of contracts.pages){
 const d=new JSDOM(fs.readFileSync(path.join(web,page.file),'utf8')).window.document;
 for(const [selector,content] of Object.entries(page.metadata)){const e=d.querySelector(selector);assert.equal(e?.getAttribute('content')??normalize(e?.textContent??''),content,page.file+': '+selector)}
 assert.deepEqual([...d.querySelectorAll('h1,h2,h3')].map(e=>[e.tagName,normalize(e.textContent)]),page.headings);
 const paragraphs=[...d.querySelectorAll('p')].map(e=>normalize(e.textContent));for(const text of page.paragraphs)assert.ok(paragraphs.includes(text),text);
 const links=new Set([...d.querySelectorAll('a')].map(a=>href(a.getAttribute('href'),page.route)));for(const target of page.links)assert.ok(links.has(target),target);
 assert.equal(d.querySelectorAll('.hero>.hero-photo img').length,1);
 assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('meta[name="robots"]').content,'noindex, nofollow');
 const sheets=[...d.querySelectorAll('link[rel="stylesheet"]')].map(el=>postcss.parse(fs.readFileSync(path.resolve(web,path.dirname(page.file),el.getAttribute('href')),'utf8')));
 function style(el,width,reduced=false){const out={};for(const ast of sheets)ast.walkRules(rule=>{let active=true;for(let a=rule.parent;a&&a.type!=='root';a=a.parent){if(a.type!=='atrule')continue;if(a.name==='keyframes'){active=false;break}if(a.name==='media'){for(const [,min]of a.params.matchAll(/min-width:\s*(\d+)px/g))if(width<+min)active=false;for(const [,max]of a.params.matchAll(/max-width:\s*(\d+)px/g))if(width>+max)active=false;if(a.params.includes('prefers-reduced-motion')&&!reduced)active=false;if(a.params.includes('hover:hover')||a.params.includes('pointer:fine'))active=false;}}
 if(!active)return;for(const selector of rule.selector.split(',')){let matches=false;try{matches=el.matches(selector.trim())}catch{}if(!matches)continue;const score=(selector.match(/[.#\[]/g)||[]).length+(selector.match(/:(?!:)/g)||[]).length;rule.walkDecls(decl=>{const old=out[decl.prop];if(!old||decl.important&&!old.important||!!decl.important===old.important&&score>=old.score)out[decl.prop]={value:decl.value,score,important:!!decl.important}})}});return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.value]));}
 const widths=[320,360,390,425,430,768,1440];
 for(const width of widths){
  const actions=style(d.querySelector('.hero-actions'),width);assert.equal(actions.display,'grid');assert.ok(actions['grid-template-columns'].includes('minmax(0,1.65fr)'));
  const header=style(d.querySelector('.site-header'),width);assert.equal(header.height,width<=767?'72px':'92px');
  const photo=style(d.querySelector('.hero-photo'),width);assert.equal(photo.position,'absolute');
  if(page.route!=='/'){
   const jump=style(d.querySelector('.knife-jump'),width);assert.equal(jump.display,'grid');assert.ok(jump['grid-template-columns'].includes(width<=767?'repeat(2,':'repeat(3,'));
   if(width<=767)assert.equal(style(d.querySelector('.knife-jump a'),width)['grid-column'],'1/-1');
   for(const card of d.querySelectorAll('.knife-jump a')){assert.equal(style(card,width).display,'flex');assert.equal(style(card,width)['flex-wrap'],'nowrap');assert.equal(style(card.querySelector('svg'),width).flex,'0 0 18px')}
  }
 }
 if(page.route==='/'){
  assert.equal(d.querySelectorAll('.hero-shortcuts .touch-hand').length,0);const hands=[...d.querySelectorAll('.service-link .touch-hand')];assert.equal(hands.length,3);hands.forEach((h,i)=>assert.equal(h.outerHTML,contracts.hands[i]));
  for(const hand of hands){assert.equal(style(hand.closest('.service-touch'),390)['pointer-events'],'none');assert.equal(style(hand.querySelector('.touch-ring'),390,true).animation,'none')}
  const composition=style(d.querySelector('.service-composition'),390);assert.equal(composition['grid-template-columns'],'1fr 1fr');assert.equal(style(d.querySelector('.service-knives'),390)['grid-column'],'1/-1');
  assert.notEqual(style(d.querySelector('.service-knives .service-link'),390).height,style(d.querySelector('.service-scissors .service-link'),390).height);
 }
 reports.push({page:page.route,widths,method:'DOM and stylesheet cascade contracts; not rendered layout',status:'PASS'});
}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify({status:'PASS',checks:reports,renderedBrowser:false,Safari:false,Lighthouse:false},null,2)+'\n');
console.log('PASS: shared header/footer source check, preserved metadata/headings/paragraphs/links, integrated heroes, CTA and 1+2 grid CSS contracts at 320/360/390/425/430/768/1440; unchanged hand SVGs, reduced motion, service asymmetry. NOT a rendered-browser test.');
