// End-to-end check of test engine 2026-11d on the template. Usage: node flow2.js <file> <shotPrefix> [midFile]
const {chromium}=require('playwright');
const [file,shot,midFile]=process.argv.slice(2);
const out=[]; const ok=(c,m)=>out.push((c?"PASS ":"FAIL ")+m);
async function setOrder(p,i,target){ // target = letters order, e.g. [1,3,0,4,2]
  for(let pos=0;pos<target.length;pos++) for(let g=0;g<8;g++){
    const L=await p.$$eval(`#ord${i} .otext b`,e=>e.map(x=>x.textContent[0]));
    const cur=L.indexOf('ABCDEFGH'[target[pos]]); if(cur===pos) break;
    await p.click(`[data-q="${i}"][data-mv="${cur}"][data-d="-1"]`);
  }
}
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage(); const errs=[], posts=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) errs.push('console: '+m.text());}); p.on('dialog',d=>d.accept());
  await ctx.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});});
  await ctx.route(/fonts\./,r=>r.abort());
  const url=(file.startsWith('http')?'':'file://')+file;
  await p.goto(url+'#test'); await p.waitForTimeout(400);
  const modes=await p.$$eval('#qmode button',e=>e.map(x=>x.dataset.m)); ok(modes.join()==='pre,post,late','mode buttons: '+modes.join());
  ok(/^PHY-[A-Z2-9]{4}$/.test(await p.textContent('#mycode')),'random PHY code shown');
  await p.selectOption('#prog','tip-tr');
  ok(/^Akım, \s*1/.test((await p.innerText('#q4 .filltext')).trim())||/^Akım,/.test((await p.innerText('#q4 .filltext')).trim()),'fill text starts correctly: '+(await p.innerText('#q4 .filltext')).replace(/\s+/g,' ').slice(0,90));
  ok(/14/.test(await p.textContent('#v-test .mod-head p')),'intro text mentions the 14-day delayed test');
  const tags=await p.$$eval('.qtag',e=>e.map(x=>x.textContent)); ok(/5 puan/.test(tags[0])&&/10 puan/.test(tags[1])&&/15 puan/.test(tags[4])&&/15/.test(tags[2])&&/40/.test(tags[5])&&/eğitimci/.test(tags[5]),'item tags show points: '+tags.map(x=>x.split('·').slice(2).join('·').trim()).join(' | '));
  await p.click('#qsubmit'); ok((await p.textContent('#qwarn')).length>5,'empty test is blocked');
  // ---- PRE: Q1 wrong, tf right, order untouched, match right, fill 2/4, open short
  await p.check('#r-pre-0-0'); await p.check('#cf-pre-0-1');
  for(const [j,v] of [[0,'d'],[1,'y'],[2,'d'],[3,'y'],[4,'d']]) await p.check(`#tf-pre-1-${j}-${v}`);
  for(const [j,v] of [[0,2],[1,4],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-pre-3-${j}`,String(v));
  await p.selectOption('#fl-pre-4-0',{value:'0'}); await p.selectOption('#fl-pre-4-1',{value:'1'});
  await p.fill('#open-pre-5','bozucu etki algılayıcı');
  await p.click('#qsubmit'); const w=await p.textContent('#qwarn');
  ok(/3/.test(w)&&/5/.test(w)&&/6/.test(w),'blank warning lists 3 (order), 5 (fill), 6 (short): '+w.slice(0,110));
  await p.click('#qforce'); await p.waitForTimeout(300);
  ok((await p.$$eval('.right,.wrong',e=>e.length))===0&&(await p.$$eval('.fix:not([hidden])',e=>e.length))===0,'pre-test: no right/wrong marks, no corrections');
  ok(/31\/60/.test(await p.textContent('#qres')),'pre score 31/60 (0+10+0+15+6): '+(await p.textContent('#qres')).trim());
  ok(await p.isVisible('#qtopics'),'pre-test shows topic feedback: '+(await p.textContent('#qtopics')).replace(/\s+/g,' ').slice(0,120));
  ok(!(await p.isVisible('#qsure')),'pre-test does not show "sure but wrong" (would hint at the key)');
  ok(!(await p.isVisible('#qsubmit')),'pre-test locked');
  await p.screenshot({path:shot+'_pre.png',fullPage:false});
  await p.click('#qsend'); await p.waitForTimeout(300);
  const pre=posts[0]||{}; const C=o=>Object.fromEntries((o.cols||[]).map(x=>[x[0],x[1]]));
  const pc=C(pre); ok(pre.schema===2&&pre.test==='pre'&&pc['Q1 mcq (5)']===0&&pc['Auto total (60)']===31&&pc['Q2 tf (10)']===10&&pc['Q5 fill (15)']===6&&pc['C1 sure']==='E'&&pc['Q6 open: lecturer (40)']===null&&/bozucu/.test(pc['A6 open answer']),'pre payload (schema 2): '+JSON.stringify(pc).slice(0,230));
  ok(pc['A3']==='ABCDE'&&pc['A2']==='DYDYD'&&pc['A5']==='1-a 2-b 3-? 4-? 5-?','answer strings: order '+pc['A3']+', fill '+pc['A5']);
  await p.reload(); await p.waitForTimeout(300); ok(!(await p.isVisible('#qsubmit')),'pre still locked after reload');
  await p.goto(url+'#giris'); await p.waitForTimeout(300); ok(/31\/60/.test(await p.textContent('#testnote')),'start screen reminder: '+(await p.textContent('#testnote')).trim().slice(0,80));
  await p.click('#testnote button'); await p.waitForTimeout(300); ok(await p.isVisible('#open-post-5'),'reminder opens the post-test');
  // ---- POST: Q1 wrong but "sure", rest right, open long
  await p.check('#r-post-0-3'); await p.check('#cf-post-0-1');
  for(const [j,v] of [[0,'d'],[1,'y'],[2,'d'],[3,'y'],[4,'d']]) await p.check(`#tf-post-1-${j}-${v}`);
  await setOrder(p,2,[1,3,0,4,2]);
  for(const [j,v] of [[0,2],[1,4],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-post-3-${j}`,String(v));
  for(const [j,v] of [[0,0],[1,1],[2,2],[3,0],[4,0]]) await p.selectOption(`#fl-post-4-${j}`,{value:String(v)});
  await p.fill('#open-post-5','Bir bozucu etki değişkeni ayar noktasından uzaklaştırır, algılayıcı ölçer, kontrol merkezi karşılaştırır ve etkileyici değişkeni geri getirir.');
  await p.dispatchEvent('#open-post-5','input'); ok(/1[0-9]/.test(await p.textContent('#wc5')),'word counter: '+(await p.textContent('#wc5')));
  await p.click('#qsubmit'); await p.waitForTimeout(300);
  ok(!(await p.isVisible('#qwarn')),'complete post-test needs no warning');
  ok(/55\/60/.test(await p.textContent('#qres')),'post score 55/60 (0+10+15+15+15): '+(await p.textContent('#qres')).trim());
  ok((await p.$$eval('.right',e=>e.length))>=15,'post-test shows the key ('+(await p.$$eval('.right',e=>e.length))+' right marks)');
  ok(/15\/15/.test(await p.textContent('#w2')),'ordering in the right order: 15/15');
  ok(/1/.test(await p.textContent('#qsure'))&&await p.isVisible('#qsure'),'"sure but wrong" lists item 1: '+(await p.textContent('#qsure')));
  ok(await p.isVisible('#rubric5'),'self-check rubric open');
  for(const j of [0,1,2]) await p.check(`#rb-post-5-${j}`);
  ok(/30\/40/.test(await p.textContent('#self5'))&&/55\/60/.test(await p.textContent('#qres')),'self-check 30/40 shown, not added to the score');
  ok(await p.isVisible('#fbform'),'feedback form (M4) and one-minute paper (M5) visible');
  await p.check('input[name="fb-helped"][value="5"]'); await p.check('input[name="fb-clear"][value="4"]');
  await p.fill('#mp-learned','Geri bildirim döngüsünün basamakları'); await p.dispatchEvent('#mp-learned','input');
  await p.screenshot({path:shot+'_post.png',fullPage:true});
  await p.click('#qsend'); await p.waitForTimeout(300);
  const po=C(posts[1]||{});
  ok(posts[1]&&posts[1].test==='post'&&po['Auto total (60)']===55&&po['Q5 fill (15)']===15&&po['Q1 mcq (5)']===0&&po['Q6 self-check (feedback)']===30&&po['Feedback: helped (1-5)']===5&&po['Feedback: clear (1-5)']===4&&po['Learned most']==='Geri bildirim döngüsünün basamakları'&&po['Q3 order (15)']===15,'post payload: '+JSON.stringify(po).slice(0,260));
  ok(await p.$eval('#rb-post-5-3',e=>e.disabled)&&await p.$eval('input[name="fb-easy"][value="3"]',e=>e.disabled),'self-check and form frozen after sending');
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
  await setOrder(p,2,[3,0,4,2,1]);
  for(const [j,v] of [[0,2],[1,4],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-late-3-${j}`,String(v));
  for(const [j,v] of [[0,0],[1,1],[2,2],[3,0],[4,0]]) await p.selectOption(`#fl-late-4-${j}`,{value:String(v)});
  await p.fill('#open-late-5','Bozucu etki değişkeni uzaklaştırır, algılayıcı ölçer, merkez karşılaştırır, etkileyici geri getirir hemen.');
  await p.click('#qsubmit'); await p.waitForTimeout(300);
  ok(/11,25\/15/.test(await p.textContent('#w2')),'pair scoring: one row out of place keeps 3 of 4 pairs = 11,25/15 ('+(await p.textContent('#w2')).slice(0,30)+')');
  ok(/56,25\/60/.test(await p.textContent('#qres')),'delayed total 56,25/60: '+(await p.textContent('#qres')).trim().slice(0,12));
  const pills=await p.$$eval('#qcmp .pill',e=>e.map(x=>x.textContent)); ok(pills.length>=4,'comparison pills: '+pills.join(' | '));
  await p.click('#qsend'); await p.waitForTimeout(300); ok(posts[2]&&posts[2].test==='late'&&C(posts[2])['Learned most']===null&&C(posts[2])['Feedback: helped (1-5)']===null,'delayed payload has no feedback form');
  // ---- reset, English
  await p.goto(url+'#test-sifirla'); await p.waitForTimeout(300); ok(await p.isVisible('#qsubmit'),'#test-sifirla resets the tests');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(300);
  ok(/Delayed test/.test(await p.textContent('#qmode'))&&/Multiple choice/.test(await p.textContent('#quiz')),'English switch: '+(await p.textContent('#qmode')));
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  // ---- mid-lecture check switched on
  if(midFile){ const q=await ctx.newPage(); const e2=[]; q.on('pageerror',e=>e2.push(e.message));
    await q.goto((midFile.startsWith('http')?'':'file://')+midFile+'#test'); await q.waitForTimeout(300);
    ok((await q.$$eval('#qmode button',e=>e.map(x=>x.dataset.m))).join()==='pre,mid,post,late','mid switch adds the Mini-quiz tab');
    await q.click('#qmode button[data-m="mid"]'); await q.waitForTimeout(200);
    await q.click('#kstart'); await q.click('[data-tf="0"]'); await q.waitForTimeout(100);
    ok(/Doğru|Correct/.test(await q.textContent('.kres')),'mini-quiz: first item answered and marked right (details: kflow.js)');
    ok(e2.length===0,'mid: no script errors '+JSON.stringify(e2)); }
  require('fs').writeFileSync('posts.json',JSON.stringify(posts));
  console.log(out.filter(Boolean).filter(x=>x!=='PASS ').join('\n')); await b.close();
})().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
