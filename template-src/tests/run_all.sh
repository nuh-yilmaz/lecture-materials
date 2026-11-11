#!/usr/bin/env bash
# Builds the template, makes the test copies and runs every test. Usage: bash tests/run_all.sh [out dir]
# Needs Python 3, Node and Playwright (Chromium). Screenshots and posts.json are written to the out dir.
set -u
T="$(cd "$(dirname "$0")/.." && pwd)"; OUT="${1:-$T/tests/out}"; mkdir -p "$OUT"
python3 "$T/build.py" >/dev/null && python3 "$T/tests/copies.py" "$T/Simulator Template.html" "$OUT" >/dev/null || exit 1
sha256sum "$T/Simulator Template.html" | cut -c1-16; wc -c < "$T/Simulator Template.html"
PORT=8799; pkill -f "http.server $PORT" 2>/dev/null; (cd "$OUT" && exec python3 -m http.server $PORT >/dev/null 2>&1) & SRV=$!; sleep 1
H="http://127.0.0.1:$PORT"; cd "$OUT"
run(){ local name="$1"; shift; "$@" > "$name.txt" 2>&1; local p=$(grep -c '^PASS' "$name.txt"); local f=$(grep -c '^FAIL\|CRASH' "$name.txt");
  printf '%-10s %3d/%-3d %s\n' "$name" "$p" "$((p+f))" "$([ "$f" = 0 ] && echo ok || echo FAILED)"; grep '^FAIL\|CRASH' "$name.txt"; }
run tsmoke   node "$T/tests/tsmoke.js" "$OUT/plain.html" sm
run flow2    node "$T/tests/flow2.js" "$OUT/midoff.html" fl "$OUT/midon.html" "$OUT/open.html"
run kflow    node "$T/tests/kflow.js" x "$H/midon.html" "$H/one.html"
run bflow    node "$T/tests/bflow.js" "$H/midon.html" "$H/plain.html" "$H/one.html"
run gas_test node "$T/tests/gas_test.js" "$T/../apps-script/Code.gs" "$OUT/posts.json"
run nosheet  node "$T/tests/nosheet.js" "$OUT/plain.html"
run mob      node "$T/tests/mob.js" "$OUT/midon.html"
run midcheck node "$T/tests/midcheck.js" "$OUT/plain.html" "$OUT/mid4.html" "$OUT/flat.html"
for x in tap conf cols m2 gas_items gas_rounds; do [ -f "$T/tests/$x.js" ] || continue
  case $x in gas_items|gas_rounds) run $x node "$T/tests/$x.js" "$T/../apps-script/Code.gs";; *) run $x node "$T/tests/$x.js" "$H";; esac; done
kill $SRV 2>/dev/null
