// TR | EN switch while the projector box is open (engine 2026-11m): class summary (#summary) and leaderboard (#board1).
// Usage: node langsw.js <base url> (serves midon.html with SHEET_URL=example.invalid)
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const ITEMS=(s)=>[['mcq',4],['tf',10],['order',16],['match',15],['fill',15],['order',24]].map(([type,pts],i)=>({q:i+1,type,pts,n:8,share:s[i]}));
(async()=>{ const b=await chromium.launch(); const errs=[];
  const ctx=await b.newContext({viewport:{width:1280,height:720}}); const gets=[];
  await ctx.route(/fonts\./,r=>r.abort());
  await ctx.route(/example\.invalid/,r=>{ const u=new URL(r.request().url()); gets.push(u);
    const body=u.searchParams.get('summary')?{ok:true,n:8,min:5,items:ITEMS([.25,.9,.4,.8,.5,.7])}:{ok:true,n:2,top:[{rank:1,alias:'PHY-AAAA',points:1500},{rank:2,alias:'PHY-BBBB',points:900}],items:[{k:1,right:2,n:2}],streak:true};
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(body)}); });
  const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-16T10:00:00')});
  const txt=async s=>((await p.textContent(s))||'').replace(/\s+/g,' ').trim();
  const lang=async l=>{ await p.click(`#board [data-bl="${l}"]`); await p.waitForTimeout(300); };   // a real click: the box covers the page switch
  // ---- 1. class summary
  await p.goto(base+'/midon.html#summary'); await p.waitForTimeout(400);
  ok(await txt('#board h2')==='Ön test · Sınıf özeti'&&/Modülü aç/.test(await txt('#blist')),'#summary opens in Turkish');
  ok(await p.isVisible('#board [data-bl="en"]')&&await p.getAttribute('#board [data-bl="tr"]','aria-pressed')==='true','TR | EN buttons in the box; TR marked');
  ok(await p.evaluate(()=>{ const r=document.querySelector('#lang button').getBoundingClientRect(); return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2).closest('#board')!==null; }),'the box covers the page switch (why the box has its own)');
  await p.clock.runFor(60000); await p.click('#breset'); await p.waitForTimeout(300);   // stored window start: must survive the switch
  const since0=gets[gets.length-1].searchParams.get('since'); let n0=gets.length;
  await lang('en');
  ok(await txt('#board h2')==='Pre-test · Class summary','EN at once: title');
  ok(await txt('#breset')==='Reset (new group)'&&await txt('#bclose')==='Close','EN at once: buttons');
  ok(/8 students sent the pre-test/.test(await txt('#bcount'))&&/Open module ›/.test(await txt('#blist'))&&/^Items: Q1 25%/.test(await txt('#bitems')),'EN at once: count, rows and item line (new request)');
  ok(/75% and above/.test(await txt('#slegend'))&&/prediction task live/.test(await txt('#shint')),'EN at once: legend and hint');
  ok(gets.length===n0+1&&gets[gets.length-1].searchParams.get('since')===since0,'one new request; the window start set by "Sıfırla" is kept');
  ok(await p.getAttribute('#board [data-bl="en"]','aria-pressed')==='true'&&await p.getAttribute('#lang button[data-l="en"]','aria-pressed')==='true','EN marked in the box and in the page switch');
  ok(await p.getAttribute('#board','aria-label')==='Pre-test · Class summary'&&new URL(p.url()).hash==='#summary','box label and address stay on #summary');
  n0=gets.length; await p.clock.runFor(10200); await p.waitForTimeout(300);
  ok(gets.length===n0+1,'still one refresh every 10 s (no second timer)');
  await lang('tr');
  ok(await txt('#board h2')==='Ön test · Sınıf özeti'&&/Modülü aç/.test(await txt('#blist')),'back to TR at once');
  // ---- 2. leaderboard
  await p.goto(base+'/midon.html#board1'); await p.waitForTimeout(400);
  const t1=await txt('#board h2'); ok(/Liderlik tablosu/.test(t1),'#board1 opens in Turkish: '+t1);
  await lang('en');
  const t2=await txt('#board h2');
  ok(/Leaderboard/.test(t2)&&/1\/2/.test(t2),'EN at once: board title keeps the round: '+t2);
  ok(/students sent a result/.test(await txt('#bcount'))&&/points/.test(await txt('#blist'))&&/Streak bonus/.test(await txt('#bformula')),'EN at once: count, points, formula with streak line');
  ok(/Next round ›/.test(await txt('#board'))&&new URL(p.url()).hash==='#board1','EN at once: round buttons; address stays #board1');
  n0=gets.length; await p.clock.runFor(5200); await p.waitForTimeout(300);
  ok(gets.length===n0+1,'still one refresh every 5 s (no second timer)');
  // ---- 3. closed box: the page switch works again and does not reopen the box
  await lang('tr'); await p.click('#bclose'); await p.waitForTimeout(300); await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(300);
  ok(await p.isHidden('#board')&&await p.getAttribute('#lang button[data-l="en"]','aria-pressed')==='true','after Close: the page switch works; the box stays closed');
  // ---- 4. phone width: buttons wrap, no sideways scroll
  await p.setViewportSize({width:390,height:800}); await p.goto(base+'/midon.html#summary'); await p.waitForTimeout(400);
  const w=await p.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);
  ok(w[0]<=w[1]&&await p.isVisible('#board [data-bl="tr"]'),'390 px: box buttons visible, no sideways scroll ('+w.join('/')+')');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close(); console.log(out.join('\n'));
})().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1)});
