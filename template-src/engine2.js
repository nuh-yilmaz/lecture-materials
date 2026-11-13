/* ---------------- TEST ENGINE 2026-11i ----------------
   2026-11i: F1 remediation plan on the post-test key screen (no Sheet or Apps Script change; Apps Script 2026-11h).
   2026-11h: M7 missions (fix the body, you are the organ); mini-quiz story rounds; streak bonus on the board.
   2026-11g: mini-quiz rounds (QUIZ_MID = list of rounds of 3 items; links #mid1… and #board1…; Q126–Q143).
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
  // F1 remediation plan (post-test only; Adaptive guide p. 8 without the video step). Step 4 only when the delayed test is on.
  remT:{tr:"Gözden Geçirme Planı",en:"Review plan"}, remFor:{tr:"Gözden Geçirilecek Konular:",en:"Topics to review:"},
  remSteps:{tr:["Simülatörde konunun modülünü aç; tahmin ve görevi yeniden dene.","Modül notundaki kitap sayfalarından 1–2 temel cümleyi işaretle.","Kendi sözcüklerinle 3 kısa not kartı yaz (önde soru, arkada yanıt)."],
            en:["Open the topic's module in the simulator; try the prediction and mission again.","Mark 1–2 key sentences in the book pages listed in the module note.","Write 3 short note cards in your own words (question on front, answer on back)."]},
  remLate:{tr:"{n} gün sonra açılan gecikmeli testte kendini yokla.",en:"Test yourself in the delayed test, which opens after {n} days."},
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
  midClosed:{tr:"Son testi çözdüğünüz için mini quiz turları kapandı.",en:"The mini-quiz rounds are closed because you have already taken the post-test."},
  kT:{tr:"Mini quiz",en:"Mini-quiz"}, kRound:{tr:"Tur {r}/{n}",en:"Round {r}/{n}"}, kList:{tr:"Mini quiz turları",en:"Mini-quiz rounds"},
  kListHint:{tr:"Eğitimcinin gösterdiği turu açın (QR kod ya da aşağıdaki liste). Her tur 3 kısa sorudur.",en:"Open the round the lecturer shows (QR code or the list below). Each round has 3 short questions."},
  kAll:{tr:"‹ Tüm turlar",en:"‹ All rounds"}, kClosed:{tr:"kapalı",en:"closed"}, kPill:{tr:"{r}/{n} doğru ({k} tur)",en:"{r}/{n} right ({k} rounds)"},
  kIntro:{tr:"{n} kısa soru. Her sorunun süresi var (10–30 saniye). Doğru ve hızlı cevap daha çok puan alır; grubun zorlandığı sorular daha çok puan verir. Art arda doğru cevaplar seri bonusu kazandırır. Süre telefonunuzda ölçülür; internet hızı puanınızı etkilemez. Puanlar herkes bitirince tahtada hesaplanır. Her tur bir kez çözülür.",en:"{n} short questions. Each question has a time limit (10–30 seconds). Right and fast answers earn more points; questions the group finds hard give more points. Right answers in a row earn a streak bonus. Time is measured on your phone, so your internet speed does not change your score. Points are calculated on the board when everyone has finished. Each round can be taken once."},
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
  testP_mid:{tr:" Ders boyunca süreli mini quiz turları vardır.",en:" There are timed mini-quiz rounds during the lecture."},
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
/* mini-quiz rounds (2026-11g): a 2026-11f flat list of items is read as one round (checkMid reports it) */
const ROUNDS=(Array.isArray(QUIZ_MID)&&QUIZ_MID.length&&QUIZ_MID[0]&&QUIZ_MID[0].type)?[{items:QUIZ_MID}]:(QUIZ_MID||[]).map(r=>({items:(r&&r.items)||[],story:(r&&r.story)||null}));   // story (2026-11h, T1): one line that ties the 3 items to one person or situation
const RS=()=>(ROUNDS[kr-1]||{}).story, rsHtml=()=>RS()?`<p class="kstory">${tx(RS())}</p>`:"";
const NR=ROUNDS.length, MIDS=ROUNDS.flatMap(r=>r.items);
let kr=1;   // round shown on the test tab (1…NR); 0 = list of rounds
const mk=r=>"mid"+r, RQ=()=>(ROUNDS[kr-1]||{items:[]}).items;
const setOf=m=>m==="mid"?RQ():QUIZ;
const isAuto=q=>q.type!=="open";
const HAS_OPEN=QUIZ.some(q=>!isAuto(q));
const maxOf=set=>r2(set.filter(isAuto).reduce((a,q)=>a+q.pts,0));
const nOf=q=>q.type==="mcq"?1:q.type==="match"?tx(q.left).length:q.type==="fill"?q.blanks.length:tx(q.o).length;
let ST=store.get(KST); if(!ST||typeof ST!=="object") ST={};
if("mid" in ST){ if(ST.mid&&!ST.mid1) ST.mid1=ST.mid; delete ST.mid; store.set(KST,ST); }   // a 2026-11f mini-quiz result counts as round 1 (stored once)
["pre","post","late"].concat(ROUNDS.map((_,i)=>mk(i+1))).forEach(m=>{if(!(m in ST)) ST[m]=null;});
const saveST=()=>store.set(KST,ST);
const curKey=()=>qmode==="mid"?mk(kr):qmode;
const hashOf=()=>qmode==="mid"?(kr?mk(kr):"mini"):qmode;   // #mid1… for a round, #mini for the list of rounds
const hashSync=()=>{ try{ if(location.hash.slice(1)!==hashOf()) history.replaceState(null,"","#"+hashOf()); }catch(e){} };
let qmode=MODES[0], seq={}, warned=false, devMem=null;   // seq[i] = rows of order item i in the order they were tapped
const ordAns=(q,i)=>{ const s=seq[i]||[]; return s.concat(tx(q.o).map((_,k)=>k).filter(k=>!s.includes(k))); };   // steps without a number go to the end
UI.testP={tr:QT.testP_base.tr+(HAS_OPEN?QT.testP_open.tr:"")+(TESTS.mid?QT.testP_mid.tr:"")+(TESTS.late?QT.testP_late.tr.replace("{n}",LATE_DAYS):""),en:QT.testP_base.en+(HAS_OPEN?QT.testP_open.en:"")+(TESTS.mid?QT.testP_mid.en:"")+(TESTS.late?QT.testP_late.en.replace("{n}",LATE_DAYS):"")};
UI.mode_pre=UI.pre; UI.mode_post=UI.post; UI.mode_mid={tr:"Mini quiz",en:"Mini-quiz"}; UI.mode_late={tr:"Gecikmeli test",en:"Delayed test"};
function countWords(s){return (s||"").split(/[\s,;:.!?()\/\-–—>→←↑↓=+]+/).filter(w=>/\p{L}{2,}|\d/u.test(w)).length;}
const CODE_RE=/^PHY-[A-Z2-9]{4}$/;
function myCode(){ let c=store.get("sim-code")||devMem; const old=typeof c==="string"&&c.match(/^NF-([A-Z2-9]{4})$/); if(old){ c="PHY-"+old[1]; store.set("sim-code",c); }
  if(!c||!CODE_RE.test(c)){ const A="ABCDEFGHJKLMNPRSTUVYZ23456789"; c="PHY-"+Array.from({length:4},()=>A[Math.floor(Math.random()*A.length)]).join(""); store.set("sim-code",c); } devMem=c; return c; }
const anyDone=()=>Object.keys(ST).some(m=>ST[m]);
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
  const ps=$("#prog"); if(ps) ps.onchange=()=>{ store.set("sim-program",ps.value||null); if(qmode==="mid"&&kr&&!ST[mk(kr)]) renderQuiz(); else renderCodeBox(); };
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
const totalStr=(set,rec)=>`${nf(totalOf(set,rec))}/${nf(totMax(set))}`;
/* ----- rendering ----- */
function renderModes(){
  const box=$("#qmode"); if(!box) return;
  box.innerHTML=MODES.map(m=>`<button type="button" data-m="${m}" aria-pressed="${m===qmode}">${t(UI["mode_"+m])}</button>`).join("");
  box.querySelectorAll("button").forEach(b=>b.onclick=()=>{qmode=b.dataset.m; if(qmode==="mid") kr=NR===1?1:0; renderModes(); renderQuiz(); hashSync(); });
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
  if(qmode==="mid"&&kr&&!ST[mk(kr)]&&ST.post) return qt("midClosed");
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
    `<div class="topics" id="qtopics" hidden></div><div class="remplan" id="qrem" hidden></div><div class="surewrong" id="qsure" hidden></div><div class="compare" id="qcmp" style="margin-top:12px"></div>`+
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
  // F1 remediation plan: post-test key screen, only topics marked ✗ or ~ (none → no block)
  const weak=tp.filter(x=>x.mark!=="✓"), rb=$("#qrem");
  if(qmode==="post"&&weak.length){ const steps=QT.remSteps[LANG].concat(TESTS.late?[qt("remLate",{n:LATE_DAYS})]:[]);
    rb.hidden=false; rb.innerHTML=`<b>${qt("remT")}</b><p>${qt("remFor")} ${weak.map(x=>`<a href="#${x.m}" data-go="${x.m}"><span class="tm ${x.mark==="~"?"mid":"bad"}">${x.mark}</span>${x.label}</a>`).join(" · ")}</p><ol>${steps.map(x=>`<li>${x}</li>`).join("")}</ol>`; }
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
  ["pre","mid","post","late"].forEach(m=>{
    if(m==="mid"){ let r=0,n=0,k=0; ROUNDS.forEach((R,i)=>{ const x=ST[mk(i+1)]; if(x){ r+=x.auto; n+=R.items.length; k++; } });   // one pill for all rounds
      if(k) h+=`<span class="pill">${t(UI.mode_mid)}: ${qt("kPill",{r,n,k})}</span>`; return; }
    if(ST[m]) h+=`<span class="pill">${t(UI["mode_"+m])}: ${totalStr(setOf(m),ST[m])}</span>`; });
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
     streak bonus (2026-11h, Apps Script 2026-11h): 2nd right answer in a row +100, 3rd +200 (inside one round)
   One run per browser; progress is saved after every step, so a reload continues the same question with the
   time that is left. ----- */
const KRUN=KST+"-mid", KLIM={tf:10,mcq:20,fill:20,match:30};
const kSec=q=>q.sec||KLIM[q.type]||20;
MIDS.forEach(q=>{ q.pts=1; });   // the test page counts right answers; points come from the board
let kTick=null;
{ const run=store.get(KRUN); if(run&&MODES.includes("mid")){ const r=run.r||1; if(r>=1&&r<=NR){ qmode="mid"; kr=r; } else store.set(KRUN,null); } }   // a round in progress opens first (a 2026-11f run is round 1)
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
const kHead=()=>`${qt("kT")}${NR>1?" · "+qt("kRound",{r:kr,n:NR}):""}`;
const kBack=()=>NR>1?`<button class="btn ghost" type="button" id="kall">${qt("kAll")}</button>`:"";
function kBackOn(){ const b=$("#kall"); if(b) b.onclick=()=>{ kr=0; hashSync(); renderKahoot(); }; }
function kList(){   // list of rounds (the "Mini quiz" button when there are several rounds)
  const f=$("#quiz"); renderCodeBox(); testNote();
  f.innerHTML=`<div class="q kq"><h3 class="kh">${qt("kList")}</h3><p>${qt("kListHint")}</p><ul class="klist kround">`+
    ROUNDS.map((R,i)=>{ const r=i+1, rec=ST[mk(r)];
      return `<li><button type="button" class="btn ghost" data-kr="${r}">${qt("kRound",{r,n:NR})}</button> `+
        (rec?`<span class="tm ok">✓</span> ${qt("kSum",{r:rec.auto,n:R.items.length})}`:ST.post?`<small>${qt("kClosed")}</small>`:"")+`</li>`; }).join("")+`</ul></div>`;
  f.querySelectorAll("[data-kr]").forEach(b=>b.onclick=()=>{ kr=+b.dataset.kr; hashSync(); renderKahoot(); });
  showCompare();
}
function renderKahoot(){
  const f=$("#quiz"); clearInterval(kTick);
  const run=store.get(KRUN); if(run&&(run.r||1)!==kr){ kr=run.r||1; hashSync(); }   // a started round must be finished first
  if(!kr) return kList();
  const set=RQ(), n=set.length, rec=ST[mk(kr)];
  const g=gateHtml(); if(g&&!rec){ f.innerHTML=`<div class="q qnote">${g}</div>${NR>1?`<div class="score">${kBack()}</div>`:""}`; kBackOn(); testNote(); renderCodeBox(); return; }
  renderCodeBox(); testNote();
  if(rec) return kDone();
  if(!run){ f.innerHTML=`<div class="q kq"><h3 class="kh">${kHead()}</h3>${rsHtml()}<p>${qt("kIntro",{n})}</p>`+
      `<div class="score"><button class="btn" type="button" id="kstart" ${progOK()?"":"disabled"}>${qt("kStart")}</button>${kBack()}${progOK()?"":`<span class="testmode">${qt("progNeed")}</span>`}</div></div>`;
    kBackOn(); $("#kstart").onclick=()=>{ store.set(KRUN,{r:kr,i:0,ans:[],ms:[],ok:[],ph:"q",t0:null}); renderKahoot(); }; return; }
  if(run.i>=n) return kFinish(run);
  if(run.ph==="fb") return kFeedback(run);
  kQuestion(run);
}
function kQuestion(run){
  const set=RQ(), q=set[run.i], n=set.length, lim=kSec(q)*1000, f=$("#quiz");
  if(!run.t0){ run.t0=Date.now(); store.set(KRUN,run); }
  if(Date.now()-run.t0>=lim) return kAnswer(null);
  const o=q.o?tx(q.o):[]; let body="";
  if(q.type==="mcq") body=`<div class="kopts">${o.map((x,j)=>`<button type="button" class="kopt" data-k="${j}"><b>${LU[j]}</b> ${x}</button>`).join("")}</div>`;
  if(q.type==="tf") body=`<p class="kstmt">${o[0]}</p><div class="kopts two"><button type="button" class="kopt" data-tf="1"><b>${qt("T")}</b> ${qt("kTrue")}</button><button type="button" class="kopt" data-tf="0"><b>${qt("F")}</b> ${qt("kFalse")}</button></div>`;
  if(q.type==="fill"){ const sg=tx(q.segs); body=`<p class="kstmt">${sg[0]}<span class="kblank">____</span>${sg[1]||""}</p><div class="kopts">${tx(q.blanks[0].o).map((x,k)=>`<button type="button" class="kopt" data-k="${k}">${x}</button>`).join("")}</div>`; }
  if(q.type==="match") body=`<div class="match">${tx(q.left).map((h,j)=>`<div class="mrow"><label for="ksel-${j}"><b>${j+1}.</b> ${h}</label><select id="ksel-${j}"><option value="">${qt("choose")}</option>${o.map((x,k)=>`<option value="${k}">${ll[k]}) ${x}</option>`).join("")}</select></div>`).join("")}</div><div class="score"><button class="btn" type="button" id="kgo">${qt("kSubmit")}</button></div>`;
  f.innerHTML=`<div class="q kq"><div class="khead"><span>${NR>1?qt("kRound",{r:kr,n:NR})+" · ":""}${qt("kQ",{i:run.i+1,n})} · ${kSec(q)} ${L("sn","s")}</span><span class="ktime" id="ktime"></span></div>`+
    `<div class="kbar"><i id="kbar"></i></div>${rsHtml()}<p class="kstem">${tx(q.q)}</p>${body}</div>`;
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
  const q=RQ()[run.i], lim=kSec(q)*1000, ms=Math.min(lim,Date.now()-(run.t0||Date.now()));
  run.ans[run.i]=a; run.ms[run.i]=ms; run.ok[run.i]=kOK(q,a)?1:0; run.ph="fb";
  store.set(KRUN,run); kFeedback(run);
}
function kFeedback(run){
  const set=RQ(), q=set[run.i], a=run.ans[run.i], right=run.ok[run.i], last=run.i===set.length-1;
  const msg=right?qt("kRight",{s:dec(run.ms[run.i]/1000,1)}):(a===null?qt("kTimeout"):qt("kWrong"));
  $("#quiz").innerHTML=`<div class="q kq"><div class="khead"><span>${NR>1?qt("kRound",{r:kr,n:NR})+" · ":""}${qt("kQ",{i:run.i+1,n:set.length})}</span><span>${qt("kSoFar",{r:kRightN(run),n:run.i+1})}</span></div>`+
    `<p class="kres ${right?"ok":"bad"}">${msg}</p><p>${qt("rightAns")} <b>${kRightStr(q)}</b></p><p class="why">${tx(q.why)}</p>`+
    `<div class="score"><button class="btn" type="button" id="knext">${last?qt("kSee"):qt("kNext")}</button></div></div>`;
  kFocus();
  $("#knext").onclick=()=>{ const r=store.get(KRUN); r.i++; r.ph="q"; r.t0=null; store.set(KRUN,r); renderKahoot(); };
}
function kFocus(){ const rb=$("#rumuzbox"); if(rb) rb.hidden=true; const k=$("#quiz .kq"); if(k&&k.scrollIntoView) k.scrollIntoView({block:"start"}); }   // during the run only the question is shown
function kFinish(run){
  ST[mk(kr)]={raw:{ans:run.ans,ms:run.ms,ok:run.ok,conf:[]}, qs:run.ok.slice(), auto:kRightN(run), self:{}, fb:null, mp:null, sent:false, t:Date.now()};
  saveST(); store.set(KRUN,null); kDone();
}
function kDone(){
  const rec=ST[mk(kr)], set=RQ();
  $("#quiz").innerHTML=`<div class="q kq"><h3 class="kh">${kHead()}</h3><p class="kbig">${qt("kSum",{r:rec.auto,n:set.length})}</p>`+
    `<ul class="klist">${set.map((q,i)=>`<li><span class="tm ${rec.qs[i]?"ok":"bad"}">${rec.qs[i]?"✓":"✗"}</span> ${qt("kQ",{i:i+1,n:set.length})}: ${dec((rec.raw.ms[i]||0)/1000,1)} ${L("sn","s")}</li>`).join("")}</ul>`+
    `<p>${qt("kPtsBoard")}</p><p class="kboard">${qt("kBoard")} <span class="code">${myCode()}</span></p>`+
    `<div class="sendbox" id="sendbox"><button class="btn" type="button" id="qsend">${qt("kResend")}</button><span id="sendmsg" role="status"></span></div>`+
    (NR>1?`<div class="score">${kBack()}</div>`:"")+`</div>`;
  $("#qsend").onclick=sendResult; kBackOn();
  if(!SHEET_URL){ $("#qsend").disabled=true; $("#sendmsg").innerHTML=`<span class="testmode">${qt("testMode")}</span>`; }
  else if(rec.sent){ $("#qsend").hidden=true; $("#sendmsg").textContent=qt("sentBefore")+(rec.alias?" ("+rec.alias+")":""); }
  else if(!rec.tried){ rec.tried=true; saveST(); sendResult(); }
  showCompare();
}
function kPayload(rec,alias){   // one row per student and round (Q134-A): Test = mid1, mid2 …
  const set=RQ(), cols=[["Round",kr]];
  set.forEach((q,i)=>{ const n=i+1, lim=kSec(q)*1000, ms=Math.min(lim,rec.raw.ms[i]||lim), ok=rec.raw.ok[i]?1:0;
    cols.push([`R${n}`,ok],[`S${n}`,ok?r2(1-ms/lim):0],[`A${n}`,kAnsStr(q,rec.raw.ans[i])],[`T${n} sec`,r2(ms/1000)]); });
  cols.push(["Mini-quiz right",rec.auto],["Mini-quiz items",set.length]);
  if(PROGRAMS.length>1) cols.push(["Program",prog()]);
  cols.push(["Item codes",itemCodes(set)],["Version",SURUM],["Language",LANG]);
  return {schema:2, course:COURSE+"-quiz", alias, test:mk(kr), cols};
}
function checkMid(){   // 2026-11g: 1–10 rounds, exactly 3 items per round (Q126-A, Q127-A, Q128-A)
  if(Array.isArray(QUIZ_MID)&&QUIZ_MID.length&&QUIZ_MID[0]&&QUIZ_MID[0].type) console.error("QUIZ_MID: write rounds: [ {items:[3 items]}, {items:[…]}, … ] (engine 2026-11g); this flat list is read as one round");
  if(NR<1||NR>10) console.error(`QUIZ_MID: use 1–10 rounds (this file has ${NR})`);
  ROUNDS.forEach((R,ri)=>{ if(R.story&&(!R.story.tr||!R.story.en)) console.error(`QUIZ_MID round ${ri+1}: story needs tr and en`); });
  ROUNDS.forEach((R,ri)=>{
    if(R.items.length!==3) console.error(`QUIZ_MID round ${ri+1}: use exactly 3 items (this round has ${R.items.length})`);
    R.items.forEach((q,i)=>{ const err=m=>console.error(`QUIZ_MID round ${ri+1}, item ${i+1} (${q.type}): ${m}`); const L=x=>(tx(x)||[]).length;
      if(!["mcq","tf","match","fill"].includes(q.type)) err("mini-quiz types: mcq, tf, match, fill");
      if(!q.mod||!M[q.mod]) err("mod is not a module key: "+q.mod);
      if(q.type==="mcq"&&!(q.a>=0&&q.a<L(q.o))) err("a out of range");
      if(q.type==="tf"&&(L(q.o)!==1||q.a.length!==1)) err("tf: one statement and one answer");
      if(q.type==="match"&&(L(q.left)!==2||q.a.length!==2||L(q.o)<3)) err("match: 2 left items, 2 answers, 3 options");
      if(q.type==="fill"&&(q.blanks.length!==1||L(q.segs)!==2)) err("fill: 1 blank and 2 text pieces"); }); });
}
/* ----- leaderboard for the projector: #board1, #board2 … (#board = round 1). Reads the "-quiz" tab through the Apps Script
   every 5 s; only the rows of that round (Test = mid1, mid2 …; Apps Script 2026-11g). "Reset (new group)" restarts the time
   window of this round only (e.g. a second class section); the default window is the last 20 minutes (Q136–Q138, Q143-A). ----- */
const BT={tr:{t:"Mini quiz · Liderlik tablosu",tr_:"Mini quiz {r}/{n} · Liderlik tablosu",prev:"‹ Önceki tur",next:"Sonraki tur ›",n:"{n} öğrenci gönderdi",none:"Henüz sonuç yok. Öğrenciler mini quizi bitirince burada görünür.",
    reset:"Sıfırla (yeni grup)",close:"Kapat",q:"Soru {k}: {r}/{n} doğru",formula:"Doğru cevap = 500 + 500 × (2 − P) × hız · P = soruyu doğru yapanların oranı",streak:" · Seri bonusu: art arda 2. doğru +100, 3. doğru +200",off:"SHEET_URL boş: tablo yalnızca sonuç gönderen bir simülatörde çalışır.",err:"Bağlantı yok, tekrar deneniyor…",pts:"puan",upd:"Son güncelleme"},
  en:{t:"Mini-quiz · Leaderboard",tr_:"Mini-quiz {r}/{n} · Leaderboard",prev:"‹ Previous round",next:"Next round ›",n:"{n} students sent a result",none:"No results yet. Students appear here when they finish the mini-quiz.",
    reset:"Reset (new group)",close:"Close",q:"Question {k}: {r}/{n} right",formula:"Right answer = 500 + 500 × (2 − P) × speed · P = share who got the question right",streak:" · Streak bonus: 2nd right in a row +100, 3rd +200",off:"SHEET_URL is empty: the board only works in a simulator that sends results.",err:"No connection, trying again…",pts:"points",upd:"Last update"}};
let bTimer=null, bR=1;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const bt=(k,v)=>{ let s=BT[LANG][k]; if(v) Object.keys(v).forEach(x=>s=s.replace("{"+x+"}",v[x])); return s; };
const bTitle=()=>NR>1?bt("tr_",{r:bR,n:NR}):bt("t");
function boardSince(){ const s=store.get(KST+"-board"+bR); return (s&&Date.now()-s<3*3600e3)?s:Date.now()-20*60e3; }   // default: the last 20 minutes
function showBoard(r){
  bR=Math.min(Math.max(1,r||1),Math.max(1,NR));
  try{ if(location.hash.slice(1)!=="board"+bR) history.replaceState(null,"","#board"+bR); }catch(e){}
  let el=$("#board"); if(!el){ el=document.createElement("div"); el.id="board"; el.setAttribute("role","dialog"); document.body.appendChild(el); }
  el.setAttribute("aria-label",bTitle()); el.hidden=false; document.body.classList.add("boardon");
  const nav=NR>1?`<button class="btn ghost" type="button" id="bprev" ${bR>1?"":"disabled"}>${bt("prev")}</button><button class="btn" type="button" id="bnext" ${bR<NR?"":"disabled"}>${bt("next")}</button>`:"";
  el.innerHTML=`<div class="bwrap"><div class="bhead"><h2>${bTitle()}</h2><div class="bbtn">${nav}<button class="btn ghost" type="button" id="breset">${bt("reset")}</button><button class="btn ghost" type="button" id="bclose">${bt("close")}</button></div></div>`+
    ((ROUNDS[bR-1]||{}).story?`<p class="bstory">${tx(ROUNDS[bR-1].story)}</p>`:"")+
    `<p class="bcount" id="bcount"></p><ol class="blist" id="blist"></ol><p class="bitems" id="bitems"></p><p class="bnote" id="bformula">${bt("formula")}</p><p class="bnote" id="bnote" role="status"></p></div>`;
  $("#breset").onclick=()=>{ store.set(KST+"-board"+bR,Date.now()); boardLoad(); };
  if(NR>1){ $("#bprev").onclick=()=>showBoard(bR-1); $("#bnext").onclick=()=>showBoard(bR+1); }
  $("#bclose").onclick=()=>{ clearInterval(bTimer); el.hidden=true; document.body.classList.remove("boardon"); open("giris"); };
  clearInterval(bTimer);
  if(!SHEET_URL){ $("#bnote").textContent=bt("off"); return; }
  boardLoad(); bTimer=setInterval(boardLoad,5000);
}
function boardLoad(){
  const u=SHEET_URL+(SHEET_URL.includes("?")?"&":"?")+"board="+encodeURIComponent(COURSE+"-quiz")+"&test="+mk(bR)+"&since="+boardSince()+"&n="+BOARD_TOP+"&streak=1";   // streak bonus (Apps Script 2026-11h; an older script ignores it)
  fetch(u,{cache:"no-store"}).then(r=>r.json()).then(d=>{
    if(!d||!d.ok) throw new Error(d&&d.error||"bad");
    $("#bcount").textContent=bt("n",{n:d.n}); $("#bformula").textContent=bt("formula")+(d.streak?bt("streak"):"");   // the bonus line only when the script gives the bonus
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
/* ----- M7 missions (engine 2026-11h; CP1 S1–S6, Q3-A, Q4-A, Q5-B, Q7-A). A module with mission:{…} shows a box under the
   prediction box. 0 points. MISSION_TRIES tries per mission and browser; a started try counts (also after a reload or when
   the student leaves the module); the best stars are kept.
   fix    start values (start), run warm s, locked controls (lock). The student moves the free controls until every goal
          value stays in its zone for hold s. Moves = control changes (changes of the same control within 1.5 s are one
          move). Stars: moves ≤ stars[0] → 3, ≤ stars[1] → 2, more → 1; limit s without success → 0.
   organ  the student is one organ. Every `every` s the module stops; the student chooses ↑ / ↓ / no change for the
          control `act` (step delta). Events change the body at t s; an event at a turn time comes before that choice.
          Stars: share of the run time with all goals in zone ≥ stars[0] → 3, ≥ stars[1] → 2, ≥ stars[2] → 1, else 0.
   Times are simulation seconds (pause stops the clock; speed 2×–4× runs it faster).
   The post-test row sends "M7 stars" (best stars per mission in module order, x = not tried, e.g. 3-2-x) and "M7 tries"
   (e.g. 1-3-0). #mission-<module key> opens the module and shows its mission box (for the projector or a QR code). ----- */
const KM7=PFX+"-m7";
const M7_TASKS=MISSIONS?ORDER.filter(k=>M[k]&&M[k].mission):[];
let M7=store.get(KM7); if(!M7||typeof M7!=="object") M7={};
let MR=null, m7Acc=0;   // MR = the try that is running (one at a time)
const M7T={
  fix:{tr:"Görev · Vücudu düzeltin",en:"Mission · Fix the body"}, organ:{tr:"Görev · Organ sizsiniz",en:"Mission · You are the organ"},
  noPts:{tr:"(puan yok)",en:"(no points)"},
  ruleFix:{tr:"{g} yeşil bölgeye getirin ve {h} saniye orada tutun. Süre: {l} saniye. Daha az hamle, daha çok yıldız (3★: en çok {s} hamle).",en:"Bring {g} into the green zone and keep it there for {h} seconds. Time: {l} seconds. Fewer moves, more stars (3★: {s} moves or fewer)."},
  ruleOrgan:{tr:"Her {e} saniyede simülasyon durur ve {a} için seçim yaparsınız: ↑ artır, ↓ azalt ya da değiştirme. {n} seçim. {g} ne kadar uzun süre yeşil bölgede kalırsa o kadar çok yıldız (3★: sürenin en az %{s}'i).",en:"Every {e} seconds the simulation stops and you choose for {a}: ↑ raise, ↓ lower, or no change. {n} choices. The longer {g} stays in the green zone, the more stars (3★: at least {s}% of the time)."},
  locked:{tr:"Kilitli kontroller görev boyunca değiştirilemez.",en:"Locked controls cannot be changed during the mission."},
  tries:{tr:"Kalan deneme: {n}/{m}",en:"Tries left: {n}/{m}"}, best:{tr:"En iyi sonucunuz",en:"Your best result"},
  start:{tr:"Göreve başla",en:"Start the mission"}, again:{tr:"Tekrar dene",en:"Try again"}, stop:{tr:"Görevi bırak",en:"Stop the mission"},
  counts:{tr:"Başlattığınız deneme sayılır.",en:"A try counts once you start it."},
  noTries:{tr:"Deneme hakkınız bitti.",en:"No tries left."},
  time:{tr:"Süre",en:"Time"}, moves:{tr:"Hamle",en:"Moves"}, inZone:{tr:"Yeşil bölgede",en:"In the green zone"},
  choice:{tr:"Seçim {i}/{n}",en:"Choice {i}/{n}"}, zoneShare:{tr:"Yeşil bölgede geçen süre: %{p}",en:"Time in the green zone: {p}%"},
  ask:{tr:"{a} için seçiminiz:",en:"Your choice for {a}:"}, up:{tr:"↑ Artır",en:"↑ Raise"}, down:{tr:"↓ Azalt",en:"↓ Lower"}, same:{tr:"= Değiştirme",en:"= No change"},
  won:{tr:"Görev tamamlandı!",en:"Mission complete!"}, timeout:{tr:"Süre doldu.",en:"Time is up."}, ended:{tr:"Görev bitti.",en:"Mission over."},
  stopped:{tr:"Görevi bıraktınız. Bu deneme 0★ sayıldı.",en:"You stopped the mission. This try counts as 0★."},
  resFix:{tr:"{m} hamle, {s} saniye.",en:"{m} moves, {s} seconds."},
  zone:{tr:"yeşil bölge",en:"green zone"}, and:{tr:" ve ",en:" and "}, stars:{tr:"yıldız",en:"stars"}};
const m7t=(k,o)=>{ let s=t(M7T[k]); if(o) for(const p in o) s=s.split("{"+p+"}").join(o[p]); return s; };
const m7Def=X=>X.kind==="organ"?{every:10,turns:6,warm:10,stars:[0.8,0.6,0.4]}:{hold:5,limit:120,warm:20,stars:[3,6]};
const m7Cfg=k=>Object.assign(m7Def(M[k].mission),M[k].mission);
const m7Rec=k=>M7[k]||{tries:0,best:0,last:null};
const m7Left=k=>Math.max(0,MISSION_TRIES-m7Rec(k).tries);
const m7Star=n=>"★".repeat(n)+"☆".repeat(3-n);
function m7Ser(m,g){ return m.series.find(x=>x.k===g.k); }
function m7Name(m,g){ const s=m7Ser(m,g); return t(g.n)||(s?t(s.n):g.k); }
function m7Fmt(m,g,v){ const s=m7Ser(m,g); return g.fmt?g.fmt(v):s&&s.fmt?s.fmt(v):s&&s.axis?s.axis(v):pct(v); }
const m7In=(g,v)=>typeof v==="number"&&v>=g.lo&&v<=g.hi;
const m7Goals=(m,X)=>X.goal.map(g=>`<b>${m7Name(m,g)}</b> (${m7Fmt(m,g,g.lo)}–${m7Fmt(m,g,g.hi)})`).join(m7t("and"));
const m7Ctl=(m,id)=>m.controls.find(c=>c.id===id);
function m7Locked(m,X){   // controls that cannot be moved during a try
  const ids=new Set(X.lock||[]); m.controls.forEach(c=>{ if(c.type==="preset") ids.add(c.id); });
  (X.events||[]).forEach(e=>Object.keys(e.set||{}).forEach(id=>ids.add(id))); if(X.kind==="organ") ids.add(X.act);
  return ids; }
function missionLockUI(){   // called by buildControls
  if(!MR||MR.k!==cur) return; const m=M[cur], ids=m7Locked(m,MR.X);
  ids.forEach(id=>{ const el=document.getElementById("c-"+id); if(!el) return; const box=el.closest(".ctl");
    if(el.matches("[role=group]")) el.querySelectorAll("button").forEach(b=>b.disabled=true); else el.disabled=true;
    if(box) box.classList.add("m7lock"); });
}
function missionMove(id){   // called by buildControls when the student changes a control
  if(!MR||MR.k!==cur||MR.X.kind!=="fix"||MR.done) return;
  const now=Date.now(); if(id===MR.lastId&&now-MR.lastAt<1500){ MR.lastAt=now; return; }
  MR.moves++; MR.lastId=id; MR.lastAt=now; m7Live();
}
function missionStart(){
  const k=cur, m=M[k], X=m7Cfg(k); if(!m7Left(k)||MR) return;
  const r=m7Rec(k); r.tries++; r.last=0; M7[k]=r; store.set(KM7,M7);   // a started try counts
  S=m.init(); C=ctlDefaults(m); Object.assign(C,X.start||{}); m.controls.forEach(c=>{ if(c.type==="preset") C[c.id]=-1; });
  for(let i=0,n=Math.round((X.warm||0)/0.05);i<n;i++) m.step(S,0.05,C);
  hist=[]; simT=0;
  MR={k,X,t:0,moves:0,lastId:null,lastAt:0,inT:0,zT:0,turn:0,fired:[],news:null,wait:false,done:null,choices:[]};
  m7Events(); if(X.kind==="organ") MR.wait=true;
  if(paused){ paused=false; $("#b-pause").textContent=t(UI.pause); }
  buildControls(m); uiTick(true); renderMission(); const b=$("#m-mission"); if(b){ b.tabIndex=-1; b.focus(); }
}
function m7Events(){   // apply the events whose time has come
  let ch=false; (MR.X.events||[]).forEach((e,i)=>{ if(MR.fired[i]||MR.t<e.t-1e-9) return; MR.fired[i]=true; Object.assign(C,e.set||{}); MR.news=e.text; ch=true; });
  return ch;
}
function missionTick(dt){   // called by the loop after the model steps (dt = simulation seconds)
  if(!MR||MR.done||MR.wait||MR.k!==cur) return; const m=M[cur], X=MR.X;
  MR.t+=dt; if(m7Events()){ buildControls(m); renderMission(); }
  const inz=X.goal.every(g=>m7In(g,S[g.k]));
  if(X.kind==="fix"){
    MR.inT=inz?MR.inT+dt:0;
    if(MR.inT>=X.hold) return missionEnd(MR.moves<=X.stars[0]?3:MR.moves<=X.stars[1]?2:1,"won");
    if(MR.t>=X.limit) return missionEnd(0,"timeout");
  } else {
    if(inz) MR.zT+=dt;
    if(MR.t>=(MR.turn)*X.every-1e-9){
      if(MR.turn>=X.turns){ const sh=MR.zT/(X.turns*X.every); return missionEnd(sh>=X.stars[0]?3:sh>=X.stars[1]?2:sh>=X.stars[2]?1:0,"ended"); }
      if(m7Events()) buildControls(m);
      MR.wait=true; renderMission(); return;
    }
  }
  m7Acc+=dt; if(m7Acc>0.2){ m7Acc=0; m7Live(); }
}
function missionChoose(a){
  if(!MR||!MR.wait) return; const m=M[cur], X=MR.X, ctl=m7Ctl(m,X.act), d=X.delta||(ctl.max-ctl.min)/4;
  const v=cl(C[X.act]+(a==="up"?d:a==="down"?-d:0),ctl.min,ctl.max); C[X.act]=Math.round(v/ctl.step)*ctl.step;
  MR.choices.push(a); MR.turn++; MR.wait=false; buildControls(m); uiTick(true); renderMission();
}
function missionEnd(stars,why){
  const k=MR.k, r=m7Rec(k); r.last=stars; r.best=Math.max(r.best||0,stars); M7[k]=r; store.set(KM7,M7);
  MR.done={stars,why}; const res=MR; MR=null; m7Last=res;
  if(cur===k){ buildControls(M[k]); renderMission(); const p=$("#m-mission .mres"); if(p){ p.tabIndex=-1; p.focus(); } }
}
let m7Last=null;   // the last finished try, shown in the box until the student leaves the module
function missionStop(){ if(MR) missionEnd(0,"stopped"); }
function missionLeave(){ if(MR) missionEnd(0,"stopped"); m7Last=null; }   // open() and reset() call this
function m7Zones(m){ return MR&&MR.k===cur?MR.X.goal.map(g=>({s:m7Ser(m,g),lo:g.lo,hi:g.hi})).filter(z=>z.s):[]; }
function m7Live(){
  const el=$("#m7live"); if(!el||!MR) return; const m=M[MR.k], X=MR.X;
  const chips=X.goal.map(g=>{ const v=S[g.k], ok=m7In(g,v); return `<span class="m7chip ${ok?"ok":"bad"}">${m7Name(m,g)}: ${m7Fmt(m,g,v)} ${ok?"✓":"✗"}</span>`; }).join(" ");
  el.innerHTML=X.kind==="fix"
    ?`<div>${m7t("time")}: ${Math.floor(MR.t)}/${X.limit} ${t(UI.sec)} · ${m7t("moves")}: ${MR.moves} · ${m7t("inZone")}: ${dec(Math.min(MR.inT,X.hold),1)}/${X.hold} ${t(UI.sec)}</div><div>${chips}</div>`
    :`<div>${m7t("time")}: ${Math.floor(MR.t)}/${X.turns*X.every} ${t(UI.sec)} · ${m7t("zoneShare",{p:MR.t>0?Math.round(100*MR.zT/MR.t):0})}</div><div>${chips}</div>`;
}
function renderMission(){
  const box=$("#m-mission"); if(!box) return; const m=M[cur]; const on=!!(m&&M7_TASKS.includes(cur));
  box.hidden=!on; if(!on){ box.innerHTML=""; return; }
  const X=m7Cfg(cur), r=m7Rec(cur), left=m7Left(cur), run=MR&&MR.k===cur?MR:null, fin=!run&&m7Last&&m7Last.k===cur?m7Last:null;
  const ctl=X.kind==="organ"?m7Ctl(m,X.act):null;
  const rule=X.kind==="fix"?m7t("ruleFix",{g:m7Goals(m,X),h:X.hold,l:X.limit,s:X.stars[0]})
    :m7t("ruleOrgan",{e:X.every,a:`<b>${t(ctl.label)}</b>`,n:X.turns,g:m7Goals(m,X),s:Math.round(100*X.stars[0])});
  let h=`<div class="phead"><b>${m7t(X.kind)}</b> <small>${m7t("noPts")}</small></div><p class="pq">${t(X.title)}</p><p class="m7story">${t(X.story)}</p>`;
  if(run){
    h+=`<p class="m7rule">${rule}</p>`+(run.news?`<p class="m7news" role="status">${t(run.news)}</p>`:"")+`<div class="m7live" id="m7live" aria-live="off"></div>`;
    if(X.kind==="organ"&&run.wait) h+=`<div class="m7ask"><p>${m7t("choice",{i:run.turn+1,n:X.turns})} · ${m7t("ask",{a:t(ctl.label)})}</p><div class="pbtns">`+
      ["up","down","same"].map(a=>`<button type="button" class="btn${a==="same"?" ghost":""}" data-m7="${a}">${m7t(a)}</button>`).join("")+`</div></div>`;
    h+=`<div class="pbtns"><button type="button" class="btn ghost" id="m7stop">${m7t("stop")}</button></div><small class="pnote">${m7t("locked")}</small>`;
  } else {
    if(fin){ const d=fin.done;
      h+=`<div class="mres" role="status"><p class="m7big">${d.why==="won"?m7t("won"):d.why==="timeout"?m7t("timeout"):d.why==="ended"?m7t("ended"):m7t("stopped")} <span class="m7stars" aria-label="${d.stars} ${m7t("stars")}">${m7Star(d.stars)}</span></p>`+
        (X.kind==="fix"&&d.why==="won"?`<p>${m7t("resFix",{m:fin.moves,s:Math.round(fin.t)})}</p>`:"")+
        (X.kind==="organ"&&d.why!=="stopped"?`<p>${m7t("zoneShare",{p:Math.round(100*fin.zT/(X.turns*X.every))})}</p>`:"")+
        (d.why!=="stopped"?`<p class="pwhy">${t(X.why)}</p>`:"")+`</div>`; }
    else h+=`<p class="m7rule">${rule}</p>`;
    h+=`<p class="m7meta">${m7t("tries",{n:left,m:MISSION_TRIES})}`+(r.tries?` · ${m7t("best")}: <span class="m7stars" aria-label="${r.best||0} ${m7t("stars")}">${m7Star(r.best||0)}</span>`:"")+`</p>`;
    h+=left?`<div class="pbtns"><button type="button" class="btn" id="m7start">${r.tries?m7t("again"):m7t("start")}</button></div><small class="pnote">${m7t("counts")}</small>`:`<p class="pnote">${m7t("noTries")}</p>`;
  }
  box.innerHTML=h; m7Live();
  const st=$("#m7start"); if(st) st.onclick=missionStart;
  const sp_=$("#m7stop"); if(sp_) sp_.onclick=missionStop;
  box.querySelectorAll("[data-m7]").forEach(b=>b.onclick=()=>missionChoose(b.dataset.m7));
}
const m7StarsStr=()=>M7_TASKS.map(k=>{ const r=M7[k]; return r&&r.tries?String(r.best||0):"x"; }).join("-");
const m7TriesStr=()=>M7_TASKS.map(k=>String((M7[k]&&M7[k].tries)||0)).join("-");
function checkMission(){   // M7 author check (console)
  M7_TASKS.forEach(k=>{ const m=M[k], X=m7Cfg(k), err=x=>console.error(`M.${k}.mission: ${x}`), ids=m.controls.map(c=>c.id), s0=m.init();
    if(!["fix","organ"].includes(X.kind)) err('kind must be "fix" or "organ"');
    ["title","story","why"].forEach(f=>{ if(!X[f]||!X[f].tr||!X[f].en) err(f+" needs tr and en"); });
    Object.keys(X.start||{}).forEach(id=>{ if(!ids.includes(id)) err("start: unknown control id "+id); });
    (X.lock||[]).forEach(id=>{ if(!ids.includes(id)) err("lock: unknown control id "+id); });
    if(!Array.isArray(X.goal)||X.goal.length<1||X.goal.length>3) err("goal: 1–3 values");
    (X.goal||[]).forEach(g=>{ if(!(g.k in s0)) err("goal: "+g.k+" is not a key of the state (init)"); if(!(g.lo<g.hi)) err("goal "+g.k+": lo must be below hi"); });
    (X.events||[]).forEach((e,i)=>{ if(!(e.t>=0)) err(`events[${i}]: t missing`); if(!e.text||!e.text.tr||!e.text.en) err(`events[${i}]: text needs tr and en`);
      Object.keys(e.set||{}).forEach(id=>{ if(!ids.includes(id)) err(`events[${i}]: unknown control id `+id); }); });
    if(X.kind==="fix"){ if(!X.solve||typeof X.solve!=="object"||Array.isArray(X.solve)) err("fix: solve = {controlId:value,…}");
      else Object.keys(X.solve).forEach(id=>{ if(!ids.includes(id)) err("solve: unknown control id "+id); if(m7Locked(m,X).has(id)) err("solve uses a locked control: "+id); });
      if(!(X.stars[0]<X.stars[1])) err("fix: stars = [moves for 3★, moves for 2★]"); }
    if(X.kind==="organ"){ const a=m7Ctl(m,X.act); if(!a||a.type!=="range") err("organ: act must be the id of a range control");
      if(!Array.isArray(X.solve)||X.solve.length!==X.turns||X.solve.some(v=>!["up","down","same"].includes(v))) err(`organ: solve = ${X.turns} choices ("up", "down", "same")`);
      if(!(X.stars[0]>X.stars[1]&&X.stars[1]>X.stars[2])) err("organ: stars = [share for 3★, 2★, 1★], falling"); } });
  if(M7_TASKS.length&&(M7_TASKS.length<2||M7_TASKS.length>3)) console.warn(`M7: the design is 2–3 missions per simulator (one per main module); this file has ${M7_TASKS.length}.`);
  if(!(MISSION_TRIES>=1)) console.error("MISSION_TRIES must be 1 or more");
}
/* ----- sending (schema 2: [column name, value] pairs; null = create the column, write nothing) -----
   Column order (engine 2026-11f): per item Q<n> <type> (<pts>), A<n>, K<n> parts (tf, match, fill, order), C<n> sure
   (open item: Q<n> open: lecturer, notes, self-check, words, answer) → Auto total (84) → Confidence points → Gift (4) →
   Total (100) → [Total incl. lecturer: only with an open item] → Topics → form answers → [M2 answers, M2 right] →
   [M7 stars, M7 tries (2026-11h)] →
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
  if(M7_TASKS.length) cols.push(["M7 stars",isPost?m7StarsStr():null],["M7 tries",isPost?m7TriesStr():null]);   // engine 2026-11h, post-test row
  if(PROGRAMS.length>1) cols.push(["Program",prog()]);
  cols.push(["Item codes",itemCodes(set)],["Version",SURUM],["Language",LANG]);
  return {schema:2, course:COURSE, alias, test:mode, cols};
}
async function sendResult(){
  const rec=ST[curKey()]; if(!rec||rec.sent||!SHEET_URL) return;
  const alias=myCode(), payload=payloadOf(qmode,rec,alias);
  const btn=$("#qsend"); btn.disabled=true; $("#sendmsg").textContent=qt("sending");
  try{
    await fetch(SHEET_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
    rec.sent=true; rec.alias=alias; saveST(); $("#sendmsg").textContent=qt("sent",{a:alias}); if(qmode==="mid") $("#qsend").hidden=true;
    document.querySelectorAll("[data-rb],[data-fb]").forEach(x=>x.disabled=true); document.querySelectorAll("[data-mp]").forEach(x=>x.readOnly=true);
  }catch(err){ btn.disabled=false; $("#sendmsg").textContent=qt("sendFail"); }
}
function resetCheck(){ if(location.hash!=="#test-sifirla") return; if(confirm(qt("resetQ"))){ ST={pre:null,post:null,late:null}; ROUNDS.forEach((_,i)=>{ ST[mk(i+1)]=null; }); saveST(); store.set(KRUN,null); kr=1; M2={}; store.set(KM2,null); M7={}; store.set(KM7,null); MR=null; m7Last=null; qmode=MODES[0]; renderModes(); } try{history.replaceState(null,"","#test");}catch(e){} }
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
checkQuiz(QUIZ,"QUIZ"); if(TESTS.mid) checkMid(); checkPredict(); checkMission();
renderModes(); renderCodeBox(); testNote();
