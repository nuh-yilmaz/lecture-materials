// End-to-end check of test engine 2026-11f on the template. Usage: node flow2.js <midoff file> <shotPrefix> [midon file] [open file]
// Default test: mcq 4 · tf 10 · order 16 (5 steps) · match 15 · fill 15 · order 24 (7 steps) = 84 item points.
const {chromium}=require('playwright');
const [file,shot,midFile,openFile]=process.argv.slice(2);
const out=[]; const ok=(c,m)=>out.push((c?"PASS ":"FAIL ")+m);
const K3=[2,4,0,3,1], K6=[1,4,3,0,6,5,2];   // keys of the two order items (row indexes in the right order)
async function setOrder(p,i,target){ for(const k of target) await p.click(`#ord${i} [data-tap="${k}"]`); }   // tap ordering: tap the rows in the wanted order
const urlOf=f=>(f.startsWith('http')?'':'file://')+f;
const C=o=>Object.fromEntries((o.cols||[]).map(x=>[x[0],x[1]]));
const inOrder=(o,names)=>{ const k=(o.cols||[]).map(x=>x[0]); const ix=names.map(n=>k.indexOf(n)); return ix.every((v,j)=>v>=0&&(j===0||v>ix[j-1])); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage(); const errs=[], posts=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) errs.push('console: '+m.text());}); p.on('dialog',d=>d.accept());
  await ctx.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});});
  await ctx.route(/fonts\./,r=>r.abort());
  const url=urlOf(file);
  await p.goto(url+'#test'); await p.waitForTimeout(400);
  const modes=await p.$$eval('#qmode button',e=>e.map(x=>x.dataset.m)); ok(modes.join()==='pre,post,late','mode buttons: '+modes.join());
  ok(/^PHY-[A-Z2-9]{4}$/.test(await p.textContent('#mycode')),'random PHY code shown');
  await p.selectOption('#prog','tip-tr');
  ok(/^Akım,/.test((await p.innerText('#q4 .filltext')).trim()),'fill text starts correctly: '+(await p.innerText('#q4 .filltext')).replace(/\s+/g,' ').slice(0,60));
  const intro=await p.textContent('#v-test .mod-head p');
  ok(/14/.test(intro)&&!/Açık uçlu/.test(intro),'intro mentions the 14-day delayed test and no open-ended question');
  const tags=await p.$$eval('.qtag',e=>e.map(x=>x.textContent));
  ok(tags.length===6&&[4,10,16,15,15,24].every((v,k)=>new RegExp(' '+v+' puan').test(tags[k]))&&!tags.some(x=>/eğitimci/.test(x)),'6 items with points 4 · 10 · 16 · 15 · 15 · 24: '+tags.map(x=>x.split('·').slice(2).join('·').trim()).join(' | '));
  ok((await p.$$eval('#ord5 [data-tap]',e=>e.length))===7&&(await p.$$eval('#ord2 [data-tap]',e=>e.length))===5,'order items have 5 and 7 steps');
  await p.click('#qsubmit'); ok((await p.textContent('#qwarn')).length>5,'empty test is blocked');
  // ---- PRE: Q1 wrong, tf right, order 16 untouched, match right, fill 2/5, order 24 untouched
  await p.check('#r-pre-0-0'); await p.check('#cf-pre-0-1');
  for(const [j,v] of [[0,'d'],[1,'y'],[2,'d'],[3,'y'],[4,'d']]) await p.check(`#tf-pre-1-${j}-${v}`);
  for(const [j,v] of [[0,2],[1,4],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-pre-3-${j}`,String(v));
  await p.selectOption('#fl-pre-4-0',{value:'0'}); await p.selectOption('#fl-pre-4-1',{value:'1'});
  await p.click('#qsubmit'); const w=await p.textContent('#qwarn');
  ok(/3 \(numarasız adım: 5\)/.test(w)&&/5/.test(w)&&/6 \(numarasız adım: 7\)/.test(w),'blank warning lists 3 and 6 with their unnumbered steps, and 5 (fill): '+w.slice(0,110));
  await p.click('#qforce'); await p.waitForTimeout(300);
  ok((await p.$$eval('.right,.wrong',e=>e.length))===0&&(await p.$$eval('.fix:not([hidden])',e=>e.length))===0,'pre-test: no right/wrong marks, no corrections');
  ok(/Toplam 31\/100/.test(await p.textContent('#qres'))&&/sorular 31\/84 · güven −4 · hediye 4/.test(await p.textContent('#qres')),'pre: items 31/84 (0+10+0+15+6+0), confidence −4 (item 1 sure and wrong), gift 4 = 31/100: '+(await p.textContent('#qres')).trim());
  ok(await p.isVisible('#qscorebox')&&(await p.$eval('#qscorebox',e=>e.nextElementSibling.id))==='q0','scoring box before item 1');
  ok(await p.isVisible('#qtopics'),'pre-test shows topic feedback: '+(await p.textContent('#qtopics')).replace(/\s+/g,' ').slice(0,120));
  ok(!(await p.isVisible('#qsure')),'pre-test does not show "sure but wrong" (would hint at the key)');
  ok(!(await p.isVisible('#qsubmit')),'pre-test locked');
  await p.screenshot({path:shot+'_pre.png',fullPage:false});
  await p.click('#qsend'); await p.waitForTimeout(300);
  const pc=C(posts[0]||{});
  ok(posts[0]&&posts[0].schema===2&&posts[0].test==='pre'&&pc['Q1 mcq (4)']===0&&pc['Auto total (84)']===31&&pc['Q2 tf (10)']===10&&pc['Q5 fill (15)']===6&&pc['C1 sure']==='E'&&pc['Version']==='2026-11f','pre payload (schema 2): '+JSON.stringify(pc).slice(0,230));
  ok(pc['A3']==='ABCDE'&&pc['A6']==='ABCDEFG'&&pc['A2']==='DYDYD'&&pc['A5']==='1-a 2-b 3-? 4-? 5-?','answer strings: order '+pc['A3']+' / '+pc['A6']+', fill '+pc['A5']);
  ok(pc['K2 parts']==='11111'&&pc['K3 parts']==='0000'&&pc['K4 parts']==='11111'&&pc['K5 parts']==='11000'&&pc['K6 parts']==='000000'&&!('K1 parts' in pc),'part marks: tf 11111, order pairs 0000, match 11111, fill 11000, 7-step order 000000; none for mcq');
  ok(pc['Confidence points']===-4&&pc['Gift (4)']===4&&pc['Total (100)']===31&&!('Total incl. lecturer' in pc)&&!Object.keys(pc).some(k=>/lecturer/.test(k)),'Confidence points −4, Gift (4) 4, Total (100) 31; no lecturer columns (no open item)');
  ok(/^ornek1:[A-Z2-9]{6} ornek1:[A-Z2-9]{6} ornek2:[A-Z2-9]{6} ornek1:[A-Z2-9]{6} ornek2:[A-Z2-9]{6} ornek1:[A-Z2-9]{6}$/.test(pc['Item codes']),'Item codes: module:code per item: '+pc['Item codes']);
  ok(inOrder(posts[0],['Q2 tf (10)','A2','K2 parts','C2 sure','Q6 order (24)','A6','K6 parts','C6 sure','Auto total (84)','Confidence points','Gift (4)','Total (100)','Topics','Feedback: helped (1-5)','Still unclear','M2 answers','M2 right','Program','Item codes','Version','Language'])&&posts[0].cols.slice(-3).map(x=>x[0]).join()==='Item codes,Version,Language','column order: K after A, totals after Auto total, M2 after the form, Item codes before Version');
  ok(pc['M2 answers']===null&&pc['M2 right']===null,'pre-test row: M2 columns created empty');
  await p.reload(); await p.waitForTimeout(300); ok(!(await p.isVisible('#qsubmit')),'pre still locked after reload');
  await p.goto(url+'#giris'); await p.waitForTimeout(300); ok(/31\/100/.test(await p.textContent('#testnote')),'start screen reminder shows the total: '+(await p.textContent('#testnote')).trim().slice(0,80));
  await p.click('#testnote button'); await p.waitForTimeout(300); ok(await p.isVisible('#r-post-0-0'),'reminder opens the post-test');
  // ---- POST: Q1 wrong but "sure", rest right
  await p.check('#r-post-0-3'); await p.check('#cf-post-0-1');
  for(const [j,v] of [[0,'d'],[1,'y'],[2,'d'],[3,'y'],[4,'d']]) await p.check(`#tf-post-1-${j}-${v}`);
  await setOrder(p,2,K3); await setOrder(p,5,K6);
  for(const [j,v] of [[0,2],[1,4],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-post-3-${j}`,String(v));
  for(const [j,v] of [[0,0],[1,1],[2,2],[3,0],[4,0]]) await p.selectOption(`#fl-post-4-${j}`,{value:String(v)});
  await p.click('#qsubmit'); await p.waitForTimeout(300);
  ok(!(await p.isVisible('#qwarn')),'complete post-test needs no warning');
  ok(/Toplam 80\/100/.test(await p.textContent('#qres'))&&/sorular 80\/84/.test(await p.textContent('#qres')),'post: items 80/84 (0+10+16+15+15+24) − 4 + 4 = 80/100: '+(await p.textContent('#qres')).trim());
  ok(/0\/4 puan · güven −4\./.test(await p.textContent('#w0'))&&!/güven/.test(await p.textContent('#w1')),'item line shows the confidence points only for "sure" items');
  ok((await p.$$eval('.right',e=>e.length))>=20,'post-test shows the key ('+(await p.$$eval('.right',e=>e.length))+' right marks)');
  ok(/16\/16/.test(await p.textContent('#w2'))&&/24\/24/.test(await p.textContent('#w5')),'order items in the right order: 16/16 and 24/24');
  ok(/1/.test(await p.textContent('#qsure'))&&await p.isVisible('#qsure'),'"sure but wrong" lists item 1: '+(await p.textContent('#qsure')));
  ok(await p.isVisible('#fbform'),'feedback form (M4) and one-minute paper (M5) visible');
  ok(!/kendi kontrol/i.test(await p.textContent('#sendmsg')),'send hint has no open-item self-check: '+(await p.textContent('#sendmsg')));
  await p.check('input[name="fb-helped"][value="5"]'); await p.check('input[name="fb-clear"][value="4"]');
  await p.fill('#mp-learned','Geri bildirim döngüsünün basamakları'); await p.dispatchEvent('#mp-learned','input');
  await p.screenshot({path:shot+'_post.png',fullPage:true});
  await p.click('#qsend'); await p.waitForTimeout(300);
  const po=C(posts[1]||{});
  ok(posts[1]&&posts[1].test==='post'&&po['Auto total (84)']===80&&po['Q5 fill (15)']===15&&po['Q1 mcq (4)']===0&&po['Q3 order (16)']===16&&po['Q6 order (24)']===24&&po['A6']==='BEDAGFC'&&po['Feedback: helped (1-5)']===5&&po['Feedback: clear (1-5)']===4&&po['Learned most']==='Geri bildirim döngüsünün basamakları','post payload: '+JSON.stringify(po).slice(0,260));
  ok(po['K3 parts']==='1111'&&po['K6 parts']==='111111'&&po['Confidence points']===-4&&po['Total (100)']===80&&po['Item codes']===pc['Item codes']&&po['M2 answers']==='-'&&po['M2 right']===0,'post: part marks all 1, total 80, same item codes; M2 not done: "-", 0');
  ok(await p.$eval('input[name="fb-easy"][value="3"]',e=>e.disabled)&&await p.$eval('#mp-learned',e=>e.readOnly),'form frozen after sending');
  ok(posts.length===2,'exactly 2 rows sent');
  // ---- LATE: locked until 14 days after the post-test
  await p.click('#qmode button[data-m="late"]'); await p.waitForTimeout(200);
  ok(!(await p.isVisible('#qsubmit'))&&/açıl/.test(await p.textContent('#quiz')),'delayed test locked: '+(await p.textContent('#quiz')).trim().slice(0,90));
  await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)); s.post.t-=15*864e5; localStorage.setItem(k,JSON.stringify(s));},'tpl-t4');
  await p.goto(url+'#giris'); await p.reload(); await p.waitForTimeout(300);
  ok(/açıldı/.test(await p.textContent('#testnote')),'start screen: delayed test is open');
  await p.click('#testnote button'); await p.waitForTimeout(300);
  ok(await p.isVisible('#qsubmit'),'delayed test opens after 14 days');
  await p.check('#r-late-0-1'); for(const [j,v] of [[0,'d'],[1,'y'],[2,'d'],[3,'y'],[4,'d']]) await p.check(`#tf-late-1-${j}-${v}`);
  await setOrder(p,2,[4,0,3,1,2]);            // first step moved to the end: 3 of 4 pairs
  await setOrder(p,5,[1,4,3,0,6,2,5]);        // last two swapped: 4 of 6 pairs
  for(const [j,v] of [[0,2],[1,4],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-late-3-${j}`,String(v));
  for(const [j,v] of [[0,0],[1,1],[2,2],[3,0],[4,0]]) await p.selectOption(`#fl-late-4-${j}`,{value:String(v)});
  await p.click('#qsubmit'); await p.waitForTimeout(300);
  ok(/12\/16/.test(await p.textContent('#w2'))&&/16\/24/.test(await p.textContent('#w5')),'pair scoring, 4 points per pair: 3 of 4 pairs = 12/16, 4 of 6 pairs = 16/24');
  ok(/Toplam 76\/100/.test(await p.textContent('#qres'))&&/sorular 72\/84 · güven 0/.test(await p.textContent('#qres')),'delayed: items 72/84 + 0 + 4 = 76/100: '+(await p.textContent('#qres')).trim().slice(0,60));
  const pills=await p.$$eval('#qcmp .pill',e=>e.map(x=>x.textContent)); ok(pills.join('|')==='Ön test: 31/100|Son test: 80/100|Gecikmeli test: 76/100|+49 puan','comparison pills use the total; gain = post − pre: '+pills.join(' | '));
  await p.click('#qsend'); await p.waitForTimeout(300); ok(posts[2]&&posts[2].test==='late'&&C(posts[2])['Learned most']===null&&C(posts[2])['Feedback: helped (1-5)']===null,'delayed payload has no feedback form');
  { const lc=C(posts[2]||{}); ok(lc['K3 parts']==='0111'&&lc['K6 parts']==='111100'&&lc['Total (100)']===76,'delayed: order part marks 0111 and 111100 (the pairs that scored), total 76'); }
  // ---- reset, English
  await p.goto(url+'#test-sifirla'); await p.waitForTimeout(300); ok(await p.isVisible('#qsubmit'),'#test-sifirla resets the tests');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(300);
  ok(/Delayed test/.test(await p.textContent('#qmode'))&&/Multiple choice/.test(await p.textContent('#quiz')),'English switch: '+(await p.textContent('#qmode')));
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  // ---- mid-lecture check switched on
  if(midFile){ const q=await ctx.newPage(); const e2=[]; q.on('pageerror',e=>e2.push(e.message));
    await q.goto(urlOf(midFile)+'#test'); await q.waitForTimeout(300);
    ok((await q.$$eval('#qmode button',e=>e.map(x=>x.dataset.m))).join()==='pre,mid,post,late','mid switch adds the Mini-quiz tab');
    await q.click('#qmode button[data-m="mid"]'); await q.waitForTimeout(200);
    await q.click('#kstart'); await q.click('[data-tf="0"]'); await q.waitForTimeout(100);
    ok(/Doğru|Correct/.test(await q.textContent('.kres')),'mini-quiz: first item answered and marked right (details: kflow.js)');
    ok(e2.length===0,'mid: no script errors '+JSON.stringify(e2)); }
  // ---- open item (special case; copy with item 6 = open, 26 points, scored by the lecturer)
  if(openFile){ const oc=await b.newContext({viewport:{width:1280,height:900}}); const op=[]; const e3=[];
    await oc.route(/example\.invalid/,r=>{op.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});}); await oc.route(/fonts\./,r=>r.abort());
    const o=await oc.newPage(); o.on('pageerror',e=>e3.push(e.message)); o.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) e3.push('console: '+m.text());}); o.on('dialog',d=>d.accept());
    await o.goto(urlOf(openFile)+'#test'); await o.waitForTimeout(300); await o.selectOption('#prog','tip-tr');
    const t6=(await o.$$eval('.qtag',e=>e.map(x=>x.textContent)))[5]||'';
    ok(/26 puan/.test(t6)&&/eğitimci/.test(t6)&&/Açık uçlu/.test(await o.textContent('#v-test .mod-head p')),'open copy: item 6 "scored by the lecturer", intro mentions it: '+t6);
    await o.check('#r-pre-0-1'); await o.fill('#open-pre-5','kısa cevap'); await o.click('#qsubmit');
    ok(/10 kelimeden kısa/.test(await o.textContent('#qwarn')),'short open answer is listed in the blank warning');
    await o.click('#qforce'); await o.waitForTimeout(200);
    ok(/eğitimci puanlayacak/.test(await o.textContent('#w5')),'pre-test: open answer saved for the lecturer');
    await o.click('#qmode button[data-m="post"]'); await o.waitForTimeout(200);
    await o.check('#r-post-0-1'); await o.fill('#open-post-5','Bozucu etki değişkeni uzaklaştırır, algılayıcı ölçer, merkez karşılaştırır ve etkileyici değişkeni geri getirir.');
    await o.click('#qsubmit'); await o.click('#qforce'); await o.waitForTimeout(200);
    for(const j of [0,1,2]) await o.check(`#rb-post-5-${j}`);
    ok(await o.isVisible('#rubric5')&&/19,5\/26/.test(await o.textContent('#self5'))&&/4\/60/.test(await o.textContent('#qres')),'post: self-check 19,5/26 shown, not added (items 4/60)');
    await o.click('#qsend'); await o.waitForTimeout(300); const oc6=C(op[0]||{});
    ok(oc6['Q6 open: lecturer (26)']===null&&oc6['Q6 lecturer notes']===null&&oc6['Q6 self-check (feedback)']===19.5&&('Total incl. lecturer' in oc6)&&oc6['Auto total (60)']===4&&oc6['Total (74)']!==undefined&&inOrder(op[0],['Total (74)','Total incl. lecturer','Topics']),'open payload: lecturer columns, self-check 19.5, Total (74) then Total incl. lecturer');
    ok(e3.length===0,'open copy: no script errors '+JSON.stringify(e3)); require('fs').writeFileSync('posts_open.json',JSON.stringify(op)); await oc.close(); }
  require('fs').writeFileSync('posts.json',JSON.stringify(posts));
  console.log(out.join('\n')); await b.close();
})().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
