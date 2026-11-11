# Simulator template: build sources

Builds `Simulator Template.html` (the file saved in Drive: Lectures/Simulators).
The built file is not stored here. Guide: project doc `claude/simulator_template.md`.

## Build
    cd template-src
    python3 build.py        # writes "Simulator Template.html" in this folder

The page head and CSS come from `base/Sindirim_v2_base.html`. The parts are joined in this order:
`cfg.js`, `mods.js`, `quiz.js`, `engine2.js`, `frame.js` (script) and `body.html` (page body).
Build of 2026-11-11 (engine 2026-11f): 151,103 bytes, sha256 e0a1b03beb20914dbbc81687780d4d7d5e6db86a496750489d2f3c8621f4e5eb.

## Tests (Node + Playwright; usage is in the first lines of each file)
Run everything: `bash tests/run_all.sh [out dir]`. It builds the template, makes the test copies (`tests/copies.py`: plain, midoff, midon, open, edit, whyedit, nopredict), starts a local server on port 8799 and prints one line per test (13 tests, 240 checks).
- `tests/tsmoke.js` (16): modules and layout, plain template.
- `tests/flow2.js` (56): test engine (mid-off and mid-on, scoring, Sheet columns); writes `posts.json` and `posts_open.json`.
- `tests/kflow.js` (19): mini-quiz; `tests/bflow.js` (14): leaderboard `#board`.
- `tests/tap.js` (20): tap ordering. `tests/conf.js` (18): confidence points, gift, scoring box.
- `tests/cols.js` (8): item codes and part marks. `tests/m2.js` (24): M2 "predict first" box.
- `tests/gas_test.js` (32) with `posts.json`: runs `../apps-script/Code.gs` against a simulated Sheet (`tests/gasmock.js`).
- `tests/gas_items.js` (25): item analysis (500 students, 10, pooling, ties).
- `tests/nosheet.js` (4), `tests/mob.js` (2), `tests/midcheck.js` (2): no-Sheet mode, 390 px width, mini-quiz check.
Serve the copies over local http, because localStorage is lost on reload for file://. Needs Python 3, Node and Playwright (Chromium).
