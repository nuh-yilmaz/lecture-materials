"""Build 'Simulator Template.html' from Sindirim Simülatörü_v2.html (CSS + test engine) and the parts in this folder."""
import os
W = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(W, "base", "Sindirim_v2_base.html")
s = open(SRC, encoding="utf8").read()
rd = lambda n: open(os.path.join(W, n), encoding="utf8").read()

css = s[s.index("<style>") + 7: s.index("</style></head>")]
for drop in [".cup{", ".cup i{", ".gland{"]:
    i = css.index(drop); css = css[:i] + css[css.index("\n", i) + 1:]
css = css.replace("/* Sindirim simülatörü ekleri / additions */", "/* Ekler / additions */")
css += """
/* Bloklar / blocks (template 2026-11) */
.ctl.wide{grid-column:1/-1}
.ctl .seg{width:max-content;max-width:100%;flex-wrap:wrap}
.ctl{min-width:0} .ctl.wide .seg{width:auto}   /* long preset rows wrap on a 390 px phone (as in the Unit I simulator) */
.drawbox{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px}
.drawbox canvas{width:100%;height:260px;display:block}
.blocks{display:grid;gap:16px}
.gauge{display:grid;justify-items:center;gap:2px}
.gauge svg{width:180px;max-width:100%;height:auto;display:block}
.gauge .gv{font-family:var(--f-mono);font-size:22px;font-weight:700;color:var(--navy);margin-top:-6px}
.gauge small{color:var(--muted);font-size:13px}
.eqbox{display:grid;gap:4px;padding:12px 14px;border-radius:12px;background:var(--surface-2)}
.eqbox .eqf{font-family:var(--f-mono);font-size:20px;font-weight:700;color:var(--navy)}
.eqbox .eqn{font-family:var(--f-mono);font-size:15px}
.eqbox small{color:var(--muted);font-size:13px}
"""
eng = rd("engine2.js")
css += """
/* Test 2026-11d */
.filltext{line-height:2.2;margin:4px 0 0}
.fblank{display:inline-block;margin:0 4px;border-radius:8px;padding:0 2px}
.fblank select{font:inherit;padding:4px 6px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);max-width:100%}
.fblank.right{outline:2px solid var(--ok)} .fblank.wrong{outline:2px solid var(--signal)}
.conf{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:10px;font-size:14px;color:var(--muted)}
.conf label{display:inline-flex;gap:4px;align-items:center;color:var(--ink)}
.topics{margin-top:12px;padding:12px;border-radius:10px;background:var(--surface-2)}
.topics ul{list-style:none;margin:8px 0;padding:0;display:grid;gap:4px}
.topics small{color:var(--muted)}
.tm{display:inline-block;width:1.6em;text-align:center;font-weight:700}
.tm.ok{color:var(--ok)} .tm.mid{color:var(--warn)} .tm.bad{color:var(--signal)}
.remplan{margin-top:12px;padding:12px;border-radius:10px;border:1px solid var(--line)}
.remplan p{margin:6px 0} .remplan ol{margin:6px 0 0;padding-left:1.4em;display:grid;gap:4px}
.surewrong{margin-top:10px;font-weight:700;color:var(--signal)}
.selfpts{margin:8px 0 0;font-weight:700;color:var(--muted)}
.fbform{margin-top:14px;padding:12px;border-radius:10px;border:1px solid var(--line);display:grid;gap:10px}
.fbform small{color:var(--muted)}
.likert{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.likert .lk{display:flex;gap:10px}
.likert .lk label{display:inline-flex;gap:3px;align-items:center}
.fbform textarea{width:100%;font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink)}
.mp{font-weight:700;font-size:15px}
.testmode{color:var(--signal);font-weight:700;margin:0 0 6px}
.progline{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-weight:700}
.progline select{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink)}
.progline.need select{outline:2px solid var(--signal)}
.kq .kh{margin:0 0 6px}
.khead{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-weight:700;color:var(--muted);font-size:14px}
.ktime{font-family:var(--f-mono);font-size:26px;color:var(--navy);min-width:2ch;text-align:right}
.kbar{height:8px;border-radius:99px;background:var(--surface-2);overflow:hidden;margin:6px 0 12px}
.kbar i{display:block;height:100%;width:100%;background:var(--navy);transition:width .1s linear}
.kstem{font-size:19px;font-weight:700;margin:0 0 12px}
.kstmt{font-size:18px;margin:0 0 12px}
.kblank{display:inline-block;min-width:3ch;border-bottom:3px solid var(--navy);text-align:center}
.kopts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.kopts .kopt{font:inherit;font-size:17px;text-align:left;padding:16px 14px;min-height:64px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}
.kopts .kopt:hover,.kopts .kopt:focus-visible{border-color:var(--navy)}
.kopts .kopt b{display:inline-block;min-width:1.6em;color:var(--navy)}
.kres{font-size:20px;font-weight:700}
.kres.ok{color:var(--ok)} .kres.bad{color:var(--signal)}
.kbig{font-size:28px;font-weight:700;color:var(--navy);margin:6px 0}
.klist{list-style:none;padding:0;margin:8px 0;display:grid;gap:4px}
.kboard{font-weight:700}
.kboard .code{white-space:nowrap}
#board{position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;padding:24px 16px}
body.boardon{overflow:hidden}
#board .bwrap{max-width:900px;margin:0 auto}
#board .bhead{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
#board h2{margin:0;font-size:clamp(24px,4vw,40px);color:var(--navy)}
#board .bbtn{display:flex;gap:8px}
#board .bcount{font-size:20px;color:var(--muted);margin:10px 0 18px}
#board .blist{list-style:none;padding:0;margin:0;display:grid;gap:12px}
#board .blist li{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding:14px 20px;border-radius:14px;background:var(--surface);border:2px solid var(--line);font-size:clamp(22px,3.4vw,36px)}
#board .blist li.r1{border-color:var(--navy);border-width:3px}
#board .brank{font-weight:800;color:var(--navy);min-width:1.4em}
#board .balias{font-family:var(--f-mono);font-weight:700;letter-spacing:.04em}
#board .bpts{font-weight:700}
#board .bempty{display:block;font-size:20px;color:var(--muted)}
#board .bnote{color:var(--muted);margin-top:16px}
#board .bitems{font-size:18px;font-weight:700;margin-top:18px}
/* M2 predict first (2026-11f) */
.predict{background:var(--surface);border:2px solid var(--navy);border-radius:var(--r);padding:14px;display:grid;gap:8px;margin-bottom:12px}
.predict .phead small{color:var(--muted)}
.predict .pq{margin:0;font-weight:700}
.popts{display:flex;flex-wrap:wrap;gap:8px}
.popts label{display:inline-flex;gap:6px;align-items:center;min-height:44px;padding:8px 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);cursor:pointer;font-weight:600}
.popts label:has(input:checked){border-color:var(--navy);outline:2px solid var(--navy)}
.pbtns{display:flex;flex-wrap:wrap;gap:8px}
.predict .pnote{color:var(--muted)}
.predict .pres{margin:0} .predict .pwhy{margin:0;color:var(--ink)}
/* M7 missions, story rounds (2026-11h) */
.mission{border-color:var(--ok)}
.mission .m7story{margin:0}
.mission .m7rule{margin:0;font-size:15px;color:var(--muted)}
.mission .m7news{margin:0;padding:8px 12px;border-radius:10px;background:color-mix(in srgb,var(--warn) 14%,var(--surface));font-weight:600}
.mission .m7live{font-family:var(--f-mono);font-size:14px;display:grid;gap:6px}
.m7chip{display:inline-block;padding:3px 10px;border-radius:999px;border:1px solid var(--line);font-weight:700}
.m7chip.ok{border-color:var(--ok);color:var(--ok)} .m7chip.bad{border-color:var(--signal);color:var(--signal)}
.mission .m7ask{padding:10px 12px;border-radius:10px;background:var(--surface-2);display:grid;gap:8px}
.mission .m7ask p{margin:0;font-weight:700}
.mission .mres{display:grid;gap:6px} .mission .mres p{margin:0}
.mission .m7big{font-size:18px;font-weight:700}
.m7stars{color:var(--warn);letter-spacing:2px;font-size:20px;white-space:nowrap}
.mission .m7meta{margin:0}
.ctl.m7lock{opacity:.55}
.kstory{margin:0 0 6px;font-style:italic;color:var(--muted)}
#board .bstory{font-size:20px;font-style:italic;margin:4px 0 10px}
/* Test 2026-11f: scoring box, total line */
.scorebox{border:2px solid var(--navy);background:color-mix(in srgb,var(--navy) 9%,var(--surface));font-weight:600;font-size:15px;line-height:1.5}
.score .tparts{color:var(--muted);font-size:15px;font-weight:600;white-space:nowrap}
.score .tnote{color:var(--muted);font-size:14px}
/* Test 2026-11f: tap ordering */
.ordhint{margin:2px 0 8px;font-size:14px;color:var(--muted)}
.tapord{display:grid;gap:8px}
.tstep{display:grid;grid-template-columns:36px minmax(0,1fr);gap:10px;align-items:center;width:100%;min-height:48px;padding:8px 10px;font:inherit;text-align:left;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:10px;cursor:pointer;touch-action:manipulation}
.tstep:hover{border-color:var(--navy)}
.tstep:focus-visible{outline:3px solid var(--navy);outline-offset:2px}
.tstep[aria-pressed="true"]{border-color:var(--navy);background:var(--surface-2)}
.tnum{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:2px dashed var(--line);font-family:var(--f-mono);font-weight:700;color:var(--navy)}
.tstep[aria-pressed="true"] .tnum,.tnum.on{border:2px solid var(--navy);background:var(--navy);color:var(--surface)}
.ordrow .tnum{width:28px;height:28px}
.ordbar{margin-top:8px}
@media (max-width:520px){.kopts{grid-template-columns:1fr}}
@media (max-width:640px){.likert{grid-template-columns:1fr}}
"""

out = ("<!DOCTYPE html>\n<!-- Simülatör şablonu / Simulator template 2026-11: how-to notes are at the top of the <script> below -->\n"
       '<html lang="tr"><head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       "<title>Simülatör Şablonu</title>\n"
       + s[s.index('<link rel="preconnect"'): s.index("<style>")]
       + "<style>" + css + "</style></head><body>\n" + rd("body.html")
       + '\n<script>\n(function(){\n"use strict";\n' + rd("cfg.js") + "\n" + rd("mods.js") + "\n" + rd("quiz.js") + "\n" + eng + rd("frame.js")
       + "\n</script>\n</body></html>\n")
open(os.path.join(W, "Simulator Template.html"), "w", encoding="utf8").write(out)
print(len(out), "chars")
