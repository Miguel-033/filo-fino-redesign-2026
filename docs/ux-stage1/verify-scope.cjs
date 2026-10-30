// Scope gate: only the homepage service-card block and its own assets may change.
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const {JSDOM}=require('jsdom');const root=path.resolve(__dirname,'../..');
const base='5a6089fafc3a5f464bf24fbb2011b950eb8f094c';
const old=cp.execFileSync('git',['show',base+':design-premium-preview/index.html'],{cwd:root,encoding:'utf8'});
const now=fs.readFileSync(path.join(root,'design-premium-preview/index.html'),'utf8');
const block=/<section id="servicios"[\s\S]*?<\/section>/;
const normalized=s=>s.replace(block,'CARDS').replace('<link rel="stylesheet" href="service-cards.css?v=cards-stage1">','').replace('premium.js?v=cards-stage1-r2','premium.js?v=ux20261027');
assert.equal(normalized(now),normalized(old),'Homepage outside service cards changed');
const before=new JSDOM(old).window.document,after=new JSDOM(now).window.document;
assert.deepEqual([...after.querySelectorAll('#servicios img')].map(e=>e.outerHTML),[...before.querySelectorAll('#servicios img')].map(e=>e.outerHTML),'Media changed');
assert.deepEqual([...after.querySelectorAll('#servicios .service-link')].map(e=>e.getAttribute('href')),[...before.querySelectorAll('#servicios .service-link')].map(e=>e.getAttribute('href')),'Routes changed');
const allowed=new Set(['design-premium-preview/index.html','design-premium-preview/premium.js','design-premium-preview/service-cards.css']);
const changed=cp.execFileSync('git',['diff',base,'--name-only','--','design-premium-preview'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const f of changed.filter(f=>!f.endsWith('.cjs')))assert.ok(allowed.has(f),'Out-of-scope runtime file: '+f);
for(const f of ['seo/routes.json','seo/migration/url-map.csv','robots.txt','sitemap.xml','design-system/components/header.html','design-system/components/menu.html','design-system/components/footer.html']){assert.deepEqual(fs.readFileSync(path.join(root,f)),cp.execFileSync('git',['show',base+':'+f],{cwd:root}),f+' changed');}
const css=fs.readFileSync(path.join(root,'design-premium-preview/service-cards.css'),'utf8');require('postcss').parse(css).walkRules(r=>r.selector.split(',').forEach(s=>assert.ok(s.trim().startsWith('#servicios '),'Unscoped card CSS: '+s)));
console.log('PASS: other home blocks byte-identical; media, routes, registry, metadata, menu/footer, production files preserved; new CSS scoped to #servicios.');
