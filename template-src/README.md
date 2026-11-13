# Simulator template: build sources

Builds `Simulator Template.html` (the file saved in Drive: Lectures/Simulators).
The built file is not stored here. Guide: project doc `claude/simulator_template.md`.

## Build
    cd template-src
    python3 build.py        # writes "Simulator Template.html" in this folder

The page head and CSS come from `base/Sindirim_v2_base.html`. The parts are joined in this order:
`cfg.js`, `mods.js`, `quiz.js`, `engine2.js`, `frame.js` (script) and `body.html` (page body).
Build of 2026-11-13 (engine 2026-11i: F1 remediation plan on the post-test key screen): 184,244 bytes, sha256 3a2634e1ce59c049920f134cbd9d5dce0ca18b116a52789553ca133c14edaaed. Also: CSS rule `.ctl{min-width:0} .ctl.wide .seg{width:auto}` (long preset rows wrap on a 390 px phone).
Previous build (engine 2026-11h: M7 missions, story rounds, streak bonus): 182,347 bytes, sha256 0a33ac72c144c4f85394697357f9bfe4a8c6aa0f2147ff8cd254fcf7660f3dee.
Older build (engine 2026-11g): 158,244 bytes, sha256 ce657c346000925f7301188488196faee3c9514b55c2ac479cc623eb9fe594de.

## Tests (Node + Playwright; usage is in the first lines of each file)
Run everything: `bash tests/run_all.sh [out dir]`. It builds the template, makes the test copies (`tests/copies.py`: plain, midoff, midon, open, edit, whyedit, nopredict, one, mid4, flat, nomission, tries1, lateoff), starts a local server on port 8799 and prints one line per test (16 tests, 359 checks).
- `tests/tsmoke.js` (16): modules and layout, plain template.
- `tests/flow2.js` (57): test engine (mid-off and mid-on, scoring, Sheet columns); writes `posts.json` and `posts_open.json`.
- `tests/kflow.js` (36): mini-quiz rounds (#mid = round 1, #mid2, list of rounds, one round, 2026-11f data, story line); `tests/bflow.js` (26): one leaderboard per round (`#board1`, `#board2`, previous/next, reset per round, story and streak lines).
- `tests/tap.js` (20): tap ordering. `tests/conf.js` (18): confidence points, gift, scoring box.
- `tests/rem.js` (16): F1 remediation plan (engine 2026-11i): post-test only, ✗ and ~ topics only, TR/EN text, step 4 only with the delayed test.
- `tests/cols.js` (8): item codes and part marks. `tests/m2.js` (24): M2 "predict first" box.
- `tests/m7.js` (42): M7 missions (engine 2026-11h): fix and organ kinds, locks, moves, stars, 3 tries, #mission- links, Sheet columns, switches, 390 px.
- `tests/gas_test.js` (33) with `posts.json`: runs `../apps-script/Code.gs` against a simulated Sheet (`tests/gasmock.js`).
- `tests/gas_items.js` (25): item analysis (500 students, 10, pooling, ties).
- `tests/gas_rounds.js` (26): Apps Script 2026-11g/h: one row per student and round, board `&test=midN`, streak bonus `&streak=1` (2026-11h), item analysis of a `-quiz` tab.
- `tests/nosheet.js` (4), `tests/mob.js` (2), `tests/midcheck.js` (6): no-Sheet mode, 390 px width, mini-quiz author check (3 items per round, old flat list).
Serve the copies over local http, because localStorage is lost on reload for file://. Needs Python 3, Node and Playwright (Chromium).
