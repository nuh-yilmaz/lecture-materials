// M7 missions (engine 2026-11h; CP1 S1–S6, Q7-A: 3 tries, best stars sent). Usage: node m7.js <base url> (serves midoff.html, nomission.html, tries1.html)
// Example 1: organ mission (the student sets the effector every 10 s). Example 2: fix mission (vessel 1 narrowed and locked).
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m); const errs=[];
async function ctxPage(b,vw){ const c=await b.newContext({viewport:vw||{width:1280,height:900}}); const posts=[];
  await c.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});}); await c.route(/fonts\./,r=>r.abort());
  const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if((m.type()==='error'||(m.type()==='warning'&&/M7/.test(m.text())))&&!/ERR_|net::|Failed to load/.test(m.text())) errs.push('console: '+m.text());}); p.on('dialog',d=>d.accept()); return {c,p,posts}; }
async function sendTest(p,file,m){ await p.goto(base+'/'+file+'#'+m); await p.waitForTimeout(250); await p.selectOption('#prog','tip-tr').catch(()=>{});
  await p.check(`#r-${m}-0-1`); await p.click('#qsubmit'); if(await p.isVisible('#qforce')) await p.click('#qforce'); await p.waitForTimeout(200); await p.click('#qsend'); await p.waitForTimeout(250); }
const C=o=>Object.fromEntries((o&&o.cols||[]).map(x=>[x[0],x[1]]));
const txt=async(p,s)=>((await p.textContent(s))||'').replace(/\s+/g,' ');
const setR=(p,id,v)=>p.$eval('#c-'+id,(e,v)=>{e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));},String(v));
const fast=p=>p.click('#speed button[data-s="4"]');
async function waitRes(p,ms){ const t0=Date.now(); while(Date.now()-t0<(ms||30000)){ if(await p.$('#m-mission .mres')) return true; await p.waitForTimeout(150); } return false; }
async function organRun(p,choices){ for(const a of choices){ await p.waitForSelector('#m-mission [data-m7]',{timeout:20000}); await p.click(`#m-mission [data-m7="${a}"]`); } return waitRes(p,25000); }
(async()=>{ const b=await chromium.launch();
  // A. fix mission on Example 2
  let {c,p,posts}=await ctxPage(b);
  await sendTest(p,'midoff.html','pre');
  await p.goto(base+'/midoff.html#ornek3'); await p.waitForTimeout(250); ok(await p.isHidden('#m-mission'),'module without a mission: no box');
  await p.goto(base+'/midoff.html#ornek2'); await p.waitForTimeout(250);
  const box=await txt(p,'#m-mission');
  ok(await p.isVisible('#m-mission')&&/Görev · Vücudu düzeltin/.test(box)&&/Akımı geri getirin/.test(box)&&/Damar 1 daraldı/.test(box),'Example 2: "Görev · Vücudu düzeltin" box with title and story');
  ok(/Akım.*%90–%110/.test(box)&&/5 saniye/.test(box)&&/120 saniye/.test(box)&&/en çok 3 hamle/.test(box),'rule line: goal zone, hold 5 s, limit 120 s, 3★ moves: '+box.slice(0,260));
  ok(/Kalan deneme: 3\/3/.test(box)&&/Göreve başla/.test(box)&&/Başlattığınız deneme sayılır/.test(box),'3 tries; Start button; "a started try counts"');
  ok(await p.$eval('#m-predict',e=>e.nextElementSibling.id)==='m-mission'&&await p.$eval('#m-mission',e=>e.nextElementSibling.id)==='m-controls','mission box under the prediction box, above the controls');
  await p.click('#m7start'); await p.waitForTimeout(250);
  ok(await p.$eval('#c-r1',e=>e.value)==='0.7'&&await p.isDisabled('#c-r1')&&await p.isDisabled('#c-scen [data-pi="0"]')&&!(await p.isDisabled('#c-dp'))&&!(await p.isDisabled('#c-r2')),'start: vessel 1 at 70% and locked; presets locked; ΔP and vessel 2 free');
  ok(await p.$eval('#c-r1',e=>e.closest('.ctl').classList.contains('m7lock')),'locked control is dimmed');
  const live0=await txt(p,'#m7live'); ok(/Hamle: 0/.test(live0)&&/Akım: %3\d ✗/.test(live0),'live line: moves 0, flow far below the zone ✗: '+live0);
  ok(/Kalan deneme: 2\/3/.test(await txt(p,'#m-mission'))===false&&/Görevi bırak/.test(await txt(p,'#m-mission')),'during the try: Stop button, no Start');
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('tpl-m7'))); ok(st&&st.ornek2&&st.ornek2.tries===1,'the try is counted at start (localStorage)');
  const zone=await p.evaluate(()=>{ const c=document.getElementById('chart'), g=c.getContext('2d'), d=g.getImageData(0,0,c.width,c.height).data; let n=0; for(let i=0;i<d.length;i+=4) if(d[i+1]>d[i]+20&&d[i+1]>d[i+2]&&d[i+3]>0) n++; return n; });
  ok(zone>500,'green goal zone drawn on the chart ('+zone+' green pixels)');
  await setR(p,'dp',1.6); await setR(p,'dp',2); ok(/Hamle: 1/.test(await txt(p,'#m7live')),'two quick changes of the same control = 1 move');
  await setR(p,'r2',1.5); await fast(p);
  ok(await waitRes(p,15000),'solve {ΔP 2, vessel 2 150%} reaches the goal');
  const r1=await txt(p,'#m-mission');
  ok(/Görev tamamlandı! ★★★/.test(r1)&&/2 hamle/.test(r1)&&/ikisi de tek başına yetmez/.test(r1),'result: complete, 3★ (2 moves), explanation: '+r1.slice(0,200));
  ok(/Kalan deneme: 2\/3/.test(r1)&&/En iyi sonucunuz: ★★★/.test(r1)&&/Tekrar dene/.test(r1),'2 tries left, best 3★, "Try again"');
  ok(!(await p.isDisabled('#c-r1'))&&!(await p.isDisabled('#c-scen [data-pi="0"]')),'after the try the controls are free again');
  // second try: 7 moves → 1★ (best stays 3★)
  await p.click('#speed button[data-s="1"]'); await p.click('#m7start'); await p.waitForTimeout(200);
  for(const [id,v] of [['dp',1.5],['r2',1.2],['dp',1.8],['r2',1.4],['dp',1.9],['r2',1.5],['dp',2]]){ await setR(p,id,v); }
  ok(/Hamle: 7/.test(await txt(p,'#m7live')),'7 moves counted');
  await fast(p); ok(await waitRes(p,15000)&&/Görev tamamlandı! ★☆☆/.test(await txt(p,'#m-mission'))&&/En iyi sonucunuz: ★★★/.test(await txt(p,'#m-mission')),'7 moves → 1★; the best result stays 3★');
  // third try: stop → 0★, no tries left
  await p.click('#m7start'); await p.waitForTimeout(150); await p.click('#m7stop'); await p.waitForTimeout(150);
  const r3=await txt(p,'#m-mission'); ok(/Görevi bıraktınız\. Bu deneme 0★ sayıldı/.test(r3)&&/Kalan deneme: 0\/3/.test(r3)&&/Deneme hakkınız bitti/.test(r3)&&!(await p.$('#m7start')),'Stop: counts as 0★; 3 tries used; no Start button');
  await p.reload(); await p.waitForTimeout(250); ok(/Kalan deneme: 0\/3/.test(await txt(p,'#m-mission'))&&/★★★/.test(await txt(p,'#m-mission')),'after a reload: tries and best stars stay');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(150);
  ok(/Mission · Fix the body/.test(await txt(p,'#m-mission'))&&/Tries left: 0\/3/.test(await txt(p,'#m-mission'))&&/No tries left/.test(await txt(p,'#m-mission')),'English texts');
  await p.click('#lang button[data-l="tr"]');
  // B. organ mission on Example 1
  await p.goto(base+'/midoff.html#ornek1'); await p.waitForTimeout(250);
  const ob=await txt(p,'#m-mission'); ok(/Görev · Organ sizsiniz/.test(ob)&&/Her 10 saniyede/.test(ob)&&/Etkileyici \(elle\)/.test(ob)&&/6 seçim/.test(ob)&&/en az %80/.test(ob),'Example 1: organ box with the rule (every 10 s, act control, 6 choices, 80%)');
  await p.click('#m7start'); await p.waitForTimeout(400);
  ok(/Ortam birden soğudu/.test(await txt(p,'#m-mission'))&&/Seçim 1\/6/.test(await txt(p,'#m-mission .m7ask')),'event at t = 0 is shown before choice 1');
  const t0=await p.evaluate(()=>document.querySelector('#m7live').textContent); await p.waitForTimeout(600);
  ok(t0===await p.evaluate(()=>document.querySelector('#m7live').textContent)&&/Süre: 0\/60/.test(t0),'the simulation waits for the choice (clock stays at 0)');
  ok(await p.isDisabled('#c-man')&&await p.isDisabled('#c-fb')&&await p.isDisabled('#c-dist')&&await p.isDisabled('#c-kick'),'organ: act control, feedback, disturbance and button locked');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(150);
  ok(await p.isDisabled('#c-man')&&/Choice 1\/6/.test(await txt(p,'#m-mission')),'language switch during a try keeps the lock and the choice');
  await p.click('#lang button[data-l="tr"]'); await fast(p);
  await p.waitForSelector('#m-mission [data-m7]'); await p.click('#m-mission [data-m7="up"]');
  await p.waitForTimeout(300); ok(await p.$eval('#c-man',e=>e.value)==='0.3','↑ raises the effector by delta (0 → 0.3)');
  const done=await organRun(p,['same','down','same','down','same']);
  const or=await txt(p,'#m-mission'); ok(done&&/Görev bitti\. ★★★/.test(or)&&/Yeşil bölgede geçen süre: %(8\d|9\d)/.test(or),'solve (↑ = ↓ = ↓ =) → 3★ with 80% or more in the zone: '+or.slice(0,160));
  await p.click('#m7start'); const done2=await organRun(p,['same','same','same','same','same','same']);
  ok(done2&&/Görev bitti\. ☆☆☆/.test(await txt(p,'#m-mission'))&&/En iyi sonucunuz: ★★★/.test(await txt(p,'#m-mission')),'no response at all → 0★; best stays 3★');
  // leaving the module during a try counts it
  await p.click('#speed button[data-s="1"]'); await p.click('#m7start'); await p.waitForTimeout(150); await p.goto(base+'/midoff.html#ornek2'); await p.waitForTimeout(200); await p.goto(base+'/midoff.html#ornek1'); await p.waitForTimeout(200);
  ok(/Kalan deneme: 0\/3/.test(await txt(p,'#m-mission')),'leaving the module during a try uses the try');
  await sendTest(p,'midoff.html','post');
  const pr=C(posts[0]), po=C(posts[1]);
  ok(pr['M7 stars']===null&&pr['M7 tries']===null,'pre-test row: M7 columns created empty');
  ok(po['M7 stars']==='3-3'&&po['M7 tries']==='3-3','post-test row: "M7 stars" 3-3, "M7 tries" 3-3 (Example 1, Example 2)');
  ok(po['Total (100)']===8,'0 points: the total is not changed by M7');
  await p.goto(base+'/midoff.html#test-sifirla'); await p.waitForTimeout(200); await p.goto(base+'/midoff.html#ornek2'); await p.reload(); await p.waitForTimeout(250);
  ok(/Kalan deneme: 3\/3/.test(await txt(p,'#m-mission')),'#test-sifirla also resets the missions');
  await c.close();
  // C. link #mission-ornek2; not tried → x; phone width
  ({c,p,posts}=await ctxPage(b,{width:390,height:844}));
  await p.goto(base+'/midoff.html#mission-ornek2'); await p.waitForTimeout(400);
  ok(await p.isVisible('#v-mod')&&/Akımı geri getirin/.test(await txt(p,'#m-mission'))&&await p.evaluate(()=>document.activeElement&&document.activeElement.id)==='m-mission','#mission-ornek2 opens Example 2 with the mission box focused');
  await p.click('#m7start'); await p.waitForTimeout(300);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'running mission fits 390 px: '+sw);
  await (await p.$('#m-mission')).screenshot({path:'m7_fix_phone.png'});
  await setR(p,'dp',2); await setR(p,'r2',1.5); await fast(p); await waitRes(p,15000);
  await (await p.$('#m-mission')).screenshot({path:'m7_result_phone.png'});
  await p.goto(base+'/midoff.html#ornek1'); await p.waitForTimeout(200); await p.click('#m7start'); await p.waitForTimeout(300);
  await (await p.$('#m-mission')).screenshot({path:'m7_organ_phone.png'}); await p.click('#m7stop');
  await sendTest(p,'midoff.html','post'); ok(C(posts[0])['M7 stars']==='0-3'&&C(posts[0])['M7 tries']==='1-1','stopped organ try 0★, fix 3★: "0-3", tries "1-1"');
  await c.close();
  ({c,p,posts}=await ctxPage(b)); await sendTest(p,'midoff.html','post'); ok(C(posts[0])['M7 stars']==='x-x'&&C(posts[0])['M7 tries']==='0-0','no mission tried: "x-x", "0-0"'); await c.close();
  // D. switches
  ({c,p,posts}=await ctxPage(b)); await p.goto(base+'/nomission.html#ornek2'); await p.waitForTimeout(250);
  ok(await p.isHidden('#m-mission')&&!(await p.isDisabled('#c-r1')),'MISSIONS=false: no box');
  await sendTest(p,'nomission.html','post'); ok(posts[0]&&!('M7 stars' in C(posts[0])),'MISSIONS=false: no M7 columns'); await c.close();
  ({c,p,posts}=await ctxPage(b)); await p.goto(base+'/tries1.html#ornek2'); await p.waitForTimeout(250);
  ok(/Kalan deneme: 1\/1/.test(await txt(p,'#m-mission')),'MISSION_TRIES=1: one try'); await c.close();
  ok(errs.length===0,'no script errors and no author-check messages '+JSON.stringify(errs));
  await b.close(); console.log(out.join('\n'));
})().catch(e=>{console.log('CRASH '+e.stack);process.exit(1);});
