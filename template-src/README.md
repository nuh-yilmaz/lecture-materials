# Simulator template: build sources

Builds `Simulator Template.html` (the file saved in Drive: Lectures/Simulators).
The built file is not stored here. Guide: project doc `claude/simulator_template.md`.

## Build
    cd template-src
    python3 build.py        # writes "Simulator Template.html" in this folder

The page head and CSS come from `base/Sindirim_v2_base.html`. The parts are joined in this order:
`cfg.js`, `mods.js`, `quiz.js`, `engine2.js`, `frame.js` (script) and `body.html` (page body).
Build of 2026-11-23 (engine 2026-11r: mini-quiz round limit 1–30 rounds over all decks, was 1–10; Apps Script 2026-11o unchanged): 213,866 bytes, sha256 337e250c5fd2637a2b06d930f051f519580a7bed78241a99bfdb52a98be7f2e6.
Previous build of 2026-11-21 (engine 2026-11q: decks, rule 2.2: optional `DECKS` list, set at the end of the quiz part; one pre-test and post-test per deck, links `#pre1`, `#post1` …, class summary `#summary1` …, Sheet tabs `<COURSE>-d1` …; one mini-quiz numbering; delayed test over all decks, total = mean of the deck parts, tab `<COURSE>-late`; without `DECKS` the engine works as 2026-11p; Apps Script 2026-11o unchanged): 213,695 bytes, sha256 2b8821160e9b79cbaec38ff8883a434fb4ac1441b05de51623e37470cdb6ea99.
Previous build of 2026-11-17 (engine 2026-11p: author check, a console warning when a step of an order item repeats the question; there is no engine 2026-11o, that letter is the Apps Script fix of 2026-11-16): 205,147 bytes, sha256 01eb5bb37ad7109dc06b18f24b2348b9be273345a84669b2d7725c2fcfc69720.
Previous build of 2026-11-16 (engine 2026-11n: an open box redrawn by TR | EN shows its last reply at once; engine 2026-11m: TR | EN buttons inside the leaderboard and class summary box, which redraws at once; engine 2026-11l: config name SURUM renamed VERSION, same values; before it, engine 2026-11k: "Şimdi / Now" page `#now`, one QR per lecture; delayed-test reminder by calendar or e-mail; Ganong author order Barrett, Brooks, Barman, Yuan; needs Apps Script 2026-11k): 203,657 bytes, sha256 76e59981fb2d41d46e26b6992085a07e4a67a6a0fda0e9aaf166b9cc49c5b52c.
Previous build (engine 2026-11j: pre-test class summary for the projector, `#summary`; needs Apps Script 2026-11j): 190,670 bytes, sha256 f67c64d561621045297c9843ed23b941362495e387c2d3dc712cbef98ac66de9.
Previous build (engine 2026-11i: F1 remediation plan on the post-test key screen; CSS rule `.ctl{min-width:0} .ctl.wide .seg{width:auto}`): 184,244 bytes, sha256 3a2634e1ce59c049920f134cbd9d5dce0ca18b116a52789553ca133c14edaaed.
Older build (engine 2026-11h: M7 missions, story rounds, streak bonus): 182,347 bytes, sha256 0a33ac72c144c4f85394697357f9bfe4a8c6aa0f2147ff8cd254fcf7660f3dee.

## Tests (Node + Playwright; usage is in the first lines of each file)
Run everything: `bash tests/run_all.sh [out dir]`. It builds the template, makes the test copies (`tests/copies.py`: plain, midoff, midon, open, edit, whyedit, nopredict, one, mid4, flat, nomission, tries1, lateoff, ordrep, decks, decksbad, rounds26, rounds30, rounds31), starts a local server on port 8799 and prints one line per test (25 tests, 581 checks; ordrep added 2026-11-17, decks added 2026-11-21, rounds added 2026-11-23).
- `tests/tsmoke.js` (16): modules and layout, plain template.
- `tests/flow2.js` (57): test engine (mid-off and mid-on, scoring, Sheet columns); writes `posts.json` and `posts_open.json`.
- `tests/kflow.js` (36): mini-quiz rounds (#mid = round 1, #mid2, list of rounds, one round, 2026-11f data, story line); `tests/bflow.js` (26): one leaderboard per round (`#board1`, `#board2`, previous/next, reset per round, story and streak lines).
- `tests/tap.js` (20): tap ordering. `tests/conf.js` (18): confidence points, gift, scoring box.
- `tests/rem.js` (16): F1 remediation plan (engine 2026-11i): post-test only, ✗ and ~ topics only, TR/EN text, step 4 only with the delayed test.
- `tests/csum.js` (23): pre-test class summary `#summary` (engine 2026-11j): request, at least 5 students, topic % by item points and module, marks and order, items of another version left out, reset, "open module" at the prediction task, TR/EN, 390 px, no SHEET_URL.
- `tests/langsw.js` (25): TR | EN buttons inside the `#summary` and `#board` box (engines 2026-11m and -11n): the last reply is shown at once with a slow script, also in the default window, not after "Reset"; the box covers the page switch, a switch redraws title, buttons and rows at once, one request, window start kept, one timer, Close, 390 px.
- `tests/now.js` (28): "Şimdi / Now" page (engine 2026-11k): next step order, round chips, started round first, delayed test, EN, 390 px, lecturer link, old links.
- `tests/laterem.js` (22): delayed-test reminder: calendar file and Google link (no code), e-mail checks and consent, message without code or scores, browser keeps only the date, test mode, late:false.
- `tests/gas_rem.js` (32): Apps Script 2026-11k reminders tab: storage without code, sorting, refused addresses, daily sending, quota, deletion, trigger, menu.
- `tests/cols.js` (8): item codes and part marks. `tests/m2.js` (24): M2 "predict first" box.
- `tests/m7.js` (42): M7 missions (engine 2026-11h): fix and organ kinds, locks, moves, stars, 3 tries, #mission- links, Sheet columns, switches, 390 px.
- `tests/gas_test.js` (33) with `posts.json`: runs `../apps-script/Code.gs` against a simulated Sheet (`tests/gasmock.js`).
- `tests/gas_items.js` (25): item analysis (500 students, 10, pooling, ties).
- `tests/gas_rounds.js` (26): Apps Script 2026-11g/h: one row per student and round, board `&test=midN`, streak bonus `&streak=1` (2026-11h), item analysis of a `-quiz` tab.
- `tests/gas_sum.js` (16): Apps Script 2026-11j: `?summary=<course>&test=pre&since=&ver=`; pre-test rows of this Version only, mean share per item, nothing below 5 students, no codes in the reply, other tabs refused.
- `tests/decks.js` (49): decks (engine 2026-11q): mode buttons and Now page per deck, `#pre1`/`#post2` links (`#pre` = deck 1), one round numbering, a deck's rounds close after its post-test, gates, reminder box only after the last deck, tabs `-d1`/`-d2`/`-late`, M2 and M7 only with the last deck's post-test, delayed test of 12 items (total = mean of the parts; also when the last deck was missed), `#summary2`, `#board3`, EN, 390 px, reset, author check (`decksbad.html`).
- `tests/rounds.js` (20): mini-quiz round limit (engine 2026-11r): 26 rounds in 2 decks (12 + 14) and 30 rounds pass the author check, 31 are reported; Now page chips per deck, list of rounds, `#mid13`, `#mid26`, `#mid27`, round 26 sent as `mid26`, `#board26` and `#board13`, previous round, deck 1 rounds close after post-test 1; 390 px without sideways scroll.
- `tests/ordrep.js` (7): author check of engine 2026-11p: no warning for the template; a question that names a step gives one warning (item, language, step, how to fix); English unchanged; the page still runs.
- `tests/nosheet.js` (4), `tests/mob.js` (2), `tests/midcheck.js` (6): no-Sheet mode, 390 px width, mini-quiz author check (3 items per round, old flat list).
Serve the copies over local http, because localStorage is lost on reload for file://. Needs Python 3, Node and Playwright (Chromium).
