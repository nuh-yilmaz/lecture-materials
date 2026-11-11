// Confidence points and gift (engine 2026-11f; Q107-B, Q108-A, Q109-A, Q111-A). Usage: node conf.js <base url> (serves midoff.html, confoff.html)
// Per item "sure" = +2·s − 4·(1 − s) (s = score share); "not sure" / no mark = 0; gift 4; Total = items + confidence + 4, 0–100.
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const RIGHT={mcq:1,tf:'dydyd',o2:[2,4,0,3,1],match:[2,4,0,1,3],fill:[0,1,2,0,0],o5:[1,4,3,0,6,5,2]};
const WRONG={mcq:0,tf:'ydydy',o2:[1,3,0,4,2],match:[5,5,5,5,5],fill:[1,0,0,1,1],o5:[2,5,6,0,3,4,1]};   // reversed orders keep 0 pairs
const errs=[];
async function page(b,file){ const c=await b.newContext({viewport:{width:1280,height:900}}); await c.route(/example\.invalid/,r=>r.fulfill({status:200,body:'{"ok":true}'})); await c.route(/fonts\./,r=>r.abort());
  const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept()); await p.goto(base+'/'+file+'#pre'); await p.waitForTimeout(300); await p.selectOption('#prog','tip-tr'); return p; }
async function take(p,m,a,conf){   // a = answers, conf = [1|0|null per item]
  await p.click(`#qmode button[data-m="${m}"]`).catch(()=>{}); await p.waitForTimeout(150);
  await p.check(`#r-${m}-0-${a.mcq}`);
  for(let j=0;j<5;j++) await p.check(`#tf-${m}-1-${j}-${a.tf[j]}`);
  for(const k of a.o2) await p.click(`#ord2 [data-tap="${k}"]`);
  for(let j=0;j<5;j++) await p.selectOption(`#sel-${m}-3-${j}`,{value:String(a.match[j])});
  for(let j=0;j<5;j++) await p.selectOption(`#fl-${m}-4-${j}`,{value:String(a.fill[j])});
  for(const k of a.o5) await p.click(`#ord5 [data-tap="${k}"]`);
  for(let i=0;i<6;i++) if(conf[i]!==null) await p.check(`#cf-${m}-${i}-${conf[i]}`);
  await p.click('#qsubmit'); if(await p.isVisible('#qforce')) await p.click('#qforce'); await p.waitForTimeout(250);
  return (await p.textContent('#qres')).replace(/\s+/g,' ').trim(); }
const S6=[1,1,1,1,1,1];
(async()=>{ const b=await chromium.launch();
  // A. all right, all "sure": 84 + 12 + 4 = 100
  let p=await page(b,'midoff.html');
  const box=await p.textContent('#qscorebox');
  ok(box==='Puanlama: «Eminim» işaretli soru doğruysa +2, yanlışsa −4 puan; «Emin değilim» 0 puan. Kısmen doğru sorularda puan orantılıdır. 4 puan bizden hediye.','pre-test: Turkish scoring box text as in simulator_template.md');
  ok((await p.$eval('#qscorebox',e=>e.nextElementSibling.id))==='q0'&&(await p.$eval('#qscorebox',e=>getComputedStyle(e).borderTopColor))!=='rgba(0, 0, 0, 0)','box is coloured and stands right before item 1');
  await p.click('#qmode button[data-m="post"]'); await p.waitForTimeout(150);
  ok(await p.isVisible('#qscorebox'),'post-test: scoring box shown');
  let r=await take(p,'post',RIGHT,S6);
  ok(/Toplam 100\/100 sorular 84\/84 · güven \+12 · hediye 4/.test(r),'all right, all "sure": 84 + 12 + 4 = 100 (max): '+r);
  ok(/4\/4 puan · güven \+2\./.test(await p.textContent('#w0'))&&/24\/24 puan · güven \+2\./.test(await p.textContent('#w5')),'item lines: +2 for a right "sure" item');
  await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)); s.post.t-=15*864e5; localStorage.setItem(k,JSON.stringify(s));},'tpl-t4');
  await p.goto(base+'/midoff.html#late'); await p.reload(); await p.waitForTimeout(300);
  ok(await p.isVisible('#qscorebox')&&await p.isVisible('#qsubmit'),'delayed test: scoring box shown');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(150);
  ok(await p.textContent('#qscorebox')==="Scoring: a 'sure' item earns +2 if right and costs 4 if wrong; 'not sure' gives 0. Partly right items count in proportion. 4 points are a gift from us.",'English scoring box text as in simulator_template.md');
  await p.context().close();
  // B. one wrong "sure" item: −4
  p=await page(b,'midoff.html'); r=await take(p,'post',{...RIGHT,mcq:0},S6);
  ok(/Toplam 90\/100 sorular 80\/84 · güven \+6 · hediye 4/.test(r)&&/0\/4 puan · güven −4\./.test(await p.textContent('#w0')),'one wrong "sure" item costs 4: 80 + (10 − 4) + 4 = 90: '+r);
  await p.context().close();
  // C. partly right items count in proportion; "not sure" and no mark = 0
  p=await page(b,'midoff.html');
  r=await take(p,'post',{...RIGHT,tf:'dydyy',o2:[4,0,3,1,2],fill:[0,1,0,1,1]},[0,1,1,null,1,null]);
  ok(/Toplam 72,7\/100 sorular 69\/84 · güven −0,3 · hediye 4/.test(r),'partial: tf 4/5 +0,8 · order 3/4 pairs +0,5 · fill 2/5 −1,6 → −0,3; items 69; total 72,7: '+r);
  ok(/8\/10 puan · güven \+0,8\./.test(await p.textContent('#w1'))&&/12\/16 puan · güven \+0,5\./.test(await p.textContent('#w2'))&&/6\/15 puan · güven −1,6\./.test(await p.textContent('#w4')),'item lines show the proportional confidence points');
  ok(!/güven/.test(await p.textContent('#w0'))&&!/güven/.test(await p.textContent('#w3')),'"not sure" and no mark: no confidence points');
  await p.context().close();
  // D. all wrong and all "sure": 0 − 24 + 4 = −20 → 0 (never below 0); then post 100; gain
  p=await page(b,'midoff.html'); r=await take(p,'pre',WRONG,S6);
  ok(/Toplam 0\/100 sorular 0\/84 · güven −24 · hediye 4/.test(r),'all wrong, all "sure": −20 is shown as 0 (never below 0): '+r);
  ok((await p.$$eval('#qtopics .tm',e=>e.map(x=>x.textContent))).every(x=>x==='✗'),'topic feedback uses item points only (all ✗)');
  r=await take(p,'post',RIGHT,S6);
  const pills=await p.$$eval('#qcmp .pill',e=>e.map(x=>x.textContent));
  ok(pills.join('|')==='Ön test: 0/100|Son test: 100/100|+100 puan','comparison pills and gain use the total: '+pills.join(' | '));
  await p.goto(base+'/midoff.html#giris'); await p.waitForTimeout(250);
  ok(/100\/100/.test(await p.textContent('#testnote')),'start screen shows the total');
  await p.context().close();
  // E. CONFIDENCE switched off: gift only
  p=await page(b,'confoff.html');
  ok(await p.textContent('#qscorebox')==='Puanlama: 4 puan bizden hediye.'&&!(await p.$('input[name="cf0"]')),'CONFIDENCE=false: box shows the gift only; no "sure" marks');
  r=await take(p,'pre',RIGHT,[null,null,null,null,null,null]);
  ok(/Toplam 88\/88 sorular 84\/84 · hediye 4/.test(r)&&!/güven/.test(r),'CONFIDENCE=false: total = items + 4 (88/88): '+r);
  await p.context().close();
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close(); })().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
