/**
 * Course simulations – writes test results to this Google Sheet.            Script version 2026-11d
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
 *    the header row. A value of null only creates the column (e.g. the teacher columns) and never
 *    overwrites what is already there, so teacher scores and notes are kept.
 *    New simulators should use a new course name (tab), so old and new columns are not mixed.
 */
const HEADERS = ['Timestamp', 'Alias', 'Test', 'Q1 (20)', 'Q2 (20)', 'Q3 (20)', 'Q4 (20)',
  'Q5 self-score (20)', 'Auto total (80)', 'Total (incl. self-score)',
  'A1 choice', 'A2 order', 'A3 matching', 'A4 T/F (D=true, Y=false)', 'A5 open-ended answer', 'Version', 'Language'];
const MAX_COLS = 200;

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
  // Start from the existing row (keeps teacher cells) or from an empty row.
  const row = target
    ? sheet.getRange(target, 1, 1, headers.length).getValues()[0]
    : headers.map(function () { return ''; });
  row[col('Timestamp')] = new Date();
  row[col('Alias')] = alias;
  row[col('Test')] = test;
  pairs.forEach(function (p) {
    if (p[1] === null || p[1] === undefined) return;          // create the column only
    row[col(p[0])] = (typeof p[1] === 'number') ? (isFinite(p[1]) ? p[1] : '') : clean(p[1]);
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
function doGet() {
  return ContentService.createTextOutput('Course simulations data endpoint is running (script 2026-11d).');
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
