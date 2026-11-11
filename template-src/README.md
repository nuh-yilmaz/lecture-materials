# Simulator template: build sources

Builds `Simulator Template.html` (the file saved in Drive: Lectures/Simulators).
The built file is not stored here. Guide: project doc `claude/simulator_template.md`.

## Build
    cd template-src
    python3 build.py        # writes "Simulator Template.html" in this folder

The page head and CSS come from `base/Sindirim_v2_base.html`. The parts are joined in this order:
`cfg.js`, `mods.js`, `quiz.js`, `engine2.js`, `frame.js` (script) and `body.html` (page body).
Build of 2026-11-11 (engine 2026-11g, mini-quiz rounds): 158,244 bytes, sha256 ce657c346000925f7301188488196faee3c9514b55c2ac479cc623eb9fe594de.

## Tests (Node + Playwright; usage is in the first lines of each file)
Run everything: `bash tests/run_all.sh [out dir]`. It builds the template, makes the test copies (`tests/copies.py`: plain, midoff, midon, open, edit, whyedit, nopredict, one, mid4, flat), starts a local server on port 8799 and prints one line per test (14 tests, 292 checks).
- `tests/tsmoke.js` (16): modules and layout, plain template.
- `tests/flow2.js` (57): test engine (mid-off and mid-on, scoring, Sheet columns); writes `posts.json` and `posts_open.json`.
- `tests/kflow.js` (34): mini-quiz rounds (#mid = round 1, #mid2, list of rounds, one round, 2026-11f data); `tests/bflow.js` (23): one leaderboard per round (`#board1`, `#board2`, previous/next, reset per round).
- `tests/tap.js` (20): tap ordering. `tests/conf.js` (18): confidence points, gift, scoring box.
- `tests/cols.js` (8): item codes and part marks. `tests/m2.js` (24): M2 "predict first" box.
- `tests/gas_test.js` (32) with `posts.json`: runs `../apps-script/Code.gs` against a simulated Sheet (`tests/gasmock.js`).
- `tests/gas_items.js` (25): item analysis (500 students, 10, pooling, ties).
- `tests/gas_rounds.js` (23): Apps Script 2026-11g: one row per student and round, board `&test=midN`, item analysis of a `-quiz` tab.
- `tests/nosheet.js` (4), `tests/mob.js` (2), `tests/midcheck.js` (6): no-Sheet mode, 390 px width, mini-quiz author check (3 items per round, old flat list).
Serve the copies over local http, because localStorage is lost on reload for file://. Needs Python 3, Node and Playwright (Chromium).
