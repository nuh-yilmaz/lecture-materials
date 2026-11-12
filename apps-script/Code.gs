/**
 * Course simulations – writes test results to this Google Sheet.            Script version 2026-11h
 * One deployment serves every course: each course writes to its own tab (e.g. "endocrine").
 * Setup: Sheet > Extensions > Apps Script > paste this code > Deploy > New deployment >
 * Type: Web app > Execute as: Me > Who has access: Anyone.
 * Update: paste the new code > Deploy > Manage deployments > Edit (pencil) > Version: New version
 * > Deploy. The web app URL stays the same.
 *
 * Two kinds of messages are accepted:
 *  - Schema 1 (simulators with test engine 2026-11b/11c): the fixed 17 columns in HEADERS.
 *  - Schema 2 (test engine 2026-11d and the simulator template): a list of [column name, value]
 *    pairs. Each value is written under its column name; a missing column is added at the end of
 *    the header row. A value of null only creates the column (e.g. the lecturer columns) and never
 *    overwrites what is already there, so lecturer scores and notes are kept.
 *    New simulators should use a new course name (tab), so old and new columns are not mixed.
 * Mini-quiz leaderboard (2026-11e): <web app URL>?board=<course>-quiz&since=<ms>&n=5 returns the best
 *    points of the rows sent after <since> (anonymous codes only; only tabs ending in "-quiz").
 *    Points come from the round's own answers: right = 500 + 500 * (2 - P) * S, wrong = 0
 *    (P = share of the round right on that question, S = speed 0-1 sent by the phone).
 * New in 2026-11h (test engine 2026-11h; Q8-A of 2026-11-12):
 *  - Board streak bonus: with &streak=1 (sent by engine 2026-11h boards), a right answer that follows a right answer in
 *    the same round earns +100 × (streak − 1): 2nd right in a row +100, 3rd +200. The reply says streak:true.
 *    Without &streak (engines 2026-11e to 11g) the points are as before.
 *  - Engine 2026-11h sends "M7 stars" and "M7 tries" (missions) with the post-test row; they are stored as text.
 * New in 2026-11g (test engine 2026-11g, mini-quiz rounds; Q134–Q143):
 *  - The mini-quiz sends one row per student and round (Test = mid1, mid2 …; old engines send "mid").
 *  - Board: &test=mid2 counts only the rows of that round. Without &test the board works as before (2026-11e/f).
 *    Only the item columns (R<k>, S<k>) that have values in the round's rows are used.
 *  - "Physiology → Item analysis" also works on a "-quiz" tab: one row per round and item with n, right, P (share
 *    right), mean time of the right answers and the P flag; no D (3 items per round are too few). Rows are pooled by
 *    item code ("Item codes"); n < 40: P as a count (e.g. 7/10), flag "few data". Written to "<tab>-items".
 * New in 2026-11f (test engine 2026-11f):
 *  - "K<n> parts", "Item codes" and "M2 answers" are stored as text, so "01101" keeps its first 0.
 *  - Sheet menu "Physiology → Item analysis": open a test tab (e.g. "respiration") and run it. It writes the tab
 *    "<tab>-items" (rewritten at each run). Method (handbook p. 100; Q97-A, Q98-A, Q99-A, Q101-A, Q116–Q121):
 *    post-test rows; upper and lower 27% of the students (round(0.27 × n), all students tied at the cut included);
 *    groups ranked by the total minus the item; P = mean score share of both groups × 100; D = mean share (upper) −
 *    mean share (lower). Sub-parts (tf statements, match rows, fill blanks, order pairs) from "K<n> parts" use the
 *    groups of their item. P pre: the same method on the pre-test rows; gain = P post − P pre.
 *    Fewer than 40 rows: P as a count of score shares over all students (e.g. 7.5/10), no D, flag "few data".
 *    Rows are pooled by item code ("Item codes", one "module:code" per item) across terms, programs and TR/EN
 *    within the tab; an edited item has a new code and gets its own row. Delayed-test rows are not used.
 *    Flags: P 50–60 ideal, 30–70 acceptable, > 70 easy, < 30 hard; D ≥ 0.35 excellent, 0.25–0.34 good,
 *    0.15–0.24 review, < 0.15 low, < 0 check the key.
 */
const HEADERS = ['Timestamp', 'Alias', 'Test', 'Q1 (20)', 'Q2 (20)', 'Q3 (20)', 'Q4 (20)',
  'Q5 self-score (20)', 'Auto total (80)', 'Total (incl. self-score)',
  'A1 choice', 'A2 order', 'A3 matching', 'A4 T/F (D=true, Y=false)', 'A5 open-ended answer', 'Version', 'Language'];
const MAX_COLS = 200;
const TEXT_COLS = /^(K\d+ parts|Item codes|M2 answers|M7 stars|M7 tries)$/;   // stored as text (leading ' ), e.g. part marks "01101"

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tab = clean(d.course).replace(/[^\w -]/g, '').slice(0, 40) || 'results';
    const sheet = ss.getSheetByName(tab) || ss.insertSheet(tab);
    if (d.schema === 2) writeNamed(sheet, d); else writeFixed(sheet, d);
    return out({ ok: true, schema: d.schema === 2 ? 2 : 1 });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err).slice(0, 200) });
  } finally {
    lock.releaseLock();
  }
}

// Schema 1: unchanged behaviour of the first script (old simulators keep working).
function writeFixed(sheet, d) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  const alias = clean(d.alias), test = clean(d.test);
  const row = [
    new Date(), alias, test,
    num(d.s1), num(d.s2), num(d.s3), num(d.s4), num(d.s5_self),
    num(d.auto_total), num(d.total),
    clean(d.a1), clean(d.a2), clean(d.a3), clean(d.a4), clean(d.a5), clean(d.version), clean(d.lang)
  ];
  // One row per student and test: a later submission updates the same row.
  const target = findRow(sheet, 2, 3, alias, test);
  if (target) sheet.getRange(target, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

// Schema 2: values go under their column names.
function writeNamed(sheet, d) {
  if (!Array.isArray(d.cols) || d.cols.length > MAX_COLS) throw new Error('bad cols');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Alias', 'Test']);
    sheet.setFrozenRows(1);
  }
  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  ['Timestamp', 'Alias', 'Test'].forEach(function (h) { if (headers.indexOf(h) < 0) throw new Error('missing column ' + h); });
  // Add missing columns at the end of the header row (in the order they arrive).
  const pairs = [];
  const added = [];
  d.cols.forEach(function (p) {
    if (!Array.isArray(p) || p.length < 1) return;
    const label = String(p[0] == null ? '' : p[0]).slice(0, 80).trim();
    if (!label || /^[=+\-@']/.test(label) || label === 'Timestamp' || label === 'Alias' || label === 'Test') return;
    if (headers.indexOf(label) < 0 && added.indexOf(label) < 0) added.push(label);
    pairs.push([label, p.length > 1 ? p[1] : null]);
  });
  if (added.length) {
    sheet.getRange(1, headers.length + 1, 1, added.length).setValues([added]);
    headers = headers.concat(added);
  }
  const col = function (h) { return headers.indexOf(h); };   // 0-based
  const alias = clean(d.alias), test = clean(d.test);
  const target = findRow(sheet, col('Alias') + 1, col('Test') + 1, alias, test);
  // Start from the existing row (keeps lecturer cells) or from an empty row.
  const row = target
    ? sheet.getRange(target, 1, 1, headers.length).getValues()[0]
    : headers.map(function () { return ''; });
  row[col('Timestamp')] = new Date();
  row[col('Alias')] = alias;
  row[col('Test')] = test;
  pairs.forEach(function (p) {
    if (p[1] === null || p[1] === undefined) return;          // create the column only
    row[col(p[0])] = (typeof p[1] === 'number') ? (isFinite(p[1]) ? p[1] : '')
      : TEXT_COLS.test(p[0]) ? "'" + String(p[1]).slice(0, 2000) : clean(p[1]);
  });
  // A row read back from the Sheet has lost the leading ' of its text cells; keep digit-only text as text.
  headers.forEach(function (h, j) {
    if (TEXT_COLS.test(h) && typeof row[j] === 'string' && /^\d+$/.test(row[j])) row[j] = "'" + row[j];
  });
  if (target) sheet.getRange(target, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

// Last row whose alias and test match (1-based column numbers); 0 if none.
function findRow(sheet, aliasCol, testCol, alias, test) {
  const last = sheet.getLastRow();
  if (last < 2 || !alias) return 0;
  const a = sheet.getRange(2, aliasCol, last - 1, 1).getValues();
  const t = sheet.getRange(2, testCol, last - 1, 1).getValues();
  for (let i = a.length - 1; i >= 0; i--) {
    if (String(a[i][0]) === alias && String(t[i][0]) === test) return i + 2;
  }
  return 0;
}

// Opening the web app URL in a browser shows this message (connection check).
// With ?board=... it returns the mini-quiz leaderboard as JSON.
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.board) {
    try { return out(board(p)); } catch (err) { return out({ ok: false, error: String(err && err.message || err).slice(0, 200) }); }
  }
  return ContentService.createTextOutput('Course simulations data endpoint is running (script 2026-11h).');
}

// Mini-quiz points of one round (rows sent after "since"), calculated from the round's own answers:
//   P = share of the round right on item k, S = speed (1 - time/limit) sent by the phone
//   right: 500 + 500 * (2 - P) * S, wrong: 0. Equal points share a place, so more than n rows can come back.
//   &streak=1 (2026-11h): a right answer after a right answer in the same round adds 100 * (streak - 1).
function board(p) {
  const tab = String(p.board).replace(/[^\w -]/g, '').slice(0, 40);
  const test = /^mid\d{0,2}$/.test(String(p.test || '')) ? String(p.test) : '';   // 2026-11g: one round only (e.g. mid2)
  if (!/-quiz$/.test(tab)) return { ok: false, error: 'not a quiz tab' };
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tab);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, n: 0, items: [], top: [] };
  const v = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const h = v[0].map(String), ia = h.indexOf('Alias'), it = h.indexOf('Timestamp'), iq = h.indexOf('Test');
  const rc = [], sc = [];
  h.forEach(function (name, j) {
    let m = /^R(\d+)$/.exec(name); if (m) rc[+m[1]] = j;
    m = /^S(\d+)$/.exec(name); if (m) sc[+m[1]] = j;
  });
  const all = [];
  for (let k = 1; k < rc.length; k++) if (rc[k] !== undefined && sc[k] !== undefined) all.push(k);
  if (ia < 0 || it < 0 || !all.length || (test && iq < 0)) return { ok: true, n: 0, items: [], top: [] };
  const since = Number(p.since) || 0, n = Math.min(Math.max(parseInt(p.n, 10) || 5, 1), 20);
  const streak = String(p.streak || '') === '1';   // 2026-11h
  const rows = v.slice(1).filter(function (r) {
    const t = r[it] instanceof Date ? r[it].getTime() : Date.parse(r[it]);
    return t >= since && (!test || String(r[iq]) === test) && all.some(function (k) { return r[rc[k]] !== ''; });
  });
  if (!rows.length) return { ok: true, n: 0, items: [], top: [] };
  // items of this round: the R<k> columns with a value in at least one row (a tab may hold rounds of other sizes)
  const ks = all.filter(function (k) { return rows.some(function (r) { return r[rc[k]] !== ''; }); });
  const share = {}, items = [];
  ks.forEach(function (k) {
    let right = 0;
    rows.forEach(function (r) { if (Number(r[rc[k]]) === 1) right++; });
    share[k] = right / rows.length;
    items.push({ k: k, right: right, n: rows.length });
  });
  const scored = rows.map(function (r) {
    let pts = 0, run = 0;
    ks.forEach(function (k) {
      if (Number(r[rc[k]]) !== 1) { run = 0; return; }
      const s = Math.min(Math.max(Number(r[sc[k]]) || 0, 0), 1);
      run++;
      pts += 500 + 500 * (2 - share[k]) * s + (streak && run > 1 ? 100 * (run - 1) : 0);
    });
    return { alias: String(r[ia]), points: Math.round(pts) };
  });
  scored.sort(function (a, b) { return b.points - a.points; });
  const top = [];
  let rank = 0, prev = null;
  scored.forEach(function (r, i) {
    if (r.points !== prev) { rank = i + 1; prev = r.points; }
    if (rank <= n) top.push({ rank: rank, alias: r.alias, points: r.points });
  });
  return { ok: true, n: rows.length, items: items, top: top, streak: streak };
}

// ---------------- Item analysis (2026-11f; "-quiz" tabs 2026-11g) ----------------
// Sheet menu. A simple trigger: it runs when the Sheet opens (this script is bound to the Sheet).
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Physiology').addItem('Item analysis', 'itemAnalysisMenu').addToUi();
}

// Menu action: analyses the tab that is open (Q116-A) and writes "<tab>-items".
function itemAnalysisMenu() {
  const ui = SpreadsheetApp.getUi();
  const name = SpreadsheetApp.getActiveSheet().getName();
  if (/-items$/.test(name)) {
    ui.alert('Open a test tab or a "-quiz" tab first (not a "-items" tab), then run Physiology → Item analysis.');
    return;
  }
  const res = itemAnalysis(name);
  ui.alert(!res.ok ? res.message : res.quiz
    ? 'Mini-quiz item analysis written to tab "' + res.tab + '": ' + res.nRows + ' rows, ' + res.nRounds + ' rounds, ' + res.nItems + ' items.'
    : 'Item analysis written to tab "' + res.tab + '": ' + res.nPost + ' post-test rows, ' + res.nPre + ' pre-test rows, ' + res.nItems + ' items.');
}

// Reads the test tab, writes "<tab>-items" and returns a summary (also used by the tests).
function itemAnalysis(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = ss.getSheetByName(tabName);
  if (!src || src.getLastRow() < 2) return { ok: false, message: 'Tab "' + tabName + '" has no result rows.' };
  const vals = src.getRange(1, 1, src.getLastRow(), src.getLastColumn()).getValues();
  const res = /-quiz$/.test(tabName) ? quizAnalyse(vals, tabName, new Date()) : analyse(vals, tabName, new Date());
  if (!res.ok) return res;
  const name = (tabName + '-items').slice(0, 100);
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, res.table.length, res.table[0].length).setValues(res.table);
  sh.getRange(5, 1, 1, res.table[0].length).setFontWeight('bold');
  sh.setFrozenRows(5);
  res.tab = name;
  return res;
}

// Pure analysis of the tab values (row 1 = headers). Returns { ok, table (2D array), items (details), nPost, nPre, nItems }.
function analyse(v, tabName, when) {
  const h = v[0].map(String), iTest = h.indexOf('Test'), iCodes = h.indexOf('Item codes');
  if (iTest < 0 || iCodes < 0) return { ok: false, message: 'Tab "' + tabName + '" has no "Item codes" column. Simulators with test engine 2026-11f send it; older rows cannot be analysed.' };
  // Score columns per item position n: "Q<n> <type> (<pts>)" and, for an open item, "Q<n> open: lecturer (<pts>)".
  const qcols = {};
  h.forEach(function (name, j) {
    let m = /^Q(\d+) (mcq|tf|order|match|fill) \(([\d.]+)\)$/.exec(name);
    if (!m) { m = /^Q(\d+) open: lecturer \(([\d.]+)\)$/.exec(name); if (m) m = [m[0], m[1], 'open', m[2]]; }
    if (m) (qcols[m[1]] = qcols[m[1]] || []).push({ j: j, type: m[2], pts: Number(m[3]) });
  });
  const txt = function (x) { return String(x == null ? '' : x).replace(/^'/, ''); };
  const isNum = function (x) { return x !== '' && x !== null && isFinite(Number(x)) && typeof x !== 'boolean'; };
  // One entry per row and item: { code, mod, pos, type, pts, score, parts }
  const rows = { post: [], pre: [] };
  const seen = {};   // code -> { pos, type, pts, mod, last (row index), kLen }
  let lastRow = -1, lastCodes = [];
  for (let r = 1; r < v.length; r++) {
    const test = txt(v[r][iTest]), codes = txt(v[r][iCodes]).trim();
    if ((test !== 'post' && test !== 'pre') || !codes) continue;
    const items = [];
    codes.split(/\s+/).forEach(function (mc, k) {
      const n = String(k + 1), cut = mc.lastIndexOf(':'), code = cut < 0 ? mc : mc.slice(cut + 1), mod = cut < 0 ? '' : mc.slice(0, cut);
      const col = (qcols[n] || []).filter(function (c) { return isNum(v[r][c.j]); })[0];
      if (!col) return;
      const kj = h.indexOf('K' + n + ' parts'), ks = kj < 0 ? '' : txt(v[r][kj]).replace(/\D/g, '');
      items.push({ code: code, mod: mod, pos: k + 1, type: col.type, pts: col.pts, score: Number(v[r][col.j]), parts: ks });
      const s = seen[code] || (seen[code] = { kLen: 0 });
      s.pos = k + 1; s.type = col.type; s.pts = col.pts; s.mod = mod; s.last = r; s.kLen = Math.max(s.kLen, ks.length);
    });
    if (!items.length) continue;
    const total = items.reduce(function (a, it) { return a + it.score; }, 0);
    rows[test].push({ total: total, items: items });
    if (r > lastRow) { lastRow = r; lastCodes = items.map(function (it) { return it.code; }); }
  }
  // Entries per code: { rest, share, parts[] }
  const entries = function (test, code) {
    const out = [];
    rows[test].forEach(function (row) {
      row.items.forEach(function (it) {
        if (it.code !== code || !(it.pts > 0)) return;
        const kLen = seen[code].kLen, ks = it.parts ? ('0'.repeat(kLen) + it.parts).slice(-kLen) : '';   // old numeric cells lost leading zeros
        out.push({ rest: row.total - it.score, share: Math.min(1, Math.max(0, it.score / it.pts)), parts: ks.split('').map(Number) });
      });
    });
    return out;
  };
  const codes = Object.keys(seen).sort(function (a, b) {
    const ca = lastCodes.indexOf(a), cb = lastCodes.indexOf(b);
    if ((ca < 0) !== (cb < 0)) return ca < 0 ? 1 : -1;            // items of the latest version first
    return ca >= 0 ? ca - cb : (seen[a].pos - seen[b].pos) || (seen[b].last - seen[a].last);
  });
  const W = 13, table = [];
  const pad = function (a) { while (a.length < W) a.push(''); return a; };
  table.push(pad(['Item analysis · ' + tabName + ' · script 2026-11h · ' + fmtWhen(when)]));
  table.push(pad(['Post-test rows with item codes: ' + rows.post.length + ' · pre-test rows: ' + rows.pre.length +
    ' · groups: upper and lower 27% by total minus the item (ties included) · P = mean score share of both groups × 100 · D = upper − lower · n < 40: P as a count, no D']));
  table.push(pad(['Flags: P 50–60 ideal, 30–70 acceptable, > 70 easy, < 30 hard · D ≥ 0.35 excellent, 0.25–0.34 good, 0.15–0.24 review, < 0.15 low, < 0 check the key']));
  table.push(pad([]));
  table.push(['Item', 'Part', 'Code', 'Module', 'Type', 'Points', 'n post', 'P post', 'n pre', 'P pre', 'Gain', 'D', 'Flag']);
  const details = [];
  codes.forEach(function (code) {
    const s = seen[code], post = entries('post', code), pre = entries('pre', code);
    const label = 'Q' + s.pos + (lastCodes.indexOf(code) < 0 ? ' (old)' : '');
    const nParts = (s.type === 'mcq' || s.type === 'open') ? 0 : s.kLen;
    for (let j = -1; j < nParts; j++) {
      const get = j < 0 ? function (e) { return e.share; } : function (e) { return e.parts[j]; };
      const a = stat(post, get), b = stat(pre, get);
      const gain = a.p === null || b.p === null ? '' : Math.round(a.p - b.p);
      table.push([label, j < 0 ? '' : partName(s.type, j), code, s.mod, s.type, j < 0 ? s.pts : '', a.n, a.show, b.n, b.show, gain,
        a.d === null ? '' : a.d, a.n === 0 ? 'no post-test rows' : a.n < 40 ? 'few data' : 'P ' + pFlag(Math.round(a.p)) + ' · D ' + dFlag(a.d)]);
      details.push({ code: code, part: j, n: a.n, nU: a.nU, nL: a.nL, P: a.p, D: a.d, Ppre: b.p, nPre: b.n });
    }
  });
  return { ok: true, table: table, items: details, nPost: rows.post.length, nPre: rows.pre.length, nItems: codes.length };
}

// Mini-quiz tab (Q140-B): one row per round and item. P = share right (time-out = wrong); no D; mean time of right answers.
// Rows are pooled by item code; rows without codes (older engines) are pooled by round and position.
function quizAnalyse(v, tabName, when) {
  const h = v[0].map(String), iTest = h.indexOf('Test'), iCodes = h.indexOf('Item codes');
  if (iTest < 0) return { ok: false, message: 'Tab "' + tabName + '" has no "Test" column.' };
  const txt = function (x) { return String(x == null ? '' : x).replace(/^'/, ''); };
  const seen = {}, last = {};   // key -> stats; last[round] = keys of the newest row of that round
  let nRows = 0;
  for (let r = 1; r < v.length; r++) {
    const m = /^mid(\d*)$/.exec(txt(v[r][iTest])); if (!m) continue;
    const round = m[1] ? Number(m[1]) : 1, codes = iCodes < 0 ? [] : txt(v[r][iCodes]).trim().split(/\s+/).filter(String);
    const keys = [];
    for (let k = 1; k <= 20; k++) {
      const jr = h.indexOf('R' + k); if (jr < 0) break;
      const val = v[r][jr]; if (val === '' || val === null) continue;
      const mc = codes[k - 1] || '', cut = mc.lastIndexOf(':');
      const code = mc ? (cut < 0 ? mc : mc.slice(cut + 1)) : '', key = code || ('round' + round + '-' + k);
      const s = seen[key] || (seen[key] = { round: round, k: k, code: code, mod: cut < 0 ? '' : mc.slice(0, cut), n: 0, right: 0, tSum: 0, last: 0 });
      const ok = Number(val) === 1, jt = h.indexOf('T' + k + ' sec'), t = jt < 0 ? NaN : Number(v[r][jt]);
      s.n++; if (ok) { s.right++; if (isFinite(t)) s.tSum += t; }
      s.round = round; s.k = k; s.last = r; keys.push(key);
    }
    if (keys.length) { nRows++; last[round] = keys; }
  }
  const keys = Object.keys(seen).sort(function (a, b) {
    const A = seen[a], B = seen[b];
    return (A.round - B.round) || (A.k - B.k) || (B.last - A.last);
  });
  if (!keys.length) return { ok: false, message: 'Tab "' + tabName + '" has no mini-quiz rows.' };
  const W = 9, table = [], details = [];
  const pad = function (a) { while (a.length < W) a.push(''); return a; };
  table.push(pad(['Mini-quiz item analysis · ' + tabName + ' · script 2026-11h · ' + fmtWhen(when)]));
  table.push(pad(['Rows: ' + nRows + ' · P = share right × 100 (time-out = wrong) · no D (3 items per round) · n < 40: P as a count · pooled by item code']));
  table.push(pad(['Flags: P 50–60 ideal, 30–70 acceptable, > 70 easy, < 30 hard']));
  table.push(pad([]));
  table.push(['Round', 'Item', 'Code', 'Module', 'n', 'Right', 'P', 'Mean time right (s)', 'Flag']);
  keys.forEach(function (key) {
    const s = seen[key], p = 100 * s.right / s.n, old = (last[s.round] || []).indexOf(key) < 0;
    table.push([s.round, 'K' + s.k + (old ? ' (old)' : ''), s.code, s.mod, s.n, s.right, s.n < 40 ? "'" + s.right + '/' + s.n : Math.round(p),
      s.right ? Math.round(10 * s.tSum / s.right) / 10 : '', s.n < 40 ? 'few data' : 'P ' + pFlag(Math.round(p))]);
    details.push({ key: key, round: s.round, k: s.k, n: s.n, right: s.right, P: p, old: old });
  });
  return { ok: true, quiz: true, table: table, items: details, nRows: nRows, nRounds: Object.keys(last).length, nItems: keys.length };
}

// P and D of one item or sub-part. get(e) = score share 0–1 of one student.
function stat(list, get) {
  const n = list.length;
  if (!n) return { n: 0, p: null, d: null, show: '', nU: 0, nL: 0 };
  if (n < 40) {   // few data: P as a count over all students, no D
    const sum = list.reduce(function (a, e) { return a + get(e); }, 0), c = Math.round(sum * 10) / 10;
    return { n: n, p: 100 * sum / n, d: null, show: "'" + c + '/' + n, nU: 0, nL: 0 };
  }
  const k = Math.max(1, Math.round(0.27 * n));
  const rest = list.map(function (e) { return e.rest; }).sort(function (a, b) { return b - a; });
  const hi = rest[k - 1], lo = rest[n - k];
  const up = list.filter(function (e) { return e.rest >= hi; }), low = list.filter(function (e) { return e.rest <= lo; });
  const sum = function (g) { return g.reduce(function (a, e) { return a + get(e); }, 0); };
  const p = 100 * (sum(up) + sum(low)) / (up.length + low.length);
  const d = Math.round((sum(up) / up.length - sum(low) / low.length) * 100) / 100;
  return { n: n, p: p, d: d, show: Math.round(p), nU: up.length, nL: low.length };
}
function pFlag(p) { return p > 70 ? 'easy' : p < 30 ? 'hard' : (p >= 50 && p <= 60) ? 'ideal' : 'acceptable'; }
function dFlag(d) { return d < 0 ? 'check the key' : d >= 0.35 ? 'excellent' : d >= 0.25 ? 'good' : d >= 0.15 ? 'review' : 'low'; }
function partName(type, j) {
  if (type === 'tf') return 'statement ' + 'abcdefgh'[j];
  if (type === 'match') return 'row ' + (j + 1);
  if (type === 'fill') return 'blank ' + (j + 1);
  if (type === 'order') return 'pair ' + (j + 1) + ' (steps ' + (j + 1) + '–' + (j + 2) + ')';
  return 'part ' + (j + 1);
}
function fmtWhen(d) {
  const z = function (x) { return (x < 10 ? '0' : '') + x; };
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function num(v) { const n = Number(v); return isFinite(n) ? n : ''; }
// Truncates text and stops input starting with = + - @ from running as a formula.
function clean(v) {
  let s = String(v == null ? '' : v).slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
