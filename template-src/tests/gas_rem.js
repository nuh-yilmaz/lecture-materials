// Delayed-test e-mail reminders in Apps Script 2026-11k (tab "reminders"; Q28-C). Usage: node gas_rem.js <path to Code.gs>
const {load}=require('./gasmock.js');
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const G=load(process.argv[2]); const {ctx,book,post}=G;
const mails=[]; let quota=1500; const trig=[];
ctx.MailApp={getRemainingDailyQuota:()=>quota, sendEmail:(to,s,b)=>{ mails.push({to,s,b}); }};
ctx.ScriptApp={getProjectTriggers:()=>trig, newTrigger:f=>({timeBased(){return this;},everyDays(){return this;},atHour(){return this;},create(){ trig.push({getHandlerFunction:()=>f}); }})};
const ymd=d=>d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
const day=n=>{ const t=new Date(); return ymd(new Date(t.getFullYear(),t.getMonth(),t.getDate()+n)); };
const R=()=>(book.reminders?book.reminders.rows.slice(1).filter(r=>r[2]):[]);
// ---- store
let r=post({schema:'rem',course:'introduction',email:'Ayse.K@Ogr.Istanbul.edu.tr ',days:14,lang:'tr',alias:'PHY-7KQ2'});
ok(r.ok&&book.reminders&&book.reminders.rows[0].join()==='Course,Send on,E-mail,Language','reply ok; tab "reminders" with 4 headers');
ok(R().length===1&&R()[0].join()==='introduction,'+day(14)+',ayse.k@ogr.istanbul.edu.tr,tr','row: course, date in 14 days (no time), e-mail in lower case, language');
ok(!JSON.stringify(book.reminders.rows).includes('PHY-'),'no code stored, even if the page sends one');
ok(!book.introduction,'no results tab written by a reminder');
r=post({schema:'rem',course:'introduction',email:'ayse.k@ogr.istanbul.edu.tr',days:14,lang:'tr'});
ok(r.ok&&r.dup&&R().length===1,'same e-mail and course stored once (dup)');
ok(post({schema:'rem',course:'other',email:'a@b.co',days:14}).error==='course'&&R().length===1,'course not in REM_LINKS refused');
['no-at.example.com','a b@c.co','=HYPERLINK("x")@a.co','+1@a.co','-a@b.co','x@y','a@b.c',('a'.repeat(120))+'@b.co'].forEach(e=>
  ok(post({schema:'rem',course:'introduction',email:e,days:14}).error==='email','bad e-mail refused: '+e.slice(0,24)));
post({schema:'rem',course:'introduction',email:'zeynep@x.com',days:999,lang:'en'});
post({schema:'rem',course:'introduction',email:'can@x.com',days:-5});
const rows=R();
ok(rows.map(x=>x[2]).join()==='ayse.k@ogr.istanbul.edu.tr,can@x.com,zeynep@x.com','rows sorted by e-mail (order shows nothing)');
ok(rows.find(x=>x[2]==='zeynep@x.com')[1]===day(60)&&rows.find(x=>x[2]==='zeynep@x.com')[3]==='en','days limited to 60; language en kept');
ok(rows.find(x=>x[2]==='can@x.com')[1]===day(1)&&rows.find(x=>x[2]==='can@x.com')[3]==='tr','days at least 1; other language → tr');
// ---- sending
book.reminders.rows.push(['introduction',day(0),'due@x.com','tr'],['introduction',day(-3),'late@x.com','en'],['introduction',day(-9),'old@x.com','tr'],['endocrine',day(-1),'gone@x.com','tr']);
let res=ctx.sendReminders();
ok(res.sent===3&&mails.map(m=>m.to).sort().join()==='due@x.com,late@x.com,old@x.com','due rows sent (today, 3 days late, 9 days late)');
const m1=mails.find(m=>m.to==='due@x.com'), m2=mails.find(m=>m.to==='late@x.com');
ok(/Gecikmeli test açıldı: Fizyolojiye Giriş/.test(m1.s)&&m1.b.includes('https://nuh-yilmaz.github.io/lecture-materials/introduction/#late')&&/aynı cihaz ve tarayıcıda|cihaz ve tarayıcıda/.test(m1.b),'TR e-mail: subject, link to #late, same-device note');
ok(/Delayed test is open: Introduction to Physiology/.test(m2.s)&&m2.b.includes('#late'),'EN e-mail');
ok(!mails.some(m=>/PHY-|\d+\/100/.test(m.b)),'e-mails contain no code and no score');
ok(R().map(x=>x[2]).join()==='ayse.k@ogr.istanbul.edu.tr,can@x.com,zeynep@x.com','sent rows and rows of unknown courses deleted; future rows kept');
// ---- quota used up
book.reminders.rows.push(['introduction',day(-2),'wait@x.com','tr'],['introduction',day(-8),'drop@x.com','tr']); quota=0; mails.length=0;
res=ctx.sendReminders();
ok(res.sent===0&&!mails.length&&R().some(x=>x[2]==='wait@x.com')&&!R().some(x=>x[2]==='drop@x.com'),'no quota: 2-day-old row waits, 8-day-old row deleted unsent');
quota=10; res=ctx.sendReminders(); ok(res.sent===1&&!R().some(x=>x[2]==='wait@x.com'),'next day: waiting row sent');
// ---- Send on cell stored as a real date (the Sheet converts "yyyy-mm-dd" text to a date)
{ const d=n=>{ const t=new Date(); return new Date(t.getFullYear(),t.getMonth(),t.getDate()+n); };
  book.reminders.rows.push(['introduction',d(0),'datedue@x.com','tr'],['introduction',d(-2),'datelate@x.com','en'],['introduction',d(5),'datefuture@x.com','tr']); mails.length=0;
  ctx.reminderStatus(); ok(/due today or earlier: 2\)/.test(G.ui.alerts.slice(-1)[0]),'status counts date cells due today or earlier');
  res=ctx.sendReminders();
  ok(res.sent===2&&mails.map(m=>m.to).sort().join()==='datedue@x.com,datelate@x.com','date cells due today and 2 days ago are sent');
  ok(R().some(x=>x[2]==='datefuture@x.com'&&x[1]===day(5))&&!R().some(x=>/^datedue|^datelate/.test(x[2])),'future date cell kept as yyyy-mm-dd; sent rows deleted');
  R().filter(x=>x[2]==='datefuture@x.com').forEach(x=>book.reminders.rows.splice(book.reminders.rows.indexOf(x),1)); }
// ---- menu, status, trigger, version
ctx.reminderTrigger(); ctx.reminderTrigger();
ok(trig.length===1&&trig[0].getHandlerFunction()==='sendReminders','daily trigger installed once');
ctx.reminderStatus(); ok(/Waiting reminders: 3/.test(G.ui.alerts.slice(-1)[0])&&/E-mails left today/.test(G.ui.alerts.slice(-1)[0])&&/Daily sending: on/.test(G.ui.alerts.slice(-1)[0]),'status: queue, quota, trigger');
ctx.onOpen(); ok(G.ui.menus.slice(-1)[0].items.map(x=>x[0]).join('|')==='Item analysis|Reminders: status|Reminders: start daily sending','menu has the 2 reminder items');
ok(/script 2026-11o/.test(ctx.doGet({parameter:{}}).t),'web app page says (script 2026-11o)');
// ---- results still work
r=post({schema:2,course:'introduction',alias:'PHY-AAAA',test:'post',cols:[['Total (100)',80]]});
ok(r.ok&&book.introduction&&!book.reminders.rows.some(x=>x.includes('PHY-AAAA')),'schema 2 results go to the course tab, never to "reminders"');
console.log(out.join('\n'));
