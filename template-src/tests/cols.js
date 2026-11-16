// Item codes and part marks (engine 2026-11f; Q99-A, Q118-A, Q119-A). Usage: node cols.js <base url> (serves midoff, edit, whyedit)
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m); const errs=[];
async function send(b,file,lang,fill){   // takes the pre-test (item 1 right, optional extra answers) and returns the payload as an object
  const c=await b.newContext(); const posts=[]; await c.route(/example\.invalid/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,body:'{"ok":true}'});}); await c.route(/fonts\./,r=>r.abort());
  const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.goto(base+'/'+file+'#pre'); await p.waitForTimeout(250); if(lang==='en'){ await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(150); }
  await p.selectOption('#prog','tip-en'); await p.check('#r-pre-0-1'); if(fill) await fill(p);
  await p.click('#qsubmit'); if(await p.isVisible('#qforce')) await p.click('#qforce'); await p.waitForTimeout(200); await p.click('#qsend'); await p.waitForTimeout(250);
  await c.close(); return Object.fromEntries((posts[0]||{cols:[]}).cols); }
(async()=>{ const b=await chromium.launch();
  const tr=await send(b,'midoff.html','tr'), en=await send(b,'midoff.html','en');
  const codes=x=>(x['Item codes']||'').split(' ');
  ok(codes(tr).length===6&&tr['Item codes']===en['Item codes']&&tr['Language']==='tr'&&en['Language']==='en','same item codes in TR and EN (rows pool across languages): '+tr['Item codes']);
  ok(new Set(codes(tr).map(x=>x.split(':')[1])).size===6,'six different codes');
  const ed=await send(b,'edit.html','tr'), wy=await send(b,'whyedit.html','tr');
  const diff=(x,y)=>codes(x).map((c,i)=>c===codes(y)[i]?'=':'≠').join('');
  ok(diff(tr,ed)==='=≠====','a typo fix in item 2 gives item 2 a new code; the others stay: '+diff(tr,ed));
  ok(diff(tr,wy)==='======','an explanation edit (item 1) keeps every code: '+diff(tr,wy));
  // part marks for partly right answers
  const pr=await send(b,'midoff.html','tr',async p=>{
    for(const [j,v] of [[0,'d'],[1,'d'],[2,'d'],[3,'y'],[4,'y']]) await p.check(`#tf-pre-1-${j}-${v}`);   // statements 2 and 5 wrong
    for(const k of [2,4,0]) await p.click(`#ord2 [data-tap="${k}"]`);                                     // C E A, then B D → pairs CE, EA
    for(const [j,v] of [[0,2],[1,0],[2,0],[3,1],[4,3]]) await p.selectOption(`#sel-pre-3-${j}`,{value:String(v)});   // row 2 wrong
    await p.selectOption('#fl-pre-4-0',{value:'0'}); await p.selectOption('#fl-pre-4-4',{value:'0'}); });        // blanks 1 and 5 right, 2–4 empty
  ok(pr['K2 parts']==='10110'&&pr['Q2 tf (10)']===6,'tf part marks 10110 (6/10)');
  ok(pr['K3 parts']==='1100'&&pr['A3']==='CEABD'&&pr['Q3 order (16)']===8,'order part marks 1100 for CEABD (8/16)');
  ok(pr['K4 parts']==='10111'&&pr['K5 parts']==='10001'&&pr['Q5 fill (15)']===6,'match 10111, fill 10001 (empty blanks = 0)');
  ok(errs.length===0,'no script errors '+JSON.stringify(errs));
  console.log(out.join('\n')); await b.close(); })().catch(e=>{console.log(out.join('\n'));console.log('CRASH',e.message);process.exit(1);});
