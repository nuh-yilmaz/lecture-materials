// Default switches: the mini-quiz tab is on. Usage: node midcheck.js <plain file>
const {chromium}=require('playwright'); const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
(async()=>{const b=await chromium.launch(); const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) errs.push('console: '+m.text());});
await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#test'); await p.waitForTimeout(400);
const tabs=(await p.$$eval('#qmode button',e=>e.map(x=>x.dataset.m))).join(); ok(tabs==='pre,mid,post,late','default tabs: '+tabs);
ok(errs.length===0,'no script or checkQuiz errors '+JSON.stringify(errs));
console.log(out.join('\n')); await b.close();})();
