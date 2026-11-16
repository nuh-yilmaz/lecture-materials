// F1 remediation plan on the post-test key screen (engine 2026-11i; review_ai_in_education.md, F1). Usage: node rem.js <base url> (serves midoff.html, lateoff.html)
// Shown after the post-test key only; lists only topics marked ✗ (below 50%) or ~ (50–74%); TR and EN text as approved; step 4 only with the delayed test.
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const RIGHT={mcq:1,tf:'dydyd',o2:[2,4,0,3,1],match:[2,4,0,1,3],fill:[0,1,2,0,0],o5:[1,4,3,0,6,5,2]};
const WRONG={mcq:0,tf:'ydydy',o2:[1,3,0,4,2],match:[5,5,5,5,5],fill:[1,0,0,1,1],o5:[2,5,6,0,3,4,1]};
const HALF2={...RIGHT,tf:'yyydd',fill:[1,0,0,1,0]};   // Example 2: only the 16-point order right → 16/32 = 50% (~); Example 1 stays ✓
const TR=['Simülatörde konunun modülünü aç; tahmin ve görevi yeniden dene.','Modül notundaki kitap sayfalarından 1–2 temel cümleyi işaretle.','Kendi sözcüklerinle 3 kısa not kartı yaz (önde soru, arkada yanıt).','14 gün sonra açılan gecikmeli testte kendini yokla.'];
const EN=["Open the topic's module in the simulator; try the prediction and mission again.",'Mark 1–2 key sentences in the book pages listed in the module note.','Write 3 short note cards in your own words (question on front, answer on back).','Test yourself in the delayed test, which opens after 14 days.'];
const errs=[];
async function page(b,file,w){ const c=await b.newContext({viewport:{width:w||1280,height:900}}); await c.route(/example\.invalid/,r=>r.fulfill({status:200,body:'{"ok":true}'})); await c.route(/fonts\./,r=>r.abort());
  const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept()); await p.goto(base+'/'+file+'#pre'); await p.waitForTimeout(300); await p.selectOption('#prog','tip-tr'); return p; }
async function take(p,m,a){
  await p.click(`#qmode button[data-m="${m}"]`).catch(()=>{}); await p.waitForTimeout(150);
  await p.check(`#r-${m}-0-${a.mcq}`);
  for(let j=0;j<5;j++) await p.check(`#tf-${m}-1-${j}-${a.tf[j]}`);
  for(const k of a.o2) await p.click(`#ord2 [data-tap="${k}"]`);
  for(let j=0;j<5;j++) await p.selectOption(`#sel-${m}-3-${j}`,{value:String(a.match[j])});
  for(let j=0;j<5;j++) await p.selectOption(`#fl-${m}-4-${j}`,{value:String(a.fill[j])});
  for(const k of a.o5) await p.click(`#ord5 [data-tap="${k}"]`);
  await p.click('#qsubmit'); if(await p.isVisible('#qforce')) await p.click('#qforce'); await p.waitForTimeout(250); }
const steps=p=>p.$$eval('#qrem li',e=>e.map(x=>x.textContent));
const links=p=>p.$$eval('#qrem a',e=>e.map(x=>x.textContent));
(async()=>{ const b=await chromium.launch();
  // A. pre-test (no key): no plan, even with all topics ✗; post-test all ✓: no plan
  let p=await page(b,'midoff.html'); await take(p,'pre',WRONG);
  ok((await p.$$eval('#qtopics .tm',e=>e.map(x=>x.textContent))).every(x=>x==='✗')&&!(await p.isVisible('#qrem')),'pre-test: topics all ✗, but no plan (no key in the pre-test)');
  await take(p,'post',RIGHT);
  ok(!(await p.isVisible('#qrem'))&&(await p.$$eval('#qtopics .tm',e=>e.every(x=>x.textContent==='✓'))),'post-test all ✓: no plan');
  await p.context().close();
  // B. post-test with one topic ~ (50%) and one ✓: plan lists only the ~ topic
  p=await page(b,'midoff.html'); await take(p,'post',HALF2);
  const marks=await p.$$eval('#qtopics li',e=>e.map(x=>x.textContent.trim()));
  ok(marks.join('|')==='✓ Örnek 1: Temel|~ Örnek 2: Denklem','topics: Example 1 ✓, Example 2 ~ (50%): '+marks.join(' | '));
  ok(await p.isVisible('#qrem'),'post-test: plan shown');
  ok((await links(p)).join('|')==='~Örnek 2: Denklem','plan lists only the ~ topic, not the ✓ topic');
  ok((await p.$eval('#qrem b',e=>e.textContent))==='Gözden Geçirme Planı'&&/^Gözden Geçirilecek Konular:/.test(await p.$eval('#qrem p',e=>e.textContent)),'Turkish heading and topic line');
  ok(JSON.stringify(await steps(p))===JSON.stringify(TR),'Turkish steps 1–4 as approved in F1');
  ok(await p.$eval('#qrem',e=>{const t=document.getElementById('qtopics'); return t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING;})>0,'plan stands after the topic result (after the key)');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(200);
  ok(JSON.stringify(await steps(p))===JSON.stringify(EN),'English steps 1–4 as approved in F1');
  ok((await p.$eval('#qrem b',e=>e.textContent))==='Review plan'&&(await links(p)).join('|')==='~Example 2: Equation','English heading and topic link');
  await p.click('#qrem a'); await p.waitForTimeout(250);
  ok(/#ornek2$/.test(p.url())||await p.isVisible('#t-ornek2[aria-selected="true"]'),'topic link opens the module: '+p.url());
  await p.context().close();
  // C. post-test all wrong: both topics ✗; 390 px fits
  p=await page(b,'midoff.html',390); await take(p,'post',WRONG);
  ok((await links(p)).join('|')==='✗Örnek 1: Temel · ✗Örnek 2: Denklem'.split(' · ').join('|'),'all wrong: both ✗ topics listed: '+(await links(p)).join(' | '));
  ok(await p.$eval('#qrem',e=>e.scrollWidth<=e.clientWidth+1),'390 px: plan fits the width');
  // D. delayed test (keyed): no plan
  await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)); s.post.t-=15*864e5; localStorage.setItem(k,JSON.stringify(s));},'tpl-t4');
  await p.goto(base+'/midoff.html#late'); await p.reload(); await p.waitForTimeout(300); await take(p,'late',WRONG);
  ok(await p.isVisible('#qtopics')&&!(await p.isVisible('#qrem')),'delayed test: topics shown, no plan');
  await p.context().close();
  // E. delayed test switched off: steps 1–3 only
  p=await page(b,'lateoff.html'); await take(p,'post',WRONG);
  ok(JSON.stringify(await steps(p))===JSON.stringify(TR.slice(0,3)),'TESTS.late off: step 4 left out');
  await p.context().close();
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close(); console.log(out.join('\n'));
})().catch(e=>{console.log('CRASH '+e.stack); process.exit(1);});
