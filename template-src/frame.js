
/* ---------------- ÇERÇEVE / FRAME (normally unchanged) ---------------- */
let cur=null, S=null, C=null, hist=[], simT=0, speed=1, paused=false, last=0, uiAcc=0, view="giris";
function staticText(){
  document.documentElement.lang=LANG; document.title=t(UI.title);
  document.querySelectorAll("[data-i]").forEach(el=>{el.textContent=t(UI[el.dataset.i]);});
  document.querySelectorAll("[data-ih]").forEach(el=>{el.innerHTML=t(UI[el.dataset.ih]);});
  document.querySelectorAll("[data-ia]").forEach(el=>{el.setAttribute("aria-label",t(UI[el.dataset.ia]));});
  $("#b-pause").textContent=paused?t(UI.resume):t(UI.pause);
  $("#gofirst").dataset.go=ORDER[0];
  document.querySelectorAll("#lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===LANG));
  const TABS=[["giris",t(UI.tabStart)],...ORDER.map(k=>[k,t(M[k].tab)]),["test",t(UI.tabTest)]];
  $("#tabs").innerHTML=TABS.map(([k,n])=>`<button type="button" role="tab" id="t-${k}" data-go="${k}" aria-selected="${k===view}">${n}</button>`).join("");
  $("#modgrid").innerHTML=ORDER.map(k=>`<button type="button" class="modcard" data-go="${k}"><em>${t(M[k].eyebrow)}</em><strong>${t(M[k].title)}</strong><span>${t(M[k].card)}</span></button>`).join("");
}
function ctlDefaults(m){const c={};m.controls.forEach(k=>{if(k.type!=="button") c[k.id]=k.value;}); return c;}
function unPreset(m,id){ m.controls.forEach(p=>{ if(p.type!=="preset"||C[p.id]<0) return; const o=p.options[C[p.id]]; if(o&&o.set&&id in o.set){ C[p.id]=-1; document.querySelectorAll(`#c-${p.id} button`).forEach(b=>b.setAttribute("aria-pressed","false")); } }); }
function buildControls(m){
  const box=$("#m-controls");
  box.innerHTML=m.controls.map(k=>{
    const help=t(k.help)?`<small>${t(k.help)}</small>`:"";
    if(k.type==="range") return `<div class="ctl"><label for="c-${k.id}">${t(k.label)}${k.show?`: <output id="o-${k.id}">${k.show(C[k.id])}</output>`:""}</label><input type="range" id="c-${k.id}" min="${k.min}" max="${k.max}" step="${k.step}" value="${C[k.id]}"><div class="ends"><span>${t(k.ends[0])}</span><span>${t(k.ends[1])}</span></div>${help}</div>`;
    if(k.type==="toggle") return `<div class="ctl"><label class="switch" for="c-${k.id}"><input type="checkbox" role="switch" id="c-${k.id}" ${C[k.id]?"checked":""}><span>${t(k.label)}</span></label>${help}</div>`;
    if(k.type==="preset") return `<div class="ctl wide"><span class="lab" id="lb-${k.id}">${t(k.label)}</span><div class="seg" role="group" id="c-${k.id}" aria-labelledby="lb-${k.id}">${k.options.map((o,i)=>`<button type="button" data-pi="${i}" aria-pressed="${C[k.id]===i}">${t(o.label)}</button>`).join("")}</div>${help}</div>`;
    return `<div class="ctl"><button class="btn" type="button" id="c-${k.id}">${t(k.label)}</button>${help}</div>`;
  }).join("");
  m.controls.forEach(k=>{
    const el=document.getElementById("c-"+k.id);
    if(k.type==="range"){ el.addEventListener("input",()=>{C[k.id]=+el.value; const o=document.getElementById("o-"+k.id); if(o) o.textContent=k.show(C[k.id]); unPreset(m,k.id); uiTick(true);}); el.addEventListener("change",()=>missionMove(k.id)); }
    else if(k.type==="toggle") el.addEventListener("change",()=>{C[k.id]=el.checked; unPreset(m,k.id); missionMove(k.id); uiTick(true);});
    else if(k.type==="preset") el.addEventListener("click",e=>{const b=e.target.closest("[data-pi]"); if(!b) return; const i=+b.dataset.pi, o=k.options[i]; C[k.id]=i; Object.assign(C,o.set||{}); if(o.act) o.act(S,C); buildControls(m); const nb=document.querySelector(`#c-${k.id} [data-pi="${i}"]`); if(nb) nb.focus(); uiTick(true);});
    else el.addEventListener("click",()=>{k.act(S,C); missionMove(k.id); uiTick(true);});
  });
  missionLockUI();   // M7: locked controls during a mission try
}
function modText(){
  const m=M[cur];
  $("#m-eyebrow").textContent=t(m.eyebrow); $("#m-title").textContent=t(m.title); $("#m-sub").textContent=t(m.sub);
  $("#m-daily").innerHTML=`<b>${t(UI.daily)}</b> `+t(m.daily);
  $("#m-tasks").innerHTML=t(m.tasks).map(x=>`<li><span>${x}</span></li>`).join("");
  $("#m-note").innerHTML=m.note();
  $("#m-legend").innerHTML=m.series.map(s=>`<span><i style="background:var(${s.c})"></i>${t(s.n)}: <span class="v" id="lv-${s.k}">–</span></span>`).join("");
  $("#m-chartbox").hidden=!m.series.length;
  $("#m-drawbox").hidden=!m.draw; if(m.draw) $("#draw").style.height=(m.draw.h||260)+"px";
  lastNowHTML=""; renderPredict(); renderMission();
}
function open(key){
  missionLeave();   // M7: leaving or reopening a module ends a running try (it counts as 0★)
  const mm=/^mission-(.+)$/.exec(key); if(mm&&M[mm[1]]){ open(mm[1]); try{ history.replaceState(null,"","#"+key); }catch(e){} const b=$("#m-mission"); if(b&&!b.hidden){ b.tabIndex=-1; b.scrollIntoView({block:"start"}); b.focus({preventScroll:true}); } return; }   // #mission-<module>
  const bm=/^board(\d*)$/.exec(key); if(bm){ showBoard(bm[1]?+bm[1]:1); return; }   // leaderboard for the projector: #board1, #board2 … (#board = round 1)
  const km=/^mid(\d*)$/.exec(key);
  if(MODES.includes("mid")&&(km||key==="mini")){ qmode="mid"; kr=key==="mini"?(NR===1?1:0):km[1]?+km[1]:1; if(kr>NR) kr=0; renderModes(); key="test"; }   // #mid1, #mid2 … (#mid = round 1); #mini = list of rounds
  else if(MODES.includes(key)){ qmode=key; renderModes(); key="test"; }   // QR links: #pre, #post, #late
  if(!M[key]&&key!=="giris"&&key!=="test") key="giris";
  view=key;
  document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.go===key));
  const tb=document.getElementById("t-"+key); if(tb) tb.scrollIntoView({block:"nearest",inline:"nearest"});
  $("#v-giris").hidden=key!=="giris"; $("#v-test").hidden=key!=="test"; $("#v-mod").hidden=!M[key];
  try{ const h=key==="test"?hashOf():key; if(location.hash.slice(1)!==h) history.replaceState(null,"","#"+h); }catch(e){}   // the test tab keeps its mode in the address (#pre, #mid2…), so a reload returns to it
  if(key==="test"){ renderQuiz(); } else testNote();
  if(!M[key]){ cur=null; return; }
  cur=key; modText(); reset();
}
function reset(){ if(MR){ missionLeave(); renderMission(); } const m=M[cur]; S=m.init(); C=ctlDefaults(m); hist=[]; simT=0; buildControls(m); for(let i=0;i<3;i++) m.step(S,0.05,C); uiTick(true); }
function setLang(l){
  LANG=l; store.set(PFX+"-lang",l); staticText(); renderModes(); testNote();
  if(cur){ modText(); buildControls(M[cur]); uiTick(true); }
  if(view==="test") renderQuiz();
}

function nodeHTML(n){
  const w=cl(n.v,0,1)*100; const val=n.fmt?n.fmt(n.v):pct(n.v);
  return `<div class="node"><div class="nl">${n.l}</div><div class="ns">${n.s}</div><div class="nv${n.small?" sm":""}" style="color:var(${n.c})">${val}</div><div class="meter"><i style="width:${w}%;background:var(${n.c})"></i></div></div>`;
}
let lastNowHTML="";
function uiTick(force){
  if(!cur) return; const m=M[cur];
  $("#m-path").innerHTML=m.rows(S,C).map(r=>`<div class="prow">${r.map(nodeHTML).join('<div class="arrow" aria-hidden="true">→</div>')}</div>`).join("");
  const fb=m.fb(S,C); const fbEl=$("#m-fb");
  if(fb){ fbEl.innerHTML=`<div class="fb ${fb.on?"on":"off"} ${fb.kind}"><span class="dot" style="opacity:${fb.on?0.35+0.65*cl(fb.strength,0,1):1}"></span><span>${fb.text}</span></div>`; } else fbEl.innerHTML="";
  const nh=m.now(S,C).map(p=>`<p>${p}</p>`).join(""); if(nh!==lastNowHTML){$("#m-now").innerHTML=nh; lastNowHTML=nh;}
  $("#m-visual").innerHTML=m.visual?m.visual(S,C):"";
  m.series.forEach(s=>{const el=document.getElementById("lv-"+s.k); if(!el) return; const v=S[s.k]; if(v==null) return; el.textContent=s.fmt?s.fmt(v):pct(v);});
}

/* ---------------- GRAFİK / CHART ---------------- */
const cv=$("#chart"), ctx=cv.getContext("2d");
const winOf=m=>(m.chart&&m.chart.win)||60;
function fitCanvas(c,g){ const dpr=window.devicePixelRatio||1, W=c.clientWidth, H=c.clientHeight; if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);} g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,W,H); return [W,H]; }
function drawChart(){
  if(!cur) return; const m=M[cur]; if(!m.series.length) return;
  const [W,H]=fitCanvas(cv,ctx);
  const padL=46,padR=10,padT=10,padB=26, pw=W-padL-padR, ph=H-padT-padB;
  const ink=css("--muted"), grid=css("--grid"), band=css("--band");
  ctx.font=`12px ${css("--f-mono")}`; ctx.fillStyle=ink; ctx.strokeStyle=grid; ctx.lineWidth=1;
  const P=m.series.find(s=>s.primary)||m.series[0];
  const y=(s,v)=>padT+ph-(cl((v-s.min)/(s.max-s.min),0,1))*ph;
  const day=m.chart&&m.chart.day;
  if(day){ const xd=h=>padL+(h/24)*pw; ctx.fillStyle=grid; (m.chart.night||[]).forEach(([a,b])=>ctx.fillRect(xd(a),padT,xd(b)-xd(a),ph)); }
  m7Zones(m).forEach(z=>{ const y1=y(z.s,z.hi), y0=y(z.s,z.lo); ctx.fillStyle=css("--ok"); ctx.globalAlpha=.16; ctx.fillRect(padL,y1,pw,y0-y1); ctx.globalAlpha=.9; ctx.strokeStyle=css("--ok"); ctx.lineWidth=1.5; ctx.setLineDash([6,4]); [y1,y0].forEach(yy=>{ ctx.beginPath(); ctx.moveTo(padL,yy); ctx.lineTo(padL+pw,yy); ctx.stroke(); }); ctx.setLineDash([]); ctx.globalAlpha=1; ctx.lineWidth=1; });   // M7 goal zone
  if(P.band){ ctx.fillStyle=band; const y1=y(P,P.band[1]), y0=y(P,P.band[0]); ctx.fillRect(padL,y1,pw,y0-y1); ctx.fillStyle=ink; ctx.textAlign="right"; ctx.fillText(t(P.bandLabel)||t(UI.normal),padL+pw-4,y1+13); }
  ctx.textAlign="right"; ctx.textBaseline="middle";
  for(let i=0;i<=4;i++){ const v=P.min+(P.max-P.min)*i/4, yy=y(P,v); ctx.strokeStyle=grid; ctx.beginPath(); ctx.moveTo(padL,yy); ctx.lineTo(padL+pw,yy); ctx.stroke(); const lab=P.axis?P.axis(v):""; if(lab!==""){ctx.fillStyle=ink; ctx.fillText(lab,padL-6,yy);} }
  ctx.textBaseline="alphabetic";
  if(P.refs){ P.refs.forEach(r=>{ const yy=y(P,r.v); ctx.strokeStyle=css("--ink"); ctx.globalAlpha=.55; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(padL,yy); ctx.lineTo(padL+pw,yy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1; ctx.fillStyle=ink; ctx.textAlign="left"; ctx.fillText(t(r.l),padL+6,yy-5); }); }
  ctx.textAlign="center"; ctx.fillStyle=ink;
  if(day){   // 24-hour axis: whole-day curves from m.dayVals, marker at the current hour
    const x=h=>padL+(h/24)*pw;
    for(let h=0;h<=24;h+=6){ ctx.textAlign=h===24?"right":(h===0?"left":"center"); ctx.fillText(String(h%24).padStart(2,"0")+":00",x(h),H-8); }
    if((m.chart.night||[]).length){ ctx.textAlign="left"; ctx.fillText(t(UI.night),x(m.chart.night[0][0])+4,padT+14); }
    m.series.forEach(s=>{ ctx.strokeStyle=css(s.c); ctx.lineWidth=s.primary?3:2; ctx.beginPath(); for(let i=0;i<=192;i++){ const h=i/8, v=m.dayVals(h,C)[s.k], xx=x(h), yy=y(s,v); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);} ctx.stroke(); });
    const xh=x(S.h); ctx.strokeStyle=css("--ink"); ctx.lineWidth=1.5; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(xh,padT); ctx.lineTo(xh,padT+ph); ctx.stroke(); ctx.setLineDash([]);
    m.series.forEach(s=>{ ctx.fillStyle=css(s.c); ctx.beginPath(); ctx.arc(xh,y(s,S[s.k]),s.primary?4.5:3.5,0,7); ctx.fill(); });
    return;
  }
  const WIN=winOf(m), stepL=WIN<=20?5:WIN<=40?10:15, t1=Math.max(simT,WIN), t0=t1-WIN, x=tt=>padL+((tt-t0)/WIN)*pw;
  const every=pw<340?2:1;   // narrow screens: fewer time labels
  for(let s=0,i=0;s<=WIN;s+=stepL,i++){ if(s!==WIN&&i%every) continue; ctx.textAlign=s===WIN?"right":(s===0?"left":"center"); ctx.fillText((s===WIN?t(UI.nowLbl):"−"+(WIN-s)+" "+t(UI.sec)),padL+(s/WIN)*pw,H-8); } ctx.textAlign="center";
  m.series.forEach(s=>{
    ctx.strokeStyle=css(s.c); ctx.lineWidth=s.primary?3:2; ctx.beginPath(); let st=false;
    for(const p of hist){ if(p.t<t0) continue; const xx=x(p.t), yy=y(s,p[s.k]); st?ctx.lineTo(xx,yy):(ctx.moveTo(xx,yy),st=true); }
    ctx.stroke();
    const lp=hist[hist.length-1]; if(lp){ ctx.fillStyle=css(s.c); ctx.beginPath(); ctx.arc(x(lp.t),y(s,lp[s.k]),s.primary?4.5:3.5,0,7); ctx.fill(); }
  });
}
/* ---------------- ÇİZİM ALANI / DRAWING AREA ---------------- */
const dv=$("#draw"), dctx=dv.getContext("2d");
function drawPanel(){ if(!cur) return; const m=M[cur]; if(!m.draw) return; const [W,H]=fitCanvas(dv,dctx); dctx.save(); m.draw.fn(dctx,W,H,S,C); dctx.restore(); }

/* ---------------- DÖNGÜ / LOOP ---------------- */
function loop(ts){
  const dtReal=last?Math.min(0.1,(ts-last)/1000):0; last=ts;
  if(cur&&!paused&&!(MR&&MR.wait)){   // an organ mission waits for the student's choice
    const m=M[cur]; let dt=dtReal*speed; const n=Math.max(1,Math.ceil(dt/0.05));
    for(let i=0;i<n;i++){ m.step(S,dt/n,C); simT+=dt/n; if(MR){ missionTick(dt/n); if(!MR||MR.wait) break; } }
    if(!(m.chart&&m.chart.day)){ const p={t:simT}; m.series.forEach(s=>p[s.k]=S[s.k]); hist.push(p); const W=winOf(m); while(hist.length&&hist[0].t<simT-W-2) hist.shift(); }
    uiAcc+=dtReal; if(uiAcc>0.15){uiAcc=0; uiTick();}
  }
  drawChart(); drawPanel();
  requestAnimationFrame(loop);
}
$("#b-pause").onclick=()=>{paused=!paused; $("#b-pause").textContent=paused?t(UI.resume):t(UI.pause);};
$("#b-reset").onclick=()=>reset();
document.querySelectorAll("#speed button").forEach(b=>b.onclick=()=>{speed=+b.dataset.s; document.querySelectorAll("#speed button").forEach(x=>x.setAttribute("aria-pressed",x===b));});
document.querySelectorAll("#lang button").forEach(b=>b.onclick=()=>setLang(b.dataset.l));
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]"); if(!g) return; e.preventDefault(); if(g.dataset.mode&&MODES.includes(g.dataset.mode)){qmode=g.dataset.mode; renderModes();} open(g.dataset.go); window.scrollTo({top:0});});
window.addEventListener("hashchange",()=>open(location.hash.slice(1)));
staticText();
open(location.hash.slice(1)||"giris");
requestAnimationFrame(loop);
})();
