// M2 "predict first" box (engine 2026-11f; Q100-A, Q122-A, Q123-A). Usage: node m2.js <base url> (serves midoff.html, nopredict.html)
// Example task on Example 2: "If the pressure difference doubles …, what happens to flow?" set {dp:2,r1:1,r2:1}, answer up.
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m); const errs=[];
async function ctxPage(b,vw){ const c=await b.newContext({viewport:vw||{width:1280,height:900}}); const posts=[];
  await c.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});}); await c.route(/fonts\./,r=>r.abort());
  const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) errs.push('console: '+m.text());}); p.on('dialog',d=>d.accept()); return {c,p,posts}; }
async function sendTest(p,m){ await p.goto(base+'/midoff.html#'+m); await p.waitForTimeout(250); await p.selectOption('#prog','tip-tr').catch(()=>{});
  await p.check(`#r-${m}-0-1`); await p.click('#qsubmit'); if(await p.isVisible('#qforce')) await p.click('#qforce'); await p.waitForTimeout(200); await p.click('#qsend'); await p.waitForTimeout(250); }
const C=o=>Object.fromEntries((o&&o.cols||[]).map(x=>[x[0],x[1]]));
(async()=>{ const b=await chromium.launch();
  // A. wrong prediction after a pause; pre and post rows
  let {c,p,posts}=await ctxPage(b);
  await sendTest(p,'pre');
  await p.goto(base+'/midoff.html#ornek1'); await p.waitForTimeout(250); ok(await p.isHidden('#m-predict'),'module without a task: no box');
  await p.goto(base+'/midoff.html#ornek2'); await p.waitForTimeout(250);
  ok(await p.isVisible('#m-predict')&&/Önce tahmin edin/.test(await p.textContent('#m-predict'))&&/basınç farkı iki katına/.test(await p.textContent('#m-predict .pq')),'Example 2: "Önce tahmin edin" box with the question');
  ok((await p.$$eval('#m-predict input[name=m2opt]',e=>e.length))===3&&/↑ Artar.*↓ Azalır.*= Değişmez/.test((await p.textContent('#m-predict .popts')).replace(/\s+/g,' '))&&await p.isDisabled('#m2lock'),'options ↑ / ↓ / no change; Lock disabled until one is chosen');
  ok(await p.$eval('#m-predict',e=>e.nextElementSibling.id)==='m-controls','box stands above the module controls');
  await p.click('#b-pause'); const dp0=await p.$eval('#c-dp',e=>e.value);
  await p.focus('#m-predict input[value="down"]'); await p.keyboard.press('Space'); ok(!(await p.isDisabled('#m2lock')),'keyboard: Space on an option enables Lock');
  await p.click('#m2lock'); await p.waitForTimeout(300);
  ok(dp0==='1'&&await p.$eval('#c-dp',e=>e.value)==='2'&&await p.$eval('#c-r1',e=>e.value)==='1','Lock applies the settings like a preset (ΔP 1 → 2)');
  ok(/Duraklat/.test(await p.textContent('#b-pause'))&&await p.$eval('#c-scen [data-pi="0"]',e=>e.getAttribute('aria-pressed'))==='false','Lock runs the paused module; the preset button is released');
  const res=(await p.textContent('#m-predict .pres')).replace(/\s+/g,' ');
  ok(/Tahmininiz: ↓ Azalır · Doğru cevap: ↑ Artar ✗/.test(res)&&/iki katına çıkar/.test(await p.textContent('#m-predict .pwhy')),'then the box shows the prediction, the right answer (✗) and the explanation: '+res);
  ok(!(await p.$('#m2lock'))&&!(await p.$('#m-predict input')),'one try: no options and no Lock after locking');
  await p.reload(); await p.waitForTimeout(250); ok(/Tahmininiz: ↓/.test(await p.textContent('#m-predict'))&&!(await p.$('#m2lock')),'after a reload the result stays (one try per browser)');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(150);
  ok(/Predict first/.test(await p.textContent('#m-predict'))&&/Your prediction: ↓ Falls · Right answer: ↑ Rises/.test((await p.textContent('#m-predict')).replace(/\s+/g,' ')),'English texts');
  await p.click('#lang button[data-l="tr"]');
  await sendTest(p,'post');
  const pr=C(posts[0]), po=C(posts[1]);
  ok(pr['M2 answers']===null&&pr['M2 right']===null,'pre-test row: M2 columns created empty');
  ok(po['M2 answers']==='D'&&po['M2 right']===0,'post-test row: "M2 answers" D, "M2 right" 0');
  ok(po['Total (100)']===8&&po['Auto total (84)']===4,'0 points: the total is not changed by M2 (4 + 0 + 4 = 8)');
  const k=(posts[1].cols||[]).map(x=>x[0]); ok(k.indexOf('M2 answers')===k.indexOf('Still unclear')+1&&k.indexOf('M2 right')+1===k.indexOf('Program'),'M2 columns after the form answers, before Program');
  await p.goto(base+'/midoff.html#test-sifirla'); await p.waitForTimeout(200); await p.goto(base+'/midoff.html#ornek2'); await p.reload(); await p.waitForTimeout(250);
  ok(await p.isVisible('#m2lock'),'#test-sifirla also resets the prediction tasks');
  await c.close();
  // B. right prediction; C. skip
  ({c,p,posts}=await ctxPage(b)); await p.goto(base+'/midoff.html#ornek2'); await p.waitForTimeout(250);
  await p.check('#m-predict input[value="up"]'); await p.click('#m2lock'); await p.waitForTimeout(200);
  ok(/Tahmininiz: ↑ Artar · Doğru cevap: ↑ Artar ✓/.test((await p.textContent('#m-predict .pres')).replace(/\s+/g,' ')),'right prediction marked ✓');
  await sendTest(p,'post'); ok(C(posts[0])['M2 answers']==='U'&&C(posts[0])['M2 right']===1,'right prediction: "U", 1');
  await c.close();
  ({c,p,posts}=await ctxPage(b,{width:390,height:844})); await p.goto(base+'/midoff.html#ornek2'); await p.waitForTimeout(250);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'box fits 390 px: '+sw);
  await (await p.$('#m-predict')).screenshot({path:'m2_phone.png'});
  await p.click('#m2skip'); await p.waitForTimeout(200); const sk=(await p.textContent('#m-predict')).replace(/\s+/g,' ');
  ok(/Atladınız\. Doğru cevap: ↑ Artar/.test(sk)&&/iki katına/.test(sk)&&await p.$eval('#c-dp',e=>e.value)==='1','Skip uses the try and shows the answer and explanation; settings not applied');
  await sendTest(p,'post'); ok(C(posts[0])['M2 answers']==='-'&&C(posts[0])['M2 right']===0,'skipped: "-", 0');
  await c.close();
  // D. PREDICT switched off
  ({c,p,posts}=await ctxPage(b)); await p.goto(base+'/nopredict.html#ornek2'); await p.waitForTimeout(250);
  ok(await p.isHidden('#m-predict'),'PREDICT=false: no box');
  await p.goto(base+'/nopredict.html#post'); await p.waitForTimeout(250); await p.selectOption('#prog','tip-tr'); await p.check('#r-post-0-1'); await p.click('#qsubmit'); await p.click('#qforce'); await p.waitForTimeout(200); await p.click('#qsend'); await p.waitForTimeout(250);
  ok(posts[0]&&!('M2 answers' in C(posts[0]))&&!('M2 right' in C(posts[0])),'PREDICT=false: no M2 columns');
  await c.close();
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close(); })().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
