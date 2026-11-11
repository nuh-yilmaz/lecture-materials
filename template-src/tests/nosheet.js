// Template without SHEET_URL (test mode). Usage: node nosheet.js <plain file>
const {chromium}=require('playwright'); const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
(async()=>{const b=await chromium.launch(); const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#test'); await p.waitForTimeout(400);
ok(await p.isVisible('#rumuzbox')&&/Test modu/.test(await p.textContent('#rumuzbox')),'code box with the red "Test modu" line');
await p.selectOption('#prog','tip-tr'); await p.check('#r-pre-0-1'); await p.click('#qsubmit'); await p.click('#qforce'); await p.waitForTimeout(300);
ok(await p.isVisible('#sendbox')&&await p.isDisabled('#qsend'),'send button shown but greyed out');
ok(/4\/84/.test(await p.textContent('#qres')),'score shown: '+(await p.textContent('#qres')).trim());
ok(errs.length===0,'no script errors '+JSON.stringify(errs));
console.log(out.join('\n')); await b.close();})();
