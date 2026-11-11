/* =====================================================================
   SİMÜLATÖR ŞABLONU / SIMULATOR TEMPLATE
   Template 2026-11 · test engine 2026-11d · guide: claude/simulator_template.md
   ---------------------------------------------------------------------
   HOW TO MAKE A NEW SIMULATOR
   1. Copy this file. Name it "<Konu> Simülatörü.html" (one file per lecture).
   2. CONFIG (below): COURSE, PFX, SURUM, SHEET_URL, ORDER.
   3. UI (below): change title, eyebrow, lead, path, seeP, seeNote, sample*,
      ph. Every text is a pair {tr:"…", en:"…"}. Keep all other UI texts.
   4. MODULES: delete the example modules M.ornek1–M.ornek4 and write one
      module per part of the lecture (format below). Put their keys in ORDER.
   5. QUIZ: replace the 6 example questions (format under TEST below). Keep the
      default points unless the lecture needs other weights: mcq 5 · tf 10
      (5 statements) · order 15 · match 15 · fill 15 (5 blanks) · open 40
      (scored by the lecturer) = 100; automatic part 60.
      Give every item a topic (mod = module key) for the topic feedback.
   6. Facts: check every value in Guyton 15th and Ganong 27th (rule 2.9) and
      give the pages in each module note. Physiology only (rule 2.10).
   7. Test with SHEET_URL "" first: open every tab, take the pre- and the
      post-test, switch TR/EN. Then set SHEET_URL and send one test row.
   Reset the tests in a browser: open the page with #test-sifirla.
   ---------------------------------------------------------------------
   MODULE FORMAT                                     (* = optional)
   M.key={
     tab, eyebrow, title, sub, card   {tr,en}: tab name, small line above the
                                      title, title, subtitle, start-page card
     init:()=>({…})                   starting state S (numbers)
     controls:[…]                     see CONTROLS
     step(s,dt,c){…}                  the model: update s for dt seconds;
                                      c = control values. ap(x,target,tau,dt)
                                      moves x toward target (time constant tau)
     rows:(s,c)=>[[node,…],[node,…]]  pathway boxes, one array per row;
                                      node={l,s,v,c,fmt*,small*}: label, sub-
                                      label, bar 0–1, color token, value text
     fb:(s,c)=>({kind,on,strength,text}) | null   feedback light;
                                      kind "neg" (blue) or "pos" (red)
     series:[{k,n,c,min,max,primary*,axis*,fmt*,band*,bandLabel*,refs*}]
                                      chart lines: k = key in s; [] = no chart
     chart*:{win:15}                  time window in seconds (default 60)
     chart*:{day:true,night:[[0,6],[20,24]]} + dayVals(h,c)=>({k:v,…})
                                      24-hour axis; s.h = hour (0–24)
     now:(s,c)=>[html,…]              "What is happening?" lines; tg() = tag
     visual*:(s,c)=>html              blocks B.* (see BLOCKS)
     draw*:{h:260,fn(g,W,H,s,c){…}}   large drawing area (canvas 2D, g)
     daily {tr,en} · tasks {tr:[…],en:[…]} · note:()=>html + SRC(tr,en)
   }
   CONTROLS
     {type:"range",id,label,min,max,step,value,ends:[a,b],show*:v=>"…",help}
     {type:"toggle",id,label,value:false,help}
     {type:"button",id,label,act:(s,c)=>{…},help}
     {type:"preset",id,label,value:0,options:[{label,set:{id:value,…}}],help}
     BOOK_CTL  ready toggle: off = Guyton, on = Ganong; read with bk(c,g,n)
   BLOCKS (return HTML; join several in visual)
     B.gauge(v,{min,max,zones,label,fmt,sub})  half-circle gauge
     B.bars(title,[[label,value,max,color*,text*],…])  bar list
     B.stack(title,[[label,value,color],…])    shares of a whole
     B.counter(n,label,sub)  B.clock(h,sub)  B.progress(f,label)
     B.eq(formula,numbers,note)                equation panel
   TEST (QUIZ, and QUIZ_MID for the mid-lecture check)       (* = optional)
     common: {type, pts, mod, q:{tr,en}, why:{tr,en}, tag*}  mod = topic
     mcq    o:{tr:[5 options],en:[…]}, a: index of the right option
     tf     o: 5 statements, a:[true,false,…], fix: corrections, mods*:[topic per statement]
     order  o: 4–6 rows in mixed order, a: row indexes in the right order
            (scored by consecutive pairs: each right pair = pts/(rows−1))
     match  left: 4–6 items, o: options (2–3 left over), a: option index per item, mods*
     fill   segs:{tr:[text,text,…]} around the blanks (one piece more than the blanks), 5 blanks,
            blanks:[{o:{tr:[options],en:[…]},a:index},…], mods*
     open   rubric: 4 steps, ph*: placeholder. Scored by the lecturer in the Sheet:
            per step full / partial / none = pts/steps · 0.4×that · 0
            (e.g. 40 points, 4 steps: 10 / 4 / 0). Students tick the steps as a
            self-check after the post-test; it is not added to their score.
   SWITCHES (below): TESTS.pre/mid/post/late, LATE_DAYS, CONFIDENCE (M3),
     FEEDBACK (M4, 1–5 form after the post-test), MINUTE (M5, one-minute paper), PROGRAMS.
   MINI-QUIZ (TESTS.mid): QUIZ_MID, Kahoot style, format at QUIZ_MID in the TEST part.
   QR LINKS: <simulator link>#pre, #mid, #post open that test directly (one QR per slide).
   LEADERBOARD: <simulator link>#board on the projector (lecturer only; needs SHEET_URL and Apps Script 2026-11e).
   ===================================================================== */

/* ---------------- AYARLAR / CONFIG ---------------- */
const COURSE="template";   // Sheet tab name (English, lower case), e.g. "respiration"
const PFX="tpl";           // browser storage prefix, 2–5 letters, unique per simulator
const SURUM="2026-11d";    // version sent with each result; change it when the test changes
const SHEET_URL="";        // Apps Script web app URL (…/exec); "" = results are not sent
const ORDER=["ornek1","ornek2","ornek3","ornek4"];   // module keys, in tab order
/* assessment switches (true = on) */
const TESTS={pre:true, mid:true, post:true, late:true};  // mid = M6 mini-quiz (Kahoot style, QUIZ_MID: 4–5 items; give it after about 15–20 minutes or at a topic break; set false to switch it off); late = M1 delayed test
const LATE_DAYS=14;        // the delayed test opens this many days after the student's post-test
const CONFIDENCE=true;     // M3: "Are you sure?" under each automatic item (recorded, not scored)
const FEEDBACK=true;       // M4: four 1–5 statements after the post-test
const MINUTE=true;         // M5: one-minute paper after the post-test
/* programs (faculty / language) asked once per browser and sent as the "Program" column; [] = do not ask.
   PLACEHOLDER list: replace it with the user's list. */
const PROGRAMS=[{k:"tip-tr",tr:"Tıp (Türkçe)",en:"Medicine (Turkish)"},{k:"tip-en",tr:"Tıp (İngilizce)",en:"Medicine (English)"},{k:"diger",tr:"Diğer",en:"Other"}];
const BOARD_TOP=5;           // leaderboard (#board on the projector): number of places shown; equal points share a place
const MINW=10, KST=PFX+"-t4";

const $=s=>document.querySelector(s);
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ap=(x,t,tau,dt)=>x+(t-x)*Math.min(1,dt/tau);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const store={get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
let LANG=(()=>{let l=null;try{l=new URLSearchParams(location.search).get("lang");}catch(e){} if(l!=="en"&&l!=="tr") l=store.get(PFX+"-lang"); return l==="en"?"en":"tr";})();
const L=(tr,en)=>LANG==="en"?en:tr;
const t=x=>x==null?"":(typeof x!=="object"||Array.isArray(x))?x:(x[LANG]!==undefined?x[LANG]:x.tr);
const pct=v=>{const n=Math.round(v*100); return LANG==="en"?n+"%":"%"+n;};
const dec=(v,d=1)=>{const s=v.toFixed(d); return LANG==="en"?s:s.replace(".",",");};

/* ---------------- ARAYÜZ METİNLERİ / UI TEXT ---------------- */
const UI={
  /* --- change these for each simulator --- */
  title:{tr:"Simülatör Şablonu",en:"Simulator Template"},
  eyebrow:{tr:"[Ders adı] · Tıp Fakültesi 1–2. sınıf",en:"[Lecture name] · Medicine, years 1–2"},
  lead:{tr:"[Bir cümle: öğrenci ne yapacak?] Değerlerin nasıl değiştiğini canlı izleyin.",en:"[One sentence: what will the student do?] Watch the values change live."},
  path:{tr:"Yol",en:"Pathway"},
  howP:{tr:"Her modül konunun bir bölümünü canlandırır. Değerler gerçek zamanlı hesaplanır; yaptığınız her değişikliğin sonucunu birkaç saniye içinde görürsünüz.",en:"Each module animates one part of the topic. Values are calculated in real time, so you see the result of every change within a few seconds."},
  seeP:{tr:"Her basamak bir kutuda gösterilir. Çubuk, düzeyi gösterir.",en:"Each step is shown in a box. The bar shows the level."},
  seeNote:{tr:"[Birimleri açıklayın: hangi değerler yüzde, hangileri gerçek birimle (mm Hg, L/dk…) gösteriliyor?]",en:"[Explain the units: which values are percentages and which are in real units (mm Hg, L/min…)?]"},
  sampleL:{tr:"Etkileyici",en:"Effector"}, sampleS:{tr:"Düzeltici yanıt",en:"Corrective response"}, sampleV:{tr:"%80",en:"80%"},
  ph:{tr:"Örneğin: Bozucu etki → … → …",en:"For example: disturbance → … → …"},
  /* --- usually unchanged --- */
  tabStart:{tr:"Başla",en:"Start"}, tabTest:{tr:"Ön / son test",en:"Pre / post test"},
  howTitle:{tr:"Nasıl kullanılır?",en:"How to use it"},
  st1:{tr:"<b>Önce ön testi çözün.</b> 5 soru, 5 farklı soru türü. Not için değil, neyi bildiğinizi görmek için.",en:"<b>Take the pre-test first.</b> 5 questions, 5 question types. It is not graded; it shows what you already know."},
  st2:{tr:"<b>Bir modül seçin.</b> Düğmelere basın, kaydırıcıları oynatın.",en:"<b>Choose a module.</b> Press the buttons and move the sliders."},
  st3:{tr:"<b>“Ne oluyor?” kutusunu okuyun.</b> Ekranda olanı adım adım açıklar.",en:"<b>Read the “What is happening?” box.</b> It explains the screen step by step."},
  st4:{tr:"<b>Ders notunu okuyun ve görevleri yapın,</b> sonra son testi çözüp puanınızı karşılaştırın.",en:"<b>Read the lecture note and do the tasks,</b> then take the post-test and compare your scores."},
  goPre:{tr:"Ön teste başla",en:"Start the pre-test"}, goFirst:{tr:"İlk modüle geç",en:"Go to the first module"},
  seeTitle:{tr:"Ekranda ne göreceksiniz?",en:"What you will see"},
  srcTitle:{tr:"Kaynaklar",en:"Sources"},
  srcP:{tr:"Değerler iki ders kitabından alınmıştır. Kitaplar farklı değer verdiğinde simülatör ikisini de gösterir.",en:"Values are taken from two textbooks. Where the books differ, the simulator shows both."},
  pause:{tr:"Duraklat",en:"Pause"}, resume:{tr:"Devam et",en:"Resume"}, reset:{tr:"Baştan başlat",en:"Restart"},
  now:{tr:"Ne oluyor?",en:"What is happening?"}, tasks:{tr:"Bunu deneyin",en:"Try this"}, note:{tr:"Ders notu",en:"Lecture note"},
  daily:{tr:"Günlük hayatta:",en:"In daily life:"},
  chartAria:{tr:"Zamana göre değerler grafiği",en:"Chart of values over time"}, drawAria:{tr:"Canlı çizim",en:"Live drawing"},
  nowLbl:{tr:"şimdi",en:"now"}, sec:{tr:"sn",en:"s"}, normal:{tr:"normal",en:"normal"}, night:{tr:"gece",en:"night"},
  testEyebrow:{tr:"Kendinizi sınayın",en:"Test yourself"}, testTitle:{tr:"Ön test ve son test",en:"Pre-test and post-test"},
  /* testP is built by the test engine from the switches */
  pre:{tr:"Ön test",en:"Pre-test"}, post:{tr:"Son test",en:"Post-test"},
  footer:{tr:"Bu simülasyon, fizyolojiyi anlamak için basitleştirilmiş bir eğitim modelidir; sayılar gerçek bir kişinin değerleri değildir.",en:"This simulation is a simplified teaching model for understanding physiology; the numbers are not the values of a real person."},
  langAria:{tr:"Dil",en:"Language"}, speedAria:{tr:"Simülasyon hızı",en:"Simulation speed"}, testAria:{tr:"Test türü",en:"Test type"}, tabsAria:{tr:"Modüller",en:"Modules"}
};

/* ---------------- YARDIMCILAR / HELPERS ---------------- */
const tg=(tr,en)=>`<span class='tag'>${L(tr,en)}</span>`;
const SRC=(tr,en)=>`<p class="src">${L(tr,en)}</p>`;
const BOOK_CTL={type:"toggle",id:"book",label:{tr:"Ganong değerlerini kullan",en:"Use Ganong values"},value:false,help:{tr:"Kapalı: Guyton ve Hall (15. baskı). Açık: Ganong (27. baskı). İki kitabın değerleri farklıdır.",en:"Off: Guyton and Hall (15th ed.). On: Ganong (27th ed.). The two books give different values."}};
const bk=(c,g,n)=>c.book?n:g, bkName=c=>c.book?"Ganong":"Guyton";

/* ---------------- BLOKLAR / BLOCKS ---------------- */
const B={
  gauge(v,o={}){
    const mn=o.min??0, mx=o.max??1, f=cl((v-mn)/(mx-mn),0,1), R=70, cx=90, cy=84;
    const pt=a=>[(cx+R*Math.cos(a)).toFixed(1),(cy-R*Math.sin(a)).toFixed(1)];
    const arc=(f0,f1,col)=>{const [x0,y0]=pt(Math.PI*(1-f0)),[x1,y1]=pt(Math.PI*(1-f1)); return `<path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" stroke="var(${col})" stroke-width="14" fill="none"/>`;};
    let a0=0, z=""; (o.zones||[[mx,"--line"]]).forEach(([to,col])=>{const a1=cl((to-mn)/(mx-mn),0,1); if(a1>a0) z+=arc(a0,a1,col); a0=a1;});
    const [nx,ny]=(()=>{const a=Math.PI*(1-f); return [(cx+(R-20)*Math.cos(a)).toFixed(1),(cy-(R-20)*Math.sin(a)).toFixed(1)];})();
    const val=o.fmt?o.fmt(v):pct(v), lab=t(o.label);
    return `<div class="gauge" role="img" aria-label="${lab}: ${val}"><b>${lab}</b><svg viewBox="0 0 180 96" aria-hidden="true">${z}<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="var(--ink)"/></svg><div class="gv">${val}</div>${o.sub?`<small>${t(o.sub)}</small>`:""}</div>`;
  },
  bars(title,items){
    return `<div class="bars"><b>${t(title)}</b>${items.map(([l,v,mx,c,txt])=>`<div class="bar"><span>${t(l)}</span><i style="width:${cl(v/mx,0,1)*100}%;background:var(${c||"--h5"})"></i><em>${txt??dec(v)}</em></div>`).join("")}</div>`;
  },
  stack(title,items){
    const tot=items.reduce((a,x)=>a+x[1],0)||1;
    return `<div style="display:grid;gap:6px"><b>${t(title)}</b><div class="stack">${items.map(([l,v,c])=>`<i style="width:${100*v/tot}%;background:var(${c})" title="${t(l)}"></i>`).join("")}</div><div class="legendkey">${items.map(([l,v,c])=>`<span><i class="sw" style="background:var(${c})"></i>${t(l)} ${pct(v/tot)}</span>`).join("")}</div></div>`;
  },
  counter(n,label,sub){ return `<div class="visual"><div class="clock">${n}</div><div><b>${t(label)}</b>${sub?`<br><small style="color:var(--muted)">${t(sub)}</small>`:""}</div></div>`; },
  clock(h,sub){ const hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return `<div class="visual"><div class="clock">${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}</div>${sub?`<small style="color:var(--muted)">${t(sub)}</small>`:""}</div>`; },
  progress(f,label){ const p=Math.round(cl(f,0,1)*100); return `<div style="display:grid;gap:6px"><b>${t(label)}: ${pct(p/100)}</b><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i style="width:${p}%"></i></div></div>`; },
  eq(formula,numbers,note){ return `<div class="eqbox"><div class="eqf">${formula}</div>${numbers?`<div class="eqn">${numbers}</div>`:""}${note?`<small>${t(note)}</small>`:""}</div>`; }
};
const blocks=(...h)=>`<div class="blocks">${h.filter(Boolean).join("")}</div>`;
