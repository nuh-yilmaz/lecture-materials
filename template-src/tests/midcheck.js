const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#test'); await p.waitForTimeout(400);
console.log('default tabs:',(await p.$$eval('#qmode button',e=>e.map(x=>x.dataset.m))).join(),'errors:',JSON.stringify(errs)); await b.close();})();
