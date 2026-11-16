// Delayed-test reminder on the page (engine 2026-11k; Q28-C): calendar file, Google Calendar link, optional e-mail.
// The e-mail message carries no code and no scores; the browser keeps only the date. Usage: node laterem.js <base url> (serves midon.html, plain.html, lateoff.html)
const {chromium}=require('playwright'); const base=process.argv[2];
const out=[]; const ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
const A={mcq:1,tf:'dydyd',o2:[2,4,0,3,1],match:[2,4,0,1,3],fill:[0,1,2,0,0],o5:[1,4,3,0,6,5,2]};
const errs=[], posts=[];
async function page(b,file,w){ const c=await b.newContext({viewport:{width:w||390,height:844}});
  await c.route(/example\.invalid/,r=>{ posts.push(JSON.parse(r.request().postData()||'{}')); r.fulfill({status:200,body:'{"ok":true}'}); }); await c.route(/fonts\./,r=>r.abort());
  const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept()); await p.goto(base+'/'+file+'#post'); await p.waitForTimeout(300); await p.selectOption('#prog','tip-tr'); return p; }
async function post(p){ const m='post';
  await p.check(`#r-${m}-0-${A.mcq}`); for(let j=0;j<5;j++) await p.check(`#tf-${m}-1-${j}-${A.tf[j]}`);
  for(const k of A.o2) await p.click(`#ord2 [data-tap="${k}"]`);
  for(let j=0;j<5;j++) await p.selectOption(`#sel-${m}-3-${j}`,{value:String(A.match[j])});
  for(let j=0;j<5;j++) await p.selectOption(`#fl-${m}-4-${j}`,{value:String(A.fill[j])});
  for(const k of A.o5) await p.click(`#ord5 [data-tap="${k}"]`);
  await p.click('#qsubmit'); if(await p.isVisible('#qforce')) await p.click('#qforce'); await p.waitForTimeout(300); }
const ymd=ms=>{ const d=new Date(ms); return d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2); };
(async()=>{ const b=await chromium.launch();
  // A. live Sheet: post-test screen
  const p=await page(b,'midon.html');
  ok(!(await p.isVisible('#qlate')),'no reminder box before the post-test');
  await post(p);
  ok(await p.isVisible('#qlate')&&/Gecikmeli test hatırlatıcısı/.test(await p.textContent('#qlate')),'post-test screen shows the reminder box');
  const t=await p.evaluate(()=>JSON.parse(localStorage.getItem('tpl-t4')).post.t), d=ymd(t+14*864e5), e=ymd(t+15*864e5);
  ok(/tarihinde açılır/.test(await p.textContent('#qlate')),'box gives the opening date');
  const ics=decodeURIComponent((await p.getAttribute('#calics','href')).replace(/^data:text\/calendar;charset=utf-8,/,''));
  ok(ics.startsWith('BEGIN:VCALENDAR\r\n')&&ics.includes('DTSTART;VALUE=DATE:'+d)&&ics.includes('DTEND;VALUE=DATE:'+e),'calendar file: all-day event on the delayed-test date ('+d+')');
  ok(ics.includes('BEGIN:VALARM')&&ics.includes('TRIGGER:PT9H')&&/URL:http.*midon\.html#late/.test(ics),'calendar file: alarm at 09:00, link to #late');
  ok(!/PHY-|\/100/.test(ics)&&(await p.getAttribute('#calics','download'))==='gecikmeli-test.ics','calendar file: no code, no score; file name gecikmeli-test.ics');
  const g=await p.getAttribute('#calg','href');
  ok(g.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE')&&g.includes('dates='+d+'/'+e)&&decodeURIComponent(g).includes('#late')&&!/PHY-/.test(g),'Google Calendar link: date, #late link, no code');
  const n0=posts.length;
  await p.fill('#remmail','ayse@ogr'); await p.click('#remsend');
  ok(/Geçerli bir e-posta/.test(await p.textContent('#remmsg'))&&posts.length===n0,'bad e-mail: message, nothing sent');
  await p.fill('#remmail','=x@a.co'); await p.click('#remsend');
  ok(/Geçerli bir e-posta/.test(await p.textContent('#remmsg'))&&posts.length===n0,'e-mail starting with = refused');
  await p.fill('#remmail','ayse@ogr.istanbul.edu.tr'); await p.click('#remsend');
  ok(/onay kutusunu/.test(await p.textContent('#remmsg'))&&posts.length===n0,'no consent tick: message, nothing sent');
  await p.check('#remok'); await p.click('#remsend'); await p.waitForTimeout(300);
  const rp=posts.slice(n0);
  ok(rp.length===1&&JSON.stringify(Object.keys(rp[0]))===JSON.stringify(['schema','course','email','days','lang']),'one message with only schema, course, email, days, lang');
  ok(rp[0].schema==='rem'&&rp[0].course==='template'&&rp[0].email==='ayse@ogr.istanbul.edu.tr'&&rp[0].days===14&&rp[0].lang==='tr'&&!JSON.stringify(rp[0]).includes('PHY-'),'message values; no code');
  ok(/Kaydedildi/.test(await p.textContent('#qlate'))&&!(await p.isVisible('#remmail')),'saved line shown, form gone');
  const ls=await p.evaluate(()=>Object.keys(localStorage).map(k=>k+'='+localStorage.getItem(k)).join('\n'));
  ok(!ls.includes('ayse@')&&/tpl-remreq=\{"d":"\d{8}"\}/.test(ls),'browser keeps only the date, never the address');
  await p.goto(base+'/midon.html#now'); await p.reload(); await p.waitForTimeout(300);
  ok(/E-posta hatırlatması istendi/.test(await p.textContent('.nowpage #qlate'))&&await p.isVisible('.nowpage #calics'),'Now page: box with calendar buttons and "requested" line');
  ok(await p.waitForFunction(()=>{ const r=document.querySelector('.nowpage').getBoundingClientRect(); return r.top>=-2&&r.top<120; },null,{timeout:2000}).then(()=>true,()=>false),'Q26: #now scrolls the Now card to the top of the phone screen');
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'390 px: no sideways scroll');
  await p.click('#lang button[data-l="en"]'); await p.waitForTimeout(200);
  ok(/Delayed-test reminder/.test(await p.textContent('.nowpage #qlate'))&&/E-mail reminder requested/.test(await p.textContent('.nowpage #qlate')),'English text');
  // B. delayed test open (15 days later) or done: no box
  await p.evaluate(()=>{ const s=JSON.parse(localStorage.getItem('tpl-t4')); s.post.t-=15*864e5; localStorage.setItem('tpl-t4',JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(300);
  ok(!(await p.isVisible('#qlate')),'delayed test open: no reminder box');
  // C. test mode (SHEET_URL ""): calendar works, e-mail button disabled
  const q=await page(b,'plain.html'); await post(q);
  ok(await q.isVisible('#calics')&&await q.isDisabled('#remsend')&&/Test modu/i.test(await q.textContent('#qlate')),'test mode: calendar shown, e-mail disabled with "Test modu"');
  // D. no delayed test (late:false): no box
  const r=await page(b,'lateoff.html'); await post(r);
  ok(!(await r.isVisible('#qlate')),'late:false: no reminder box');
  ok(!errs.length,'no page errors '+errs.join(' | '));
  await b.close(); console.log(out.join('\n'));
})().catch(e=>{ console.log(out.join('\n')+'\nCRASH '+e.message); process.exit(0); });
