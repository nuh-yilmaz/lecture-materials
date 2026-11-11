// Mini-quiz rounds (Kahoot style, engine 2026-11g) check. Usage: node kflow.js x <base url of midon.html> [base url of one.html]
// Round 1 of the template: tf (false), mcq (a = A), match (1-a, 2-b). Round 2: mcq (a = B), fill (a = 16), tf (true).
const {chromium}=require('playwright'); const base=process.argv[3], one=process.argv[4];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}}); const posts=[];
  await ctx.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});});
  await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{ if(!localStorage.getItem('sim-code')) localStorage.setItem('sim-code',JSON.stringify('NF-7KQ2')); });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-11T10:00:00')}); await p.clock.pauseAt(new Date('2026-11-11T10:00:01'));
  // ---- round 1 through the old link #mid
  await p.goto(base+'#mid'); await p.waitForTimeout(300);
  ok(await p.isVisible('#v-test')&&(await p.getAttribute('#qmode button[data-m="mid"]','aria-pressed'))==='true','QR link #mid opens the test tab on the mini-quiz');
  ok(/Tur 1\/2/.test(await p.textContent('.kh'))&&new URL(p.url()).hash==='#mid1','#mid opens round 1 (title "Tur 1/2", address #mid1)');
  ok((await p.textContent('#mycode')).trim()==='PHY-7KQ2','old NF code becomes PHY with the same 4 characters');
  ok(await p.isDisabled('#kstart'),'start is disabled until a program is chosen');
  await p.selectOption('#prog','tip-tr'); await p.waitForTimeout(100);
  ok(!(await p.isDisabled('#kstart')),'program chosen: start enabled');
  await p.click('#kstart');
  ok(/Tur 1\/2 · Soru 1\/3/.test(await p.textContent('.khead')),'header: round 1/2, question 1/3, with timer');
  await p.clock.runFor(2000); await p.click('[data-tf="0"]');   // tf: statement is false → right
  const r1=await p.textContent('.kres');
  ok(/Doğru! \(2,0 sn\)/.test(r1)&&!/puan/.test(r1),'right after 2 s: phone shows right and time, no points: '+r1);
  await p.click('#knext'); await p.click('[data-k="1"]');      // mcq: B is wrong
  ok(/Yanlış/.test(await p.textContent('.kres'))&&/1\/2 doğru/.test(await p.textContent('.khead')),'wrong answer shown; running count 1/2 right');
  await p.click('#knext'); await p.clock.runFor(5000);
  await p.waitForTimeout(1000); await p.reload(); await p.waitForTimeout(300);
  ok(/Soru 3\/3/.test(await p.textContent('.khead')),'reload during question 3 continues the same question');
  const left=+(await p.textContent('#ktime')); ok(left===25,'time kept running across the reload: '+left+' s left of 30');
  await p.selectOption('#ksel-0','0'); await p.selectOption('#ksel-1','1'); await p.click('#kgo');
  ok(/Doğru! \(5,0 sn\)/.test(await p.textContent('.kres')),'match item right after 5 s');
  await p.click('#knext'); await p.waitForTimeout(300);
  ok(/PHY-7KQ2/.test(await p.textContent('.kboard'))&&/2\/3 doğru/.test(await p.textContent('.kbig'))&&/tahtada/.test(await p.textContent('#quiz')),'result page: 2/3 right, points on the board, code shown');
  ok(posts.length===1&&posts[0].course==='template-quiz'&&posts[0].test==='mid1','round 1 sent once to tab template-quiz as Test "mid1"');
  const c=Object.fromEntries(posts[0].cols);
  ok(posts[0].cols[0][0]==='Round'&&c.Round===1&&c.R1===1&&c.S1===0.8&&c.R2===0&&c.A2==='B'&&c.R3===1&&c.S3===0.83&&!('R4' in c)&&c['Mini-quiz right']===2&&c['Mini-quiz items']===3&&c.Program==='tip-tr'&&c.Version==='2026-11g','payload: Round first, 3 items (R, S, A, T), program, version: '+JSON.stringify(c).slice(0,200));
  ok(/^ornek1:\w{6} ornek1:\w{6} ornek1:\w{6}$/.test(c['Item codes'])&&posts[0].cols.slice(-3).map(x=>x[0]).join()==='Item codes,Version,Language','payload: item codes of the 3 items, before Version and Language');
  await p.reload(); await p.waitForTimeout(300);
  ok(posts.length===1&&/2\/3 doğru/.test(await p.textContent('.kbig')),'reload after the end: no second send, result kept');
  // ---- list of rounds, then round 2
  await p.click('#kall'); await p.waitForTimeout(200);
  const li=await p.$$eval('.kround li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  ok(li.length===2&&/Tur 1\/2 ✓ 2\/3 doğru/.test(li[0])&&/^Tur 2\/2$/.test(li[1])&&new URL(p.url()).hash==='#mini','"All rounds": list with round 1 done (2/3) and round 2 open; address #mini: '+JSON.stringify(li));
  await p.click('[data-kr="2"]'); await p.waitForTimeout(200);
  ok(/Tur 2\/2/.test(await p.textContent('.kh'))&&new URL(p.url()).hash==='#mid2','round 2 opens from the list (address #mid2)');
  await p.click('#kstart'); await p.click('[data-k="1"]'); await p.click('#knext');   // mcq right (B)
  await p.clock.runFor(1000); await p.click('[data-k="2"]'); await p.click('#knext');  // fill right (16)
  await p.click('[data-tf="1"]'); await p.click('#knext'); await p.waitForTimeout(300);  // tf right
  ok(/3\/3 doğru/.test(await p.textContent('.kbig')),'round 2 result 3/3');
  ok(posts.length===2&&posts[1].test==='mid2'&&Object.fromEntries(posts[1].cols).Round===2&&Object.fromEntries(posts[1].cols)['Item codes'].split(' ').every(x=>/^ornek2:/.test(x)),'round 2 sent as Test "mid2", Round 2, its own item codes');
  await p.click('#qmode button[data-m="pre"]'); await p.waitForTimeout(200);
  ok(/Mini quiz: 5\/6 doğru \(2 tur\)/.test(await p.textContent('#qcmp')),'test page: one compare pill for all rounds: 5/6 right (2 rounds)');
  await p.goto(base+'#mid1'); await p.waitForTimeout(300);
  ok(/2\/3 doğru/.test(await p.textContent('.kbig'))&&posts.length===2,'#mid1 opens the round 1 result again; no new send');
  await p.goto(base+'#mid9'); await p.waitForTimeout(300);
  ok(await p.isVisible('.kround'),'#mid9 (no such round) shows the list of rounds');
  await p.click('#qmode button[data-m="pre"]'); await p.click('#qmode button[data-m="mid"]'); await p.waitForTimeout(200);
  ok(await p.isVisible('.kround'),'the "Mini quiz" button opens the list of rounds');
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'no horizontal scroll at 390 px: '+sw);
  await p.screenshot({path:'k_list.png',fullPage:false});
  // ---- a started round must be finished first
  const c3=await b.newContext({viewport:{width:390,height:844}}); await c3.route(/fonts\./,r=>r.abort()); await c3.route(/example\.invalid/,r=>r.fulfill({status:200,body:'{}'}));
  const q3=await c3.newPage(); await q3.goto(base+'#mid2'); await q3.waitForTimeout(200); await q3.selectOption('#prog','tip-tr'); await q3.click('#kstart'); await q3.waitForTimeout(100);
  await q3.goto(base+'#mid1'); await q3.waitForTimeout(300);
  ok(/Tur 2\/2 · Soru 1\/3/.test(await q3.textContent('.khead')),'round 2 started: #mid1 returns to the running round 2');
  // ---- 2026-11f data in the browser: result "mid" = round 1; an old run (no round) continues as round 1
  const c4=await b.newContext(); await c4.route(/fonts\./,r=>r.abort());
  await c4.addInitScript(()=>{ if(sessionStorage.getItem('x')) return; sessionStorage.setItem('x','1');
    localStorage.setItem('tpl-t4',JSON.stringify({pre:null,mid:{raw:{ans:[[false],0,[0,1]],ms:[2000,3000,4000],ok:[1,1,1],conf:[]},qs:[1,1,1],auto:3,self:{},fb:null,mp:null,sent:true,t:1}}));
    localStorage.setItem('sim-program',JSON.stringify('tip-tr')); });
  const q4=await c4.newPage(); await q4.goto(base+'#mid'); await q4.waitForTimeout(300);
  ok(/3\/3 doğru/.test(await q4.textContent('.kbig')),'old saved result "mid" is shown as round 1');
  const st=await q4.evaluate(()=>JSON.parse(localStorage.getItem('tpl-t4'))); ok(st.mid1&&!('mid' in st),'old key "mid" stored as "mid1"');
  const c5=await b.newContext(); await c5.route(/fonts\./,r=>r.abort());
  await c5.addInitScript(()=>{ if(sessionStorage.getItem('x')) return; sessionStorage.setItem('x','1'); localStorage.setItem('tpl-t4-mid',JSON.stringify({i:1,ans:[[false]],ms:[2000],ok:[1],ph:'q',t0:null})); localStorage.setItem('sim-program',JSON.stringify('tip-tr')); });
  const q5=await c5.newPage(); await q5.goto(base+'#test'); await q5.waitForTimeout(300);
  ok(/Tur 1\/2 · Soru 2\/3/.test(await q5.textContent('.khead'))&&new URL(q5.url()).hash==='#mid1','old run in progress (no round) continues as round 1, question 2');
  // ---- one round only: no list, no "All rounds"
  if(one){ const c6=await b.newContext(); await c6.route(/fonts\./,r=>r.abort()); const q6=await c6.newPage(); const e6=[]; q6.on('pageerror',e=>e6.push(e.message));
    await q6.goto(one+'#test'); await q6.click('#qmode button[data-m="mid"]'); await q6.waitForTimeout(200);
    ok(await q6.isVisible('#kstart')&&!(await q6.$('#kall'))&&!/Tur/.test(await q6.textContent('.kh'))&&new URL(q6.url()).hash==='#mid1','one round: the button opens round 1 directly, no list, no round number');
    ok(e6.length===0,'one round: no script errors'); }
  // pre-test needs a program (new browser)
  const c2=await b.newContext(); await c2.route(/fonts\./,r=>r.abort()); const q=await c2.newPage();
  await q.goto(base+'#pre'); await q.waitForTimeout(300); await q.check('#r-pre-0-1'); await q.click('#qsubmit');
  ok(/programınızı|your program/i.test(await q.textContent('#qwarn')),'pre-test without a program shows the program message');
  const code2=(await q.textContent('#mycode')).trim(); ok(/^PHY-[A-Z2-9]{4}$/.test(code2),'new browser gets a PHY code: '+code2);
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close(); })();
