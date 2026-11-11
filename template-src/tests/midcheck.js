// Default switches and the author check of the mini-quiz rounds. Usage: node midcheck.js <plain file> [mid4 file] [flat file]
const {chromium}=require('playwright'); const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const [plain,mid4,flat]=process.argv.slice(2);
async function load(b,file){ const p=await (await b.newContext()).newPage(); const errs=[], cons=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) cons.push(m.text());});
  await p.route(/fonts\./,r=>r.abort()); await p.goto('file://'+file+'#test'); await p.waitForTimeout(400); return {p,errs,cons}; }
(async()=>{const b=await chromium.launch();
const A=await load(b,plain);
const tabs=(await A.p.$$eval('#qmode button',e=>e.map(x=>x.dataset.m))).join(); ok(tabs==='pre,mid,post,late','default tabs: '+tabs);
ok(A.errs.length===0&&A.cons.length===0,'no script or checkQuiz errors (template: 2 rounds of 3 items) '+JSON.stringify(A.errs.concat(A.cons)));
if(mid4){ const B=await load(b,mid4);
  ok(B.cons.some(m=>/QUIZ_MID round 2: use exactly 3 items \(this round has 4\)/.test(m))&&!B.cons.some(m=>/round 1:/.test(m)),'round with 4 items: author check names round 2 and the count '+JSON.stringify(B.cons));
  ok(!B.cons.some(m=>/4–5/.test(m))&&B.errs.length===0,'old "use 4–5 items" message is gone; the page still runs'); }
if(flat){ const C=await load(b,flat);
  ok(C.cons.some(m=>/QUIZ_MID: write rounds/.test(m))&&C.errs.length===0,'old flat list: author check asks for rounds; the page still runs');
  await C.p.click('#qmode button[data-m="mid"]'); await C.p.waitForTimeout(200);
  ok(await C.p.isVisible('#kstart')&&!(await C.p.$('.kround')),'old flat list is read as one round'); }
console.log(out.join('\n')); await b.close();})();
