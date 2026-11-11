# Simulator template: build sources

Builds `Simulator Template.html` (the file saved in Drive: Lectures/Simulators).
The built file is not stored here. Guide: project doc `claude/simulator_template.md`.

## Build
    cd template-src
    python3 build.py        # writes "Simulator Template.html" in this folder

The page head and CSS come from `base/Sindirim_v2_base.html`. The parts are joined in this order:
`cfg.js`, `mods.js`, `quiz.js`, `engine2.js`, `frame.js` (script) and `body.html` (page body).
Build of 2026-11-11: 134,543 bytes, sha256 787adca618e1a4a34632c048455de047cb866795d6a4461fc271a02c3e477bcc.

## Tests (Node + Playwright; usage is in the first lines of each file)
- `tests/tsmoke.js` (16): modules and layout, run on the plain template.
- `tests/flow2.js` (42): test engine; needs a copy with mid:false and a copy with mid:true, both with SHEET_URL=https://example.invalid/exec.
- `tests/kflow.js` (19): mini-quiz; `tests/bflow.js` (14): leaderboard `#board`. Serve the copies over local http (python3 -m http.server), because localStorage is lost on reload for file://.
- `tests/gas_test.js` (30) with `tests/posts.json`: runs `../apps-script/Code.gs` against a simulated Sheet.
- `tests/nosheet.js`, `tests/mob.js`, `tests/midcheck.js`: no-Sheet mode, 390 px width, mini-quiz check.
Test copies: replace `const SHEET_URL="";` with `const SHEET_URL="https://example.invalid/exec";` and, for the mid-off copy, `mid:true` with `mid:false` in `const TESTS`.
