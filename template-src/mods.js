/* ---------------- MODÜLLER / MODULES ----------------
   The 4 modules below are EXAMPLES. Each shows a set of building blocks.
   Delete them in a real simulator and write the lecture's own modules. */
const M={};
const sp=v=>(v>=0?"+":"−")+pct(Math.abs(v));          // signed percent
const hm=h=>{const hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0");};
const EXNOTE=()=>SRC("Kaynak: Guyton ve Hall (15. baskı), s. ___; Ganong (27. baskı), Bölüm ___.","Source: Guyton and Hall (15th ed.), p. ___; Ganong (27th ed.), Chapter ___.");

/* ÖRNEK 1 · TEMEL MODÜL: kontroller, yol kutuları, geri bildirim ışığı, grafik
   EXAMPLE 1 · CORE: controls, pathway boxes, feedback light, chart */
M.ornek1={
  tab:{tr:"Örnek 1: Temel",en:"Example 1: Core"},
  eyebrow:{tr:"Örnek · temel parçalar",en:"Example · core parts"},
  title:{tr:"Negatif geri bildirim",en:"Negative feedback"},
  sub:{tr:"Bozucu etki değişkeni ayar noktasından uzaklaştırır; etkileyici onu geri çeker.",en:"A disturbance moves the variable away from its set point; the effector pulls it back."},
  card:{tr:"Temel parçalar: kaydırıcı, düğme, anahtar, yol kutuları, geri bildirim ışığı ve 60 saniyelik grafik.",en:"Core parts: slider, button, switch, pathway boxes, feedback light, and the 60-second chart."},
  init:()=>({x:1,e:0,pulse:0,D:0,err:0}),
  controls:[
    {type:"range",id:"dist",label:{tr:"Bozucu etki",en:"Disturbance"},min:-1,max:1,step:.05,value:0,ends:[{tr:"Düşürür",en:"Lowers"},{tr:"Yükseltir",en:"Raises"}],help:{tr:"Değişkeni ayar noktasından uzaklaştıran sürekli bir etki.",en:"A lasting effect that moves the variable away from its set point."}},
    {type:"button",id:"kick",label:{tr:"Ani bozulma",en:"Sudden disturbance"},help:{tr:"Kısa süreli bir yükselme; birkaç saniyede kaybolur.",en:"A short rise that fades within a few seconds."},act:s=>{s.pulse=0.6;}},
    {type:"range",id:"gain",label:{tr:"Geri bildirim gücü",en:"Feedback strength"},min:0,max:1,step:.05,value:.5,show:v=>dec(4*v),ends:[{tr:"Zayıf",en:"Weak"},{tr:"Güçlü",en:"Strong"}],help:{tr:"Kazanç: etkileyicinin hata başına düzeltmesi.",en:"Gain: the effector's correction per unit of error."}},
    {type:"toggle",id:"fb",label:{tr:"Negatif geri bildirim",en:"Negative feedback"},value:true,help:{tr:"Kapatırsanız etkileyici kendiliğinden çalışmaz (deney).",en:"If you switch it off, the effector does not work by itself (experiment)."}},
    {type:"range",id:"man",label:{tr:"Etkileyici (elle)",en:"Effector (by hand)"},min:-0.6,max:0.6,step:.05,value:0,show:v=>sp(v),ends:[{tr:"Düşürür",en:"Lowers"},{tr:"Yükseltir",en:"Raises"}],help:{tr:"Yalnızca negatif geri bildirim kapalıyken çalışır: kontrol merkezi sizsiniz.",en:"Works only when negative feedback is off: you are the control center."}}
  ],
  /* M7 mission, kind "organ" (EXAMPLE): the student is the control center and sets the effector every 10 s */
  mission:{kind:"organ",
    title:{tr:"[Örnek] Kontrol merkezi sizsiniz",en:"[Example] You are the control center"},
    story:{tr:"Negatif geri bildirim kapalı. Etkileyiciyi siz yönetiyorsunuz. Ortam değiştikçe düzenlenen değişkeni normal aralıkta tutun.",en:"Negative feedback is off. You direct the effector. Keep the regulated variable in the normal range while the surroundings change."},
    start:{fb:false,dist:0,man:0,gain:0.5}, lock:["fb","gain","dist","kick"], act:"man", delta:0.3, every:10, turns:6,
    goal:[{k:"x",lo:0.9,hi:1.1}],
    events:[{t:0,set:{dist:-0.75},text:{tr:"[Örnek] Ortam birden soğudu: bozucu etki değişkeni düşürüyor.",en:"[Example] The surroundings suddenly turn cold: the disturbance lowers the variable."}},
            {t:20,set:{dist:0},text:{tr:"[Örnek] Ortam normale döndü: bozucu etki kalmadı.",en:"[Example] The surroundings are normal again: the disturbance is gone."}},
            {t:40,set:{dist:0.75},text:{tr:"[Örnek] Ortam ısındı: bozucu etki değişkeni yükseltiyor.",en:"[Example] The surroundings turn warm: the disturbance raises the variable."}}],
    solve:["up","same","down","same","down","same"],
    why:{tr:"[Örnek] Kontrol merkezi sapmanın tersi yönde yanıt verir: değişken düşünce etkileyici yükseltir, yükselince düşürür. Yanıt gecikirse değişken bir süre normal aralığın dışında kalır.",en:"[Example] The control center responds against the deviation: when the variable falls, the effector raises it; when it rises, the effector lowers it. If the response comes late, the variable stays outside the normal range for a while."}},
  step(s,dt,c){
    const G=4*c.gain;
    s.pulse*=Math.exp(-dt/3);
    s.D=0.4*c.dist+s.pulse;
    s.e=ap(s.e,c.fb?cl(-G*(s.x-1),-2,2):(c.man||0),1.2,dt);
    s.x=ap(s.x,1+s.D+s.e,0.8,dt);
    s.err=s.x-1;
  },
  rows:s=>[[
    {l:L("Bozucu etki","Disturbance"),s:L("Değişkeni uzaklaştırır","Moves the variable away"),v:0.5+s.D/2,c:"--h2",fmt:()=>sp(s.D)},
    {l:L("Algılayıcı","Sensor"),s:L("Ölçülen değer","Measured value"),v:s.x/2,c:"--h1",fmt:()=>pct(s.x)},
    {l:L("Kontrol merkezi","Control center"),s:L("Hata = ölçülen − ayar noktası","Error = measured − set point"),v:0.5+s.err/2,c:"--h5",fmt:()=>sp(s.err)},
    {l:L("Etkileyici","Effector"),s:L("Düzeltici yanıt","Corrective response"),v:0.5+s.e/4,c:"--h3",fmt:()=>sp(s.e)}
  ],[
    {l:L("Ayar noktası","Set point"),s:L("Hedef değer","Target value"),v:0.5,c:"--muted",fmt:()=>pct(1)},
    {l:L("Düzenlenen değişken","Regulated variable"),s:L("Ayar noktasına göre","Relative to the set point"),v:s.x/2,c:"--signal",fmt:()=>pct(s.x)}
  ]],
  fb:(s,c)=>({kind:"neg",on:c.fb,strength:cl(Math.abs(s.e),0,1),
    text:c.fb?L("Negatif geri bildirim açık: etkileyici, sapmanın tersi yönde çalışıyor.","Negative feedback on: the effector works against the deviation."):L("Negatif geri bildirim KAPALI: sapma düzeltilmiyor.","Negative feedback OFF: the deviation is not corrected.")}),
  series:[
    {k:"x",n:{tr:"Düzenlenen değişken",en:"Regulated variable"},c:"--signal",min:0,max:2,primary:true,band:[0.9,1.1],bandLabel:{tr:"normal aralık (örnek)",en:"normal range (example)"},axis:v=>pct(v)},
    {k:"e",n:{tr:"Etkileyici yanıtı",en:"Effector response"},c:"--h3",min:-2,max:2,fmt:v=>sp(v)}
  ],
  now(s,c){
    const o=[], G=4*c.gain, dev=Math.abs(s.err);
    if(dev<0.02&&Math.abs(s.D)<0.02) o.push(L("Değişken ayar noktasında. Bozucu etkiyi değiştirin ya da “Ani bozulma”ya basın.","The variable is at its set point. Change the disturbance or press “Sudden disturbance”."));
    if(dev>=0.02&&c.fb) o.push(tg("Düzeltme","Correction")+L(`Değişken ayar noktasından ${sp(s.err)} saptı. Kontrol merkezi etkileyiciyi ters yönde çalıştırıyor.`,`The variable has moved ${sp(s.err)} from its set point. The control center drives the effector in the opposite direction.`));
    if(!c.fb&&Math.abs(s.D)>0.02) o.push(tg("Geri bildirim yok","No feedback")+L("Bozucu etkinin tamamı değişkene yansıyor.","The whole disturbance shows up in the variable."));
    if(c.fb&&Math.abs(c.dist)>0.1&&s.pulse<0.02&&G>0) o.push(tg("Kazanç","Gain")+L(`Kazanç = düzeltme / kalan hata = ${dec(G)}. Sapma küçülür ama tamamen kaybolmaz.`,`Gain = correction / remaining error = ${dec(G)}. The deviation becomes smaller but does not disappear.`));
    return o;
  },
  daily:{tr:"[Örnek] Bir oda termostatı da negatif geri bildirimle çalışır: oda soğuyunca ısıtıcı açılır.",en:"[Example] A room thermostat also works by negative feedback: when the room cools, the heater switches on."},
  tasks:{tr:["Bozucu etkiyi “Yükseltir” yönüne çekin. Değişken ne kadar saptı?","Negatif geri bildirimi kapatıp aynı denemeyi yapın. Sapma nasıl değişti?","Geri bildirim gücünü artırın. Kalan hata neden küçülüyor?"],
         en:["Move the disturbance toward “Raises”. How far did the variable move?","Switch off negative feedback and repeat. How did the deviation change?","Increase the feedback strength. Why does the remaining error become smaller?"]},
  note:()=>L(`<p>[Örnek ders notu. Gerçek modülde her bilgi Guyton ve Ganong'dan kontrol edilir ve sayfası verilir.]</p><p><strong>Negatif geri bildirim:</strong> Algılayıcı değişikliği ölçer, kontrol merkezi ayar noktasıyla karşılaştırır, etkileyici değişkeni geri çeker. <strong>Kazanç</strong> = düzeltme / kalan hata.</p>`+EXNOTE(),
             `<p>[Example lecture note. In a real module every fact is checked in Guyton and Ganong and its page is given.]</p><p><strong>Negative feedback:</strong> The sensor measures the change, the control center compares it with the set point, and the effector pulls the variable back. <strong>Gain</strong> = correction / remaining error.</p>`+EXNOTE())
};

/* ÖRNEK 2 · BLOKLAR: hazır durum, kitap anahtarı, denklem, gösterge, pay çubuğu, çubuk listesi
   EXAMPLE 2 · BLOCKS: preset, book switch, equation, gauge, share bar, bar list */
M.ornek2={
  tab:{tr:"Örnek 2: Denklem",en:"Example 2: Equation"},
  eyebrow:{tr:"Örnek · hazır durum, kitap anahtarı, gösterge",en:"Example · preset, book switch, gauge"},
  title:{tr:"Akım, basınç farkı ve direnç",en:"Flow, pressure difference, and resistance"},
  sub:{tr:"Akım = basınç farkı / direnç. Yarıçap küçülünce direnç çok artar.",en:"Flow = pressure difference / resistance. When the radius falls, resistance rises steeply."},
  card:{tr:"Bloklar: hazır durum düğmeleri, Guyton ↔ Ganong anahtarı, denklem paneli, gösterge, pay çubuğu ve çubuk listesi.",en:"Blocks: preset buttons, Guyton ↔ Ganong switch, equation panel, gauge, share bar, and bar list."},
  init:()=>({q:1,R:1,R1:1,R2:1}),
  predict:{q:{tr:"Damar yarıçapları normalken basınç farkı iki katına çıkarsa akım ne olur?",en:"If the pressure difference doubles while both radii stay normal, what happens to flow?"},
    set:{dp:2,r1:1,r2:1}, a:"up",
    why:{tr:"Akım = basınç farkı / direnç. Yarıçaplar değişmediği için direnç aynı kalır; basınç farkı iki katına çıkınca akım da iki katına çıkar.",en:"Flow = pressure difference / resistance. The radii do not change, so resistance stays the same; when the pressure difference doubles, flow doubles too."}},
  /* M7 mission, kind "fix" (EXAMPLE): the module starts disturbed; bring flow back into the normal range */
  mission:{kind:"fix",
    title:{tr:"[Örnek] Akımı geri getirin",en:"[Example] Bring the flow back"},
    story:{tr:"Damar 1 daraldı: yarıçapı normalin %70'i. Akım çok düştü. Damar 1'i değiştiremezsiniz; akımı normal aralığa (%90–110) geri getirin.",en:"Vessel 1 has narrowed: its radius is 70% of normal. Flow has fallen a lot. You cannot change vessel 1; bring flow back into the normal range (90–110%)."},
    start:{dp:1,r1:0.7,r2:1}, lock:["r1"], goal:[{k:"q",lo:0.9,hi:1.1}],
    solve:{dp:2,r2:1.5},
    why:{tr:"[Örnek] Direnç = R1 + R2 ve R ∝ 1/r⁴. Damar 1 daralınca toplam direnç çok artar. Akımı geri getirmek için basınç farkını artırmak ve damar 2'yi genişletmek gerekir: ikisi de tek başına yetmez.",en:"[Example] Resistance = R1 + R2, and R ∝ 1/r⁴. When vessel 1 narrows, the total resistance rises steeply. To bring flow back, the pressure difference must rise and vessel 2 must widen: neither is enough alone."}},
  controls:[
    {type:"preset",id:"scen",label:{tr:"Hazır durum",en:"Preset"},value:0,options:[
      {label:{tr:"Normal",en:"Normal"},set:{dp:1,r1:1,r2:1}},
      {label:{tr:"Damar 1 dar",en:"Vessel 1 narrow"},set:{dp:1,r1:0.8,r2:1}},
      {label:{tr:"Basınç farkı yüksek",en:"High pressure difference"},set:{dp:1.5,r1:1,r2:1}}],
     help:{tr:"Bir düğme, birkaç kontrolü birlikte ayarlar.",en:"One button sets several controls together."}},
    {type:"range",id:"dp",label:{tr:"Basınç farkı (ΔP)",en:"Pressure difference (ΔP)"},min:0,max:2,step:.05,value:1,show:v=>pct(v),ends:[{tr:"0",en:"0"},{tr:"%200",en:"200%"}],help:{tr:"Akımı sağlayan güç.",en:"The force that drives flow."}},
    {type:"range",id:"r1",label:{tr:"Damar 1 yarıçapı",en:"Vessel 1 radius"},min:0.5,max:1.5,step:.05,value:1,show:v=>pct(v),ends:[{tr:"Dar",en:"Narrow"},{tr:"Geniş",en:"Wide"}],help:{tr:"Direnç, yarıçapın dördüncü kuvvetiyle ters orantılıdır.",en:"Resistance is inversely proportional to the fourth power of the radius."}},
    {type:"range",id:"r2",label:{tr:"Damar 2 yarıçapı",en:"Vessel 2 radius"},min:0.5,max:1.5,step:.05,value:1,show:v=>pct(v),ends:[{tr:"Dar",en:"Narrow"},{tr:"Geniş",en:"Wide"}],help:{tr:"İki damar art arda (seri) bağlıdır.",en:"The two vessels are connected in series."}},
    BOOK_CTL
  ],
  step(s,dt,c){
    s.R1=Math.pow(c.r1,-4)/2; s.R2=Math.pow(c.r2,-4)/2; s.R=s.R1+s.R2;
    s.q=ap(s.q,c.dp/s.R,0.8,dt);
  },
  rows:(s,c)=>[[
    {l:L("Basınç farkı","Pressure difference"),s:"ΔP",v:c.dp/2,c:"--h1",fmt:()=>pct(c.dp)},
    {l:L("Direnç","Resistance"),s:"R = R1 + R2",v:s.R/6,c:"--h2",fmt:()=>dec(s.R,2)},
    {l:L("Akım","Flow"),s:"Q = ΔP / R",v:s.q/3,c:"--h3",fmt:()=>pct(s.q)}
  ]],
  fb:()=>null,
  series:[
    {k:"q",n:{tr:"Akım",en:"Flow"},c:"--h3",min:0,max:3,primary:true,axis:v=>pct(v),fmt:v=>pct(v)},
    {k:"R",n:{tr:"Direnç",en:"Resistance"},c:"--h2",min:0,max:6,fmt:v=>dec(v,2)}
  ],
  now(s,c){
    const o=[L(`Akım = ${dec(c.dp,2)} / ${dec(s.R,2)} = ${pct(c.dp/s.R)} (normalin yüzdesi).`,`Flow = ${dec(c.dp,2)} / ${dec(s.R,2)} = ${pct(c.dp/s.R)} (percent of normal).`)];
    if(c.r1<0.95) o.push(tg("Daralma","Narrowing")+L(`Damar 1 yarıçapı ${pct(1-c.r1)} azaldı; direnci ${dec(Math.pow(c.r1,-4))} katına çıktı.`,`The radius of vessel 1 fell by ${pct(1-c.r1)}; its resistance rose ${dec(Math.pow(c.r1,-4))}-fold.`));
    if(c.book) o.push(tg("Ganong","Ganong")+L("Gösterge, Ganong'un normal aralığını kullanıyor (örnek sayı).","The gauge uses Ganong's normal range (example number)."));
    return o;
  },
  visual(s,c){
    const [lo,hi]=bk(c,[0.9,1.1],[0.8,1.2]);   // EXAMPLE values, not from the books
    return blocks(
      B.eq("Q = ΔP / R",`${dec(c.dp,2)} / ${dec(s.R,2)} = ${dec(c.dp/s.R,2)}`,{tr:"R ∝ 1 / r⁴: yarıçap biraz azalınca direnç çok artar.",en:"R ∝ 1 / r⁴: a small fall in radius raises resistance steeply."}),
      B.gauge(s.q,{min:0,max:3,zones:[[lo,"--h1"],[hi,"--ok"],[3,"--signal"]],label:{tr:"Akım",en:"Flow"},fmt:pct,sub:L(`Normal aralık: ${bkName(c)} (örnek)`,`Normal range: ${bkName(c)} (example)`)}),
      B.stack({tr:"Direncin dağılımı",en:"Share of resistance"},[[{tr:"Damar 1",en:"Vessel 1"},s.R1,"--h2"],[{tr:"Damar 2",en:"Vessel 2"},s.R2,"--h4"]]),
      B.bars({tr:"Değerler",en:"Values"},[["ΔP",c.dp,2,"--h1",pct(c.dp)],["R",s.R,6,"--h2",dec(s.R,2)],["Q",s.q,3,"--h3",pct(s.q)]])
    );
  },
  daily:{tr:"[Örnek] Bahçe hortumunun ucunu sıkınca su akımı azalır: direnç artmıştır.",en:"[Example] Squeezing the end of a garden hose reduces the flow: resistance has risen."},
  tasks:{tr:["“Damar 1 dar” düğmesine basın. Yarıçap %20 azaldı; akım ne kadar düştü?","Basınç farkını iki katına çıkarın. Akım da iki katına çıktı mı?","Kitap anahtarını açın. Göstergedeki normal aralık nasıl değişti?"],
         en:["Press “Vessel 1 narrow”. The radius fell by 20%; how much did flow fall?","Double the pressure difference. Did flow double too?","Switch on the book switch. How did the normal range on the gauge change?"]},
  note:()=>L(`<p>[Örnek ders notu.] <strong>Akım</strong> = basınç farkı / direnç. Direnç, yarıçapın dördüncü kuvvetiyle ters orantılıdır (Poiseuille). Göstergedeki normal aralıklar örnek sayılardır.</p>`+EXNOTE(),
             `<p>[Example lecture note.] <strong>Flow</strong> = pressure difference / resistance. Resistance is inversely proportional to the fourth power of the radius (Poiseuille). The normal ranges on the gauge are example numbers.</p>`+EXNOTE())
};

/* ÖRNEK 3 · DÖNGÜ: tekrarlayan dalga, büyük çizim alanı, sayaç, ilerleme çubuğu, 15 sn grafik
   EXAMPLE 3 · CYCLE: repeating wave, large drawing area, counter, progress bar, 15-s chart */
M.ornek3={
  tab:{tr:"Örnek 3: Döngü",en:"Example 3: Cycle"},
  eyebrow:{tr:"Örnek · döngü, çizim alanı, sayaç",en:"Example · cycle, drawing area, counter"},
  title:{tr:"Tekrarlayan bir döngü",en:"A repeating cycle"},
  sub:{tr:"Bir hacim düzenli aralıklarla dolar ve boşalır. Grafik son 15 saniyeyi gösterir.",en:"A volume fills and empties at regular intervals. The chart shows the last 15 seconds."},
  card:{tr:"Bloklar: dalga biçiminde değişen değer, büyük çizim alanı, sayaç, ilerleme çubuğu ve kısa zaman penceresi.",en:"Blocks: a value that changes as a wave, a large drawing area, a counter, a progress bar, and a short time window."},
  init:()=>({ph:0,n:0,v:0,fill:1}),
  controls:[
    {type:"range",id:"rate",label:{tr:"Döngü hızı",en:"Cycle rate"},min:6,max:30,step:1,value:12,show:v=>v+L(" /dk"," /min"),ends:[{tr:"Yavaş",en:"Slow"},{tr:"Hızlı",en:"Fast"}],help:{tr:"Dakikadaki döngü sayısı.",en:"Cycles per minute."}},
    {type:"range",id:"amp",label:{tr:"Genlik",en:"Amplitude"},min:.2,max:1,step:.05,value:.5,show:v=>pct(v),ends:[{tr:"Küçük",en:"Small"},{tr:"Büyük",en:"Large"}],help:{tr:"Her döngüde değişen hacim.",en:"The volume that changes in each cycle."}},
    {type:"toggle",id:"hold",label:{tr:"Döngüyü durdur",en:"Hold the cycle"},value:false,help:{tr:"Hacim o anki değerinde kalır.",en:"The volume stays at its current value."}}
  ],
  chart:{win:15},
  step(s,dt,c){
    if(!c.hold){ s.ph+=dt*c.rate/60; if(s.ph>=1){ s.ph-=1; s.n++; } }
    s.v=c.amp*(1-Math.cos(2*Math.PI*s.ph))/2;
    s.fill=c.hold?0:(s.ph<0.5?1:-1);
  },
  rows:(s,c)=>[[
    {l:L("Döngü hızı","Cycle rate"),s:L("dakikada","per minute"),v:c.rate/30,c:"--h1",fmt:()=>String(c.rate)},
    {l:L("Evre","Phase"),s:L("Döngü içinde","Within the cycle"),v:s.ph,c:"--h5",fmt:()=>s.fill>0?L("Doluyor","Filling"):s.fill<0?L("Boşalıyor","Emptying"):L("Durdu","Held"),small:true},
    {l:L("Hacim","Volume"),s:L("En büyük değerin yüzdesi","Percent of maximum"),v:s.v,c:"--h3",fmt:()=>pct(s.v)}
  ]],
  fb:()=>null,
  series:[
    {k:"v",n:{tr:"Hacim",en:"Volume"},c:"--h3",min:0,max:1,primary:true,axis:v=>pct(v)}
  ],
  now(s,c){
    const o=[L(`Dakikada ${c.rate} döngü: her döngü ${dec(60/c.rate)} sn sürüyor.`,`${c.rate} cycles per minute: each cycle lasts ${dec(60/c.rate)} s.`)];
    if(c.hold) o.push(tg("Durdu","Held")+L("Döngü durdu; hacim sabit kaldı.","The cycle is held; the volume stays constant."));
    return o;
  },
  visual:(s,c)=>blocks(B.counter(s.n,{tr:"Tamamlanan döngü",en:"Completed cycles"},{tr:"Her döngü: dolma + boşalma",en:"Each cycle: filling + emptying"}),B.progress(s.ph,{tr:"Döngünün ilerlemesi",en:"Progress of the cycle"})),
  draw:{h:240,fn(g,W,H,s,c){
    const cx=W/2, cy=H/2-6, r0=Math.min(W,H)*0.17, r=r0*(1+0.9*s.v), rmax=r0*(1+0.9*c.amp);
    g.lineWidth=2; g.strokeStyle=css("--muted"); g.setLineDash([6,5]); g.beginPath(); g.arc(cx,cy,rmax,0,7); g.stroke(); g.setLineDash([]);
    g.strokeStyle=css("--ink"); g.lineWidth=4; g.beginPath(); g.moveTo(cx,cy+r); g.lineTo(cx,H-6); g.stroke();
    g.fillStyle=css("--h3"); g.globalAlpha=.28; g.beginPath(); g.arc(cx,cy,r,0,7); g.fill(); g.globalAlpha=1;
    g.strokeStyle=css("--h3"); g.lineWidth=3; g.beginPath(); g.arc(cx,cy,r,0,7); g.stroke();
    if(s.fill){ const ay=H-28, d=s.fill>0?-1:1; g.fillStyle=css("--signal"); g.beginPath(); g.moveTo(cx+22,ay+10*d); g.lineTo(cx+14,ay-6*d); g.lineTo(cx+30,ay-6*d); g.closePath(); g.fill(); }
    g.fillStyle=css("--ink"); g.font=`700 15px ${css("--f-body")}`; g.textAlign="left";
    g.fillText(s.fill>0?L("Doluyor","Filling"):s.fill<0?L("Boşalıyor","Emptying"):L("Durdu","Held"),cx+40,H-18);
    g.fillStyle=css("--muted"); g.font=`13px ${css("--f-body")}`; g.textAlign="center"; g.fillText(L("kesik çizgi: en büyük hacim","dashed line: maximum volume"),cx,14);
  }},
  daily:{tr:"[Örnek] Günlük hayattan, döngüyle ilgili kısa bir örnek.",en:"[Example] A short everyday example about the cycle."},
  tasks:{tr:["Döngü hızını 24'e çıkarın. Bir döngü kaç saniye sürüyor?","Genliği küçültün. Çizim ve grafik nasıl değişti?","“Döngüyü durdur”u açın ve sayacı izleyin."],
         en:["Raise the cycle rate to 24. How many seconds does one cycle last?","Reduce the amplitude. How did the drawing and the chart change?","Switch on “Hold the cycle” and watch the counter."]},
  note:()=>L(`<p>[Örnek ders notu.] Döngü süresi = 60 / dakikadaki döngü sayısı.</p>`+EXNOTE(),`<p>[Example lecture note.] Cycle duration = 60 / cycles per minute.</p>`+EXNOTE())
};

/* ÖRNEK 4 · 24 SAAT: saat ekseni, saat göstergesi, günü oynat
   EXAMPLE 4 · 24 HOURS: hour axis, clock, play the day */
M.ornek4={
  tab:{tr:"Örnek 4: 24 saat",en:"Example 4: 24 hours"},
  eyebrow:{tr:"Örnek · 24 saatlik eksen",en:"Example · 24-hour axis"},
  title:{tr:"Günlük ritim",en:"Daily rhythm"},
  sub:{tr:"İki değer gün içinde ters yönde değişir. Grafiğin yatay ekseni saattir.",en:"Two values change in opposite directions during the day. The horizontal axis of the chart is the hour."},
  card:{tr:"Bloklar: 24 saatlik grafik ekseni, gece gölgesi, saat göstergesi ve “Günü oynat” (1 sn = 1 saat).",en:"Blocks: 24-hour chart axis, night shading, clock, and “Play the day” (1 s = 1 hour)."},
  init:()=>({h:8,a:0.5,b:0.5}),
  controls:[
    {type:"range",id:"hour",label:{tr:"Saat",en:"Time"},min:0,max:23.75,step:.25,value:8,show:v=>hm(v),ends:[{tr:"00:00",en:"00:00"},{tr:"24:00",en:"24:00"}],help:{tr:"Kaydırarak günün saatini seçin.",en:"Slide to choose the time of day."}},
    {type:"toggle",id:"play",label:{tr:"Günü oynat",en:"Play the day"},value:false,help:{tr:"Saat kendiliğinden ilerler (1 saniye = 1 saat).",en:"The clock runs by itself (1 second = 1 hour)."}},
    {type:"range",id:"peak",label:{tr:"A'nın tepe saati",en:"Peak time of A"},min:0,max:23,step:1,value:8,show:v=>hm(v),ends:[{tr:"00:00",en:"00:00"},{tr:"23:00",en:"23:00"}],help:{tr:"A değerinin en yüksek olduğu saat.",en:"The hour when value A is highest."}}
  ],
  chart:{day:true,night:[[0,6],[22,24]]},
  dayVals(h,c){ const k=Math.cos(2*Math.PI*(h-c.peak)/24); return {a:0.5+0.5*k, b:0.5-0.5*k}; },
  step(s,dt,c){
    if(c.play){ c.hour=(c.hour+dt)%24; const r=document.getElementById("c-hour"); if(r) r.value=c.hour; const o=document.getElementById("o-hour"); if(o) o.textContent=hm(c.hour); }
    s.h=c.hour; Object.assign(s,M.ornek4.dayVals(s.h,c));
  },
  rows:s=>[[
    {l:L("Saat","Time"),s:L("günün saati","time of day"),v:s.h/24,c:"--navy",fmt:()=>hm(s.h)},
    {l:L("Değer A","Value A"),s:L("en yüksek değerin yüzdesi","percent of maximum"),v:s.a,c:"--h3",fmt:()=>pct(s.a)},
    {l:L("Değer B","Value B"),s:L("en yüksek değerin yüzdesi","percent of maximum"),v:s.b,c:"--h5",fmt:()=>pct(s.b)}
  ]],
  fb:()=>null,
  series:[
    {k:"a",n:{tr:"Değer A",en:"Value A"},c:"--h3",min:0,max:1,primary:true,axis:v=>pct(v)},
    {k:"b",n:{tr:"Değer B",en:"Value B"},c:"--h5",min:0,max:1}
  ],
  now(s,c){
    const night=s.h<6||s.h>=22;
    return [tg(night?"Gece":"Gündüz",night?"Night":"Day")+L(`Saat ${hm(s.h)}: A ${pct(s.a)}, B ${pct(s.b)}.`,`At ${hm(s.h)}: A ${pct(s.a)}, B ${pct(s.b)}.`)];
  },
  visual:s=>blocks(B.clock(s.h,(s.h<6||s.h>=22)?{tr:"Gece",en:"Night"}:{tr:"Gündüz",en:"Day"})),
  daily:{tr:"[Örnek] Günlük ritimle ilgili kısa bir örnek.",en:"[Example] A short example about the daily rhythm."},
  tasks:{tr:["Saati A'nın tepe saatine getirin. B kaçta?","“Günü oynat”ı açın ve 24 saniye izleyin.","Tepe saatini değiştirin. Eğriler nasıl kaydı?"],
         en:["Set the time to A's peak time. What is B?","Switch on “Play the day” and watch for 24 seconds.","Change the peak time. How did the curves shift?"]},
  note:()=>L(`<p>[Örnek ders notu.] Bu modülde grafik zamana göre değil, günün saatine göre çizilir.</p>`+EXNOTE(),`<p>[Example lecture note.] In this module the chart is drawn by time of day, not by elapsed time.</p>`+EXNOTE())
};
