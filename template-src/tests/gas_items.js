// Item analysis of Apps Script 2026-11f against a simulated Sheet. Usage: node gas_items.js <Code.gs>
// Cases: hand-checked P and D with ties at the 27% cut (n = 40), a large group (500, against a reference), a small group (10),
// pooling across versions / languages / programs, flags, the menu, and text cells.
const {load}=require('./gasmock.js'); const env=load(process.argv[2]); const {ctx,book,ui,post,H,cell}=env;
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
// ---- message builder (same columns as engine 2026-11f). parts: 1/0 per part (mcq: one part; order: one per key pair)
const ITEMS=[{type:'mcq',pts:4,mod:'ornek1',code:'MCQAAA',n:1},{type:'tf',pts:10,mod:'ornek1',code:'TFBBBB',n:5},{type:'order',pts:16,mod:'ornek2',code:'ORDCCC',n:4},
  {type:'match',pts:15,mod:'ornek1',code:'MATDDD',n:5},{type:'fill',pts:15,mod:'ornek2',code:'FILEEE',n:5},{type:'order',pts:24,mod:'ornek1',code:'ORDFFF',n:6}];
const score=(it,p)=>Math.round(p.reduce((a,b)=>a+b,0)*it.pts/it.n*100)/100;
function msg(tab,alias,test,parts,o={}){ const items=o.items||ITEMS, cols=[]; let auto=0;
  items.forEach((it,i)=>{ const n=i+1, s=score(it,parts[i]); auto+=s; cols.push([`Q${n} ${it.type} (${it.pts})`,s],[`A${n}`,'x']); if(it.type!=='mcq') cols.push([`K${n} parts`,parts[i].join('')]); cols.push([`C${n} sure`,'-']); });
  cols.push(['Auto total (84)',Math.round(auto*100)/100],['Confidence points',0],['Gift (4)',4],['Total (100)',Math.min(100,auto+4)],['Topics',''],['Program',o.prog||'tip-tr'],
    ['Item codes',items.map(it=>it.mod+':'+it.code).join(' ')],['Version',o.ver||'2026-11f'],['Language',o.lang||'tr']);
  return {schema:2,course:tab,alias,test,cols}; }
const full=it=>Array(it.n).fill(1), none=it=>Array(it.n).fill(0);
const det=(res,code,part)=>res.items.find(x=>x.code===code&&x.part===part);
const rowOf=(tab,code,part)=>book[tab+'-items'].rows.find(r=>r[2]===code&&r[1]===part);
// ---- 1. hand case, n = 40: ties at the cut (k = round(0.27 × 40) = 11)
// rest (total minus item 1): 8 × 80, 6 × 65, 13 × 26, 4 × 10, 9 × 0 → upper = rest ≥ 65 (14 students), lower = rest ≤ 10 (13 students)
const restParts={80:[1,1,1,1,1],65:[1,1,0,1,1],26:[1,1,0,0,0],10:[1,0,0,0,0],0:[0,0,0,0,0]};   // flags for items 2–6 (full or none)
let a=0; const plan=[[80,8,6],[65,6,4],[26,13,7],[10,4,1],[0,9,2]];   // [rest, students, how many right on item 1]
plan.forEach(([rest,cnt,right])=>{ for(let i=0;i<cnt;i++){ const f=restParts[rest]; post(msg('hand','PHY-H'+(a++),'post',[[i<right?1:0],...ITEMS.slice(1).map((it,k)=>f[k]?full(it):none(it))])); } });
let res=ctx.itemAnalysis('hand'); const h1=det(res,'MCQAAA',-1);
ok(res.ok&&res.nPost===40&&h1.n===40,'hand case: 40 post-test rows');
ok(h1.nU===14&&h1.nL===13,'ties at the cut are included: upper 14 (8 + 6 tied), lower 13 (9 + 4 tied): '+h1.nU+'/'+h1.nL);
// upper: 6 + 4 = 10 of 14 right; lower: 1 + 2 = 3 of 13 right → P = 13/27 = 48.1; D = 10/14 − 3/13 = 0.484
ok(Math.round(h1.P)===48&&h1.D===0.48,'P = (10 + 3) / 27 × 100 = 48; D = 10/14 − 3/13 = 0.48: P '+h1.P.toFixed(1)+', D '+h1.D);
ok(rowOf('hand','MCQAAA','')[12]==='P acceptable · D excellent'&&rowOf('hand','MCQAAA','')[7]===48,'tab row: P 48, flag "P acceptable · D excellent"');
// ---- 2. large group (500), pre and post, against a reference
let seed=7; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; };
const norm=()=>Math.sqrt(-2*Math.log(rnd()+1e-12))*Math.cos(2*Math.PI*rnd());
const diff=ITEMS.map((it,i)=>Array.from({length:it.n},(_,j)=>-1+0.4*i+0.3*j));
const gen=(ab)=>ITEMS.map((it,i)=>diff[i].map((b,j)=>{ const rev=i===4&&j===2;   // fill blank 3: better students more often wrong (key error)
  const p=1/(1+Math.exp((rev?1:-1)*1.7*(ab-b))); return rnd()<p?1:0; }));
const REF={post:[],pre:[]};
for(let s=0;s<500;s++){ const ab=norm(); for(const [test,shift] of [['pre',-0.8],['post',0]]){ const parts=gen(ab+shift); REF[test].push(parts); post(msg('big','PHY-'+s,test,parts,{lang:s%2?'en':'tr',prog:s%3?'tip-tr':'tip-en'})); } }
function refStat(rows,i,j){ // independent reference: j = -1 item, else part
  const it=ITEMS[i], v=rows.map(p=>{ const tot=ITEMS.reduce((a,x,k)=>a+score(x,p[k]),0), sc=score(it,p[i]); return {rest:tot-sc, s:j<0?sc/it.pts:p[i][j]}; });
  const n=v.length, k=Math.round(0.27*n), by=v.map(x=>x.rest).sort((x,y)=>y-x), U=v.filter(x=>x.rest>=by[k-1]), Lw=v.filter(x=>x.rest<=by[n-k]);
  const m=g=>g.reduce((a,x)=>a+x.s,0)/g.length; return {P:100*(m(U)*U.length+m(Lw)*Lw.length)/(U.length+Lw.length), D:Math.round((m(U)-m(Lw))*100)/100}; }
res=ctx.itemAnalysis('big'); let bad=[], cnt=0;
ITEMS.forEach((it,i)=>{ for(let j=-1;j<(it.type==='mcq'?0:it.n);j++){ const d=det(res,it.code,j), rp=refStat(REF.post,i,j), rq=refStat(REF.pre,i,j); cnt++;
  if(!d||d.n!==500||Math.abs(d.P-rp.P)>1e-9||d.D!==rp.D||Math.abs(d.Ppre-rq.P)>1e-9) bad.push(it.code+'/'+j+': '+JSON.stringify(d)+' ref '+JSON.stringify(rp)); } });
ok(res.nPost===500&&res.nPre===500&&bad.length===0,'500 students: P post, D and P pre of all 6 items and 25 sub-parts equal the reference ('+cnt+' rows) '+bad.slice(0,2).join(' | '));
const bt=book['big-items'];
ok(bt.rows.length===5+cnt&&bt.rows[4].join('|')==='Item|Part|Code|Module|Type|Points|n post|P post|n pre|P pre|Gain|D|Flag','tab "big-items": 5 header lines + one row per item and sub-part');
const fb3=rowOf('big','FILEEE','blank 3'); ok(fb3&&fb3[11]<0&&/check the key/.test(fb3[12]),'a reversed sub-part (fill blank 3) gets D < 0 and the flag "check the key": D '+(fb3&&fb3[11]));
const g=rowOf('big','TFBBBB',''); ok(typeof g[10]==='number'&&g[10]>0&&g[10]===Math.round(det(res,'TFBBBB',-1).P-det(res,'TFBBBB',-1).Ppre),'gain = P post − P pre (positive after the lecture): '+g[10]);
ok(rowOf('big','ORDCCC','pair 2 (steps 2–3)')&&rowOf('big','TFBBBB','statement e')&&rowOf('big','MATDDD','row 5')&&rowOf('big','FILEEE','blank 1'),'sub-part names: statement a–e, row 1–5, blank 1–5, pair k (steps k–k+1)');
ok(bt.rows.slice(5).every(r=>r.length===13)&&/n < 40/.test(bt.rows[1][0])&&/0.15–0.24 review/.test(bt.rows[2][0]),'header lines explain the method and the flags');
// ---- 3. small group (10): P as a count, no D, "few data"
for(let s=0;s<10;s++){ const p=ITEMS.map(it=>full(it)); p[0]=[s<7?1:0]; if(s>=5) p[2]=[1,1,0,0]; post(msg('small','PHY-S'+s,'post',p)); }
res=ctx.itemAnalysis('small'); const m1=rowOf('small','MCQAAA',''), o3=rowOf('small','ORDCCC',''), o3p=rowOf('small','ORDCCC','pair 3 (steps 3–4)');
ok(m1[7]==="'7/10"&&m1[11]===''&&m1[12]==='few data','mcq 7 of 10 right: P "7/10" (text), no D, "few data"');
ok(o3[7]==="'7.5/10"&&o3p[7]==="'5/10",'partial points: order 5 × 1 + 5 × 0.5 = "7.5/10"; pair 3 "5/10" (Q120-A)');
// ---- 4. pooling: same code across versions, positions, TR/EN and programs; edited item = new code; other rows skipped
const V2=[ITEMS[0],{...ITEMS[1],code:'TFNEW2'},ITEMS[3],ITEMS[2],ITEMS[4],ITEMS[5]];   // tf edited (new code); order 16 moved from Q3 to Q4
for(let s=0;s<6;s++) post(msg('pool','PHY-P'+s,'post',ITEMS.map(it=>full(it)),{lang:s%2?'en':'tr',prog:s%3?'tip-tr':'tip-en',ver:'2026-11f'}));
for(let s=0;s<4;s++) post(msg('pool','PHY-Q'+s,'post',V2.map(it=>s<2?full(it):none(it)),{ver:'2026-11g',items:V2}));
post(msg('pool','PHY-Q9','late',V2.map(it=>none(it)),{items:V2}));
post({schema:2,course:'pool',alias:'PHY-OLD',test:'post',cols:[['Q1 mcq (5)',5],['Auto total (60)',5]]});   // engine 2026-11d row: no item codes
res=ctx.itemAnalysis('pool'); const pc=rowOf('pool','ORDCCC',''), old=rowOf('pool','TFBBBB',''), nw=rowOf('pool','TFNEW2','');
ok(pc[0]==='Q4'&&pc[6]===10&&pc[7]==="'8/10",'order item pooled across versions (Q3 → Q4), languages and programs: n 10, P "8/10"');
ok(old[0]==='Q2 (old)'&&old[6]===6&&nw[0]==='Q2'&&nw[6]===4,'edited item: new code with its own row (n 4); old code marked "(old)" (n 6)');
ok(res.nPost===10,'delayed-test rows and rows without item codes are not used (10 post rows)');
const order=book['pool-items'].rows.slice(5).filter(r=>r[1]==='').map(r=>r[0]).join(' ');
ok(order==='Q1 Q2 Q3 Q4 Q5 Q6 Q2 (old)','items of the latest version first, in their order; old codes after them: '+order);
// ---- 5. flags at the limits
const pf=[50,60,49,61,30,70,29,71].map(p=>p+':'+ctx.pFlag(p)).join(' '), df=[0.35,0.34,0.25,0.24,0.15,0.14,0,-0.01].map(d=>d+':'+ctx.dFlag(d)).join(' ');
ok(pf==='50:ideal 60:ideal 49:acceptable 61:acceptable 30:acceptable 70:acceptable 29:hard 71:easy','P flags: 50–60 ideal, 30–70 acceptable, > 70 easy, < 30 hard');
ok(df==='0.35:excellent 0.34:good 0.25:good 0.24:review 0.15:review 0.14:low 0:low -0.01:check the key','D flags: ≥ 0.35 excellent, 0.25–0.34 good, 0.15–0.24 review, < 0.15 low, < 0 check the key');
// ---- 6. menu
ctx.onOpen(); ok(ui.menus.length===1&&ui.menus[0].title==='Physiology'&&ui.menus[0].items[0].join()==='Item analysis,itemAnalysisMenu','Sheet menu "Physiology → Item analysis"');
env.setActive('hand'); const n0=book['hand-items'].rows.length; ctx.itemAnalysisMenu();
ok(/written to tab "hand-items": 40 post-test rows/.test(ui.alerts.pop())&&book['hand-items'].rows.length===n0,'menu on the open tab writes "<tab>-items"; a second run rewrites it (no duplicate rows)');
env.setActive('hand-items'); ctx.itemAnalysisMenu(); ok(/Open a test tab first/.test(ui.alerts.pop()),'menu on a "-items" tab: asks to open a test tab');
post({course:'digestion',alias:'NF-OLD1',test:'pre',s1:20,version:'2026-11c',lang:'tr'}); env.setActive('digestion'); ctx.itemAnalysisMenu();
ok(/no "Item codes" column/.test(ui.alerts.pop())&&!book['digestion-items'],'old tab without item codes: message, no new tab');
// ---- 7. text cells and the web app
const tc='text'; post(msg(tc,'PHY-T1','post',ITEMS.map(it=>it.type==='mcq'?[1]:[0,...Array(it.n-1).fill(1)])));
ok(cell(tc,1,'K2 parts')==="'01111"&&cell(tc,1,'Item codes').startsWith("'ornek1:"),'part marks and item codes are stored as text ("01111" keeps its 0)');
book[tc].rows[1][H(tc).indexOf('K3 parts')]='0111';   // as read back from a real Sheet (no apostrophe)
post({schema:2,course:tc,alias:'PHY-T1',test:'post',cols:[['Version','2026-11f']]}); ok(cell(tc,1,'K3 parts')==="'0111",'a row update keeps digit-only part marks as text');
ok(/2026-11f/.test(ctx.doGet({parameter:{}}).t),'web app page says "(script 2026-11f)"');
console.log(out.join('\n'));
