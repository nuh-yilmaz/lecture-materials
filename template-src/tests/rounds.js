// Mini-quiz round limit (engine 2026-11r): 1-30 rounds over all decks. Unit II plan: 2 decks, 12 + 14 = 26 rounds.
// Usage: node rounds.js <base url> (serves rounds26.html: deck 1 = rounds 1-12, deck 2 = rounds 13-26, SHEET_URL example.invalid;
// rounds30.html: 30 rounds, no author-check error; rounds31.html: 31 rounds, the author check reports it). Phone width 390 px.
const {chromium}=require('playwright'); const base=process.argv[2]+'/rounds26.html';
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const rec=t=>({raw:{ans:[],conf:[]},qs:[],auto:50,self:{},fb:null,mp:null,sent:true,t});
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}});
  const posts=[], gets=[];
  await ctx.route(/example\.invalid/,r=>{ const q=r.request(); if(q.method()==='POST') posts.push(JSON.parse(q.postData())); else gets.push(q.url());
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":true,"top":[],"items":[],"n":0}'}); });
  await ctx.route(/fonts\./,r=>r.abort());
  const p=await ctx.newPage(); const errs=[], cerr=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) cerr.push(m.text()); });
  const seed=async(st,hash)=>{ await p.evaluate(st=>{ localStorage.clear(); localStorage.setItem('sim-code','"PHY-7KQ2"'); localStorage.setItem('sim-program','"tip-tr"');
      if(st) localStorage.setItem('tpl-t4',JSON.stringify(st)); },st);
    await p.goto('about:blank'); await p.goto(base+'#'+(hash||'now')); await p.waitForTimeout(300); };
  const hash=()=>new URL(p.url()).hash; const txt=async s=>(await p.$(s))?(await p.textContent(s)):'';
  const noSide=()=>p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
  const last=()=>new URL(gets[gets.length-1]||'http://x/').searchParams;
  // ---- author check: 26 and 30 rounds pass, 31 rounds are reported
  await p.goto(base+'#now'); await seed(null);
  ok(!cerr.length,'26 rounds in 2 decks: no author-check error '+cerr.join(' | '));
  for(const [f,n] of [['rounds30.html',30],['rounds31.html',31]]){
    const q=await ctx.newPage(); const ce=[], pe=[]; q.on('pageerror',e=>pe.push(e.message)); q.on('console',m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) ce.push(m.text()); });
    await q.goto(process.argv[2]+'/'+f+'#mini'); await q.waitForTimeout(300);
    const cnt=await q.$$eval('[data-kr]',e=>e.length);
    if(n===30) ok(!ce.length&&!pe.length&&cnt===30,'30 rounds (the limit): no author-check error, 30 rounds in the list '+ce.join(' | '));
    else ok(ce.some(m=>/QUIZ_MID: use 1–30 rounds over all decks \(this file has 31\)/.test(m))&&!pe.length&&cnt===31,'31 rounds: the author check names the limit and the count; the page still runs '+ce.join(' | '));
    await q.close(); }
  // ---- Now page and list of rounds at 390 px
  ok(JSON.stringify(await p.$$eval('.nowrounds',e=>e.map(x=>[...x.querySelectorAll('[data-r]')].map(c=>+c.dataset.r))))===JSON.stringify([[1,2,3,4,5,6,7,8,9,10,11,12],[13,14,15,16,17,18,19,20,21,22,23,24,25,26]]),'Now page: round chips per deck, deck 1 = 1-12, deck 2 = 13-26 (one numbering)');
  ok(await noSide(),'Now page with 26 round chips: no sideways scroll at 390 px');
  await p.screenshot({path:'rounds26_now.png',fullPage:true});
  await p.goto(base+'#mini'); await p.waitForTimeout(200);
  ok(await p.$$eval('[data-kr]',e=>e.length)===26&&/Tur 26\/26/.test(await txt('.kround')),'list of rounds: 26 rounds, the last is "Tur 26/26"');
  ok(await noSide(),'list of 26 rounds: no sideways scroll at 390 px');
  // ---- links #mid13, #mid26, #mid27
  await p.goto(base+'#mid13'); await p.waitForTimeout(200);
  ok(/Tur 13\/26/.test(await txt('.kh'))&&hash()==='#mid13','#mid13 (first round of deck 2) opens "Tur 13/26"');
  await p.goto(base+'#mid26'); await p.waitForTimeout(200);
  ok(/Tur 26\/26/.test(await txt('.kh'))&&!!(await p.$('#kstart'))&&hash()==='#mid26','#mid26 opens the last round, "Tur 26/26", start button (address #mid26)');
  await p.goto(base+'#mid27'); await p.waitForTimeout(200);
  ok(hash()==='#mini'&&await p.$$eval('[data-kr]',e=>e.length)===26,'#mid27 (no such round) shows the list of rounds');
  // ---- play round 26 and send it
  await p.goto(base+'#mid26'); await p.waitForTimeout(200);
  await p.click('#kstart');
  ok(/Tur 26\/26 · Soru 1\/3/.test(await txt('.khead')),'phone header: "Tur 26/26 · Soru 1/3"');
  ok(await noSide(),'round 26 question: no sideways scroll at 390 px');
  posts.length=0;
  await p.click('[data-k="1"]'); await p.click('#knext'); await p.click('[data-k="2"]'); await p.click('#knext'); await p.click('[data-tf="1"]'); await p.click('#knext'); await p.waitForTimeout(400);
  const P=posts[0]||{}, c=Object.fromEntries(P.cols||[]);
  ok(posts.length===1&&P.course==='template-quiz'&&P.test==='mid26'&&c.Round===26&&c['Mini-quiz right']===3,'round 26 sent once to tab template-quiz: Test "mid26", Round 26, 3/3 right');
  // ---- leaderboard #board26, #board13
  gets.length=0; await p.goto(base+'#board26'); await p.waitForTimeout(400);
  ok(await p.isVisible('#board')&&last().get('test')==='mid26'&&/Mini quiz 26\/26/.test(await txt('#board h2'))&&hash()==='#board26','#board26: asks the script for Test "mid26", title "Mini quiz 26/26" (address #board26)');
  ok(!(await p.isDisabled('#bprev'))&&await p.isDisabled('#bnext'),'#board26 (last round): "previous" on, "next" off');
  ok(await noSide(),'#board26: no sideways scroll at 390 px');
  await p.screenshot({path:'rounds26_board.png'});
  await p.click('#bprev'); await p.waitForTimeout(300);
  ok(last().get('test')==='mid25'&&hash()==='#board25','"previous round" from 26 shows round 25 (Test "mid25", address #board25)');
  await p.goto(base+'#board13'); await p.waitForTimeout(300);
  ok(last().get('test')==='mid13'&&/Mini quiz 13\/26/.test(await txt('#board h2')),'#board13 (first round of deck 2): Test "mid13", title "Mini quiz 13/26"');
  await p.click('#bclose'); await p.waitForTimeout(200);
  // ---- a deck's rounds close after its post-test (with 26 rounds)
  await seed({pre1:rec(Date.now()),post1:rec(Date.now())});
  ok(await p.$eval('.nowrounds [data-r="12"]',e=>e.classList.contains('closed'))&&!(await p.$eval('.nowrounds [data-r="13"]',e=>e.classList.contains('closed')))&&!(await p.$eval('.nowrounds [data-r="26"]',e=>e.classList.contains('closed'))),'after post-test 1: round 12 (deck 1) closed, rounds 13 and 26 (deck 2) open');
  ok(!errs.length,'no page errors '+errs.join(' | '));
  await b.close(); console.log(out.join('\n'));
})().catch(e=>{console.log(out.join('\n')+'\nCRASH '+e.message);});
