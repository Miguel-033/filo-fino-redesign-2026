// Integration gates for every developed page. jsdom is not a rendering engine.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {JSDOM}=require('jsdom'),postcss=require('postcss');
const root=path.resolve(__dirname,'..'),web=path.join(root,'design-premium-preview');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'routes.json'),'utf8'));
const pages=config.pages.filter(p=>p.status==='developed'),routes=new Map(pages.map(p=>[p.path,p]));
const facts={
 'knife-service':['Desde 4 €','Desde 15 minutos','cerámicos','dentado','sistema tipo Apex'],
 'scissors-service':['17 €','19 €','22 €','Desde 2 horas','Desde 5 €','Desde 7 €','grooming'],
 'manicure-service':['8 €','7 €','5 €','Desde 20 minutos','uña encarnada','Empujadores'],
 'clipper-blades-service':['Desde 13 €','Desde 2 horas','grooming','avería eléctrica'],
 'hospitality-b2b-service':['Desde 6 €','200–300 mm','Condiciones y coste','acuerdo individual']
};
const result=[];
for(const p of pages){
 const file=path.join(web,p.source),html=fs.readFileSync(file,'utf8');
 const dom=new JSDOM(html,{url:'https://preview.test/'+p.path.slice(1),runScripts:'outside-only'}),w=dom.window,d=w.document;
 const text=d.querySelector('main').textContent.replace(/\s+/g,' ');
 assert.equal(d.querySelectorAll('html').length,1);assert.equal(d.querySelectorAll('h1').length,1);
 assert.equal(d.querySelectorAll('header.site-header').length,1);assert.equal(d.querySelectorAll('footer.site-footer').length,1);
 assert.equal(d.querySelectorAll('link[rel=canonical],script[type="application/ld+json"],meta[property="og:url"]').length,0);
 assert.equal(d.querySelector('meta[name=robots]').content,'noindex, nofollow');
 assert.equal(d.title,p.title);assert.equal(d.querySelector('meta[name=description]').content,p.description);
 assert.ok(!/mejor taller|número uno|gratis|24 horas|10 €\/pieza|100%/i.test(text));
 for(const value of facts[p.role]||[])assert.ok(text.toLowerCase().includes(value.toLowerCase()),p.path+' missing fact: '+value);
 const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size);
 for(const use of d.querySelectorAll('use[href^="#"]'))assert.ok(d.getElementById(use.getAttribute('href').slice(1)));
 for(const a of d.querySelectorAll('a[href]')){
  const href=a.getAttribute('href');assert.ok(!href.startsWith('/'),p.path+' host-root link: '+href);
  const url=new URL(href,'https://preview.test'+p.path);
  if(url.origin==='https://preview.test'){
   const dest=routes.get(url.pathname);if(!dest&&url.pathname.startsWith('/assets/')){assert.ok(fs.existsSync(path.join(web,url.pathname)));continue;}assert.ok(dest,p.path+' missing local route '+url.pathname);
   if(url.hash){const destDoc=dest===p?d:new JSDOM(fs.readFileSync(path.join(web,dest.source),'utf8')).window.document;assert.ok(destDoc.getElementById(url.hash.slice(1)),p.path+' missing anchor '+href);}
  }
  if(url.hostname==='wa.me'){assert.equal(url.pathname,'/34614005053');assert.ok(url.searchParams.get('text')?.length>15);}
 }
 for(const el of d.querySelectorAll('img[src],script[src],source[src],video[poster],link[rel=stylesheet],link[rel=preload]')){
  const ref=el.getAttribute('src')||el.getAttribute('poster')||el.getAttribute('href'),target=path.resolve(path.dirname(file),ref);
  assert.ok(target.startsWith(web+path.sep)&&fs.existsSync(target),p.path+' missing asset: '+ref);
 }
 for(const img of d.querySelectorAll('img')){assert.ok(img.hasAttribute('alt'));assert.ok(+img.width>0&&+img.height>0);}
 for(const css of d.querySelectorAll('link[rel=stylesheet]'))postcss.parse(fs.readFileSync(path.resolve(path.dirname(file),css.getAttribute('href')),'utf8'));
 for(const v of d.querySelectorAll('video')){assert.equal(v.preload,'none');assert.equal(v.autoplay,false);assert.equal(v.controls,true);assert.ok(v.hasAttribute('playsinline'));}
 if(p.serviceName){
  assert.equal(d.querySelectorAll('video').length,1);assert.ok(d.querySelector('a[href="tel:+34614005053"]'));
  assert.ok(d.querySelector('.hero .hero-photo img').getAttribute('fetchpriority')==='high');
  // Each new service reuses the accepted menu script, including keyboard-focus return.
  w.matchMedia=()=>({matches:true,addEventListener(){}});w.Element.prototype.getAnimations=()=>[];d.getAnimations=()=>[];
  w.Element.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  const before=[...d.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
  w.eval(fs.readFileSync(path.join(web,'servicios/afilado-cuchillos-valencia/knives.js'),'utf8'));
  const button=d.querySelector('.menu-trigger'),dialog=d.querySelector('#menu-dialog');
  button.click();assert.ok(dialog.open);assert.equal(button.getAttribute('aria-expanded'),'true');
  dialog.querySelector('a[href^="#"]').click();assert.equal(dialog.open,false);assert.equal(button.getAttribute('aria-expanded'),'false');
  assert.equal(d.activeElement.id,w.location.hash.slice(1));
  assert.deepEqual([...d.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),before);
 }
 result.push({path:p.path,status:'PASS',method:'HTML/CSS/asset and menu DOM integration; no browser layout'});
}
for(const media of JSON.parse(fs.readFileSync(path.join(web,'assets/service-media.json'),'utf8'))){
 const source=fs.readFileSync(path.join(root,media.source)),copy=fs.readFileSync(path.join(web,media.file));
 assert.deepEqual(copy,source);assert.equal(crypto.createHash('sha256').update(copy).digest('hex'),media.sha256);
}
// Historic paths, release files and UI assets are intentionally left intact.
for(const [file,digest]of Object.entries(config.productionHandoff.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),digest);
fs.writeFileSync(path.join(__dirname,'service-checks.json'),JSON.stringify({status:'PASS',pages:result,limitations:['Preview server unavailable','No real mobile/desktop/Safari render','No measured Lighthouse or field CWV','No production HTTP/indexing or structured data validation']},null,2)+'\n');
console.log('PASS: seven pages; route graph, facts, metadata, resources/video loading, original media bytes and menu navigation/focus in DOM test doubles. Release files frozen.');
