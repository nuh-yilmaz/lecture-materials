/* ---------------- TEST ENGINE 2026-11f ----------------
   Any number of items, any order. Item types: mcq, tf, order, match, fill, open.
   Default test: 6 automatic items, 84 points (see QUIZ). Points rule: all item points + 2 per automatic item + 4 = 100.
   Automatic items are scored here; open items (special cases) are scored by the lecturer (Sheet columns).
   Pre-test: total + topic feedback only. Mid, post, delayed: key, item scores, topics.
   One row per test is sent to the Sheet (schema 2: values go under their column names). */
const tx=v=>(v&&typeof v==="object"&&!Array.isArray(v)&&("tr" in v))?v[LANG]:v;
const QT={
  choose:{tr:"Seçin…",en:"Choose…"},
  T:{tr:"D",en:"T"}, F:{tr:"Y",en:"F"}, pts:{tr:"puan",en:"points"},
  type_mcq:{tr:"Çoktan seçmeli",en:"Multiple choice"}, type_tf:{tr:"Doğru / yanlış",en:"True / false"}, type_order:{tr:"Sıralama",en:"Ordering"},
  type_match:{tr:"Eşleştirme",en:"Matching"}, type_fill:{tr:"Boşluk doldurma",en:"Fill in the blanks"}, type_open:{tr:"Açık uçlu",en:"Open-ended"},
  lecturerTag:{tr:"eğitimci puanlar",en:"scored by the lecturer"},
  check:{tr:"Cevapları kontrol et",en:"Check answers"}, clear:{tr:"Temizle",en:"Clear"},
  right:{tr:"Doğru.",en:"Correct."}, rightAns:{tr:"Doğru cevap:",en:"Correct answer:"}, rightOrder:{tr:"Doğru sıra:",en:"Correct order:"}, rightMatch:{tr:"Doğru eşleşme:",en:"Correct matches:"}, rightFill:{tr:"Doğru cevaplar:",en:"Correct answers:"},
  pairNote:{tr:"Doğru sıradaki her ardışık çift puan alır.",en:"Each consecutive pair in the correct order earns points."},
  tryIt:{tr:"Simülasyonda deneyin →",en:"Try it in the simulation →"},
  rubricT:{tr:"Kendi kontrolünüz: yazdığınız basamakları işaretleyin (puana eklenmez; bu soruyu eğitimci puanlar)",en:"Self-check: tick the steps you wrote (not added to your score; the lecturer scores this question)"},
  selfPts:{tr:"Kendi değerlendirmeniz: {x}/{m} (puana eklenmez)",en:"Your self-check: {x}/{m} (not added to your score)"},
  openSaved:{tr:"Cevabınız kaydedildi. Bu soruyu eğitimci puanlayacak.",en:"Your answer has been saved. The lecturer will score this question."},
  answer:{tr:"Cevabınız",en:"Your answer"},
  autoNote:{tr:"otomatik puan; açık uçlu soruyu eğitimci puanlar",en:"automatic score; the lecturer scores the open-ended question"},
  sure:{tr:"Bu cevaptan emin misiniz?",en:"Are you sure of this answer?"}, sureY:{tr:"Eminim",en:"Sure"}, sureN:{tr:"Emin değilim",en:"Not sure"},
  scoreBox:{tr:"Puanlama: «Eminim» işaretli soru doğruysa +2, yanlışsa −4 puan; «Emin değilim» 0 puan. Kısmen doğru sorularda puan orantılıdır. 4 puan bizden hediye.",en:"Scoring: a 'sure' item earns +2 if right and costs 4 if wrong; 'not sure' gives 0. Partly right items count in proportion. 4 points are a gift from us."},
  scoreBoxGift:{tr:"Puanlama: 4 puan bizden hediye.",en:"Scoring: 4 points are a gift from us."},
  totT:{tr:"Toplam",en:"Total"}, totItems:{tr:"sorular",en:"items"}, totConf:{tr:"güven",en:"confidence"}, totGift:{tr:"hediye",en:"gift"},
  sureWrong:{tr:"Emin olduğunuz hâlde yanlış: {list}. Bu soruların konularını tekrar edin.",en:"Sure but wrong: {list}. Review the topics of these questions."},
  topicsT:{tr:"Konulara göre sonucunuz",en:"Your result by topic"}, topicHint:{tr:"✓ iyi (en az %75) · ~ kısmen (%50–74) · ✗ tekrar edin (%50'nin altında)",en:"✓ good (75% or more) · ~ partly (50–74%) · ✗ review (below 50%)"},
  send:{tr:"Sonucumu eğitimciye gönder",en:"Send my result to the lecturer"},
  sent:{tr:"Gönderildi. Teşekkürler! Kodunuz: {a}",en:"Sent. Thank you! Your code: {a}"}, sending:{tr:"Gönderiliyor…",en:"Sending…"},
  sentBefore:{tr:"Bu test için sonucunuz gönderildi.",en:"Your result for this test has been sent."},
  sendFail:{tr:"Gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.",en:"Could not send. Check your internet connection and try again."},
  sendHint:{tr:"Gönderdikten sonra değiştirilemez.",en:"You cannot change it after sending."},
  sendHintOpen:{tr:"Önce açık uçlu sorudaki kendi kontrolünüzü yapın.",en:"First complete the self-check of the open-ended question."},
  sendHintForm:{tr:"Önce yukarıdaki kısa formu doldurun, sonra gönderin.",en:"First complete the short form above, then send."},
  myCode:{tr:"Kodunuz",en:"Your code"},
  testMode:{tr:"Test modu: SHEET_URL boş, sonuçlar gönderilmez.",en:"Test mode: SHEET_URL is empty, so results are not sent."},
  codeHelp:{tr:"Bu kod size rastgele verildi; adınız kaydedilmez. Kodunuzu not edin. Testlerin hepsini aynı cihazda çözün; böylece sonuçlarınız eşleşir.",en:"This code was given to you at random; your name is not stored. Write your code down. Take all the tests on the same device so that your results match."},
  otherDev:{tr:"İlk testi başka bir cihazda mı çözdünüz?",en:"Did you take the first test on another device?"},
  enterCode:{tr:"O cihazdaki kodunuzu yazın",en:"Type the code from that device"},
  codeSet:{tr:"Kod değiştirildi.",en:"Code changed."},
  codeBad:{tr:"Kod PHY- ile başlar ve 4 karakter içerir (ör. PHY-7KQ2).",en:"The code starts with PHY- and has 4 characters (e.g., PHY-7KQ2)."},
  prog:{tr:"Programınız",en:"Your program"}, progNeed:{tr:"Önce yukarıdan programınızı seçin.",en:"First choose your program above."},
  oneTry:{tr:"Her test bir kez çözülür. Kontrolden sonra cevaplar değiştirilemez.",en:"Each test can be taken once. Answers cannot be changed after checking."},
  lockPre:{tr:"Doğru cevaplar son testten sonra açılacak.",en:"The correct answers will open after the post-test."},
  preClosed:{tr:"Son testi çözdüğünüz için ön test kapandı.",en:"The pre-test is closed because you have already taken the post-test."},
  midClosed:{tr:"Son testi çözdüğünüz için mini quiz kapandı.",en:"The mini-quiz is closed because you have already taken the post-test."},
  kT:{tr:"Mini quiz",en:"Mini-quiz"},
  kIntro:{tr:"{n} kısa soru. Her sorunun süresi var (10–30 saniye). Doğru ve hızlı cevap daha çok puan alır; grubun zorlandığı sorular daha çok puan verir. Süre telefonunuzda ölçülür; internet hızı puanınızı etkilemez. Puanlar herkes bitirince tahtada hesaplanır. Mini quiz bir kez çözülür.",en:"{n} short questions. Each question has a time limit (10–30 seconds). Right and fast answers earn more points; questions the group finds hard give more points. Time is measured on your phone, so your internet speed does not change your score. Points are calculated on the board when everyone has finished. The mini-quiz can be taken once."},
  kStart:{tr:"Başla",en:"Start"}, kNext:{tr:"Sonraki soru",en:"Next question"}, kSee:{tr:"Sonucumu gör",en:"See my result"}, kSubmit:{tr:"Cevapla",en:"Answer"},
  kQ:{tr:"Soru {i}/{n}",en:"Question {i}/{n}"}, kSoFar:{tr:"{r}/{n} doğru",en:"{r}/{n} right"},
  kRight:{tr:"Doğru! ({s} sn)",en:"Correct! ({s} s)"}, kWrong:{tr:"Yanlış.",en:"Wrong."}, kTimeout:{tr:"Süre doldu.",en:"Time is up."},
  kSum:{tr:"{r}/{n} doğru",en:"{r}/{n} right"}, kPtsBoard:{tr:"Puanlar herkes bitirince tahtada hesaplanır: doğru ve hızlı cevaplar, grubun zorlandığı sorularda daha çok puan alır.",en:"Points are calculated on the board when everyone has finished: right and fast answers earn more on questions the group found hard."},
  kBoard:{tr:"Tahtaya bakın! Kodunuz:",en:"Look at the board! Your code:"},
  kResend:{tr:"Tekrar gönder",en:"Send again"}, kTrue:{tr:"Doğru",en:"True"}, kFalse:{tr:"Yanlış",en:"False"},
  noPre:{tr:"Ön testi çözmediniz. Son testi yine de çözebilirsiniz; karşılaştırma yapılamaz.",en:"You did not take the pre-test. You can still take the post-test, but no comparison is possible."},
  toPost:{tr:"Ön testi tamamladınız ({x}). Son testi dersin son 10 dakikasında çözün.",en:"You have completed the pre-test ({x}). Take the post-test in the last 10 minutes of the lecture."},
  goPost:{tr:"Son teste geç",en:"Go to the post-test"}, goLate:{tr:"Gecikmeli teste geç",en:"Go to the delayed test"},
  postDone:{tr:"Son test tamamlandı ({y}).",en:"Post-test completed ({y})."},
  lateWhen:{tr:"Gecikmeli test {d} tarihinde açılacak. Aynı sorular, ne kadarını hatırladığınızı gösterir.",en:"The delayed test will open on {d}. The same questions show how much you remember."},
  lateNoPost:{tr:"Gecikmeli test, son testten {n} gün sonra açılır.",en:"The delayed test opens {n} days after the post-test."},
  lateOpen:{tr:"Gecikmeli test açıldı.",en:"The delayed test is open."},
  lateDone:{tr:"Gecikmeli test tamamlandı ({z}).",en:"Delayed test completed ({z})."},
  wcount:{tr:"Kelime sayısı: {n} (puanlama için en az 10)",en:"Word count: {n} (at least 10 for scoring)"},
  noneAns:{tr:"Hiç cevap yok. Önce soruları cevaplayın.",en:"No answers yet. Answer the questions first."},
  blankWarn:{tr:"Boş ya da eksik soru var: {list}. Yine de kontrol edilsin mi? Kontrolden sonra cevaplar değiştirilemez.",en:"Unanswered or incomplete: {list}. Check anyway? Answers cannot be changed after checking."},
  bOrder:{tr:"{n} (numarasız adım: {u})",en:"{n} (steps without a number: {u})"},
  ordHint:{tr:"Adımlara doğru sırayla dokunun. Numarayı silmek için numaralı adıma yeniden dokunun. Numarasız adımlar sona eklenir.",en:"Tap the steps in the correct order. To remove a number, tap the numbered step again. Steps without a number go to the end."},
  ordClear:{tr:"Sırayı temizle",en:"Clear order"}, ordNone:{tr:"numara yok",en:"no number"},
  bShort:{tr:"{n} (10 kelimeden kısa: eğitimci 0 puan verir)",en:"{n} (under 10 words: the lecturer gives 0 points)"},
  force:{tr:"Yine de kontrol et",en:"Check anyway"}, back:{tr:"Geri dön",en:"Go back"},
  fbT:{tr:"Kısa değerlendirme (isteğe bağlı)",en:"Short feedback (optional)"},
  fbScale:{tr:"1 = Kesinlikle katılmıyorum · 5 = Kesinlikle katılıyorum",en:"1 = Strongly disagree · 5 = Strongly agree"},
  resetQ:{tr:"Bu tarayıcıdaki test kayıtları silinsin mi? (Ortak bilgisayar için)",en:"Delete the test records in this browser? (For a shared computer)"},
  testP_base:{tr:"Ön testi dersten önce, son testi dersin son 10 dakikasında çözün. Her test bir kez çözülür. Ön testte toplam puanınızı ve konu başına sonucunuzu görürsünüz; doğru cevaplar son testten sonra açılır.",en:"Take the pre-test before the lecture and the post-test in the last 10 minutes of the lecture. Each test can be taken once. In the pre-test you see your total and your result by topic; the correct answers open after the post-test."},
  testP_open:{tr:" Açık uçlu soruyu eğitimci puanlar.",en:" The lecturer scores the open-ended question."},
  testP_mid:{tr:" Dersin ortasında süreli bir mini quiz vardır.",en:" There is a timed mini-quiz in the middle of the lecture."},
  testP_late:{tr:" Son testten {n} gün sonra aynı sorularla gecikmeli test açılır.",en:" A delayed test with the same questions opens {n} days after the post-test."}
};
const FB=[ // M4 feedback form (handbook p. 114 style); M5 one-minute paper
  {k:"helped",tr:"Simülasyon konuyu anlamama yardım etti.",en:"The simulation helped me understand the topic."},
  {k:"clear",tr:"Ekrandaki açıklamalar açık ve anlaşılırdı.",en:"The explanations on the screen were clear."},
  {k:"easy",tr:"Simülasyonu kullanmak kolaydı.",en:"The simulation was easy to use."},
  {k:"matched",tr:"Test soruları derste öğrendiklerimle uyumluydu.",en:"The test questions matched what I learned in the lecture."}];
const MP=[{k:"learned",tr:"Bugün öğrendiğim en önemli şey:",en:"The most important thing I learned today:"},
          {k:"unclear",tr:"Hâlâ tam anlamadığım şey:",en:"What is still unclear to me:"}];
const qt=(k,o)=>{let s=(QT[k][LANG]||QT[k].tr); if(o) for(const p in o) s=s.split("{"+p+"}").join(o[p]); return s;};
const LU="ABCDEFGH", ll="abcdefgh", r2=v=>Math.round(v*100)/100, nf=v=>dec(r2(v),Number.isInteger(r2(v))?0:(Number.isInteger(r2(v)*10)?1:2));
const MODES=["pre","mid","post","late"].filter(m=>TESTS[m]);
const setOf=m=>m==="mid"?QUIZ_MID:QUIZ;
const isAuto=q=>q.type!=="open";
const HAS_OPEN=QUIZ.some(q=>!isAuto(q));
const maxOf=set=>r2(set.filter(isAuto).reduce((a,q)=>a+q.pts,0));
const nOf=q=>q.type==="mcq"?1:q.type==="match"?tx(q.left).length:q.type==="fill"?q.blanks.length:tx(q.o).length;
let ST=store.get(KST); if(!ST||typeof ST!=="object") ST={}; ["pre","mid","post","late"].forEach(m=>{if(!(m in ST)) ST[m]=null;});
const saveST=()=>store.set(KST,ST);
let qmode=MODES[0], seq={}, warned=false, devMem=null;   // seq[i] = rows of order item i in the order they were tapped
const ordAns=(q,i)=>{ const s=seq[i]||[]; return s.concat(tx(q.o).map((_,k)=>k).filter(k=>!s.includes(k))); };   // steps without a number go to the end
UI.testP={tr:QT.testP_base.tr+(HAS_OPEN?QT.testP_open.tr:"")+(TESTS.mid?QT.testP_mid.tr:"")+(TESTS.late?QT.testP_late.tr.replace("{n}",LATE_DAYS):""),en:QT.testP_base.en+(HAS_OPEN?QT.testP_open.en:"")+(TESTS.mid?QT.testP_mid.en:"")+(TESTS.late?QT.testP_late.en.replace("{n}",LATE_DAYS):"")};
UI.mode_pre=UI.pre; UI.mode_post=UI.post; UI.mode_mid={tr:"Mini quiz",en:"Mini-quiz"}; UI.mode_late={tr:"Gecikmeli test",en:"Delayed test"};
function countWords(s){return (s||"").split(/[\s,;:.!?()\/\-–—>→←↑↓=+]+/).filter(w=>/\p{L}{2,}|\d/u.test(w)).length;}
const CODE_RE=/^PHY-[A-Z2-9]{4}$/;
function myCode(){ let c=store.get("sim-code")||devMem; const old=typeof c==="string"&&c.match(/^NF-([A-Z2-9]{4})$/); if(old){ c="PHY-"+old[1]; store.set("sim-code",c); }
  if(!c||!CODE_RE.test(c)){ const A="ABCDEFGHJKLMNPRSTUVYZ23456789"; c="PHY-"+Array.from({length:4},()=>A[Math.floor(Math.random()*A.length)]).join(""); store.set("sim-code",c); } devMem=c; return c; }
const anyDone=()=>["pre","mid","post","late"].some(m=>ST[m]);
const prog=()=>{ const p=store.get("sim-program"); return PROGRAMS.some(x=>x.k===p)?p:""; };
const progOK=()=>PROGRAMS.length<2||!!prog();
function progHtml(){ if(PROGRAMS.length<2) return ""; const p=prog();
  return `<div class="progline${p?"":" need"}"><label for="prog">${qt("prog")}:</label> <select id="prog"><option value="">${qt("choose")}</option>${PROGRAMS.map(x=>`<option value="${x.k}" ${x.k===p?"selected":""}>${x[LANG]}</option>`).join("")}</select></div>`; }
function renderCodeBox(){
  const box=$("#rumuzbox"); if(!box) return; box.hidden=false;
  box.innerHTML=(SHEET_URL?"":`<p class="testmode" role="note">${qt("testMode")}</p>`)+`<div class="codeline">${qt("myCode")}: <span class="code" id="mycode">${myCode()}</span></div><small>${qt("codeHelp")}</small>`+progHtml()+
    (anyDone()?"":`<details class="othercode"><summary>${qt("otherDev")}</summary><label for="rumuz">${qt("enterCode")}</label> <input id="rumuz" maxlength="8" autocomplete="off" autocapitalize="characters" placeholder="PHY-7KQ2"> <button class="btn ghost" type="button" id="codeok">OK</button> <span id="codemsg" role="status"></span></details>`);
  const ok=$("#codeok"); if(ok) ok.onclick=()=>{ const v=($("#rumuz").value||"").trim().toLocaleUpperCase("tr-TR").replace(/^NF-?/,"PHY-").replace(/^PHY(?!-)/,"PHY-");
    if(!CODE_RE.test(v)){ $("#codemsg").textContent=qt("codeBad"); return; } store.set("sim-code",v); devMem=v; $("#mycode").textContent=v; $("#codemsg").textContent=qt("codeSet"); };
  const ps=$("#prog"); if(ps) ps.onchange=()=>{ store.set("sim-program",ps.value||null); if(qmode==="mid"&&!ST.mid) renderQuiz(); else renderCodeBox(); };
}
/* ----- delayed test ----- */
const lateAt=()=>ST.post?ST.post.t+LATE_DAYS*864e5:null;
const lateOpen=()=>!!ST.post&&Date.now()>=lateAt();
const fmtDate=ms=>new Date(ms).toLocaleDateString(LANG==="en"?"en-GB":"tr-TR",{day:"numeric",month:"long",year:"numeric"});
/* ----- scoring ----- */
function grade(set,raw){
  return set.map((q,i)=>{ const r=raw.ans[i];
    if(q.type==="open") return null;
    if(q.type==="mcq") return r===q.a?q.pts:0;
    if(q.type==="order"){ const n=q.a.length, pos=k=>q.a.indexOf(k); let p=0; for(let k=0;k<n-1;k++) if(pos(r[k+1])===pos(r[k])+1) p++; return r2(p*q.pts/(n-1)); }
    const key=q.type==="fill"?q.blanks.map(b=>b.a):q.a; let c=0; key.forEach((a,j)=>{ if(r[j]===a) c++; }); return r2(c*q.pts/key.length);
  });
}
function unitOK(q,r,j){ // is sub-unit j right? (tf statement, match row, fill blank)
  if(q.type==="tf"||q.type==="match") return r[j]===q.a[j];
  if(q.type==="fill") return r[j]===q.blanks[j].a; return false;
}
function topics(set,rec){
  const T={}; const add=(m,e,p)=>{ if(!T[m]) T[m]={e:0,p:0}; T[m].e+=e; T[m].p+=p; };
  set.forEach((q,i)=>{ if(!isAuto(q)) return; const r=rec.raw.ans[i];
    if(q.type==="mcq"||q.type==="order") add(q.mod,rec.qs[i],q.pts);
    else { const n=nOf(q); for(let j=0;j<n;j++) add((q.mods&&q.mods[j])||q.mod, unitOK(q,r,j)?q.pts/n:0, q.pts/n); } });
  return Object.keys(T).map(m=>{ const pc=T[m].p?T[m].e/T[m].p:0; return {m, label:M[m]?t(M[m].tab):m, pc, mark:pc>=.75?"✓":pc>=.5?"~":"✗"}; });
}
const topicStr=(set,rec)=>topics(set,rec).map(x=>`${x.label}: ${Math.round(x.pc*100)}%`).join(" · ");
const selfOf=(set,rec)=>set.map((q,i)=>q.type==="open"?r2((rec.self[i]||[]).filter(Boolean).length*q.pts/tx(q.rubric).length):null);
/* Confidence points and gift (Q107-B, Q108-A, Q109-A): per automatic item "sure" = +2·s − 4·(1 − s), s = item score share
   (fully right +2, fully wrong −4); "not sure" or no mark = 0. Gift: 4 points per test. Total = items + confidence + 4,
   never below 0, at most 100. Topic feedback and item analysis use the item points only. Not used in the mini-quiz. */
const GIFT=4;
const confOf=(q,s,c)=>CONFIDENCE&&isAuto(q)&&c===1?r2(2*s-4*(1-s)):0;
const confPts=(set,rec)=>r2(set.reduce((a,q,i)=>a+(isAuto(q)?confOf(q,(rec.qs[i]||0)/q.pts,rec.raw.conf[i]):0),0));
const totMax=set=>Math.min(100,r2(maxOf(set)+(CONFIDENCE?2*set.filter(isAuto).length:0)+GIFT));
const totalOf=(set,rec)=>cl(r2(rec.auto+confPts(set,rec)+GIFT),0,100);
const sgn=v=>v>0?"+"+nf(v):v<0?"−"+nf(-v):"0";
const totalStr=(set,rec)=>set===QUIZ_MID?`${nf(rec.auto)}/${nf(maxOf(set))}`:`${nf(totalOf(set,rec))}/${nf(totMax(set))}`;
/* ----- rendering ----- */
function renderModes(){
  const box=$("#qmode"); if(!box) return;
  box.innerHTML=MODES.map(m=>`<button type="button" data-m="${m}" aria-pressed="${m===qmode}">${t(UI["mode_"+m])}</button>`).join("");
  box.querySelectorAll("button").forEach(b=>b.onclick=()=>{qmode=b.dataset.m; renderModes(); renderQuiz(); try{history.replaceState(null,"","#"+qmode);}catch(e){} });
}
function itemHtml(q,i,done){
  const o=q.o?tx(q.o):[], id=`${qmode}-${i}`; let body="";
  if(q.type==="mcq") body=`<div class="opts">${o.map((x,j)=>`<label class="opt" id="o${i}_${j}"><input type="radio" name="q${i}" value="${j}" id="r-${id}-${j}"><span><b>${LU[j]})</b> ${x}</span></label>`).join("")}</div>`;
  if(q.type==="order") body=`<div class="ordbox" id="ord${i}"></div>`;
  if(q.type==="match") body=`<div class="match">${tx(q.left).map((h,j)=>`<div class="mrow" id="m${i}_${j}"><label for="sel-${id}-${j}"><b>${j+1}.</b> ${h}</label><select id="sel-${id}-${j}"><option value="">${qt("choose")}</option>${o.map((x,k)=>`<option value="${k}">${ll[k]}) ${x}</option>`).join("")}</select></div>`).join("")}</div>`;
  if(q.type==="tf") body=`<div class="tfl">${o.map((x,j)=>`<div class="tfrow" id="tf${i}_${j}"><span><b>${ll[j]})</b> ${x}</span><span class="tfbtns"><label><input type="radio" name="tf${i}_${j}" value="1" id="tf-${id}-${j}-d"> ${qt("T")}</label><label><input type="radio" name="tf${i}_${j}" value="0" id="tf-${id}-${j}-y"> ${qt("F")}</label></span><div class="fix" id="fix${i}_${j}" hidden></div></div>`).join("")}</div>`;
  if(q.type==="fill"){ const sg=tx(q.segs); body=`<p class="filltext">`+sg.map((s,j)=>s+(j<q.blanks.length?`<span class="fblank" id="f${i}_${j}"><label class="sr" for="fl-${id}-${j}">${j+1}</label><select id="fl-${id}-${j}"><option value="">${j+1} …</option>${tx(q.blanks[j].o).map((x,k)=>`<option value="${k}">${x}</option>`).join("")}</select></span>`:"")).join("")+`</p>`; }
  if(q.type==="open") body=`<label for="open-${id}" class="sr">${qt("answer")}</label><textarea id="open-${id}" data-q="${i}" rows="6" placeholder="${tx(q.ph)||t(UI.ph)}"></textarea><small class="wc" id="wc${i}">${qt("wcount",{n:0})}</small><div class="rubric" id="rubric${i}" hidden><b>${qt("rubricT")}</b>${tx(q.rubric).map((r,j)=>`<label class="rb"><input type="checkbox" id="rb-${id}-${j}" data-rb="${j}" data-q="${i}"> ${r}</label>`).join("")}<p class="selfpts" id="self${i}"></p></div>`;
  const conf=CONFIDENCE&&isAuto(q)?`<div class="conf"><span>${qt("sure")}</span><label><input type="radio" name="cf${i}" value="1" id="cf-${id}-1"> ${qt("sureY")}</label><label><input type="radio" name="cf${i}" value="0" id="cf-${id}-0"> ${qt("sureN")}</label></div>`:"";
  const tag=`${i+1} · ${tx(q.tag)||qt("type_"+q.type)} · ${nf(q.pts)} ${qt("pts")}${isAuto(q)?"":" · "+qt("lecturerTag")}`;
  return `<div class="q" id="q${i}"><fieldset><legend><span class="qtag">${tag}</span>${tx(q.q)}</legend>${body}${conf}<div class="why" id="w${i}" hidden></div></fieldset></div>`;
}
/* Tap ordering (Q105-A): tap the steps in order; each tap shows the next number; tapping a numbered step removes its
   number and the later numbers move down (Q115-A); "Clear order" starts again; steps without a number go to the end.
   After checking, the steps are shown in the student's order (right / wrong marks per row). */
function renderOrder(i,locked){
  const q=setOf(qmode)[i], o=tx(q.o), box=document.getElementById("ord"+i); if(!box) return;
  if(locked){ const r=ST[qmode].raw.ans[i];
    box.innerHTML=`<ol class="ord">${r.map((idx,pos)=>`<li class="ordrow" id="ordrow${i}_${pos}"><span class="tnum on">${pos+1}</span><span class="otext"><b>${LU[idx]})</b> ${o[idx]}</span></li>`).join("")}</ol>`; return; }
  const s=seq[i]||(seq[i]=[]);
  box.innerHTML=`<p class="ordhint">${qt("ordHint")}</p><div class="tapord" role="group" aria-label="${qt("type_order")}">`+
    o.map((x,k)=>{ const at=s.indexOf(k); return `<button type="button" class="tstep" data-q="${i}" data-tap="${k}" aria-pressed="${at>=0}"><span class="tnum">${at>=0?at+1:`<span class="sr">${qt("ordNone")}</span>`}</span><span class="otext"><b>${LU[k]})</b> ${x}</span></button>`; }).join("")+
    `</div><div class="ordbar"><button type="button" class="btn ghost" data-oclear="${i}" ${s.length?"":"disabled"}>${qt("ordClear")}</button></div>`;
}
function gateHtml(){
  if(qmode==="pre"&&!ST.pre&&ST.post) return qt("preClosed");
  if(qmode==="mid"&&!ST.mid&&ST.post) return qt("midClosed");
  if(qmode==="late"&&!ST.late&&!lateOpen()) return ST.post?qt("lateWhen",{d:fmtDate(lateAt())}):qt("lateNoPost",{n:LATE_DAYS});
  return "";
}
function noteHtml(){
  const rec=ST[qmode];
  if(qmode==="pre"&&rec&&!ST.post) return `${qt("toPost",{x:totalStr(QUIZ,rec)})} ${qt("lockPre")} <button class="btn ghost" type="button" data-go="test" data-mode="post">${qt("goPost")}</button>`;
  if(qmode==="post"&&!rec) return (ST.pre?"":qt("noPre")+" ")+qt("oneTry");
  if(qmode==="post"&&rec&&TESTS.late) return qt("postDone",{y:totalStr(QUIZ,rec)})+" "+(lateOpen()?qt("lateOpen"):qt("lateWhen",{d:fmtDate(lateAt())}));
  return rec?"":qt("oneTry");
}
function renderQuiz(){
  clearInterval(kTick); if(qmode==="mid") return renderKahoot();
  const set=setOf(qmode), rec=ST[qmode], done=!!rec, f=$("#quiz"); warned=false;
  const g=gateHtml(); if(g&&!done){ f.innerHTML=`<div class="q qnote">${g}</div>`; testNote(); renderCodeBox(); return; }
  set.forEach((q,i)=>{ if(q.type==="order") seq[i]=[]; });
  const note=noteHtml();
  f.innerHTML=(note?`<div class="q qnote" id="qnote">${note}</div>`:"")+`<div class="q scorebox" id="qscorebox" role="note">${qt(CONFIDENCE?"scoreBox":"scoreBoxGift")}</div>`+set.map((q,i)=>itemHtml(q,i,done)).join("")+
    `<div class="q"><div class="blankwarn" id="qwarn" role="alert" hidden></div><div class="score">${done?"":`<button class="btn" type="submit" id="qsubmit">${qt("check")}</button><button class="btn ghost" type="button" id="qclear">${qt("clear")}</button>`}<span id="qres"></span></div>`+
    `<div class="topics" id="qtopics" hidden></div><div class="surewrong" id="qsure" hidden></div><div class="compare" id="qcmp" style="margin-top:12px"></div>`+
    `<div class="fbform" id="fbform" hidden></div><div class="sendbox" id="sendbox" hidden><button class="btn" type="button" id="qsend">${qt("send")}</button><span id="sendmsg" role="status"></span></div></div>`;
  set.forEach((q,i)=>{ if(q.type==="order") renderOrder(i,done); });
  if(done) showResult(set,rec); else $("#qclear").onclick=()=>renderQuiz();
  $("#qsend").onclick=sendResult;
  showCompare(); testNote(); renderCodeBox();
}
function fillAnswers(set,rec){
  const A=rec.raw.ans, id=i=>`${qmode}-${i}`;
  set.forEach((q,i)=>{ const r=A[i];
    if(q.type==="mcq"&&r>=0){const el=document.getElementById(`r-${id(i)}-${r}`); if(el) el.checked=true;}
    if(q.type==="match") r.forEach((v,j)=>{const s=document.getElementById(`sel-${id(i)}-${j}`); if(s) s.value=v===null?"":String(v);});
    if(q.type==="fill") r.forEach((v,j)=>{const s=document.getElementById(`fl-${id(i)}-${j}`); if(s) s.value=v===null?"":String(v);});
    if(q.type==="tf") r.forEach((v,j)=>{ if(v!==null){const el=document.getElementById(`tf-${id(i)}-${j}-${v?"d":"y"}`); if(el) el.checked=true;}});
    if(q.type==="open"){ const ta=document.getElementById("open-"+id(i)); if(ta){ ta.value=r; ta.readOnly=true; } const w=document.getElementById("wc"+i); if(w) w.textContent=qt("wcount",{n:countWords(r)}); }
    const c=rec.raw.conf[i]; if(c!==null&&c!==undefined){ const el=document.getElementById(`cf-${id(i)}-${c}`); if(el) el.checked=true; }
  });
  $("#quiz").querySelectorAll("input:not([data-rb]):not([data-fb]),select").forEach(x=>x.disabled=true);
}
function wh(i,p,q,txt,link,cp){const w=document.getElementById("w"+i); w.hidden=false; w.innerHTML=(p==null?"":`<b>${nf(p)}/${nf(q.pts)} ${qt("pts")}${cp==null?"":" · "+qt("totConf")+" "+sgn(cp)}.</b> `)+txt+(link&&q.mod&&M[q.mod]?` <a href="#${q.mod}" data-go="${q.mod}">${qt("tryIt")}</a>`:"");}
function markKey(set,rec){
  set.forEach((q,i)=>{ const r=rec.raw.ans[i], o=q.o?tx(q.o):[], s=rec.qs[i], cp=CONFIDENCE&&isAuto(q)&&rec.raw.conf[i]===1?confOf(q,s/q.pts,1):null;
    const W=(i,p,q,txt,link)=>wh(i,p,q,txt,link,cp);   // item line with the confidence points of this item
    if(q.type==="mcq"){ o.forEach((_,j)=>{const el=document.getElementById(`o${i}_${j}`); el.classList.toggle("right",j===q.a); el.classList.toggle("wrong",j===r&&j!==q.a);});
      W(i,s,q,(r===q.a?qt("right")+" ":qt("rightAns")+" "+LU[q.a]+") "+o[q.a]+". ")+tx(q.why),true); }
    if(q.type==="order"){ const pos=k=>q.a.indexOf(k); r.forEach((idx,p)=>{ const okNext=p<r.length-1&&pos(r[p+1])===pos(idx)+1, okPrev=p>0&&pos(r[p-1])===pos(idx)-1; document.getElementById(`ordrow${i}_${p}`).classList.add(okNext||okPrev?"right":"wrong"); });
      W(i,s,q,qt("rightOrder")+" "+q.a.map(k=>LU[k]).join(" → ")+". "+qt("pairNote")+" "+tx(q.why),true); }
    if(q.type==="match"){ q.a.forEach((k,j)=>document.getElementById(`m${i}_${j}`).classList.add(r[j]===k?"right":"wrong"));
      W(i,s,q,qt("rightMatch")+" "+q.a.map((k,j)=>(j+1)+"-"+ll[k]).join(", ")+". "+tx(q.why),true); }
    if(q.type==="fill"){ q.blanks.forEach((b,j)=>document.getElementById(`f${i}_${j}`).classList.add(r[j]===b.a?"right":"wrong"));
      W(i,s,q,qt("rightFill")+" "+q.blanks.map((b,j)=>(j+1)+") "+tx(b.o)[b.a]).join(", ")+". "+tx(q.why),true); }
    if(q.type==="tf"){ const fx=tx(q.fix); q.a.forEach((a,j)=>{document.getElementById(`tf${i}_${j}`).classList.add(r[j]===a?"right":"wrong"); const el=document.getElementById(`fix${i}_${j}`); el.hidden=false; el.textContent=fx[j];});
      W(i,s,q,tx(q.why),true); }
    if(q.type==="open") W(i,null,q,tx(q.why),true);
  });
}
function showResult(set,rec){
  fillAnswers(set,rec);
  const keyed=qmode!=="pre";
  if(keyed){ markKey(set,rec);
    set.forEach((q,i)=>{ if(q.type!=="open") return; const rb=document.getElementById("rubric"+i); rb.hidden=false;
      rb.querySelectorAll("[data-rb]").forEach((x,j)=>{x.checked=!!(rec.self[i]&&rec.self[i][j]); x.disabled=rec.sent;}); }); }
  else set.forEach((q,i)=>{ if(q.type==="open") wh(i,null,q,qt("openSaved"),false); });
  // topic feedback (all modes)
  const tp=topics(set,rec), tb=$("#qtopics");
  if(tp.length){ tb.hidden=false; tb.innerHTML=`<b>${qt("topicsT")}</b><ul>${tp.map(x=>`<li><span class="tm ${x.mark==="✓"?"ok":x.mark==="~"?"mid":"bad"}">${x.mark}</span> ${x.label}</li>`).join("")}</ul><small>${qt("topicHint")}</small>`; }
  // confidence: sure but wrong (keyed modes only; in the pre-test it would hint at the key)
  if(CONFIDENCE&&keyed){ const sw=set.map((q,i)=>isAuto(q)&&rec.raw.conf[i]===1&&rec.qs[i]<q.pts?i+1:null).filter(Boolean);
    if(sw.length){ const el=$("#qsure"); el.hidden=false; el.textContent=qt("sureWrong",{list:sw.join(", ")}); } }
  if(qmode==="post"&&(FEEDBACK||MINUTE)) renderFb(rec);
  updateTotal();
  $("#sendbox").hidden=false;
  if(!SHEET_URL){ $("#qsend").disabled=true; $("#sendmsg").innerHTML=`<span class="testmode">${qt("testMode")}</span>`; }
  else { if(rec.sent){ $("#qsend").disabled=true; $("#sendmsg").textContent=qt("sentBefore")+(rec.alias?" ("+rec.alias+")":""); }
    else if(keyed) $("#sendmsg").textContent=[HAS_OPEN?qt("sendHintOpen"):"",qmode==="post"&&(FEEDBACK||MINUTE)?qt("sendHintForm"):"",qt("sendHint")].filter(Boolean).join(" "); }
}
function renderFb(rec){
  const box=$("#fbform"); box.hidden=false; rec.fb=rec.fb||{}; rec.mp=rec.mp||{};
  box.innerHTML=`<b>${qt("fbT")}</b>`+(FEEDBACK?`<small>${qt("fbScale")}</small>`+FB.map(x=>`<div class="likert" role="radiogroup" aria-label="${x[LANG]}"><span>${x[LANG]}</span><span class="lk">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="fb-${x.k}" value="${v}" data-fb="${x.k}" ${rec.fb[x.k]===v?"checked":""} ${rec.sent?"disabled":""}> ${v}</label>`).join("")}</span></div>`).join(""):"")+
    (MINUTE?MP.map(x=>`<label class="mp" for="mp-${x.k}">${x[LANG]}</label><textarea id="mp-${x.k}" data-mp="${x.k}" rows="2" ${rec.sent?"readonly":""}>${(rec.mp[x.k]||"").replace(/</g,"&lt;")}</textarea>`).join(""):"");
}
function updateTotal(){
  const rec=ST[qmode], el=$("#qres"); if(!rec||!el) return; const set=setOf(qmode);
  const parts=[`${qt("totItems")} ${nf(rec.auto)}/${nf(maxOf(set))}`].concat(CONFIDENCE?[`${qt("totConf")} ${sgn(confPts(set,rec))}`]:[],[`${qt("totGift")} ${GIFT}`]);
  el.innerHTML=`<span class="big">${qt("totT")} ${totalStr(set,rec)}</span> <span class="tparts">${parts.join(" · ")}</span>`+(HAS_OPEN?` <span class="tnote">(${qt("autoNote")})</span>`:"");
  set.forEach((q,i)=>{ if(q.type!=="open"||qmode==="pre") return; const s=document.getElementById("self"+i); if(s) s.textContent=qt("selfPts",{x:nf(selfOf(set,rec)[i]),m:nf(q.pts)}); });
  const n=$("#qnote"); if(n) n.innerHTML=noteHtml();
  showCompare(); testNote();
}
function showCompare(){
  const el=$("#qcmp"); if(!el) return; let h="";
  ["pre","mid","post","late"].forEach(m=>{ if(ST[m]) h+=`<span class="pill">${t(UI["mode_"+m])}: ${totalStr(setOf(m),ST[m])}</span>`; });
  if(ST.pre&&ST.post){const d=r2(totalOf(QUIZ,ST.post)-totalOf(QUIZ,ST.pre)); h+=`<span class="pill" style="color:var(--ok)">${d>=0?"+":""}${nf(d)} ${qt("pts")}</span>`;}
  el.innerHTML=h;
}
function testNote(){
  const el=document.getElementById("testnote"); if(!el) return; let h="";
  if(ST.late) h=qt("lateDone",{z:totalStr(QUIZ,ST.late)});
  else if(ST.post) h=TESTS.late?(lateOpen()?`<span>${qt("lateOpen")}</span> <button class="btn" type="button" data-go="test" data-mode="late">${qt("goLate")}</button>`:qt("postDone",{y:totalStr(QUIZ,ST.post)})+" "+qt("lateWhen",{d:fmtDate(lateAt())})):qt("postDone",{y:totalStr(QUIZ,ST.post)});
  else if(ST.pre) h=`<span>${qt("toPost",{x:totalStr(QUIZ,ST.pre)})}</span> <button class="btn" type="button" data-go="test" data-mode="post">${qt("goPost")}</button>`;
  el.hidden=!h; el.innerHTML=h;
}
function readRaw(set){
  const id=i=>`${qmode}-${i}`;
  const ans=set.map((q,i)=>{
    if(q.type==="mcq"){ const s=document.querySelector(`input[name=q${i}]:checked`); return s?+s.value:-1; }
    if(q.type==="order") return ordAns(q,i);
    if(q.type==="match") return tx(q.left).map((_,j)=>{const e=document.getElementById(`sel-${id(i)}-${j}`); return e&&e.value!==""?+e.value:null;});
    if(q.type==="fill") return q.blanks.map((_,j)=>{const e=document.getElementById(`fl-${id(i)}-${j}`); return e&&e.value!==""?+e.value:null;});
    if(q.type==="tf") return tx(q.o).map((_,j)=>{const e=document.querySelector(`input[name=tf${i}_${j}]:checked`); return e?e.value==="1":null;});
    return (document.getElementById("open-"+id(i))||{}).value||"";
  });
  const conf=set.map((q,i)=>{ const e=document.querySelector(`input[name=cf${i}]:checked`); return e?+e.value:null; });
  return {ans,conf};
}
function blankList(set,raw){
  const b=[];
  set.forEach((q,i)=>{ const r=raw.ans[i], n=i+1;
    if(q.type==="mcq"&&r<0) b.push(n);
    if(q.type==="order"){ const u=tx(q.o).length-(seq[i]||[]).length; if(u>0) b.push(qt("bOrder",{n,u})); }
    if((q.type==="match"||q.type==="fill"||q.type==="tf")&&r.some(v=>v===null)) b.push(n);
    if(q.type==="open"){ const w=countWords(r); if(w===0) b.push(n); else if(w<MINW) b.push(qt("bShort",{n})); } });
  return b;
}
const isEmpty=(set,raw)=>set.every((q,i)=>{ const r=raw.ans[i]; return q.type==="mcq"?r<0:q.type==="order"?!(seq[i]||[]).length:q.type==="open"?!countWords(r):r.every(v=>v===null); });
function finish(set,raw){
  const qs=grade(set,raw);
  ST[qmode]={raw, qs, auto:r2(qs.reduce((a,b)=>a+(b||0),0)), self:{}, fb:null, mp:null, sent:false, t:Date.now()};
  saveST(); renderQuiz();
  const el=$("#qres"); if(el) el.scrollIntoView({block:"center",behavior:"smooth"});
}
$("#quiz").addEventListener("submit",e=>{
  e.preventDefault(); if(qmode==="mid"||ST[qmode]) return; const set=setOf(qmode);
  const r=readRaw(set), wbox=$("#qwarn");
  if(!progOK()){ wbox.hidden=false; wbox.textContent=qt("progNeed"); $("#rumuzbox").scrollIntoView({block:"center",behavior:"smooth"}); return; }
  if(isEmpty(set,r)){ wbox.hidden=false; wbox.textContent=qt("noneAns"); return; }
  const b=blankList(set,r);
  if(b.length&&!warned){
    warned=true; wbox.hidden=false;
    wbox.innerHTML=`<p>${qt("blankWarn",{list:b.join(", ")})}</p><div class="score"><button class="btn" type="button" id="qforce">${qt("force")}</button><button class="btn ghost" type="button" id="qback">${qt("back")}</button></div>`;
    $("#qforce").onclick=()=>finish(set,readRaw(set));
    $("#qback").onclick=()=>{wbox.hidden=true; warned=false;};
    wbox.scrollIntoView({block:"nearest",behavior:"smooth"}); return;
  }
  finish(set,r);
});
$("#quiz").addEventListener("click",e=>{ if(qmode==="mid"||ST[qmode]) return;
  const c=e.target.closest("[data-oclear]");
  if(c){ const i=+c.dataset.oclear; seq[i]=[]; renderOrder(i,false); const f=document.querySelector(`#ord${i} [data-tap]`); if(f) f.focus(); return; }
  const b=e.target.closest("[data-tap]"); if(!b) return;
  const i=+b.dataset.q, k=+b.dataset.tap, s=seq[i]||(seq[i]=[]), at=s.indexOf(k);
  if(at>=0) s.splice(at,1); else s.push(k);          // a numbered step loses its number; later numbers move down
  renderOrder(i,false); const nb=document.querySelector(`#ord${i} [data-tap="${k}"]`); if(nb) nb.focus(); });
$("#quiz").addEventListener("change",e=>{ const el=e.target, rec=ST[qmode]; if(!rec||rec.sent) return;
  if(el.dataset.rb!==undefined){ const i=+el.dataset.q; rec.self[i]=rec.self[i]||[]; rec.self[i][+el.dataset.rb]=el.checked; saveST(); updateTotal(); }
  if(el.dataset.fb!==undefined){ rec.fb=rec.fb||{}; rec.fb[el.dataset.fb]=+el.value; saveST(); } });
$("#quiz").addEventListener("input",e=>{ const el=e.target;
  if(el.dataset.mp!==undefined){ const rec=ST[qmode]; if(rec&&!rec.sent){ rec.mp=rec.mp||{}; rec.mp[el.dataset.mp]=el.value.slice(0,1000); saveST(); } return; }
  if(el.tagName!=="TEXTAREA"||el.dataset.q===undefined) return; const w=document.getElementById("wc"+el.dataset.q); if(w) w.textContent=qt("wcount",{n:countWords(el.value)}); warned=false; });
/* ----- M6 mini-quiz (Kahoot style). The phone measures time (Date.now when the question appears), so a slow
   connection does not change the score. The phone shows right/wrong and time; the POINTS are calculated on the
   board (#board) when the group has answered (Q84-A):
     P = share of the round who answered right (time-out = wrong); S = 1 − time/limit
     right: 500 + 500 × (2 − P) × S      wrong: 0
   One run per browser; progress is saved after every step, so a reload continues the same question with the
   time that is left. ----- */
const KRUN=KST+"-mid", KLIM={tf:10,mcq:20,fill:20,match:30};
const kSec=q=>q.sec||KLIM[q.type]||20;
QUIZ_MID.forEach(q=>{ q.pts=1; });   // the test page counts right answers; points come from the board
let kTick=null;
if(store.get(KRUN)&&MODES.includes("mid")) qmode="mid";   // a mini-quiz in progress opens first
const kKey=q=>q.type==="mcq"?q.a:q.type==="fill"?q.blanks.map(b=>b.a):q.a;
const kOK=(q,a)=>a!==null&&a!==undefined&&(q.type==="mcq"?a===q.a:Array.isArray(a)&&kKey(q).every((k,j)=>a[j]===k));
const kRightN=run=>run.ok.reduce((x,y)=>x+(y?1:0),0);
function kAnsStr(q,a){ if(a===null||a===undefined) return "-";
  if(q.type==="mcq") return LU[a]; if(q.type==="tf") return a.map(v=>v===null?"-":(v?"D":"Y")).join("");
  return a.map((v,j)=>(j+1)+"-"+(v===null?"?":ll[v])).join(" "); }
function kRightStr(q){ const o=q.o?tx(q.o):[];
  if(q.type==="mcq") return LU[q.a]+") "+o[q.a];
  if(q.type==="tf") return q.a.map(v=>v?qt("kTrue"):qt("kFalse")).join(", ");
  if(q.type==="fill") return q.blanks.map(b=>tx(b.o)[b.a]).join(", ");
  return tx(q.left).map((h,j)=>h+" → "+o[q.a[j]]).join("; "); }
function renderKahoot(){
  const f=$("#quiz"), set=QUIZ_MID, n=set.length; clearInterval(kTick);
  const g=gateHtml(); if(g&&!ST.mid){ f.innerHTML=`<div class="q qnote">${g}</div>`; testNote(); renderCodeBox(); return; }
  renderCodeBox(); testNote();
  if(ST.mid) return kDone();
  const run=store.get(KRUN);
  if(!run){ f.innerHTML=`<div class="q kq"><h3 class="kh">${qt("kT")}</h3><p>${qt("kIntro",{n})}</p>`+
      `<div class="score"><button class="btn" type="button" id="kstart" ${progOK()?"":"disabled"}>${qt("kStart")}</button>${progOK()?"":`<span class="testmode">${qt("progNeed")}</span>`}</div></div>`;
    $("#kstart").onclick=()=>{ store.set(KRUN,{i:0,ans:[],ms:[],ok:[],ph:"q",t0:null}); renderKahoot(); }; return; }
  if(run.i>=n) return kFinish(run);
  if(run.ph==="fb") return kFeedback(run);
  kQuestion(run);
}
function kQuestion(run){
  const set=QUIZ_MID, q=set[run.i], n=set.length, lim=kSec(q)*1000, f=$("#quiz");
  if(!run.t0){ run.t0=Date.now(); store.set(KRUN,run); }
  if(Date.now()-run.t0>=lim) return kAnswer(null);
  const o=q.o?tx(q.o):[]; let body="";
  if(q.type==="mcq") body=`<div class="kopts">${o.map((x,j)=>`<button type="button" class="kopt" data-k="${j}"><b>${LU[j]}</b> ${x}</button>`).join("")}</div>`;
  if(q.type==="tf") body=`<p class="kstmt">${o[0]}</p><div class="kopts two"><button type="button" class="kopt" data-tf="1"><b>${qt("T")}</b> ${qt("kTrue")}</button><button type="button" class="kopt" data-tf="0"><b>${qt("F")}</b> ${qt("kFalse")}</button></div>`;
  if(q.type==="fill"){ const sg=tx(q.segs); body=`<p class="kstmt">${sg[0]}<span class="kblank">____</span>${sg[1]||""}</p><div class="kopts">${tx(q.blanks[0].o).map((x,k)=>`<button type="button" class="kopt" data-k="${k}">${x}</button>`).join("")}</div>`; }
  if(q.type==="match") body=`<div class="match">${tx(q.left).map((h,j)=>`<div class="mrow"><label for="ksel-${j}"><b>${j+1}.</b> ${h}</label><select id="ksel-${j}"><option value="">${qt("choose")}</option>${o.map((x,k)=>`<option value="${k}">${ll[k]}) ${x}</option>`).join("")}</select></div>`).join("")}</div><div class="score"><button class="btn" type="button" id="kgo">${qt("kSubmit")}</button></div>`;
  f.innerHTML=`<div class="q kq"><div class="khead"><span>${qt("kQ",{i:run.i+1,n})} · ${kSec(q)} ${L("sn","s")}</span><span class="ktime" id="ktime"></span></div>`+
    `<div class="kbar"><i id="kbar"></i></div><p class="kstem">${tx(q.q)}</p>${body}</div>`;
  kFocus();
  f.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>kAnswer(q.type==="fill"?[+b.dataset.k]:+b.dataset.k));
  f.querySelectorAll("[data-tf]").forEach(b=>b.onclick=()=>kAnswer([b.dataset.tf==="1"]));
  const go=$("#kgo"); if(go) go.onclick=()=>kAnswer(tx(q.left).map((_,j)=>{ const v=$("#ksel-"+j).value; return v===""?null:+v; }));
  const tick=()=>{ if(qmode!=="mid"||$("#v-test").hidden){ clearInterval(kTick); return; } const left=Math.max(0,lim-(Date.now()-run.t0)); const tm=$("#ktime"), bar=$("#kbar");
    if(tm) tm.textContent=Math.ceil(left/1000); if(bar) bar.style.width=(100*left/lim)+"%"; if(left<=0) kAnswer(null); };
  tick(); kTick=setInterval(tick,100);
}
function kAnswer(a){
  clearInterval(kTick); const run=store.get(KRUN); if(!run||run.ph!=="q") return;
  const q=QUIZ_MID[run.i], lim=kSec(q)*1000, ms=Math.min(lim,Date.now()-(run.t0||Date.now()));
  run.ans[run.i]=a; run.ms[run.i]=ms; run.ok[run.i]=kOK(q,a)?1:0; run.ph="fb";
  store.set(KRUN,run); kFeedback(run);
}
function kFeedback(run){
  const set=QUIZ_MID, q=set[run.i], a=run.ans[run.i], right=run.ok[run.i], last=run.i===set.length-1;
  const msg=right?qt("kRight",{s:dec(run.ms[run.i]/1000,1)}):(a===null?qt("kTimeout"):qt("kWrong"));
  $("#quiz").innerHTML=`<div class="q kq"><div class="khead"><span>${qt("kQ",{i:run.i+1,n:set.length})}</span><span>${qt("kSoFar",{r:kRightN(run),n:run.i+1})}</span></div>`+
    `<p class="kres ${right?"ok":"bad"}">${msg}</p><p>${qt("rightAns")} <b>${kRightStr(q)}</b></p><p class="why">${tx(q.why)}</p>`+
    `<div class="score"><button class="btn" type="button" id="knext">${last?qt("kSee"):qt("kNext")}</button></div></div>`;
  kFocus();
  $("#knext").onclick=()=>{ const r=store.get(KRUN); r.i++; r.ph="q"; r.t0=null; store.set(KRUN,r); renderKahoot(); };
}
function kFocus(){ const rb=$("#rumuzbox"); if(rb) rb.hidden=true; const k=$("#quiz .kq"); if(k&&k.scrollIntoView) k.scrollIntoView({block:"start"}); }   // during the run only the question is shown
function kFinish(run){
  ST.mid={raw:{ans:run.ans,ms:run.ms,ok:run.ok,conf:[]}, qs:run.ok.slice(), auto:kRightN(run), self:{}, fb:null, mp:null, sent:false, t:Date.now()};
  saveST(); store.set(KRUN,null); kDone();
}
function kDone(){
  const rec=ST.mid, set=QUIZ_MID;
  $("#quiz").innerHTML=`<div class="q kq"><h3 class="kh">${qt("kT")}</h3><p class="kbig">${qt("kSum",{r:rec.auto,n:set.length})}</p>`+
    `<ul class="klist">${set.map((q,i)=>`<li><span class="tm ${rec.qs[i]?"ok":"bad"}">${rec.qs[i]?"✓":"✗"}</span> ${qt("kQ",{i:i+1,n:set.length})}: ${dec((rec.raw.ms[i]||0)/1000,1)} ${L("sn","s")}</li>`).join("")}</ul>`+
    `<p>${qt("kPtsBoard")}</p><p class="kboard">${qt("kBoard")} <span class="code">${myCode()}</span></p>`+
    `<div class="sendbox" id="sendbox"><button class="btn" type="button" id="qsend">${qt("kResend")}</button><span id="sendmsg" role="status"></span></div></div>`;
  $("#qsend").onclick=sendResult;
  if(!SHEET_URL){ $("#qsend").disabled=true; $("#sendmsg").innerHTML=`<span class="testmode">${qt("testMode")}</span>`; }
  else if(rec.sent){ $("#qsend").hidden=true; $("#sendmsg").textContent=qt("sentBefore")+(rec.alias?" ("+rec.alias+")":""); }
  else if(!rec.tried){ rec.tried=true; saveST(); sendResult(); }
  showCompare();
}
function kPayload(rec,alias){
  const cols=[];
  QUIZ_MID.forEach((q,i)=>{ const n=i+1, lim=kSec(q)*1000, ms=Math.min(lim,rec.raw.ms[i]||lim), ok=rec.raw.ok[i]?1:0;
    cols.push([`R${n}`,ok],[`S${n}`,ok?r2(1-ms/lim):0],[`A${n}`,kAnsStr(q,rec.raw.ans[i])],[`T${n} sec`,r2(ms/1000)]); });
  cols.push(["Mini-quiz right",rec.auto],["Mini-quiz items",QUIZ_MID.length]);
  if(PROGRAMS.length>1) cols.push(["Program",prog()]);
  cols.push(["Version",SURUM],["Language",LANG]);
  return {schema:2, course:COURSE+"-quiz", alias, test:"mid", cols};
}
function checkMid(){
  QUIZ_MID.forEach((q,i)=>{ const err=m=>console.error(`QUIZ_MID[${i}] (${q.type}): ${m}`); const L=x=>(tx(x)||[]).length;
    if(!["mcq","tf","match","fill"].includes(q.type)) err("mini-quiz types: mcq, tf, match, fill");
    if(!q.mod||!M[q.mod]) err("mod is not a module key: "+q.mod);
    if(q.type==="mcq"&&!(q.a>=0&&q.a<L(q.o))) err("a out of range");
    if(q.type==="tf"&&(L(q.o)!==1||q.a.length!==1)) err("tf: one statement and one answer");
    if(q.type==="match"&&(L(q.left)!==2||q.a.length!==2||L(q.o)<3)) err("match: 2 left items, 2 answers, 3 options");
    if(q.type==="fill"&&(q.blanks.length!==1||L(q.segs)!==2)) err("fill: 1 blank and 2 text pieces"); });
  if(QUIZ_MID.length<4||QUIZ_MID.length>5) console.error("QUIZ_MID: use 4–5 items");
}
/* ----- leaderboard for the projector (#board). Reads the "-quiz" tab through the Apps Script every 5 s. ----- */
const BT={tr:{t:"Mini quiz · Liderlik tablosu",n:"{n} öğrenci gönderdi",none:"Henüz sonuç yok. Öğrenciler mini quizi bitirince burada görünür.",
    round:"Yeni tur",close:"Kapat",q:"Soru {k}: {r}/{n} doğru",formula:"Doğru cevap = 500 + 500 × (2 − P) × hız · P = soruyu doğru yapanların oranı",off:"SHEET_URL boş: tablo yalnızca sonuç gönderen bir simülatörde çalışır.",err:"Bağlantı yok, tekrar deneniyor…",pts:"puan",upd:"Son güncelleme"},
  en:{t:"Mini-quiz · Leaderboard",n:"{n} students sent a result",none:"No results yet. Students appear here when they finish the mini-quiz.",
    round:"New round",close:"Close",q:"Question {k}: {r}/{n} right",formula:"Right answer = 500 + 500 × (2 − P) × speed · P = share who got the question right",off:"SHEET_URL is empty: the board only works in a simulator that sends results.",err:"No connection, trying again…",pts:"points",upd:"Last update"}};
let bTimer=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const bt=(k,v)=>{ let s=BT[LANG][k]; if(v) Object.keys(v).forEach(x=>s=s.replace("{"+x+"}",v[x])); return s; };
function boardSince(){ const s=store.get(KST+"-board"); return (s&&Date.now()-s<3*3600e3)?s:Date.now()-20*60e3; }   // default: the last 20 minutes
function showBoard(){
  let el=$("#board"); if(!el){ el=document.createElement("div"); el.id="board"; el.setAttribute("role","dialog"); el.setAttribute("aria-label",bt("t")); document.body.appendChild(el); }
  el.hidden=false; document.body.classList.add("boardon");
  el.innerHTML=`<div class="bwrap"><div class="bhead"><h2>${bt("t")}</h2><div class="bbtn"><button class="btn" type="button" id="bround">${bt("round")}</button><button class="btn ghost" type="button" id="bclose">${bt("close")}</button></div></div>`+
    `<p class="bcount" id="bcount"></p><ol class="blist" id="blist"></ol><p class="bitems" id="bitems"></p><p class="bnote">${bt("formula")}</p><p class="bnote" id="bnote" role="status"></p></div>`;
  $("#bround").onclick=()=>{ store.set(KST+"-board",Date.now()); boardLoad(); };
  $("#bclose").onclick=()=>{ clearInterval(bTimer); el.hidden=true; document.body.classList.remove("boardon"); open("giris"); };
  clearInterval(bTimer);
  if(!SHEET_URL){ $("#bnote").textContent=bt("off"); return; }
  boardLoad(); bTimer=setInterval(boardLoad,5000);
}
function boardLoad(){
  const u=SHEET_URL+(SHEET_URL.includes("?")?"&":"?")+"board="+encodeURIComponent(COURSE+"-quiz")+"&since="+boardSince()+"&n="+BOARD_TOP;
  fetch(u,{cache:"no-store"}).then(r=>r.json()).then(d=>{
    if(!d||!d.ok) throw new Error(d&&d.error||"bad");
    $("#bcount").textContent=bt("n",{n:d.n});
    $("#blist").innerHTML=d.top.length?d.top.map(r=>`<li class="r${Math.min(r.rank,4)}"><span class="brank">${r.rank}</span><span class="balias">${esc(r.alias)}</span><span class="bpts">${r.points} ${bt("pts")}</span></li>`).join(""):`<li class="bempty">${bt("none")}</li>`;
    $("#bitems").textContent=(d.items||[]).map(x=>bt("q",{k:x.k,r:x.right,n:x.n})).join(" · ");
    $("#bnote").textContent=bt("upd")+": "+new Date().toLocaleTimeString(LANG==="tr"?"tr-TR":"en-US");
  }).catch(()=>{ const n=$("#bnote"); if(n) n.textContent=bt("err"); });
}
/* ----- M2 "predict first" (Q100-A, Q122-A, Q123-A). A module with predict:{q,set,a,why} shows a box above its controls:
   the student picks ↑ / ↓ / no change and presses "Lock" (one try). Lock applies the task's settings like a preset and runs
   the module; the box then shows the prediction, the right answer and the explanation. "Skip" uses the try and shows the
   answer and the explanation. 0 points. The post-test row sends "M2 answers" (U up, D down, S no change, - skipped / not
   done; one letter per task in module order) and "M2 right" (number of right predictions). ----- */
const KM2=PFX+"-m2", ARW={up:"↑",down:"↓",same:"="};
const M2_TASKS=PREDICT?ORDER.filter(k=>M[k]&&M[k].predict):[];
let M2=store.get(KM2); if(!M2||typeof M2!=="object") M2={};
const M2T={title:{tr:"Önce tahmin edin",en:"Predict first"}, noPts:{tr:"(puan yok)",en:"(no points)"},
  o_up:{tr:"Artar",en:"Rises"}, o_down:{tr:"Azalır",en:"Falls"}, o_same:{tr:"Değişmez",en:"No change"},
  lock:{tr:"Kilitle",en:"Lock"}, skip:{tr:"Atla",en:"Skip"}, yours:{tr:"Tahmininiz",en:"Your prediction"}, answer:{tr:"Doğru cevap",en:"Right answer"},
  skipped:{tr:"Atladınız.",en:"You skipped this task."},
  note:{tr:"Tek deneme. Kilitleyince ayarlar uygulanır ve modül çalışır; sonra doğru cevabı görürsünüz.",en:"One try. When you lock, the settings are applied and the module runs; then you see the right answer."}};
const m2t=k=>t(M2T[k]), m2Opt=a=>ARW[a]+"\u00a0"+m2t("o_"+a);   // no line break between arrow and word
function renderPredict(){
  const box=$("#m-predict"); if(!box) return; const m=M[cur], P=m&&M2_TASKS.includes(cur)?m.predict:null;
  box.hidden=!P; if(!P){ box.innerHTML=""; return; }
  const r=M2[cur], head=`<div class="phead"><b>${m2t("title")}</b> <small>${m2t("noPts")}</small></div><p class="pq">${t(P.q)}</p>`;
  if(r){ const ok=r.p===P.a;
    box.innerHTML=head+`<p class="pres" role="status">`+(r.p?`${m2t("yours")}: <b>${m2Opt(r.p)}</b> · ${m2t("answer")}: <b>${m2Opt(P.a)}</b> <span class="tm ${ok?"ok":"bad"}">${ok?"✓":"✗"}</span>`
      :`${m2t("skipped")} ${m2t("answer")}: <b>${m2Opt(P.a)}</b>`)+`</p><p class="pwhy">${t(P.why)}</p>`; return; }
  box.innerHTML=head+`<div class="popts" role="radiogroup" aria-label="${m2t("yours")}">${["up","down","same"].map(a=>`<label><input type="radio" name="m2opt" value="${a}"> ${m2Opt(a)}</label>`).join("")}</div>`+
    `<div class="pbtns"><button type="button" class="btn" id="m2lock" disabled>${m2t("lock")}</button><button type="button" class="btn ghost" id="m2skip">${m2t("skip")}</button></div><small class="pnote">${m2t("note")}</small>`;
  box.querySelectorAll("input[name=m2opt]").forEach(x=>x.onchange=()=>{ $("#m2lock").disabled=false; });
  $("#m2lock").onclick=()=>{ const s=box.querySelector("input[name=m2opt]:checked"); if(s) m2Done(s.value); };
  $("#m2skip").onclick=()=>m2Done(null);
}
function m2Done(p){
  const m=M[cur], P=m.predict; M2[cur]={p, t:Date.now()}; store.set(KM2,M2);
  if(p){ Object.keys(P.set||{}).forEach(id=>unPreset(m,id)); Object.assign(C,P.set||{}); buildControls(m);   // like a preset
    if(paused){ paused=false; $("#b-pause").textContent=t(UI.pause); } uiTick(true); }                        // run the module
  renderPredict(); const r=$("#m-predict .pres"); if(r){ r.tabIndex=-1; r.focus(); }
}
const m2Answers=()=>M2_TASKS.map(k=>{ const r=M2[k]; return r&&r.p?{up:"U",down:"D",same:"S"}[r.p]:"-"; }).join("");
const m2Right=()=>M2_TASKS.filter(k=>M2[k]&&M2[k].p===M[k].predict.a).length;
/* ----- sending (schema 2: [column name, value] pairs; null = create the column, write nothing) -----
   Column order (engine 2026-11f): per item Q<n> <type> (<pts>), A<n>, K<n> parts (tf, match, fill, order), C<n> sure
   (open item: Q<n> open: lecturer, notes, self-check, words, answer) → Auto total (84) → Confidence points → Gift (4) →
   Total (100) → [Total incl. lecturer: only with an open item] → Topics → form answers → [M2 answers, M2 right] →
   Program → Item codes → Version → Language. */
function answerStr(q,r){
  if(q.type==="mcq") return r>=0?LU[r]:"-";
  if(q.type==="order") return r.map(k=>LU[k]).join("");
  if(q.type==="match"||q.type==="fill") return r.map((v,j)=>(j+1)+"-"+(v===null?"?":ll[v])).join(" ");
  if(q.type==="tf") return r.map(v=>v===null?"-":(v?"D":"Y")).join("");
  return r;
}
/* Part marks "K<n> parts" (item analysis of sub-parts): one 1/0 per tf statement, match row, fill blank, or order key pair
   (pair k = key steps k and k+1 next to each other in the student's order; the same pairs as the scoring). */
function partsStr(q,r){
  if(q.type==="order"){ const at=k=>r.indexOf(k); return q.a.slice(0,-1).map((k,j)=>at(q.a[j+1])===at(k)+1?1:0).join(""); }
  if(q.type==="tf"||q.type==="match"||q.type==="fill") return Array.from({length:nOf(q)},(_,j)=>unitOK(q,r,j)?1:0).join("");
  return null;
}
/* Item code (Q99-A, Q119-A): 6 characters made from the item's type, stem, options / rows / blanks and key, both languages.
   Any edit of these (even a typo fix) gives a new code; the explanation (why, fix), module and points do not count.
   "Item codes" = "<module>:<code>" per item, in item order (Q118-A); the item analysis pools rows by code. */
function itemCode(q){
  const s=JSON.stringify([q.type,q.q,q.o||null,q.left||null,q.segs||null,q.blanks?q.blanks.map(b=>[b.o,b.a]):null,q.a===undefined?null:q.a]);
  let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; }   // FNV-1a, 32 bit
  const A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c=""; h>>>=2; for(let k=0;k<6;k++){ c+=A[h&31]; h>>>=5; } return c;
}
const itemCodes=set=>set.map(q=>q.mod+":"+itemCode(q)).join(" ");
function payloadOf(mode,rec,alias){
  if(mode==="mid") return kPayload(rec,alias);
  const set=setOf(mode), cols=[], self=selfOf(set,rec), keyed=mode!=="pre";
  set.forEach((q,i)=>{ const n=i+1, r=rec.raw.ans[i];
    if(q.type==="open"){
      cols.push([`Q${n} open: lecturer (${nf(q.pts)})`,null],[`Q${n} lecturer notes`,null]);
      cols.push([`Q${n} self-check (feedback)`,keyed?self[i]:null],[`Q${n} words`,countWords(r)],[`A${n} open answer`,r]);
    } else {
      cols.push([`Q${n} ${q.type} (${nf(q.pts)})`,rec.qs[i]],[`A${n}`,answerStr(q,r)]);
      const k=partsStr(q,r); if(k!==null) cols.push([`K${n} parts`,k]);
      if(CONFIDENCE){ const c=rec.raw.conf[i]; cols.push([`C${n} sure`,c===1?"E":c===0?"D":"-"]); }
    } });
  cols.push([`Auto total (${nf(maxOf(set))})`,rec.auto]);
  if(CONFIDENCE) cols.push(["Confidence points",confPts(set,rec)]);
  cols.push([`Gift (${GIFT})`,GIFT],[`Total (${nf(totMax(set))})`,totalOf(set,rec)]);
  if(HAS_OPEN) cols.push([`Total incl. lecturer`,null]);   // lecturer columns only when the test has an open item
  cols.push(["Topics",topicStr(set,rec)]);
  // form columns are sent with every test (empty except after the post-test), so the column order stays fixed
  const isPost=mode==="post";
  if(FEEDBACK) FB.forEach(x=>cols.push([`Feedback: ${x.k} (1-5)`,isPost?((rec.fb||{})[x.k]??""):null]));
  if(MINUTE) MP.forEach(x=>cols.push([x.k==="learned"?"Learned most":"Still unclear",isPost?((rec.mp||{})[x.k]||""):null]));
  if(M2_TASKS.length) cols.push(["M2 answers",isPost?m2Answers():null],["M2 right",isPost?m2Right():null]);   // sent with the post-test row
  if(PROGRAMS.length>1) cols.push(["Program",prog()]);
  cols.push(["Item codes",itemCodes(set)],["Version",SURUM],["Language",LANG]);
  return {schema:2, course:COURSE, alias, test:mode, cols};
}
async function sendResult(){
  const rec=ST[qmode]; if(!rec||rec.sent||!SHEET_URL) return;
  const alias=myCode(), payload=payloadOf(qmode,rec,alias);
  const btn=$("#qsend"); btn.disabled=true; $("#sendmsg").textContent=qt("sending");
  try{
    await fetch(SHEET_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
    rec.sent=true; rec.alias=alias; saveST(); $("#sendmsg").textContent=qt("sent",{a:alias}); if(qmode==="mid") $("#qsend").hidden=true;
    document.querySelectorAll("[data-rb],[data-fb]").forEach(x=>x.disabled=true); document.querySelectorAll("[data-mp]").forEach(x=>x.readOnly=true);
  }catch(err){ btn.disabled=false; $("#sendmsg").textContent=qt("sendFail"); }
}
function resetCheck(){ if(location.hash!=="#test-sifirla") return; if(confirm(qt("resetQ"))){ ST={pre:null,mid:null,post:null,late:null}; saveST(); store.set(KRUN,null); M2={}; store.set(KM2,null); qmode=MODES[0]; renderModes(); } try{history.replaceState(null,"","#test");}catch(e){} }
resetCheck(); window.addEventListener("hashchange",resetCheck);
/* ----- format check for template authors: problems are listed in the browser console -----
   Rules (engine 2026-11f): all item points + 2 per automatic item (confidence) + 4 (gift) = 100;
   order: 4–7 rows and pts = 4 × (rows − 1); every item has a module (mod); tr and en have the same length. */
function checkQuiz(set,name){
  const nA=set.filter(isAuto).length, sum=r2(set.reduce((a,q)=>a+(q.pts||0),0));
  if(r2(sum+2*nA+4)!==100) console.error(`${name}: item points ${nf(sum)} + 2 × ${nA} automatic items + 4 = ${nf(r2(sum+2*nA+4))}; it must be 100 (default: 84 points in 6 automatic items)`);
  set.forEach((q,i)=>{ const err=m=>console.error(`${name}[${i}] (${q.type}): ${m}`); const L=x=>(tx(x)||[]).length;
    if(!q.pts||q.pts<=0) err("pts missing");
    if(q.type==="order"){ const n=L(q.o); if(n<4||n>7) err("order: use 4–7 rows"); if(r2(q.pts)!==4*(n-1)) err(`order: pts must be 4 × (rows − 1) = ${4*(n-1)} (4 points per consecutive pair)`); }
    if(!q.mod||!M[q.mod]) err("mod is not a module key: "+q.mod);
    ["tr","en"].forEach(lg=>{ const n=x=>x&&x[lg]?x[lg].length:-1;
      if(q.o&&q.o.tr&&n(q.o)!==q.o.tr.length) err("o."+lg+" length differs from o.tr");
      if(q.type==="fill"&&n(q.segs)!==q.blanks.length+1) err(`segs.${lg} must have ${q.blanks.length+1} pieces (one more than the blanks)`); });
    if(q.type==="mcq"&&!(q.a>=0&&q.a<L(q.o))) err("a out of range");
    if(q.type==="order"&&q.a.slice().sort((x,y)=>x-y).join()!==[...Array(L(q.o)).keys()].join()) err("a is not an order of all rows");
    if(q.type==="match"&&(q.a.length!==L(q.left)||q.a.some(k=>k<0||k>=L(q.o)))) err("a must give one option per left item");
    if(q.type==="tf"&&(q.a.length!==L(q.o)||L(q.fix)!==L(q.o))) err("a and fix need one entry per statement");
    if(q.type==="fill"&&q.blanks.some(b=>!(b.a>=0&&b.a<L(b.o)))) err("a blank answer is out of range");
    if(q.type==="open"&&L(q.rubric)<2) err("rubric needs steps");
    if(q.mods&&q.mods.some(m=>!M[m])) err("mods has an unknown module key"); });
}
function checkPredict(){   // M2 tasks: q and why in tr and en, a = up | down | same, set uses the module's control ids
  M2_TASKS.forEach(k=>{ const P=M[k].predict, err=x=>console.error(`M.${k}.predict: ${x}`), ids=M[k].controls.map(c=>c.id);
    if(!P.q||!P.q.tr||!P.q.en) err("q needs tr and en"); if(!P.why||!P.why.tr||!P.why.en) err("why needs tr and en");
    if(!["up","down","same"].includes(P.a)) err('a must be "up", "down" or "same"');
    Object.keys(P.set||{}).forEach(id=>{ if(!ids.includes(id)) err("set: unknown control id "+id); }); });
  if(M2_TASKS.length&&(M2_TASKS.length<2||M2_TASKS.length>3)) console.warn(`M2: the design is 2–3 prediction tasks per simulator (one per main module); this file has ${M2_TASKS.length}.`);
}
checkQuiz(QUIZ,"QUIZ"); if(TESTS.mid) checkMid(); checkPredict();
renderModes(); renderCodeBox(); testNote();
