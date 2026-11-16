// Phone width (iPhone 13, 390 px): post-test page. Usage: node mob.js <file>
const {chromium,devices}=require('playwright'); const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
(async()=>{const b=await chromium.launch(); const c=await b.newContext({...devices['iPhone 13']}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await c.route(/fonts\.|example\.invalid/,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#test'); await p.waitForTimeout(400);
await p.evaluate(()=>{document.querySelector('#qmode button[data-m="post"]').click();}); await p.waitForTimeout(300);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth); ok(sw<=390,'no horizontal scroll at 390 px: '+sw);
ok(errs.length===0,'no script errors '+JSON.stringify(errs));
const el=await p.$('#q5'); await el.scrollIntoViewIfNeeded(); await p.screenshot({path:'mob_test.png'});
console.log(out.join('\n')); await b.close();})();
