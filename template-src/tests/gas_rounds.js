// Apps Script 2026-11g: mini-quiz rounds (board per round, item analysis of a "-quiz" tab). Usage: node gas_rounds.js <Code.gs>
const {load}=require('./gasmock.js'); const env=load(process.argv[2]); const {ctx,book,ui,post,H,cell}=env;
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
// message in the column order of engine 2026-11g. its: [[right 0/1, speed 0-1, time s], …]; codes: "mod:CODE" per item
const qm=(tab,alias,test,its,codes,ver)=>({schema:2,course:tab,alias,test,cols:[['Round',+(test.slice(3)||1)]].concat(
  ...its.map(([r,s,t],i)=>[['R'+(i+1),r],['S'+(i+1),r?s:0],['A'+(i+1),r?'A':'B'],['T'+(i+1)+' sec',t]]),
  [['Mini-quiz right',its.reduce((a,x)=>a+x[0],0)],['Mini-quiz items',its.length],['Program','tip-tr']],
  codes?[['Item codes',codes]]:[],[['Version',ver||'2026-11g'],['Language','tr']])});
const get=pr=>JSON.parse(ctx.doGet({parameter:pr}).t);
const C1='ornek1:AAAAA1 ornek1:AAAAA2 ornek1:AAAAA3', C2='ornek2:BBBBB1 ornek2:BBBBB2 ornek2:BBBBB3';
// ---- 1. one row per student and round
const T='u1-quiz';
post(qm(T,'PHY-AAAA','mid1',[[1,.8,2],[1,.8,4],[1,.5,15]],C1)); post(qm(T,'PHY-BBBB','mid1',[[1,.8,2],[0,0,20],[0,0,30]],C1));
post(qm(T,'PHY-CCCC','mid1',[[1,.8,2],[0,0,20],[0,0,30]],C1)); post(qm(T,'PHY-DDDD','mid1',[[1,.2,8],[0,0,20],[0,0,30]],C1));
post(qm(T,'PHY-AAAA','mid2',[[0,0,20],[1,1,0],[1,.5,5]],C2)); post(qm(T,'PHY-BBBB','mid2',[[1,.5,10],[1,.5,10],[1,.5,5]],C2)); post(qm(T,'PHY-EEEE','mid2',[[0,0,20],[0,0,20],[1,1,0]],C2));
ok(book[T].rows.length===8&&H(T).slice(0,4).join()==='Timestamp,Alias,Test,Round','7 rows (4 in round 1, 3 in round 2); "Round" right after "Test"');
ok(H(T).filter(h=>/^R\d$/.test(h)).join()==='R1,R2,R3'&&H(T).includes('Item codes')&&cell(T,1,'Item codes')==="'"+C1,'the rounds share the columns R1–R3; item codes stored as text');
post(qm(T,'PHY-BBBB','mid1',[[1,.8,2],[1,.8,4],[0,0,30]],C1));
ok(book[T].rows.length===8&&cell(T,2,'R2')===1&&cell(T,5,'Test')==='mid2'&&cell(T,5,'Alias')==='PHY-AAAA','a resend of round 1 updates the same row; the round 2 row is not touched');
// ---- 2. board per round
const B1=get({board:T,test:'mid1',since:'0'});
// round 1: P1 = 4/4, P2 = 2/4, P3 = 1/4.  A: 500+500*1*.8=900 · 500+500*1.5*.8=1100 · 500+500*1.75*.5=937.5 → 2938
// B: 900 + 1100 = 2000 · C: 900 · D: 500+500*1*.2 = 600
ok(B1.ok&&B1.n===4&&B1.top.map(r=>r.rank+':'+r.alias+':'+r.points).join()==='1:PHY-AAAA:2938,2:PHY-BBBB:2000,3:PHY-CCCC:900,4:PHY-DDDD:600','board &test=mid1: only round 1 rows, points from round 1 answers');
ok(B1.items.map(x=>x.k+':'+x.right+'/'+x.n).join()==='1:4/4,2:2/4,3:1/4','board &test=mid1: share right per item of round 1');
const B2=get({board:T,test:'mid2',since:'0'});
// round 2: P1 = 1/3, P2 = 2/3, P3 = 3/3. A: 500+500*(4/3)*1=1166.7 + 500+500*1*.5=750 → 1917 · B: 500+500*(5/3)*.5=916.7 + 500+500*(4/3)*.5=833.3 + 750 = 2500 · E: 500+500*1*1 = 1000
ok(B2.n===3&&B2.top.map(r=>r.alias+':'+r.points).join()==='PHY-BBBB:2500,PHY-AAAA:1917,PHY-EEEE:1000'&&B2.items.map(x=>x.right).join()==='1,2,3','board &test=mid2: only round 2 rows and its own P per item');
ok(get({board:T,since:'0'}).n===7,'board without &test: all rows, as in script 2026-11e/f');
// ---- 2b. streak bonus (script 2026-11h, &streak=1): 2nd right in a row +100, 3rd +200, inside one round
const S1=get({board:T,test:'mid1',since:'0',streak:'1'});
// A: 2938 + 100 + 200 = 3238 · B (right, right, wrong): 2000 + 100 = 2100 · C, D: one right answer, no bonus
ok(S1.streak===true&&S1.top.map(r=>r.alias+':'+r.points).join()==='PHY-AAAA:3238,PHY-BBBB:2100,PHY-CCCC:900,PHY-DDDD:600','streak: round 1 points with +100 / +200 for right answers in a row');
const S2=get({board:T,test:'mid2',since:'0',streak:'1'});
// B (3 right): 2500 + 300 = 2800 · A (wrong, right, right): 1917 + 100 = 2017 · E (wrong, wrong, right): 1000; a wrong answer ends the streak
ok(S2.top.map(r=>r.alias+':'+r.points).join()==='PHY-BBBB:2800,PHY-AAAA:2017,PHY-EEEE:1000','streak: a wrong answer ends the streak (round 2)');
ok(B1.streak===false&&get({board:T,test:'mid1',since:'0',streak:'yes'}).top[0].points===2938,'no streak without &streak=1 (engines 2026-11e to 11g get the same points as before)');
ok(get({board:T,test:'mid3',since:'0'}).n===0,'board of a round without rows: empty');
ok(get({board:T,test:'mid1;x',since:'0'}).n===7&&get({board:T,test:'=SUM(1)',since:'0'}).ok===true,'a bad &test value is ignored (no crash)');
ok(get({board:T,test:'mid1',since:String(Date.now()+60000)}).n===0,'board per round still uses the time window ("Reset (new group)")');
// ---- 3. a tab that also holds an old 2026-11f row ("mid", 4 items, R4)
post({schema:2,course:T,alias:'PHY-OLD1',test:'mid',cols:[['R1',1],['S1',.5],['R2',1],['S2',.5],['R3',1],['S3',.5],['R4',1],['S4',.5],['Version','2026-11f']]});
const B3=get({board:T,test:'mid1',since:'0'});
ok(H(T).includes('R4')&&B3.n===4&&B3.items.length===3&&B3.top[0].points===2938,'old row with R4 in the tab: the round 1 board keeps 3 items and the same points');
const B4=get({board:T,test:'mid',since:'0'}); ok(B4.n===1&&B4.items.length===4,'&test=mid still shows the old one-round rows (4 items)');
// ---- 4. item analysis of a "-quiz" tab: few data (n < 40)
const S='small-quiz';
for(let i=0;i<10;i++){ post(qm(S,'PHY-S'+i,'mid1',[[i<7?1:0,.5,i<7?4:20],[1,.5,2],[i<3?1:0,.5,6]],C1)); post(qm(S,'PHY-S'+i,'mid2',[[1,.5,3],[i<5?1:0,.5,5],[0,0,10]],C2)); }
const r=ctx.itemAnalysis(S), st=book[S+'-items'];
ok(r.ok&&r.quiz&&r.nRows===20&&r.nRounds===2&&r.nItems===6,'"-quiz" tab: 20 rows, 2 rounds, 6 items');
ok(st.rows[4].join('|')==='Round|Item|Code|Module|n|Right|P|Mean time right (s)|Flag'&&st.rows.length===5+6&&/script 2026-11h/.test(st.rows[0][0]),'tab "small-quiz-items": 5 header lines + one row per round and item');
const row=(rd,k)=>st.rows.slice(5).find(x=>x[0]===rd&&x[1]==='K'+k);
ok(row(1,1).join('|')==="1|K1|AAAAA1|ornek1|10|7|'7/10|4|few data",'round 1 item 1: n 10, 7 right, P as a count "7/10", mean time of right answers 4 s, "few data"');
ok(row(2,2)[6]==="'5/10"&&row(2,3)[5]===0&&row(2,3)[7]===''&&row(2,3)[2]==='BBBBB3','round 2: P counts per item; an item nobody got right has no mean time');
ok(st.rows.slice(5).map(x=>x[0]+'-'+x[1]).join()==='1-K1,1-K2,1-K3,2-K1,2-K2,2-K3','rows sorted by round, then item');
// ---- 5. enough data (n ≥ 40): P as a number and the P flag; pooling by item code
const L='big-quiz';
for(let i=0;i<50;i++) post(qm(L,'PHY-L'+i,'mid1',[[i<27?1:0,.5,5],[i<45?1:0,.5,5],[i<10?1:0,.5,5]],C1));
ctx.itemAnalysis(L); const bt=book[L+'-items'].rows.slice(5);
ok(bt.map(x=>x[6]+':'+x[8]).join()==='54:P ideal,90:P easy,20:P hard','n = 50: P 54 ideal, 90 easy, 20 hard (no D)');
// a second term with the same items pools; then item 3 edited (new code) gets its own row, the old code is marked "(old)"
for(let i=0;i<10;i++) post(qm(L,'PHY-M'+i,'mid1',[[1,.5,5],[1,.5,5],[1,.5,5]],C1));
for(let i=0;i<5;i++) post(qm(L,'PHY-N'+i,'mid1',[[1,.5,5],[1,.5,5],[0,0,20]],'ornek1:AAAAA1 ornek1:AAAAA2 ornek1:ZZZZZ3'));
ctx.itemAnalysis(L); const b2=book[L+'-items'].rows.slice(5);
const f=c=>b2.find(x=>x[2]===c);
ok(f('AAAAA1')[4]===65&&f('AAAAA3')[4]===60&&f('AAAAA3')[1]==='K3 (old)'&&f('ZZZZZ3')[4]===5&&f('ZZZZZ3')[1]==='K3','pooled by item code across terms; an edited item gets its own row and the old code is marked "(old)"');
// ---- 6. rows without item codes (older engines) are pooled by round and position
post({schema:2,course:'old-quiz',alias:'PHY-O1',test:'mid',cols:[['R1',1],['S1',.5],['T1 sec',3],['R2',0],['S2',0],['T2 sec',20]]});
post({schema:2,course:'old-quiz',alias:'PHY-O2',test:'mid',cols:[['R1',1],['S1',.5],['T1 sec',5],['R2',1],['S2',.5],['T2 sec',4]]});
const ro=ctx.itemAnalysis('old-quiz'), ob=book['old-quiz-items'].rows.slice(5);
ok(ro.ok&&ob.length===2&&ob[0].slice(0,8).join('|')==="1|K1|||2|2|'2/2|4"&&ob[1][6]==="'1/2",'rows without codes ("mid", 2026-11f): round 1, pooled by position');
// ---- 7. the menu
env.setActive(S); ctx.itemAnalysisMenu();
ok(/Mini-quiz item analysis written to tab "small-quiz-items": 20 rows, 2 rounds, 6 items/.test(ui.alerts.pop()),'menu on a "-quiz" tab writes "<tab>-items"');
post({schema:2,course:'empty-quiz',alias:'PHY-X',test:'pre',cols:[['Version','2026-11g']]}); env.setActive('empty-quiz'); ctx.itemAnalysisMenu();
ok(/no mini-quiz rows/.test(ui.alerts.pop())&&!book['empty-quiz-items'],'"-quiz" tab without mini-quiz rows: message, no new tab');
ok(/2026-11h/.test(ctx.doGet({parameter:{}}).t),'web app page says "(script 2026-11h)"');
console.log(out.join('\n'));
