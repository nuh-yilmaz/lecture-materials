// Pre-test class summary for the projector, #summary (engine 2026-11j; review_ai_in_education.md, pre-test focus procedure).
// Usage: node csum.js <base url> (serves midon.html with SHEET_URL=example.invalid and plain.html without SHEET_URL)
// Template items: Q1 mcq 4, Q2 tf 10, Q4 match 15, Q6 order 24 → Example 1 (ornek1, 53 points); Q3 order 16, Q5 fill 15 → Example 2 (ornek2, 31 points).
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const ITEMS=(s)=>[['mcq',4],['tf',10],['order',16],['match',15],['fill',15],['order',24]].map(([type,pts],i)=>({q:i+1,type,pts,n:8,share:s[i]}));
(async()=>{ const b=await chromium.launch(); const errs=[];
  const ctx=await b.newContext({viewport:{width:1280,height:720}}); const gets=[]; let reply={ok:true,n:3,min:5,items:[]}, fail=false;
  await ctx.route(/fonts\./,r=>r.abort());
  await ctx.route(/example\.invalid/,r=>{ gets.push(r.request().url()); if(fail) return r.abort();
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(reply)}); });
  const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-14T10:00:00')}); const T0=Date.parse('2026-11-14T10:00:00');
  const last=()=>new URL(gets[gets.length-1]).searchParams, tick=async ms=>{ await p.clock.runFor(ms); await p.waitForTimeout(300); };
  const rows=()=>p.$$eval('#blist li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  // ---- 1. link and request
  await p.goto(base+'/midon.html#summary'); await p.waitForTimeout(400);
  ok(await p.isVisible('#board')&&/Ön test · Sınıf özeti/.test(await p.textContent('#board h2'))&&new URL(p.url()).hash==='#summary','#summary opens the class summary (TR title)');
  const q=last(); ok(q.get('summary')==='template'&&q.get('test')==='pre'&&q.get('ver')==='2026-11h','asks the script for course "template", Test pre, this Version');
  ok(Math.abs(+q.get('since')-(T0-30*60e3))<5000,'default window: the last 30 minutes');
  // ---- 2. fewer than 5 students
  ok(/3 öğrenci ön testi gönderdi/.test(await p.textContent('#bcount'))&&/en az 5 öğrenci gönderince görünür \(3\/5\)/.test(await p.textContent('#blist'))&&!(await p.textContent('#bitems')),'3 students: count and "at least 5" message, no topics or items');
  reply={ok:true,n:4,min:2,items:ITEMS([1,1,1,1,1,1])}; await tick(10200);
  ok(gets.length===2&&/\(4\/5\)/.test(await p.textContent('#blist')),'refreshes every 10 s; the engine keeps at least 5 even if the script says less');
  // ---- 3. topics, marks, order, items line
  reply={ok:true,n:8,min:5,items:ITEMS([.25,.9,.4,.8,.5,.7])}; await tick(10200);
  // Example 1: (.25·4 + .9·10 + .8·15 + .7·24)/53 = 38.8/53 = 73% (~) · Example 2: (.4·16 + .5·15)/31 = 13.9/31 = 45% (✗)
  let R=await rows();
  ok(R.length===2&&/^✗ Örnek 2: Denklem %45 Modülü aç ›$/.test(R[0])&&/^~ Örnek 1: Temel %73 Modülü aç ›$/.test(R[1]),'topic % weighted by item points (q.mod); marks ✗ and ~; weakest first; "Modülü aç" for ✗ and ~');
  ok(await p.$eval('#blist li',x=>x.className)==='sbad','✗ row has the "sbad" style');
  ok((await p.textContent('#bitems'))==='Sorular: S1 %25 · S2 %90 · S3 %40 · S4 %80 · S5 %50 · S6 %70','item line: share per item');
  ok(/✓ %75 ve üzeri · ~ %50–74 · ✗ %50 altı/.test(await p.textContent('#slegend'))&&/tahmin görevini canlı yapın \(yaklaşık 3 dk\)/.test(await p.textContent('#shint')),'legend and procedure hint (step 4)');
  ok(/8 öğrenci/.test(await p.textContent('#bcount'))&&/Son güncelleme/.test(await p.textContent('#bnote')),'count and last update');
  // ---- 4. items that do not match this version are left out; all ✓ → no buttons
  reply={ok:true,n:8,items:[{q:1,type:'tf',pts:4,share:0},{q:2,type:'tf',pts:10,share:.8},{q:9,type:'mcq',pts:4,share:0}].concat(ITEMS([1,1,.9,1,.8,1]).slice(2))}; await tick(10200);
  R=await rows();
  ok(R.length===2&&/^✓ Örnek 2: Denklem %85$/.test(R[0])&&/^✓ Örnek 1: Temel %96$/.test(R[1])&&!(await p.$('#blist .sopen')),'an item with another type or number is not counted; ✓ topics have no button');
  ok(!/S1 /.test(await p.textContent('#bitems'))&&/^Sorular: S2 %80 · S3 %90/.test(await p.textContent('#bitems')),'item line shows only the counted items');
  // ---- 5. connection error, reset
  fail=true; await tick(10200); ok(/Bağlantı yok/.test(await p.textContent('#bnote')),'connection error message'); fail=false;
  reply={ok:true,n:8,min:5,items:ITEMS([.25,.9,.4,.8,.5,.7])};
  await p.clock.runFor(60000); const n0=gets.length; await p.click('#breset'); await p.waitForTimeout(300);
  ok(gets.length===n0+1&&Math.abs(+last().get('since')-(T0+60000+4*10200))<15000,'"Sıfırla (yeni grup)" restarts the window now');
  // ---- 6. open module at its prediction task
  await p.click('#blist .sopen[data-m="ornek2"]'); await p.waitForTimeout(400);
  ok(!(await p.isVisible('#board'))&&await p.isVisible('#v-mod')&&new URL(p.url()).hash==='#ornek2','"Modülü aç" closes the summary and opens the module');
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='m-predict'),'the prediction box has the focus');
  const g=gets.length; await tick(20500); ok(gets.length===g,'no more requests after the summary is closed');
  // ---- 7. #board still works; close
  await p.goto(base+'/midon.html#board1'); await p.waitForTimeout(400); ok(/board=template-quiz/.test(gets[gets.length-1]),'#board1 still opens the leaderboard');
  await p.goto(base+'/midon.html#summary'); await p.waitForTimeout(400); await p.click('#bclose'); await p.waitForTimeout(200);
  ok(!(await p.isVisible('#board'))&&await p.isVisible('#v-giris'),'"Kapat" closes the summary');
  // ---- 8. EN, phone width, no SHEET_URL
  const c2=await b.newContext({viewport:{width:390,height:800}}); await c2.route(/fonts\./,r=>r.abort());
  await c2.route(/example\.invalid/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,n:8,items:ITEMS([.25,.9,.4,.8,.5,.7])})}));
  const e=await c2.newPage(); e.on('pageerror',x=>errs.push(x.message));
  await e.goto(base+'/midon.html?lang=en#summary'); await e.waitForTimeout(600);
  const RE=await e.$$eval('#blist li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  ok(/Pre-test · Class summary/.test(await e.textContent('#board h2'))&&/^✗ Example 2: Equation 45% Open module ›$/.test(RE[0])&&/^Items: Q1 25%/.test(await e.textContent('#bitems')),'EN text');
  ok(await e.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1&&[...document.querySelectorAll('#board *')].every(x=>x.getBoundingClientRect().right<=window.innerWidth+1)),'390 px: no horizontal overflow');
  await e.goto(base+'/plain.html?lang=en#summary'); await e.waitForTimeout(400);
  ok(/SHEET_URL is empty/.test(await e.textContent('#bnote')),'no SHEET_URL: note, no request');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close(); console.log(out.join('\n'));
})().catch(e=>{ console.log(out.join('\n')); console.log('CRASH '+e.message); });
