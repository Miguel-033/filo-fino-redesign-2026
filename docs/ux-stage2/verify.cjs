const fs=require('fs'),cp=require('child_process'),path=require('path'),assert=require('assert/strict'),{JSDOM}=require('jsdom'),postcss=require('postcss');
const root=path.resolve(__dirname,'../..'),web=path.join(root,'design-premium-preview'),base='8efb3ab13e13598d4506523b7722ba30205f6605';
const previous=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8'});
const html=fs.readFileSync(web+'/index.html','utf8'),old=previous('design-premium-preview/index.html');
const normalize=s=>s.replace(/<section id="(?:servicios|trabajos)"[\s\S]*?<\/section>/g,'AUTHORIZED_SECTION').replace(/<dialog id="(?:gallery-dialog|shipping-dialog)"[\s\S]*?<\/dialog>/g,'AUTHORIZED_DIALOG').replace(/service-cards\.css\?v=[^" ]+/g,'service-cards.css').replace(/premium\.js\?v=[^" ]+/g,'premium.js').replace(/<link rel="stylesheet" href="shipping\.css[^\"]*"><script src="shipping\.js[^\"]*" defer><\/script>/,'');
assert.equal(normalize(html),normalize(old),'Unrelated homepage content changed');
const d=new JSDOM(html).window.document,before=new JSDOM(old).window.document;
assert.deepEqual([...d.querySelectorAll('#servicios .service-link')].map(a=>a.getAttribute('href')),[...before.querySelectorAll('#servicios .service-link')].map(a=>a.getAttribute('href')));
for(const a of d.querySelectorAll('#servicios .service-link')){assert.equal(a.querySelectorAll('a,button,details').length,0);assert.equal(a.querySelector('.service-cta>span').textContent,'Ver servicio y precios');}
assert.equal(d.querySelectorAll('#servicios .touch-hand,#servicios .touch-ring,#gallery-dialog').length,0);
assert.equal(d.querySelectorAll('#trabajos .shipping-steps>li').length,5);assert.equal(d.querySelectorAll('#shipping-dialog .shipping-instructions>li').length,5);
assert.ok(!/\b(?:3[–-]5|24|48)\s*(?:días|horas)|gratis|garantiz|Correos|SEUR|MRW|\d+\s*€/i.test(d.querySelector('#trabajos').textContent+d.querySelector('#shipping-dialog').textContent));
const allowed=new Set(['index.html','premium.js','service-cards.css','shipping.css','shipping.js','assets/illustrations/envios.webp','assets/images/tijeras-card.webp']);
for(const f of cp.execFileSync('git',['diff',base,'--name-only','--','design-premium-preview'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean)){assert.ok(allowed.has(f.replace('design-premium-preview/',''))||f.endsWith('.cjs'),'Unexpected runtime change: '+f);}
for(const f of ['seo/routes.json','seo/migration/url-map.csv','robots.txt','sitemap.xml','design-system/components/header.html','design-system/components/menu.html','design-system/components/footer.html'])assert.equal(fs.readFileSync(root+'/'+f,'utf8'),previous(f));
assert.deepEqual(fs.readFileSync(web+'/assets/images/tijeras-card.webp'),fs.readFileSync(root+'/images/Tijeras_de_entresacar.webp'));
const tracked=cp.execFileSync('git',['ls-tree','-r','--name-only',base,'design-premium-preview/assets'],{cwd:root,encoding:'utf8'}).trim().split('\n');
for(const f of tracked)assert.deepEqual(fs.readFileSync(root+'/'+f),cp.execFileSync('git',['show',base+':'+f],{cwd:root,maxBuffer:100*1024*1024}));
for(const f of ['service-cards.css','shipping.css'])postcss.parse(fs.readFileSync(web+'/'+f,'utf8')).walkRules(r=>r.selector.split(',').forEach(s=>assert.ok(/^#(?:servicios|trabajos|shipping-dialog)\b/.test(s.trim()),'Unscoped CSS '+s)));
console.log('PASS: stage 2 scope, original media bytes, service URLs, metadata/registry/shared components/production artifacts, single-action cards and shipping-copy constraints.');
