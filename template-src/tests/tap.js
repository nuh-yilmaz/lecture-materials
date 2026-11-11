// Tap ordering (engine 2026-11f, Q105-A, Q115-A). Usage: node tap.js <base url>  (serves midoff.html; see run_all.sh)
// Item 3 (index 2): rows A–E, key C E A D B. Item 6 (index 5): 7 rows.
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const nums=async(p,i)=>p.$$eval(`#ord${i} [data-tap]`,e=>e.map(x=>x.querySelector('.tnum').textContent.replace(/[^0-9]/g,'')||'-').join(''));   // number per row A, B, C, …
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true}); const posts=[];
  await ctx.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});}); await ctx.route(/fonts\./,r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto(base+'/midoff.html#pre'); await p.waitForTimeout(300); await p.selectOption('#prog','tip-tr');
  ok((await p.$$eval('#ord2 [data-tap]',e=>e.length))===5&&await nums(p,2)==='-----','5 steps, no numbers at the start');
  ok(/dokunun/.test(await p.textContent('#ord2 .ordhint'))&&await p.isDisabled('#ord2 [data-oclear]'),'how-to line shown; "Sırayı temizle" disabled while nothing is numbered');
  await p.tap('#ord2 [data-tap="2"]'); await p.tap('#ord2 [data-tap="4"]'); await p.tap('#ord2 [data-tap="0"]');
  ok(await nums(p,2)==='3-1-2','taps C, E, A show 1, 2, 3: '+await nums(p,2));
  ok(await p.getAttribute('#ord2 [data-tap="2"]','aria-pressed')==='true'&&await p.getAttribute('#ord2 [data-tap="1"]','aria-pressed')==='false','numbered steps are marked pressed (aria-pressed)');
  await p.tap('#ord2 [data-tap="4"]');
  ok(await nums(p,2)==='2-1--','tapping numbered E removes its number; A moves down from 3 to 2: '+await nums(p,2));
  await p.tap('#ord2 [data-tap="3"]'); ok(await nums(p,2)==='2-13-','the next tap gets the next number (D = 3): '+await nums(p,2));
  await p.tap('#ord2 [data-oclear]'); ok(await nums(p,2)==='-----'&&await p.evaluate(()=>document.activeElement.dataset.tap)==='0','"Sırayı temizle" removes all numbers; focus goes to the first step');
  // keyboard
  await p.focus('#ord2 [data-tap="2"]'); await p.keyboard.press('Enter');
  ok(await nums(p,2)==='--1--'&&await p.evaluate(()=>document.activeElement.dataset.tap)==='2','keyboard: Enter numbers the step and focus stays on it');
  await p.keyboard.press('Tab'); await p.keyboard.press('Space');
  ok(await nums(p,2)==='--12-','keyboard: Tab to the next step, Space numbers it: '+await nums(p,2));
  await p.keyboard.press('Space'); ok(await nums(p,2)==='--1--','keyboard: Space on a numbered step removes its number');
  // partly numbered: C E A, then check
  await p.tap('#ord2 [data-oclear]'); for(const k of [2,4,0]) await p.tap(`#ord2 [data-tap="${k}"]`);
  await p.check('#r-pre-0-1'); await p.click('#qsubmit'); const w=await p.textContent('#qwarn');
  ok(/3 \(numarasız adım: 2\)/.test(w)&&/6 \(numarasız adım: 7\)/.test(w),'blank warning counts the steps without a number: '+w.slice(0,120));
  await p.click('#qforce'); await p.waitForTimeout(300);
  const rows=await p.$$eval('#ord2 .ordrow',e=>e.map(x=>x.innerText.replace(/\s+/g,' ').trim().slice(0,4)));
  ok(rows.length===5&&rows.join('|')==='1 C)|2 E)|3 A)|4 B)|5 D)'&&!(await p.$('#ord2 [data-tap]')),'after checking: steps in the student\'s order, unnumbered B and D at the end, no tap buttons: '+rows.join(' | '));
  await p.click('#qsend'); await p.waitForTimeout(300); const c=Object.fromEntries((posts[0]||{cols:[]}).cols);
  ok(c['A3']==='CEABD'&&c['Q3 order (16)']===8&&c['A6']==='ABCDEFG','Sheet answer string unchanged (CEABD) and pair score 2 of 4 = 8');
  // post-test: right order by taps → full points and the key
  await p.click('#qmode button[data-m="post"]'); await p.waitForTimeout(200);
  for(const k of [2,4,0,3,1]) await p.tap(`#ord2 [data-tap="${k}"]`);
  ok(await nums(p,2)==='35142','post: numbers in the key order C E A D B');
  await p.click('#qsubmit'); await p.click('#qforce').catch(()=>{}); await p.waitForTimeout(300);
  ok(/16\/16/.test(await p.textContent('#w2'))&&(await p.$$eval('#ord2 .ordrow.right',e=>e.length))===5,'post: 16/16 and every row marked right');
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'no horizontal scroll at 390 px: '+sw);
  await p.goto(base+'/midoff.html#test-sifirla'); await p.waitForTimeout(300); await p.goto(base+'/midoff.html#pre'); await p.waitForTimeout(300);
  const hgt=await p.$$eval('#ord5 [data-tap]',e=>Math.min(...e.map(x=>x.getBoundingClientRect().height))); ok(hgt>=44,'tap targets at least 44 px high: '+Math.round(hgt));
  const ow=await p.$$eval('#ord5 [data-tap]',e=>Math.max(...e.map(x=>x.getBoundingClientRect().right))); ok(ow<=390,'7-step item fits the phone width: right edge '+Math.round(ow));
  await (await p.$('#q5')).screenshot({path:'tap_phone.png'});
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(200);
  ok(/Tap the steps/.test(await p.textContent('#ord2 .ordhint'))&&/Clear order/.test(await p.textContent('#ord2 [data-oclear]')),'English: how-to line and "Clear order"');
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close(); })().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
