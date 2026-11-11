const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'#test'); await p.waitForTimeout(400);
console.log('code box visible:',await p.isVisible('#rumuzbox'));
await p.selectOption('#prog','tip-tr'); await p.check('#r-pre-0-1'); await p.click('#qsubmit'); await p.click('#qforce'); await p.waitForTimeout(300);
console.log('send box visible:',await p.isVisible('#sendbox'),'score:',(await p.textContent('#qres')).trim(),'errors:',JSON.stringify(errs)); await b.close();})();
