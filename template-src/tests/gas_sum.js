// Apps Script 2026-11j: pre-test class summary (?summary=<course>&test=pre&since=<ms>&ver=<Version>). Usage: node gas_sum.js <Code.gs>
// Class totals only (n, mean score share per automatic item); pre-test rows of this Version; no items below 5 students.
const {load}=require('./gasmock.js'); const env=load(process.argv[2]); const {ctx,book,post}=env;
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const ITEMS=[['mcq',4],['tf',10],['order',16],['match',15],['fill',15],['order',24]];
// one pre- or post-test message in the engine column order; sc = score per item (null = no value)
const msg=(tab,alias,test,sc,ver,open)=>({schema:2,course:tab,alias,test,cols:[].concat(
  ...ITEMS.map(([ty,p],i)=>[[`Q${i+1} ${ty} (${p})`,sc[i]],[`A${i+1}`,'x']]),
  open?[['Q7 open: lecturer (40)',null],['Q7 lecturer notes',null]]:[],
  [['Auto total (84)',sc.reduce((a,x)=>a+(x||0),0)],['Topics','Örnek 1: 50%'],['Program','tip-tr'],['Item codes','ornek1:AAAAAA'],['Version',ver||'2026-11h'],['Language','tr']])});
const get=pr=>JSON.parse(ctx.doGet({parameter:pr}).t);
const T='u1';
// ---- 1. fewer than 5 students: n only, no items
for(let i=0;i<4;i++) post(msg(T,'PHY-000'+i,'pre',[4,10,16,15,15,24]));
let r=get({summary:T,test:'pre',since:'0',ver:'2026-11h'});
ok(r.ok&&r.n===4&&r.min===5&&r.items.length===0,'4 students: n = 4, min = 5, no items');
// ---- 2. five or more: mean share per item
post(msg(T,'PHY-0004','pre',[0,0,0,0,0,0])); post(msg(T,'PHY-0005','pre',[0,5,8,null,15,12]));
r=get({summary:T,test:'pre',since:'0',ver:'2026-11h'});
// Q1: 4×4 + 0 + 0 = 16 / 6 / 4 = .667 · Q2: 40+0+5 = 45/6/10 = .75 · Q4: 60/5 rows with a value/15 = .8 · Q6: 96+0+12 = 108/6/24 = .75
ok(r.n===6&&r.items.length===6,'6 students: one entry per automatic item');
ok(r.items.map(x=>x.q+':'+x.type+':'+x.pts+':'+x.share).join(' ')==='1:mcq:4:0.667 2:tf:10:0.75 3:order:16:0.75 4:match:15:0.8 5:fill:15:0.833 6:order:24:0.75','mean score share per item (3 decimals); an empty cell is not counted');
ok(r.items[3].n===5&&r.items[0].n===6,'n per item counts only rows with a value');
// ---- 3. only pre-test rows of this Version
post(msg(T,'PHY-0000','post',[0,0,0,0,0,0])); post(msg(T,'PHY-0099','pre',[0,0,0,0,0,0],'2026-11g'));
r=get({summary:T,test:'pre',since:'0',ver:'2026-11h'});
ok(r.n===6&&r.items[0].share===0.667,'post-test rows and rows of another Version are not counted');
ok(get({summary:T,test:'pre',since:'0'}).n===7,'without &ver: all pre-test rows (7)');
post(msg(T,'PHY-0004','pre',[4,10,16,15,15,24]));
r=get({summary:T,since:'0',ver:'2026-11h'});
ok(r.n===6&&r.items[0].share===0.833,'a resent pre-test updates the same row (n stays 6); &test defaults to pre');
// ---- 4. time window
ok(get({summary:T,test:'pre',since:String(Date.now()+60000),ver:'2026-11h'}).n===0,'rows sent before &since are not counted ("Reset (new group)")');
// ---- 5. refused requests
ok(get({summary:T,test:'post',since:'0'}).ok===false,'post-test summary refused (pre-test only)');
ok(get({summary:T+'-quiz',since:'0'}).ok===false&&get({summary:T+'-items',since:'0'}).ok===false,'"-quiz" and "-items" tabs refused');
ok(get({summary:'nosuchtab',since:'0'}).ok===true&&get({summary:'nosuchtab',since:'0'}).n===0,'a missing tab gives n = 0');
ok(get({summary:'=SUM(1)',since:'0'}).ok===true,'a bad tab name does not crash');
// ---- 6. lecturer columns and privacy
post(msg('u2','PHY-1000','pre',[4,10,16,15,15,24],'v',true)); for(let i=1;i<5;i++) post(msg('u2','PHY-100'+i,'pre',[0,0,0,0,0,0],'v',true));
r=get({summary:'u2',since:'0',ver:'v'});
ok(r.n===5&&r.items.length===6&&!r.items.some(x=>x.q===7),'open-item lecturer columns are not items');
const js=ctx.doGet({parameter:{summary:T,since:'0',ver:'2026-11h'}}).t;
ok(!/PHY-|Alias|tip-tr|ornek1:/.test(js),'the reply has no codes, programs or item codes (class totals only)');
// ---- 7. other requests unchanged
ok(/script 2026-11o/.test(ctx.doGet({parameter:{}}).t),'web app page says "(script 2026-11o)"');
ok(get({board:T,since:'0'}).ok===false&&book[T].rows.length===9,'the board still refuses a test tab; the summary wrote nothing');
console.log(out.join('\n'));
