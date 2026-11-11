// Smoke test for the simulator template. Usage: node tsmoke.js <file> <shotPrefix>
const {chromium}=require('playwright');
const [file,shot]=process.argv.slice(2);
const out=[]; const ok=(c,m)=>out.push((c?"PASS ":"FAIL ")+m);
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}});
  await ctx.route(/fonts\.|example\.invalid|script\.google/,r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto('file://'+file); await p.waitForTimeout(500);
  ok(await p.isVisible('#v-giris'),'start page visible');
  ok((await p.$$eval('.modcard',e=>e.length))===4,'4 module cards on the start page');
  ok(await p.$eval('#gofirst',e=>e.dataset.go)==='ornek1','"first module" button opens ornek1');
  await p.screenshot({path:shot+'_start.png'});
  const tabs=await p.$$eval('#tabs button',e=>e.map(x=>x.dataset.go));
  ok(tabs.join()==='giris,ornek1,ornek2,ornek3,ornek4,test','tabs: '+tabs.join());
  for(const lang of ['tr','en']){
    if(lang==='en'){ await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(300); }
    for(const k of tabs.filter(x=>x.startsWith('ornek'))){
      await p.click(`#t-${k}`); await p.waitForTimeout(300);
      for(const r of await p.$$('#m-controls input[type=range]')) await r.evaluate(el=>{el.value=(+el.min+ +el.max)/2*1.1; el.dispatchEvent(new Event('input',{bubbles:true}));});
      for(const t of await p.$$('#m-controls input[type=checkbox]')){ await t.evaluate(el=>el.click()); await p.waitForTimeout(60);}
      for(const bt of await p.$$('#m-controls button.btn')) await bt.evaluate(el=>el.click());
      await p.waitForTimeout(1500);
      if(lang==='tr') await p.screenshot({path:`${shot}_${k}.png`,fullPage:true});
    }
  }
  // English text present
  await p.click('#t-ornek1'); await p.waitForTimeout(300);
  ok(/Negative feedback/.test(await p.textContent('#m-title')),'EN module title');
  await p.click('#lang button[data-l="tr"]'); await p.waitForTimeout(300);
  // presets in ornek2
  await p.click('#t-ornek2'); await p.waitForTimeout(300);
  await p.click('#c-scen [data-pi="1"]'); await p.waitForTimeout(200);
  ok(await p.$eval('#c-r1',e=>e.value)==='0.8','preset "Damar 1 dar" sets radius 1 to 0.8');
  ok(await p.$eval('#c-scen [data-pi="1"]',e=>e.getAttribute('aria-pressed'))==='true','preset button pressed');
  await p.$eval('#c-dp',el=>{el.value=1.3; el.dispatchEvent(new Event('input',{bubbles:true}));}); await p.waitForTimeout(100);
  ok(await p.$eval('#c-scen [data-pi="1"]',e=>e.getAttribute('aria-pressed'))==='false','moving a slider releases the preset');
  ok(await p.isVisible('.gauge svg')&&await p.isVisible('.eqbox')&&await p.isVisible('.stack')&&await p.isVisible('.bars'),'gauge, equation, share bar, bar list visible');
  await p.click('#c-book'); await p.waitForTimeout(300);
  ok(/Ganong/.test(await p.textContent('.gauge small')),'book switch changes the gauge note');
  // drawing area and short window in ornek3
  await p.click('#t-ornek3'); await p.waitForTimeout(2500);
  ok(await p.isVisible('#m-drawbox'),'drawing area visible in ornek3');
  const n=+await p.textContent('#m-visual .clock'); ok(n>=0,'counter shown: '+n);
  await p.click('#t-ornek1'); await p.waitForTimeout(200); ok(!(await p.isVisible('#m-drawbox')),'drawing area hidden in ornek1');
  // 24-hour mode
  await p.click('#t-ornek4'); await p.waitForTimeout(200);
  const h0=await p.textContent('#m-visual .clock'); await p.click('#c-play'); await p.waitForTimeout(2200);
  const h1=await p.textContent('#m-visual .clock'); ok(h0!==h1,'play the day moves the clock: '+h0+' → '+h1);
  await p.screenshot({path:shot+'_ornek4_play.png'});
  // mobile width
  await p.setViewportSize({width:390,height:844}); await p.click('#t-ornek2'); await p.waitForTimeout(500);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'no horizontal scroll at 390 px: '+sw);
  await p.screenshot({path:shot+'_mobile.png',fullPage:true});
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close();
})().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
