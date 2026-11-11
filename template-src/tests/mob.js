const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch(); const c=await b.newContext({...devices['iPhone 13']}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await c.route(/fonts\.|example\.invalid/,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#test'); await p.waitForTimeout(400);
await p.evaluate(()=>{document.querySelector('#qmode button[data-m="post"]').click();}); await p.waitForTimeout(300);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth); console.log('scrollWidth',sw,'errors',JSON.stringify(errs));
const el=await p.$('#q4'); await el.scrollIntoViewIfNeeded(); await p.screenshot({path:'mob_test.png'}); await b.close();})();
