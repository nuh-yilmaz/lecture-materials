// Author check of engine 2026-11p: an order step must not repeat the question. Usage: node ordrep.js <http base of the test copies>
const {chromium}=require('playwright'); const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const H=process.argv[2];
async function load(b,file){ const p=await (await b.newContext()).newPage(); const errs=[], warns=[], cons=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='warning') warns.push(m.text()); if(m.type()==='error'&&!/ERR_|net::|Failed to load/.test(m.text())) cons.push(m.text()); });
  await p.route(/fonts\./,r=>r.abort()); await p.goto(H+'/'+file+'#test'); await p.waitForTimeout(400); return {p,errs,warns,cons}; }
(async()=>{const b=await chromium.launch();
const A=await load(b,'plain.html');
ok(!A.warns.some(w=>/repeats the question/.test(w)),'template: no order step repeats its question '+JSON.stringify(A.warns));
ok(A.errs.length===0&&A.cons.length===0,'template: no script or checkQuiz errors');
const B=await load(b,'ordrep.html'); const W=B.warns.filter(w=>/repeats the question/.test(w));
ok(W.length===1,'changed question: exactly one warning '+JSON.stringify(W));
ok(W.length===1&&/^QUIZ\[\d+\] \(order, tr\): step "Damar 1'in yarıçapı azalır" repeats the question/.test(W[0]),'the warning names the item, the language and the step');
ok(W.length===1&&/keep the number of steps/.test(W[0]),'the warning says how to fix it');
ok(!W.some(w=>/\(order, en\)/.test(w)),'English question unchanged: no English warning');
ok(B.errs.length===0&&B.cons.length===0,'the page still runs (a warning, not an error)');
console.log(out.join('\n')); await b.close();})();
