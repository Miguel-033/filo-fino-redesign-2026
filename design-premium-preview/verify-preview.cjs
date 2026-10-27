const fs=require('fs');const assert=require('node:assert/strict');
const { chromium: pw } = require('playwright');
const path = require('node:path');
const baseUrl = process.env.FILO_PREVIEW_URL || 'http://127.0.0.1:8770/design-premium-preview/';
const output = process.env.FILO_SCREENSHOT_DIR || path.join(__dirname, 'screenshots');
fs.mkdirSync(output, {recursive:true});
const root=path.dirname(output);
const report={date:new Date().toISOString(),browser:'',widths:[],checks:[]};
(async()=>{
 const browser=await pw.launch({headless:true,...(process.env.FILO_CHROMIUM_PATH ? {executablePath:process.env.FILO_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--single-process']} : {})});report.browser=browser.version();
 for(const width of [320,360,390,430,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:width<768?844:1000},deviceScaleFactor:1,isMobile:width<768,hasTouch:width<768});
  const page=await context.newPage();const errors=[];const external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});page.on('request',r=>{if(!r.url().startsWith(baseUrl))external.push(r.url())});
  await page.goto(baseUrl,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  // Load lazy images and finish entrance reveals before screenshots.
  await page.locator('.site-footer').scrollIntoViewIfNeeded();await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));document.getAnimations().forEach(a=>a.finish())});
  const dims=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dims.scroll<=dims.client+1,`Overflow ${width}: ${JSON.stringify(dims)}`);
  assert.equal(await page.locator('.gallery-open').count(),3);
  assert.equal(await page.locator('.hero-photo img').getAttribute('src'),'assets/images/afilado.webp');
  assert.equal(await page.locator('.hero-shortcuts .touch-hand').count(),0);
  assert.equal(await page.locator('a.address-study').getAttribute('href'),'https://maps.app.goo.gl/Z4WQeCUKKeDbx8Qt7');
  const labels=await page.locator('.hero-shortcuts a>span:first-child').allTextContents();assert.deepEqual(labels,['Afilado de herramientas de manicura','Afilado de tijeras','Afilado de cuchillos']);
  assert.equal(await page.locator('body').innerText().then(t=>/[←→↑↓↗↘]/u.test(t)),false);
  const cardSizes=await page.locator('.service-link').evaluateAll(e=>e.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));assert.ok(cardSizes[0].h>cardSizes[1].h);if(width<768)assert.ok(cardSizes[0].w>cardSizes[1].w*1.8);
assert.equal(await page.locator('video,iframe').count(),0);
  const wa=await page.locator('a[data-whatsapp]').evaluateAll(links=>links.map(a=>({context:a.dataset.whatsapp,text:new URL(a.href).searchParams.get('text')})));assert.equal(new Set(wa.map(a=>a.context)).size,5);wa.forEach(a=>assert.ok(a.text.startsWith('[Filo Fino · Web]\n')));
  const photoStatus=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));photoStatus.forEach(i=>{assert.ok(i.src.startsWith('assets/')); assert.ok(i.ok,i.src)});
  for(let i=0;i<4;i++) {await page.locator('.step-button').nth(i).click();assert.equal(await page.locator('.step-button[aria-pressed="true"]').count(),1);assert.ok((await page.locator('#process-image').getAttribute('src')).endsWith(['escuchar.svg','revisar.svg','afilar.svg','comprobar.svg'][i]));assert.equal(await page.locator('#process-image').evaluate(el=>getComputedStyle(el).objectFit),'contain');}
  await page.locator('.step-button').nth(0).click();await page.locator('.gallery-open').first().click();
  for(let i=1;i<=3;i++){assert.equal(await page.locator('#gallery-counter').innerText(),`${i} / 3`);await page.locator('.gallery-next').click();}
  assert.equal(await page.locator('#gallery-counter').innerText(),'1 / 3');await page.locator('.gallery-zoom').click();assert.equal(await page.locator('.gallery-zoom').getAttribute('aria-pressed'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.gallery-open').first().evaluate(el=>document.activeElement===el),true);
  await page.locator('.menu-trigger').click();assert.equal(await page.locator('#menu-dialog').isVisible(),true);
  if(width===390)await page.screenshot({path:output+'/mobile-menu.jpg',type:'jpeg',quality:85});
  await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-trigger').evaluate(el=>el===document.activeElement),true);
  await page.locator('.service-detail summary').first().click();assert.equal(await page.locator('.service-consult[data-whatsapp="knives"]').isVisible(),true);await page.locator('.service-detail summary').first().click();
  if([390,1440].includes(width)){
    const prefix=width===390?'mobile':'desktop';
    await page.evaluate(()=>{document.getAnimations().forEach(a=>a.finish());window.scrollTo({top:0,behavior:'instant'})});
    await page.screenshot({path:output+`/${prefix}-first.jpg`,type:'jpeg',quality:88});
    await page.screenshot({path:output+`/${prefix}-full.jpg`,fullPage:true,type:'jpeg',quality:84});
    await page.locator('.step-button').nth(2).click();await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
    await page.locator('#proceso').screenshot({path:output+`/${prefix}-process.jpg`,type:'jpeg',quality:88});
    await page.locator('.gallery-open').first().click();await page.locator('.gallery-next').click();await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));await page.screenshot({path:output+`/${prefix}-gallery.jpg`,type:'jpeg',quality:85});await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[],`Browser errors at ${width}`);assert.deepEqual(external,[]);report.widths.push({width,overflow:false,errors,externalResourceRequests:external,checks:'photos, WhatsApp, four steps, gallery three, zoom, Escape, focus, disclosure'});await context.close();
 }
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await reduced.newPage();await p.goto(baseUrl);await p.locator('.step-button').nth(2).click();assert.equal(await p.evaluate(()=>document.getAnimations().length),0);report.checks.push('prefers-reduced-motion: no active animations after interaction');await reduced.close();
 const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const n=await nojs.newPage();await n.goto(baseUrl);assert.equal(await n.locator('.hero-shortcuts a').count(),3);assert.equal(await n.locator('.process-stage p').count(),4);assert.equal(await n.locator('.hero-actions a').first().isVisible(),true);await n.locator('.service-detail summary').first().click();assert.equal(await n.locator('.service-consult[data-whatsapp="knives"]').isVisible(),true);report.checks.push('No JavaScript: navigation, WhatsApp, all four descriptions and native disclosure available');await nojs.close();
 fs.writeFileSync(output+'/verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
