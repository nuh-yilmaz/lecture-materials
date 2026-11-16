# Simulator template: build sources

Builds `Simulator Template.html` (the file saved in Drive: Lectures/Simulators).
The built file is not stored here. Guide: project doc `claude/simulator_template.md`.

## Build
    cd template-src
    python3 build.py        # writes "Simulator Template.html" in this folder

The page head and CSS come from `base/Sindirim_v2_base.html`. The parts are joined in this order:
`cfg.js`, `mods.js`, `quiz.js`, `engine2.js`, `frame.js` (script) and `body.html` (page body).
Build of 2026-11-16 (engine 2026-11m: TR | EN buttons inside the leaderboard and class summary box, which redraws at once; engine 2026-11l: config name SURUM renamed VERSION, same values; before it, engine 2026-11k: "Şimdi / Now" page `#now`, one QR per lecture; delayed-test reminder by calendar or e-mail; Ganong author order Barrett, Brooks, Barman, Yuan; needs Apps Script 2026-11k): 202,833 bytes, sha256 05ff5de258570d56d629223444b9c555fdb93232e5a497077807f20700926b73.
Previous build (engine 2026-11j: pre-test class summary for the projector, `#summary`; needs Apps Script 2026-11j): 190,670 bytes, sha256 f67c64d561621045297c9843ed23b941362495e387c2d3dc712cbef98ac66de9.
Previous build (engine 2026-11i: F1 remediation plan on the post-test key screen; CSS rule `.ctl{min-width:0} .ctl.wide .seg{width:auto}`): 184,244 bytes, sha256 3a2634e1ce59c049920f134cbd9d5dce0ca18b116a52789553ca133c14edaaed.
Older build (engine 2026-11h: M7 missions, story rounds, streak bonus): 182,347 bytes, sha256 0a33ac72c144c4f85394697357f9bfe4a8c6aa0f2147ff8cd254fcf7660f3dee.

## Tests (Node + Playwright; usage is in the first lines of each file)
Run everything: `bash tests/run_all.sh [out dir]`. It builds the template, makes the test copies (`tests/copies.py`: plain, midoff, midon, open, edit, whyedit, nopredict, one, mid4, flat, nomission, tries1, lateoff), starts a local server on port 8799 and prints one line per test (22 tests, 497 checks).
- `tests/tsmoke.js` (16): modules and layout, plain template.
- `tests/flow2.js` (57): test engine (mid-off and mid-on, scoring, Sheet columns); writes `posts.json` and `posts_open.json`.
- `tests/kflow.js` (36): mini-quiz rounds (#mid = round 1, #mid2, list of rounds, one round, 2026-11f data, story line); `tests/bflow.js` (26): one leaderboard per round (`#board1`, `#board2`, previous/next, reset per round, story and streak lines).
- `tests/tap.js` (20): tap ordering. `tests/conf.js` (18): confidence points, gift, scoring box.
- `tests/rem.js` (16): F1 remediation plan (engine 2026-11i): post-test only, ✗ and ~ topics only, TR/EN text, step 4 only with the delayed test.
- `tests/csum.js` (23): pre-test class summary `#summary` (engine 2026-11j): request, at least 5 students, topic % by item points and module, marks and order, items of another version left out, reset, "open module" at the prediction task, TR/EN, 390 px, no SHEET_URL.
- `tests/langsw.js` (20): TR | EN buttons inside the `#summary` and `#board` box (engine 2026-11m): the box covers the page switch, a switch redraws title, buttons and rows at once, one request, window start kept, one timer, Close, 390 px.
- `tests/now.js` (28): "Şimdi / Now" page (engine 2026-11k): next step order, round chips, started round first, delayed test, EN, 390 px, lecturer link, old links.
- `tests/laterem.js` (22): delayed-test reminder: calendar file and Google link (no code), e-mail checks and consent, message without code or scores, browser keeps only the date, test mode, late:false.
- `tests/gas_rem.js` (29): Apps Script 2026-11k reminders tab: storage without code, sorting, refused addresses, daily sending, quota, deletion, trigger, menu.
- `tests/cols.js` (8): item codes and part marks. `tests/m2.js` (24): M2 "predict first" box.
- `tests/m7.js` (42): M7 missions (engine 2026-11h): fix and organ kinds, locks, moves, stars, 3 tries, #mission- links, Sheet columns, switches, 390 px.
- `tests/gas_test.js` (33) with `posts.json`: runs `../apps-script/Code.gs` against a simulated Sheet (`tests/gasmock.js`).
- `tests/gas_items.js` (25): item analysis (500 students, 10, pooling, ties).
- `tests/gas_rounds.js` (26): Apps Script 2026-11g/h: one row per student and round, board `&test=midN`, streak bonus `&streak=1` (2026-11h), item analysis of a `-quiz` tab.
- `tests/gas_sum.js` (16): Apps Script 2026-11j: `?summary=<course>&test=pre&since=&ver=`; pre-test rows of this Version only, mean share per item, nothing below 5 students, no codes in the reply, other tabs refused.
- `tests/nosheet.js` (4), `tests/mob.js` (2), `tests/midcheck.js` (6): no-Sheet mode, 390 px width, mini-quiz author check (3 items per round, old flat list).
Serve the copies over local http, because localStorage is lost on reload for file://. Needs Python 3, Node and Playwright (Chromium).
