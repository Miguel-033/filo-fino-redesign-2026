'use strict';
const fs=require('fs'),cp=require('child_process'),assert=require('assert'),postcss=require('postcss'),{JSDOM}=require('jsdom');
const base='8240e9a4e6f3593853665f7fbce272f7ea5b6f3c';
const old=p=>cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8'}),read=p=>fs.readFileSync(p,'utf8');
const slugs=['afilado-cuchillos-valencia','afilar-tijeras-peluqueria-valencia','herramientas-manicura-pedicura-valencia','afilado-cuchillas-maquinas-valencia','afilado-cuchillos-hosteleria-valencia'];
const pages=['design-premium-preview/index.html','design-premium-preview/servicios/index.html',...slugs.map(s=>'design-premium-preview/servicios/'+s+'/index.html')];
const normalize=s=>s.replace(/<dialog id="menu-dialog"[\s\S]*?<\/dialog>/,'MENU').replace(/(refinement.css|navigation.js|services.css)\?v=[^" ]+/g,'$1?v=VERSION');
const normText=e=>e.textContent.replace(/\s+/g,' ').trim();
for(const p of pages){const a=old(p),b=read(p),isService=slugs.some(s=>p.endsWith('/'+s+'/index.html'));
 const outside=s=>isService?normalize(s).replace(/<section class="hero[\s\S]*?<\/section>/,'HERO'):normalize(s);
 assert.equal(outside(a),outside(b),'Out-of-scope HTML: '+p);
 const da=new JSDOM(a).window.document,db=new JSDOM(b).window.document;
 const links=d=>[...d.querySelectorAll('#menu-dialog a')].map(e=>[e.getAttribute('href'),normText(e)]);
 assert.deepEqual(links(da),links(db),'Menu links/order: '+p);
 assert.equal(db.querySelectorAll('h1').length,1);
 if(isService){assert.equal(normText(da.querySelector('h1')),normText(db.querySelector('h1')));const hero=d=>d.querySelector('.hero');
 if(!/afilar-tijeras-peluqueria|afilado-cuchillas-maquinas/.test(p))assert.equal(hero(da).querySelector('img').outerHTML,hero(db).querySelector('img').outerHTML);
 for(const sel of ['.hero-copy','.service-hero-facts','.service-fact-note','.hero-actions','.knife-address','.knife-walkin'])assert.equal(hero(da).querySelector(sel)?.outerHTML,hero(db).querySelector(sel)?.outerHTML,'Facts/CTA: '+p+sel);}
}
for(const p of ['design-premium-preview/refinement.css','design-premium-preview/services.css']){const a=old(p),b=read(p);assert(b.startsWith(a),'Existing CSS changed');postcss.parse(b.slice(a.length)).walkRules(r=>{for(const s of r.selectors)assert(/^\.(menu-dialog|hero--|hero\.hero--|service-page \.hero\.hero--)/.test(s),'Non-menu/Hero selector: '+s);});}
for(const p of ['design-premium-preview/shipping.css','design-premium-preview/shipping.js','design-premium-preview/assets/illustrations/envios.webp']){assert(cp.execFileSync('git',['show',base+':'+p]).equals(fs.readFileSync(p)));}
const dom=new JSDOM(read(pages[0]),{url:'https://example.test/filo-fino-redesign-2026/',runScripts:'outside-only'}),d=dom.window.document,dialog=d.querySelector('#menu-dialog'),trigger=d.querySelector('.menu-trigger');dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>{dialog.removeAttribute('open');dialog.dispatchEvent(new dom.window.Event('close'));};dom.window.eval(read('design-premium-preview/navigation.js'));
trigger.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true,detail:1}));assert.equal(dialog.dataset.inputModality,'pointer');assert.equal(d.activeElement,dialog.querySelector('.menu-close'));
d.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(dialog.dataset.inputModality,'keyboard');assert.equal(d.activeElement,dialog.querySelector('.menu-bottom a:last-child'));
d.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(d.activeElement,dialog.querySelector('.menu-close'));d.activeElement.click();assert.equal(d.activeElement,trigger);assert(!d.body.classList.contains('modal-open'));
console.log('PASS: only shared menu, five Hero and their cache keys changed; headings/facts/CTA/media/metadata/other sections preserved; scoped CSS; pointer/keyboard state and focus boundaries pass in DOM doubles');

trigger.dispatchEvent(new dom.window.Event('pointerdown',{bubbles:true}));trigger.click();assert.equal(dialog.dataset.inputModality,'pointer');dialog.close();trigger.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));trigger.click();assert.equal(dialog.dataset.inputModality,'keyboard');dialog.close();
console.log('PASS: pointerdown also handles touch-style clicks with detail zero; keyboard activation restores keyboard mode');

for(const p of ['design-premium-preview/assets/images/tijeras-card.webp','design-premium-preview/assets/images/drive/img_1118.webp'])assert(cp.execFileSync('git',['show',base+':'+p]).equals(fs.readFileSync(p)),'Existing real photo bytes changed');
postcss.parse(read('design-premium-preview/refinement.css').slice(old('design-premium-preview/refinement.css').length)).walkDecls('outline',d=>{if(d.value==='none')assert(d.parent.selector.includes('[data-input-modality="pointer"]')&&d.parent.selector.includes('.menu-close:focus'),'Unscoped focus suppression');});
