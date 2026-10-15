// Requires Playwright and locally installed browser engines, not site dependencies.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const url=process.env.FILO_KNIVES_URL||'http://127.0.0.1:8772/design-premium-preview/servicios/afilado-cuchillos-valencia/';
const out=process.env.FILO_KNIVES_SCREENSHOTS||path.join(__dirname,'browser-checks');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.FILO_CHROMIUM_PATH?{executablePath:process.env.FILO_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--single-process']}: {})});
 fs.mkdirSync(out,{recursive:true});
 const report={url,chromium:browser.version(),widths:[],webkit:null};
 for(const width of [320,390,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.locator('.site-footer').scrollIntoViewIfNeeded();await page.locator('h1').scrollIntoViewIfNeeded();await page.evaluate(async()=>{await Promise.all([...document.images].map(x=>x.decode().catch(()=>{})));document.getAnimations().forEach(a=>a.finish());});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.locator('img').evaluateAll(img=>img.every(x=>x.naturalWidth>0)));
  await page.locator('[data-photo="0"]').click();for(let i=1;i<=3;i++){assert.equal(await page.locator('#knife-gallery-counter').innerText(),`${i} / 3`);await page.locator('.knife-next').click();}await page.locator('.knife-zoom').click();assert.equal(await page.locator('.knife-zoom').getAttribute('aria-pressed'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('[data-photo="0"]').evaluate(x=>document.activeElement===x),true);
  await page.locator('.menu-trigger').click();assert.equal(await page.locator('#menu-dialog').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-trigger').evaluate(x=>document.activeElement===x),true);
  await page.locator('.knife-faq-list summary').first().click();assert.equal(await page.locator('.knife-faq-list details').first().getAttribute('open'),'');
  if([390,1440].includes(width)){await page.locator('h1').scrollIntoViewIfNeeded();await page.evaluate(()=>{document.getAnimations().forEach(a=>a.finish());scrollTo({top:0,behavior:'instant'});});await page.screenshot({path:path.join(out,`${width}-full.jpg`),type:'jpeg',quality:85,fullPage:true});}
  assert.deepEqual(errors,[]);report.widths.push({width,passed:true});await context.close();
 }
 const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});const rp=await reduced.newPage();await rp.goto(url);await rp.locator('.knife-contact').scrollIntoViewIfNeeded();assert.equal(await rp.evaluate(()=>document.getAnimations().length),0);await reduced.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});const np=await nojs.newPage();await np.goto(url);assert.equal(await np.locator('h1').isVisible(),true);assert.equal(await np.locator('.knife-faq-list summary').count(),7);assert.equal(await np.locator('a[data-whatsapp]').first().isVisible(),true);await nojs.close();await browser.close();
 try {const safari=await webkit.launch();const c=await safari.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();await p.goto(url);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('.menu-trigger').click();assert.equal(await p.locator('#menu-dialog').isVisible(),true);report.webkit='Passed emulated mobile WebKit basic layout/menu; not a physical iPhone';await safari.close();}catch(e){report.webkit='Unavailable or failed: '+e.message.split('\n')[0];}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(report);
})().catch(e=>{console.error(e.message.split('\n').slice(0,4).join('\n'));process.exit(1);});
