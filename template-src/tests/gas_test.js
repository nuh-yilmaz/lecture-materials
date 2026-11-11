// Runs apps-script/Code.gs against a simulated Google Sheet. Usage: node gas_test.js <Code.gs> <posts.json>
const fs=require('fs'), vm=require('vm');
const [codePath,postsPath]=process.argv.slice(2);
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
// ---- minimal SpreadsheetApp mock: a sheet is a 2D array of cell values
function Sheet(name){ this.name=name; this.rows=[]; this.frozen=0; }
Sheet.prototype.getLastRow=function(){ return this.rows.length; };
Sheet.prototype.getLastColumn=function(){ return this.rows.reduce((m,r)=>Math.max(m,r.length),0); };
Sheet.prototype.appendRow=function(r){ this.rows.push(r.slice()); };
Sheet.prototype.setFrozenRows=function(n){ this.frozen=n; };
Sheet.prototype.getRange=function(r,c,nr=1,nc=1){ const sh=this; return {
  getValues(){ const v=[]; for(let i=0;i<nr;i++){ const row=sh.rows[r-1+i]||[]; const o=[]; for(let j=0;j<nc;j++) o.push(row[c-1+j]===undefined?'':row[c-1+j]); v.push(o);} return v; },
  setValues(v){ if(v.length!==nr||v[0].length!==nc) throw new Error(`setValues size ${v.length}x${v[0].length} != ${nr}x${nc}`);
    for(let i=0;i<nr;i++){ while(sh.rows.length<r+i) sh.rows.push([]); const row=sh.rows[r-1+i]; for(let j=0;j<nc;j++){ while(row.length<c-1+j) row.push(''); row[c-1+j]=v[i][j]; } } },
  setValue(x){ this.setValues([[x]]); } }; };
const book={}; const SS={getSheetByName:n=>book[n]||null, insertSheet:n=>(book[n]=new Sheet(n))};
const ctx={ SpreadsheetApp:{getActiveSpreadsheet:()=>SS}, LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({t,setMimeType(){return this;}})}, console, Date, JSON, Array, String, Number, isFinite, Error, Math, parseInt };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(codePath,'utf8'),ctx);
const post=d=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify(d)}}).t);
const H=n=>book[n].rows[0].map(String), cell=(n,r,h)=>book[n].rows[r][H(n).indexOf(h)];
// ---- 1. schema 1 (old simulators) behaves as before
const old={course:'digestion',alias:'NF-OLD1',test:'pre',s1:20,s2:16,s3:20,s4:15,auto_total:71,a1:'B',a2:'BDEAC',a3:'1-c',a4:'DYDY',a5:'Safra ...',version:'2026-11c',lang:'tr'};
ok(post(old).ok===true,'schema 1 accepted');
ok(H('digestion').length===17&&H('digestion')[3]==='Q1 (20)','schema 1: old 17 headers in a new tab');
ok(book.digestion.rows[1][3]===20&&book.digestion.rows[1][8]===71&&book.digestion.rows[1][7]==='','schema 1: values in the old columns (s5_self empty)');
post({...old,s5_self:15,total:86}); ok(book.digestion.rows.length===2&&book.digestion.rows[1][7]===15,'schema 1: same alias+test updates the same row');
post({...old,test:'post'}); ok(book.digestion.rows.length===3,'schema 1: post-test goes to a new row');
// ---- 2. schema 2 (template engine 2026-11f) with the real messages from the browser test (flow2.js)
const P=JSON.parse(fs.readFileSync(postsPath,'utf8')); const tab='template';
const PO=JSON.parse(fs.readFileSync(postsPath.replace(/posts\.json$/,'posts_open.json'),'utf8')).map(m=>({...m,course:'template-open'}));
ok(P.length===3&&P.every(p=>p.schema===2)&&PO.length===1,'real schema-2 messages loaded (pre, post, delayed; open copy: post)');
ok(post(P[0]).ok===true,'schema 2 accepted');
const h=H(tab); ok(h.slice(0,3).join()==='Timestamp,Alias,Test','schema 2: new tab starts with Timestamp, Alias, Test');
ok(P[0].cols.every(c=>h.includes(c[0])),'schema 2: every column name of the pre-test is a header ('+h.length+' columns)');
ok(cell(tab,1,'Q1 mcq (4)')===0&&cell(tab,1,'Auto total (84)')===31&&cell(tab,1,'A2')==='DYDYD'&&cell(tab,1,'Test')==='pre','schema 2: pre values under their names');
post(P[1]); const h2=H(tab);
ok(book[tab].rows.length===3&&cell(tab,2,'Test')==='post','schema 2: post-test in a new row');
ok(h.includes('Feedback: helped (1-5)')&&h2.length===h.length&&h2.slice(-2).join()==='Version,Language','schema 2: form columns exist from the pre-test on; Version, Language stay last');
ok(cell(tab,2,'Feedback: helped (1-5)')===5&&cell(tab,2,'Learned most')==='Geri bildirim döngüsünün basamakları'&&cell(tab,2,'Q3 order (16)')===16,'schema 2: post values incl. form');
post(P[0]); ok(book[tab].rows.length===3,'schema 2: resend updates the same row');
const hx=H(tab), ix=n=>hx.indexOf(n);
ok(ix('K2 parts')===ix('A2')+1&&ix('Confidence points')===ix('Auto total (84)')+1&&ix('Gift (4)')===ix('Auto total (84)')+2&&ix('Total (100)')===ix('Auto total (84)')+3&&ix('Item codes')===ix('Version')-1&&ix('M2 answers')===ix('Still unclear')+1&&ix('M2 right')===ix('Still unclear')+2&&cell(tab,2,'M2 answers')==="'-",'engine 2026-11f columns in the tab: K<n> parts after A<n>, Confidence points, Gift (4), Total (100) after Auto total (84), Item codes before Version');
ok(!hx.some(h=>/lecturer/.test(h))&&cell(tab,1,'Total (100)')===31&&cell(tab,2,'Total (100)')===80&&/^'ornek1:/.test(cell(tab,1,'Item codes'))&&/^'[01]+$/.test(cell(tab,1,'K2 parts')),'no lecturer columns without an open item; totals 31 and 80; item codes and part marks stored as text');
post(P[2]); ok(book[tab].rows.length===4&&cell(tab,3,'Test')==='late'&&cell(tab,3,'Q3 order (16)')===12&&cell(tab,3,'Q6 order (24)')===16,'schema 2: delayed test row (pair scores 12 and 16)');
// open item (special case): lecturer columns are created empty and never overwritten
const to='template-open'; post(PO[0]); const ho=H(to);
ok(cell(to,1,'Q6 open: lecturer (26)')===''&&ho.includes('Q6 lecturer notes'),'open item: lecturer columns created and left empty');
book[to].rows[1][ho.indexOf('Q6 open: lecturer (26)')]=14; book[to].rows[1][ho.indexOf('Q6 lecturer notes')]='6.5+2.6+0+2.6 ≈ 14';
post(PO[0]); ok(cell(to,1,'Q6 open: lecturer (26)')===14&&cell(to,1,'Q6 lecturer notes')==='6.5+2.6+0+2.6 ≈ 14'&&cell(to,1,'Q6 self-check (feedback)')===19.5,'open item: resend keeps the lecturer score and note');
// ---- 3. safety
const bad={schema:2,course:tab,alias:'NF-EVIL',test:'pre',cols:[['A1','=HYPERLINK("x")'],['=SUM(1)','x'],['Q1 mcq (4)',Infinity]]};
ok(post(bad).ok===true&&cell(tab,4,'A1')==='\'=HYPERLINK("x")','formula in an answer is stored as text');
ok(!H(tab).includes('=SUM(1)'),'a column name starting with = is refused');
ok(cell(tab,4,'Q1 mcq (4)')==='','a non-finite number is written as empty');
ok(post({schema:2,course:tab,alias:'NF-X',test:'pre',cols:'nope'}).ok===false,'malformed message rejected without a crash');
ok(post({...old,course:'endocrine'}).ok===true&&H('endocrine').length===17,'schema 1 still creates its own tabs (endocrine)');
// ---- 4. mini-quiz leaderboard (script 2026-11e): points from the round's own answers
// 4 students, 2 questions. Q1: all right (P=1). Q2: 1 of 4 right (P=0.25).
const kq=(a,r1,s1,r2,s2)=>({schema:2,course:'template-quiz',alias:a,test:'mid',cols:[['R1',r1],['S1',s1],['A1','Y'],['T1 sec',2],['R2',r2],['S2',s2],['A2','B'],['T2 sec',4],['Mini-quiz right',r1+r2],['Mini-quiz items',2],['Program','tip-tr'],['Version','2026-11d'],['Language','tr']]});
post(kq('PHY-AAAA',1,0.8,1,0.8)); post(kq('PHY-BBBB',1,0.8,0,0)); post(kq('PHY-CCCC',1,0.8,0,0)); post(kq('PHY-DDDD',1,0.2,0,0));
const get=pr=>{ const r=ctx.doGet({parameter:pr}); try{ return JSON.parse(r.t); }catch(e){ return r.t; } };
const B=get({board:'template-quiz',since:'0'});
// A: Q1 500+500*1*0.8=900, Q2 500+500*1.75*0.8=1200 → 2100; B and C: 900; D: 500+500*1*0.2=600
ok(B.ok&&B.n===4&&B.top.map(r=>r.rank+':'+r.alias+':'+r.points).join()==='1:PHY-AAAA:2100,2:PHY-BBBB:900,2:PHY-CCCC:900,4:PHY-DDDD:600','board: formula 500 + 500 × (2 − P) × S; equal points share a place');
ok(B.items.map(x=>x.k+':'+x.right+'/'+x.n).join()==='1:4/4,2:1/4','board: share right per question (4/4, 1/4)');
ok(get({board:'template-quiz',since:'0',n:'1'}).top.length===1,'board: n limits the places');
ok(get({board:'template-quiz',since:String(Date.now()+60000)}).n===0,'board: rows before "since" are left out (new round)');
ok(get({board:'template'}).ok===false,'board: only tabs ending in -quiz');
ok(get({board:'nothere-quiz'}).n===0,'board: missing tab gives an empty board');
ok(/2026-11f/.test(ctx.doGet({parameter:{}}).t)&&/2026-11f/.test(ctx.doGet().t),'plain URL still shows the connection text (2026-11f)');
post(kq('PHY-BBBB',1,0.8,1,1)); const B2=get({board:'template-quiz',since:'0'});
ok(B2.n===4&&B2.items[1].right===2&&B2.top[0].alias==='PHY-BBBB','board: a resend updates the same row; P is recalculated (Q2 now 2/4)');
console.log(out.join('\n'));
console.log('\nTemplate tab after the test:\n'+H(tab).join(' | '));
