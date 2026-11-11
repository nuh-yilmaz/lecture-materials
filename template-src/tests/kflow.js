// Mini-quiz (Kahoot style) check. Usage: node kflow.js <file with SHEET_URL=example.invalid>
const {chromium}=require('playwright'); const file=process.argv[2]; const base=process.argv[3]||('file://'+file);   // base = http://127.0.0.1:PORT/name.html (served like GitHub Pages)
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}}); const posts=[];
  await ctx.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});});
  await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{ if(!localStorage.getItem('sim-code')) localStorage.setItem('sim-code',JSON.stringify('NF-7KQ2')); });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-11T10:00:00')}); await p.clock.pauseAt(new Date('2026-11-11T10:00:01'));
  await p.goto(base+'#mid'); await p.waitForTimeout(300);
  ok(await p.isVisible('#v-test')&&(await p.getAttribute('#qmode button[data-m="mid"]','aria-pressed'))==='true','QR link #mid opens the test tab on the mini-quiz');
  ok((await p.textContent('#mycode')).trim()==='PHY-7KQ2','old NF code becomes PHY with the same 4 characters');
  ok(await p.isDisabled('#kstart'),'start is disabled until a program is chosen');
  await p.selectOption('#prog','tip-tr'); await p.waitForTimeout(100);
  ok(!(await p.isDisabled('#kstart')),'program chosen: start enabled');
  await p.click('#kstart');
  ok(/1\/4/.test(await p.textContent('.khead')),'question 1/4 shown with timer');
  await p.clock.runFor(2000); await p.click('[data-tf="0"]');   // tf: statement is false → right
  const r1=await p.textContent('.kres');
  ok(/Doğru! \(2,0 sn\)/.test(r1)&&!/puan/.test(r1),'right after 2 s: phone shows right and time, no points: '+r1);
  await p.click('#knext'); await p.click('[data-k="0"]');      // mcq: A is wrong
  ok(/Yanlış/.test(await p.textContent('.kres'))&&/1\/2 doğru/.test(await p.textContent('.khead')),'wrong answer shown; running count 1/2 right');
  await p.click('#knext'); await p.clock.runFor(21000); await p.waitForTimeout(100);
  ok(/Süre doldu|Time is up/.test(await p.textContent('.kres')),'fill item timed out after 20 s');
  await p.click('#knext'); await p.clock.runFor(5000);
  await p.waitForTimeout(1000); await p.reload(); await p.waitForTimeout(300);
  ok(/4\/4/.test(await p.textContent('.khead')),'reload during question 4 continues the same question');
  const left=+(await p.textContent('#ktime')); ok(left===25,'time kept running across the reload (25 s left of 30): '+left+' s left of 30');
  await p.selectOption('#ksel-0','0'); await p.selectOption('#ksel-1','1'); await p.click('#kgo');
  ok(/Doğru! \(5,0 sn\)/.test(await p.textContent('.kres')),'match item right after 5 s');
  await p.click('#knext'); await p.waitForTimeout(300);
  ok(/PHY-7KQ2/.test(await p.textContent('.kboard'))&&/2\/4 doğru/.test(await p.textContent('.kbig'))&&/tahtada/.test(await p.textContent('#quiz')),'result page: 2/4 right, points on the board, code shown');
  ok(posts.length===1&&posts[0].course==='template-quiz'&&posts[0].test==='mid','result sent once to tab template-quiz');
  const c=Object.fromEntries(posts[0].cols);
  ok(c.R1===1&&c.S1===0.8&&c.R2===0&&c.S2===0&&c.A2==='A'&&c.R3===0&&c.A3==='-'&&c['T3 sec']===20&&c.R4===1&&c.S4===0.83&&c['Mini-quiz right']===2&&c['Program']==='tip-tr','payload: right (R), speed (S), answers, time, program: '+JSON.stringify(c));
  await p.reload(); await p.waitForTimeout(300);
  ok(posts.length===1&&/PHY-7KQ2/.test(await p.textContent('.kboard')),'reload after the end: no second send, result kept');
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'no horizontal scroll at 390 px: '+sw);
  await p.screenshot({path:'k_done.png',fullPage:false});
  // pre-test needs a program (new browser)
  const c2=await b.newContext(); await c2.route(/fonts\./,r=>r.abort()); const q=await c2.newPage();
  await q.goto(base+'#pre'); await q.waitForTimeout(300); await q.check('#r-pre-0-1'); await q.click('#qsubmit');
  ok(/programınızı|your program/i.test(await q.textContent('#qwarn')),'pre-test without a program shows the program message');
  const code2=(await q.textContent('#mycode')).trim(); ok(/^PHY-[A-Z2-9]{4}$/.test(code2),'new browser gets a PHY code: '+code2);
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close(); })();
